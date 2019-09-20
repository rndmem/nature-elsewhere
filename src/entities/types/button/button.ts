import {Entity} from '../../entity/entity'
import {EntityState} from '../../entity-state/entity-state'
import {AtlasID} from '../../../atlas/atlas-id/atlas-id'
import {EntityType} from '../../entity-type/entity-type'
import {UpdateStatus} from '../../updaters/update-status/update-status'
import {Updater} from '../../updaters/updater/updater'
import {Atlas} from '../../../atlas/atlas/atlas'
import {XY} from '../../../math/xy/xy'
import {Image} from '../../../images/image/image'
import {ImageRect} from '../../../images/image-rect/image-rect'
import {ImageParser} from '../../../images/image/image-parser'
import {Input} from '../../../inputs/input'
import {Level} from '../../../levels/level/level'

export interface Button extends Entity {
  readonly type: EntityType.UI_BUTTON
  state: EntityState | Button.State
  iconID: AtlasID
  clicked: boolean
}

export namespace Button {
  export enum State {
    UNPRESSED = 'unpressed', // renamed to clicked / unclicked
    PRESSED = 'pressed'
  }
  export function parse(button: Entity, atlas: Atlas): Button {
    if (!EntityType.assert<Button>(button, EntityType.UI_BUTTON))
      throw new Error()

    for (const state of [Button.State.PRESSED, Button.State.UNPRESSED]) {
      const position = {
        x: button.imageStates[state].bounds.x,
        y: button.imageStates[state].bounds.y
      }
      const icon = newIcon(button.iconID, atlas, position)
      ImageRect.add(button.imageStates[state], icon)
    }

    Entity.invalidateBounds(button)
    return button
  }

  export const update: Updater.Update = (button, state) => {
    if (!EntityType.assert<Button>(button, EntityType.UI_BUTTON))
      throw new Error()

    button.clicked = false
    const collision = Level.collisionWithCursor(state.level, button)
    if (!collision) return Entity.setState(button, State.UNPRESSED)

    let status = Entity.setState(button, State.PRESSED) // this is just presentation not click state

    const nextClicked = Input.activeTriggered(state.inputs.pick)
    if (button.clicked !== nextClicked) status |= UpdateStatus.TERMINATE
    button.clicked = nextClicked

    return status
  }
}

function newIcon(iconID: AtlasID, atlas: Atlas, position: XY): Image {
  const bounds = {x: position.x, y: position.y}
  const config = {id: iconID, layer: 'UI_HIHI', bounds}
  return ImageParser.parse(config, atlas)
}

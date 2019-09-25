import {EntityType} from '../../entityType/EntityType'
import {EntityTypeUtil} from '../../entityType/EntityTypeUtil'
import {Update} from '../../updaters/Update'
import {UpdateStatus} from '../../updaters/updateStatus/UpdateStatus'
import {Input} from '../../../inputs/Input'
import {Marquee} from './Marquee'
import {EntityUtil} from '../../entity/EntityUtil'
import {MarqueeState} from './MarqueeState'
import {EntityCollider} from '../../../collision/EntityCollider'
import {EntityID} from '../../entityID/EntityID'
import {EntityState} from '../../entityState/EntityState'
import {Entity} from '../../entity/Entity'
import {XY} from '../../../math/xy/XY'

enum Images {
  TOP = 0,
  RIGHT = 1,
  BOTTOM = 2,
  LEFT = 3
}

export namespace MarqueeUpdater {
  export const update: Update = (marquee, state) => {
    if (!EntityTypeUtil.assert<Marquee>(marquee, EntityType.UI_MARQUEE))
      throw new Error()
    let status = UpdateStatus.UNCHANGED

    const sandbox = EntityUtil.findAnyByID(
      state.level.parentEntities,
      EntityID.UI_LEVEL_EDITOR_SANDBOX
    )
    if (!sandbox) return status

    // const collision = LevelUtil.collisionWithCursor(state.level, marquee)

    // const toggle = collision && Input.inactiveTriggered(state.inputs.pick)
    // console.log(toggle)

    const {pick} = state.inputs

    if (!pick || !Input.inactiveTriggered(state.inputs.pick)) return status

    const panel = EntityUtil.findAnyByID(
      state.level.parentEntities,
      EntityID.UI_LEVEL_EDITOR_PANEL
    )
    const panelCollision =
      panel && EntityCollider.collidesEntity(state.level.cursor, panel)

    const cursorSandboxCollision = EntityCollider.collidesEntity(
      state.level.cursor,
      sandbox
    )
    if (!panelCollision && cursorSandboxCollision) {
      status |= EntityUtil.setState(marquee, MarqueeState.VISIBLE)

      const sandboxEntity = cursorSandboxCollision.rhs.descendant // this won't work correctly for sub-entities
      marquee.selection = sandboxEntity.spawnID

      const destination = {
        x: sandboxEntity.bounds.position.x - 1,
        y: sandboxEntity.bounds.position.y - 1
      }
      status |= EntityUtil.moveTo(marquee, destination)
      doTheStuffAndThings(marquee, destination, sandboxEntity)
    } else if (!panelCollision) {
      status |= EntityUtil.setState(marquee, EntityState.HIDDEN)
      marquee.selection = undefined
    }

    return status
  }
}

function doTheStuffAndThings(
  marquee: Marquee,
  destination: XY,
  sandboxEntity: Entity
): void {
  const rect = EntityUtil.imageRect(marquee)
  const marqueeImages = rect.images

  rect.bounds.position.x = destination.x
  rect.bounds.position.y = destination.y
  rect.bounds.size.w = sandboxEntity.bounds.size.w + 2
  rect.bounds.size.h = sandboxEntity.bounds.size.h + 2

  marqueeImages[Images.TOP].bounds.position.x = destination.x
  marqueeImages[Images.TOP].bounds.position.y = destination.y
  marqueeImages[Images.TOP].bounds.size.w = sandboxEntity.bounds.size.w + 2
  marqueeImages[Images.TOP].bounds.size.h = 1

  marqueeImages[Images.LEFT].bounds.position.x = destination.x
  marqueeImages[Images.LEFT].bounds.position.y = destination.y
  marqueeImages[Images.LEFT].bounds.size.w = 1
  marqueeImages[Images.LEFT].bounds.size.h = sandboxEntity.bounds.size.h + 2

  marqueeImages[Images.RIGHT].bounds.position.x =
    destination.x + sandboxEntity.bounds.size.w + 1
  marqueeImages[Images.RIGHT].bounds.position.y = destination.y
  marqueeImages[Images.RIGHT].bounds.size.w = 1
  marqueeImages[Images.RIGHT].bounds.size.h = sandboxEntity.bounds.size.h + 2
  marqueeImages[Images.RIGHT].wrap.x =
    (sandboxEntity.bounds.size.w + 1) & 1 ? 1 : 0

  marqueeImages[Images.BOTTOM].bounds.position.x = destination.x
  marqueeImages[Images.BOTTOM].bounds.position.y =
    destination.y + sandboxEntity.bounds.size.h + 1
  marqueeImages[Images.BOTTOM].bounds.size.w = sandboxEntity.bounds.size.w + 2
  marqueeImages[Images.BOTTOM].bounds.size.h = 1
  marqueeImages[Images.BOTTOM].wrap.x =
    (sandboxEntity.bounds.size.h + 1) & 1 ? 1 : 0
}

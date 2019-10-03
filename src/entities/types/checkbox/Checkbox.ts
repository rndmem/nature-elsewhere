import {Text} from '../text/Text'
import {UpdateStatus} from '../../updaters/updateStatus/UpdateStatus'
import {UpdateState} from '../../updaters/UpdateState'
import {Level} from '../../../levels/Level'
import {Input} from '../../../inputs/Input'
import {Atlas} from 'aseprite-atlas'
import {WH} from '../../../math/WH'
import {ImageRect} from '../../../imageStateMachine/ImageRect'
import {XY} from '../../../math/XY'
import {Entity} from '../../../entity/Entity'
import {Image} from '../../../image/Image'
import {ImageConfig, ImageParser} from '../../../image/ImageParser'
import {AtlasID} from '../../../atlas/AtlasID'
import {EntityType} from '../../../entity/EntityType'

export class Checkbox extends Entity {
  checked: boolean

  constructor({checked, ...props}: Checkbox.Props, atlas: Atlas) {
    super(props)
    this.checked = checked || false
    this.setText(
      {
        type: EntityType.UI_TEXT,
        text: props.text,
        textLayer: props.textLayer,
        textScale: props.textScale,
        textMaxSize: props.textMaxSize
      },
      0,
      atlas
    )
  }

  update(state: UpdateState): UpdateStatus {
    let status = super.update(state)
    const collision = Level.collisionWithCursor(state.level, this)

    const toggle = collision && Input.inactiveTriggered(state.inputs.pick)
    const nextChecked = toggle ? !this.checked : this.checked
    if (this.checked !== nextChecked) status |= UpdateStatus.TERMINATE
    this.checked = nextChecked

    return (
      status |
      this.setState(
        this.checked ? CheckboxState.CHECKED : CheckboxState.UNCHECKED
      )
    )
  }

  setText(props: Text.Props, layerOffset: number, atlas: Atlas): void {
    const position = new XY(this.bounds.position.x + 1, this.bounds.position.y)
    const child = new Text({...props, position}, atlas)
    child.elevate(layerOffset)
    const imageID = this.children[0]
      ? this.children[0].imageRect().imageID
      : undefined
    if (imageID) child.setImageID(imageID)
    this.children[0] = child
    this.setBackground(layerOffset, atlas)
    this.invalidateBounds()
  }

  getText(): string {
    return (<Text>this.children[0]).text
  }

  private setBackground(layerOffset: number, atlas: Atlas): void {
    const text = this.children[0]
    for (const state of [CheckboxState.UNCHECKED, CheckboxState.CHECKED]) {
      const size = new WH(text.bounds.size.w, text.bounds.size.h)
      this.machine.map[state].images.length = 0
      const images = newBackgroundImages(state, layerOffset, atlas, size)
      for (const image of images) ImageRect.add(this.machine.map[state], image)
      ImageRect.moveTo(
        this.machine.map[state],
        new XY(text.bounds.position.x - 1, this.bounds.position.y)
      )
    }
  }
}

export namespace Checkbox {
  export interface Props extends Text.Props {
    readonly checked?: boolean
  }
}

export enum CheckboxState {
  UNCHECKED = 'unchecked',
  CHECKED = 'checked'
}

const backgroundID: Readonly<Record<CheckboxState, AtlasID>> = Object.freeze({
  [CheckboxState.UNCHECKED]: AtlasID.PALETTE_PALE_GREEN,
  [CheckboxState.CHECKED]: AtlasID.PALETTE_LIGHT_GREEN
})

function newBackgroundImages(
  state: CheckboxState,
  layerOffset: number,
  atlas: Atlas,
  {w, h}: WH
): Image[] {
  const id = backgroundID[state]
  const layer = 'UI_MID'
  const background: ImageConfig = {
    id,
    bounds: {position: {x: 1}, size: {w, h}},
    layer
  }
  const border: ImageConfig = {
    id,
    bounds: {position: {y: 1}, size: {w: w + 2, h: h - 2}},
    layer
  }
  const backgroundImage = ImageParser.parse(background, atlas)
  const borderImage = ImageParser.parse(border, atlas)
  backgroundImage.elevate(layerOffset)
  borderImage.elevate(layerOffset)
  return [backgroundImage, borderImage]
}

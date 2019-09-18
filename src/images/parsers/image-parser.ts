import {AnimationIDParser} from '../../atlas/animation-id-parser'
import {AnimatorParser} from './animator-parser'
import {ImageConfig} from './image-config'
import {Image} from '../image'
import {LayerParser} from './layer-parser'
import {XYParser} from '../../math/parsers/xy-parser'
import {MillipixelIntXYParser} from './millipixel-xy-parser'
import {Atlas} from '../../atlas/atlas'
import {AnimationID} from '../../atlas/animation-id'
import {Rect} from '../../math/rect'
import {ImageScaleParser} from './image-scale-parser'

export namespace ImageParser {
  export function parse(config: ImageConfig, atlas: Atlas): Image {
    const id = AnimationIDParser.parse(config.id)
    return {
      id,
      bounds: parseBounds(config, id, atlas),
      layer: LayerParser.parse(config.layer),
      animator: AnimatorParser.parse(config.animator),
      scale: ImageScaleParser.parse(config.scale),
      wrap: MillipixelIntXYParser.parse(config.wrap),
      wrapVelocity: MillipixelIntXYParser.parse(config.wrapVelocity)
    }
  }
}

function parseBounds(config: ImageConfig, id: AnimationID, atlas: Atlas): Rect {
  const w =
    config.bounds && config.bounds.w !== undefined
      ? config.bounds.w
      : Math.abs(config.scale && config.scale.x ? config.scale.x : 1) *
        atlas[id].size.w
  const h =
    config.bounds && config.bounds.h !== undefined
      ? config.bounds.h
      : Math.abs(config.scale && config.scale.y ? config.scale.y : 1) *
        atlas[id].size.h
  const xy = XYParser.parse(config.bounds)
  return {...xy, w, h}
}

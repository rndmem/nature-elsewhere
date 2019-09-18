import {MillipixelIntXYConfig} from './millipixel-int-xy-config'
import {XY} from '../../math/xy'
import {IntParser} from '../../math/parsers/int-parser'

export namespace MillipixelIntXYParser {
  export function parse(config: MillipixelIntXYConfig): XY {
    return {
      x: config && config.x !== undefined ? IntParser.parse(config.x) : 0,
      y: config && config.y !== undefined ? IntParser.parse(config.y) : 0
    }
  }
}

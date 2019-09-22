import {Atlas} from '../../atlas/atlas/Atlas'
import {EntityState} from '../../entities/entityState/EntityState'
import {EntityStateParser} from '../../entities/entityState/EntityStateParser'
import {ImageRectParser} from '../imageRect/ImageRectParser'
import {ImageStateMap} from './ImageStateMap'
import {ImageStateMapConfig} from './ImageStateMapConfig'

export namespace ImageStateMapParser {
  export function parse(
    config: ImageStateMapConfig,
    atlas: Atlas
  ): ImageStateMap {
    const map: Writable<ImageStateMap> = {
      [EntityState.HIDDEN]: {
        origin: {x: 0, y: 0},
        bounds: {x: 0, y: 0, w: 0, h: 0},
        scale: {x: 0, y: 0},
        images: []
      }
    }
    if (!config) return map
    for (const stateConfig in config) {
      const state = EntityStateParser.parse(stateConfig)
      const rectConfig = config[stateConfig]
      map[state] = ImageRectParser.parse(rectConfig, atlas)
    }
    return map
  }
}

import {Atlas} from '../atlas/atlas/atlas'
import {Image} from '../images/image/image'
import {InstanceBuffer} from './instance-buffer'
import {ShaderLayout} from '../graphics/shaders/shader-layout/shader-layout'
import {UpdateState} from '../entities/updaters/update-state'
import {Entity} from '../entities/entity/entity'
import {EntityID} from '../entities/entity-id/entity-id'
import {NumberUtil} from '../math/number/number-util'
import {Level} from '../levels/level/level'
import {EntityUtil} from '../entities/entity/entity-util'

export interface Store {
  readonly layout: ShaderLayout
  readonly atlas: Atlas
  /** dat.byteLength may exceed bytes to be rendered. len is the only accurate
      number of instances. */
  dat: DataView
  len: number
}

export namespace Store {
  export function make(layout: ShaderLayout, atlas: Atlas): Store {
    return {
      atlas,
      layout,
      dat: InstanceBuffer.make(0),
      len: 0
    }
  }

  export function update(store: Store, state: UpdateState): void {
    const {atlas} = store
    let images: Image[] = []

    if (state.level.player)
      images.push(...process([state.level.player], state, atlas))

    if (state.level.cam.followID !== EntityID.ANONYMOUS) {
      let entity
      if (
        state.level.player &&
        state.level.player.id === state.level.cam.followID
      ) {
        entity = state.level.player
      } else
        for (const parent of state.level.parentEntities) {
          entity = EntityUtil.find(parent, state.level.cam.followID)
          if (entity) break
        }
      if (entity) {
        state.level.cam.bounds.x = NumberUtil.clamp(
          Math.trunc(entity.bounds.x) +
            Math.trunc(entity.bounds.w / 2) -
            Math.trunc(state.level.cam.bounds.w / 2),
          0,
          Math.max(0, state.level.size.w - state.level.cam.bounds.w)
        )
        state.level.cam.bounds.y = NumberUtil.clamp(
          Math.trunc(entity.bounds.y) +
            Math.trunc(entity.bounds.h / 2) -
            Math.trunc(state.level.cam.bounds.h / 2),
          0,
          Math.max(0, state.level.size.h - state.level.cam.bounds.h)
        )
      }
    }
    images.push(...process([state.level.cursor], state, atlas))
    if (state.level.destination)
      images.push(...process([state.level.destination], state, atlas))
    images.push(...process(Level.activeParents(state.level), state, atlas))
    images = images.sort(Image.compare)
    // [todo] now I'm getting the now stale parents.

    const size = InstanceBuffer.size(store.layout, images.length)
    if (store.dat.byteLength < size) store.dat = InstanceBuffer.make(size * 2)
    store.len = images.length
    images.forEach((img, i) =>
      InstanceBuffer.set(store.layout, atlas, store.dat, i, img)
    )
  }
}

function process(
  entities: readonly Entity[],
  state: UpdateState,
  atlas: Atlas
): Image[] {
  entities.forEach(entity => EntityUtil.update(entity, state))
  return entities.reduce(
    (images: Image[], entity) => [
      ...images,
      ...EntityUtil.animate(entity, state.time, state.level.cam.bounds, atlas)
    ],
    []
  )
}

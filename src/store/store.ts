import {Image} from '../images/image/image'
import {InstanceBuffer} from './instance-buffer'
import {ShaderLayout} from '../graphics/shaders/shader-layout/shader-layout'
import {UpdateState} from '../entities/updaters/update-state'
import {Entity} from '../entities/entity/entity'
import {EntityID} from '../entities/entity-id/entity-id'
import {Level} from '../levels/level/level'
import {EntityUtil} from '../entities/entity/entity-util'
import {CameraUtil} from '../levels/camera/camera-util'

export interface Store {
  readonly layout: ShaderLayout
  /** dat.byteLength may exceed bytes to be rendered. len is the only accurate
      number of instances. */
  dat: DataView
  len: number
}

export namespace Store {
  export function make(layout: ShaderLayout): Store {
    return {layout, dat: InstanceBuffer.make(0), len: 0}
  }

  export function update(store: Store, state: UpdateState): void {
    let images: Image[] = []

    if (state.level.player)
      images.push(...updateAndAnimate([state.level.player], state))

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
      if (entity)
        CameraUtil.centerOn(state.level.cam, state.level, entity.bounds)
    }
    images.push(...updateAndAnimate([state.level.cursor], state))
    if (state.level.destination)
      images.push(...updateAndAnimate([state.level.destination], state))
    images.push(...updateAndAnimate(Level.activeParents(state.level), state))
    images = images.sort(Image.compare)
    // [todo] now I'm getting the now stale parents.

    const size = InstanceBuffer.size(store.layout, images.length)
    if (store.dat.byteLength < size) store.dat = InstanceBuffer.make(size * 2)
    store.len = images.length
    images.forEach((img, i) =>
      InstanceBuffer.set(store.layout, state.level.atlas, store.dat, i, img)
    )
  }
}

function updateAndAnimate(
  entities: readonly Entity[],
  state: UpdateState
): Image[] {
  entities.forEach(entity => EntityUtil.update(entity, state))
  return entities.reduce(
    (images: Image[], entity) => [
      ...images,
      ...EntityUtil.animate(
        entity,
        state.time,
        state.level.cam.bounds,
        state.level.atlas
      )
    ],
    []
  )
}

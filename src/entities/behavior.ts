import {Atlas} from '../atlas/atlas'
import {Backpacker} from './backpacker'
import {Entity} from './entity'
import {ImageRect} from '../images/image-rect'
import {InputBit} from '../inputs/input-bit'
import {InputSource} from '../inputs/input-source'
import {Level} from '../levels/level'
import {NumberUtil} from '../math/number-util'
import {Recorder} from '../inputs/recorder'
import {Rect} from '../math/rect'
import {XY} from '../math/xy'
import {RectArray} from '../math/rect-array'

export const Behavior = Object.freeze({
  STATIC() {},
  CIRCLE(val: Entity) {
    const rect = val.states[val.state]
    val.states[val.state] = ImageRect.moveBy(rect, {x: val.vx, y: val.vy})
  },
  BACKPACKER(
    val: Entity,
    entities: readonly Entity[],
    level: Level,
    _atlas: Atlas,
    _cam: Rect,
    _recorder: Recorder,
    time: number
  ): void {
    if (!Backpacker.is(val)) throw new Error(`Unsupported ID "${val.id}".`)
    let rect = val.states[val.state]
    let {x, y} = rect

    const pick = val.dst
    const dst = pick ? XY.trunc(XY.add(pick, {x: -4, y: -rect.h + 2})) : rect
    const left = dst.x < Math.trunc(x)
    const right = dst.x > Math.trunc(x)
    const up = dst.y < Math.trunc(y)
    const down = dst.y > Math.trunc(y)
    const speed = Entity.velocity(val, left || right, up || down, time)

    if (pick) {
      if (up) (y -= speed), (val.state = 'walkUp'), (val.scale.x = 1)
      if (down) (y += speed), (val.state = 'walkDown'), (val.scale.x = 1)

      const animateHorizontal = Math.abs(x - dst.x) > 8
      if (left) {
        x -= speed
        if (animateHorizontal) (val.state = 'walkRight'), (val.scale.x = -1)
      }
      if (right) {
        x += speed
        if (animateHorizontal) (val.state = 'walkRight'), (val.scale.x = 1)
      }
    }

    const collision = collides(val, XY.trunc({x, y}), level, entities)
      ? {x: true, y: true}
      : {x: false, y: false}
    const diagonal = (left || right) && (up || down)
    if (diagonal && collision.x && collision.y) {
      collision.x = collides(
        val,
        {x: Math.trunc(x), y: Math.trunc(rect.y)},
        level,
        entities
      )
      if (collision.x)
        collision.y = collides(
          val,
          {x: Math.trunc(rect.x), y: Math.trunc(y)},
          level,
          entities
        )
    }
    if (collision.x) x = rect.x
    if (collision.y) y = rect.y

    if (!collision.x && !collision.y) {
      // Synchronize x and y pixel diagonal movement.
      if ((left && up) || (right && down)) y = Math.trunc(y) + (x % 1)
      // One direction is negative, the other is positive. Offset by 1 - speed
      // to synchronize.
      if ((left && down) || (right && up)) y = Math.trunc(y) + (1 - (x % 1))
    }

    const idle =
      !pick || XY.equal(XY.trunc({x, y}), dst) || (collision.x && collision.y)

    if (idle) {
      val.state =
        val.state === 'walkUp' || val.state === 'idleUp'
          ? 'idleUp'
          : val.state === 'idleRight' ||
            val.state === 'walkRight' ||
            val.state === 'walkLeft'
          ? 'idleRight'
          : 'idleDown'
      const destination = entities.find(({id}) => id === 'destination')
      if (destination) destination.state = 'hidden'
      val.dst = undefined
    }
    rect = val.states[val.state]
    val.states[val.state] = ImageRect.moveTo(val.states[val.state], {
      x,
      y
    })
  },
  FOLLOW_PLAYER(
    _val: Entity,
    entities: readonly Entity[],
    level: Level,
    _atlas: Atlas,
    cam: Mutable<Rect>
  ) {
    const player = entities.find(({id}) => id === 'backpacker')
    if (player) {
      const rect = player.states[player.state]
      cam.x = NumberUtil.clamp(
        Math.trunc(rect.x) + Math.trunc(rect.w / 2) - Math.trunc(cam.w / 2),
        0,
        Math.max(0, level.w - cam.w)
      )
      cam.y = NumberUtil.clamp(
        Math.trunc(rect.y) + Math.trunc(rect.h / 2) - Math.trunc(cam.h / 2),
        0,
        Math.max(0, level.h - cam.h)
      )
    }
  },
  WRAPAROUND(val: Entity, _entities: readonly Entity[], level: Level) {
    const rect = val.states[val.state]
    const xy = {
      x: NumberUtil.wrap(rect.x + val.vx, -rect.w, level.w),
      y: NumberUtil.wrap(rect.y + val.vy, -rect.h, level.h)
    }
    val.states[val.state] = ImageRect.moveTo(rect, xy)
  },
  FOLLOW_CAM(
    val: Entity,
    _entities: readonly Entity[],
    _level: Level,
    _atlas: Atlas,
    cam: Rect
  ) {
    const rect = val.states[val.state]
    val.states[val.state] = ImageRect.moveTo(rect, {
      x: cam.x + 1,
      y: cam.y + cam.h - (rect.h + 1)
    })
  },
  CURSOR(
    val: Entity,
    entities: readonly Entity[],
    _level: Level,
    _atlas: Atlas,
    _cam: Rect,
    recorder: Recorder
  ) {
    const [set] = recorder.combo.slice(-1)
    const pick = set && set[InputSource.POINTER_PICK]
    const point = set && set[InputSource.POINTER_POINT]
    const xy =
      pick && pick.bits === InputBit.PICK
        ? pick.xy
        : point
        ? point.xy
        : undefined

    const rect = val.states[val.state]
    if (xy) val.states[val.state] = ImageRect.moveTo(rect, xy)

    if (pick && pick.bits === InputBit.PICK) {
      const player = entities.find(({id}) => id === 'backpacker')
      if (player && Backpacker.is(player)) {
        val.state = 'hidden'
        player.dst = xy
      } else val.state = 'visible'
    } else if (point) val.state = 'visible'
  },
  DESTINATION(
    val: Entity,
    _entities: readonly Entity[],
    _level: Level,
    _atlas: Atlas,
    _cam: Rect,
    recorder: Recorder
  ) {
    const [set] = recorder.combo.slice(-1)
    const pick = set && set[InputSource.POINTER_PICK]
    if (pick && pick.bits === InputBit.PICK) {
      val.state = 'visible'
      val.states[val.state].images.forEach(
        val => ((val.exposure = 0), (val.period = 0))
      )
      val.states[val.state] = ImageRect.moveTo(val.states[val.state], pick.xy)
    }
  }
})

export namespace Behavior {
  export type Key = keyof typeof Behavior
}

const collides = (
  val: Entity,
  xy: XY, // Overrides val.xy
  level: Level,
  entities: readonly Entity[]
): boolean => {
  const plane = {
    x: xy.x,
    y: xy.y,
    w: val.states[val.state].w,
    h: val.states[val.state].h
  } // it seems unideal that i have to go to the image state for this if collision data is moving up. can i move collision data into the staete?
  const levelRect = {x: 0, y: 0, w: level.w, h: level.h}
  if (!Rect.within(plane, levelRect)) return true
  const rectArray = RectArray.moveBy(val.collisions, xy)
  return !!entities.find(entity => {
    if (val === entity) return
    if (!Rect.intersects(plane, entity.states[entity.state])) return
    const entityRectArray = RectArray.moveBy(
      entity.collisions,
      entity.states[entity.state]
    )
    return RectArray.intersects(rectArray, entityRectArray)
  })
}

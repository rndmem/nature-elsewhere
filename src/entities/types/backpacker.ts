import {Entity} from '../entity'
import {XY} from '../../math/xy'
import {EntityType} from './entity-type'
import {Updater} from '../updaters/updater'
import {UpdateStatus} from '../updaters/update-status'
import {EntityCollider} from '../colliders/entity-collider'
import {EntityState} from '../entity-state'

export interface Backpacker extends Entity {
  readonly type: EntityType.CHAR_BACKPACKER
  destination?: XY
}

export namespace Backpacker {
  export enum State {
    IDLE_DOWN = 'idleDown',
    IDLE_UP = 'idleUp',
    IDLE_RIGHT = 'idleRight',
    WALK_RIGHT = 'walkRight',
    WALK_DOWN = 'walkDown',
    WALK_UP = 'walkUp'
  }

  export const update: Updater.Update = (backpacker, state) => {
    if (!EntityType.assert<Backpacker>(backpacker, EntityType.CHAR_BACKPACKER))
      throw new Error()
    if (!state.level.destination) return UpdateStatus.UNCHANGED

    let status = UpdateStatus.UNCHANGED

    let {x, y} = backpacker.bounds
    const {x: originalX, y: originalY} = backpacker.bounds

    const dst = XY.trunc(
      XY.add(state.level.destination.bounds, {
        x: -4,
        y: -backpacker.bounds.h + 2
      })
    )
    const left = dst.x < Math.trunc(x)
    const right = dst.x > Math.trunc(x)
    const up = dst.y < Math.trunc(y)
    const down = dst.y > Math.trunc(y)
    const speed = Entity.velocity(
      backpacker,
      state.time,
      left || right,
      up || down
    )
    const animateHorizontal = Math.abs(x - dst.x) > 8

    if (up) y -= speed.y
    if (down) y += speed.y
    if (left) x -= speed.x
    if (right) x += speed.x

    Entity.moveTo(backpacker, {x, y})

    const diagonal = (left || right) && (up || down)
    const collision = EntityCollider.collidesEntities(
      backpacker,
      state.activeParents
    )

    const collisionDirection = {x: !!collision, y: !!collision}
    if (diagonal && collision) {
      Entity.moveTo(backpacker, {x: Math.trunc(x), y: Math.trunc(originalY)})
      collisionDirection.x = !!EntityCollider.collidesEntities(
        backpacker,
        state.activeParents
      )
      if (collisionDirection.x) {
        Entity.moveTo(backpacker, {x: Math.trunc(originalX), y: Math.trunc(y)})
        collisionDirection.y = !!EntityCollider.collidesEntities(
          backpacker,
          state.activeParents
        )
      }
    }
    if (collisionDirection.x) x = originalX // don't truncate these to allow the player to slide around obstacles
    if (collisionDirection.y) y = originalY

    if (diagonal && !collisionDirection.x && !collisionDirection.y) {
      // Synchronize x and y pixel diagonal movement.
      if ((left && up) || (right && down)) y = Math.trunc(y) + (x % 1)
      // One direction is negative, the other is positive. Offset by 1 - speed
      // to synchronize.
      if ((left && down) || (right && up)) y = Math.trunc(y) + (1 - (x % 1))
    }
    Entity.moveTo(backpacker, {x, y})

    const idle =
      XY.equal(XY.trunc({x, y}), dst) ||
      (collisionDirection.x && collisionDirection.y)

    let nextState = backpacker.state
    if (idle) {
      nextState =
        nextState === State.WALK_UP || nextState === State.IDLE_UP
          ? State.IDLE_UP
          : nextState === State.IDLE_RIGHT || nextState === State.WALK_RIGHT
          ? State.IDLE_RIGHT
          : State.IDLE_DOWN
      if (state.level.destination)
        Entity.setState(state.level.destination, EntityState.HIDDEN)
    } else {
      if (up) nextState = State.WALK_UP
      if (down) nextState = State.WALK_DOWN
      if ((left || right) && animateHorizontal) nextState = State.WALK_RIGHT
    }

    let flipX = backpacker.scale.x
    if (up || down) flipX = 1
    if (left && animateHorizontal) flipX = -1
    if (right && animateHorizontal) flipX = 1

    Entity.setScale(backpacker, {x: flipX, y: backpacker.scale.y})
    Entity.setState(backpacker, nextState)

    return status
  }
}

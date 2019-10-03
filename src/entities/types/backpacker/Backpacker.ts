import {CollisionType} from '../../../collision/CollisionType'
import {Entity} from '../../../entity/Entity'
import {NumberUtil} from '../../../math/NumberUtil'
import {UpdateState} from '../../updaters/UpdateState'
import {UpdateStatus} from '../../updaters/updateStatus/UpdateStatus'
import {XY} from '../../../math/XY'

export class Backpacker extends Entity {
  update(state: UpdateState): UpdateStatus {
    let status = super.update(state)

    const destination = calculateDestination(this, state)
    if (!destination) return UpdateStatus.UNCHANGED

    const {x, y} = this.bounds.position
    const left = destination.x < x
    const right = destination.x > x
    const up = destination.y < y
    const down = destination.y > y
    this.velocity.x = (left ? -1 : right ? 1 : 0) * 80
    this.velocity.y = (up ? -1 : down ? 1 : 0) * 80

    const idle = !this.velocity.x && !this.velocity.y

    let nextState = this.machine.state
    if (idle) {
      nextState = calculateIdleState(this)
      if (state.level.destination)
        state.level.destination.setState(Entity.State.HIDDEN)
    } else {
      const horizontalDistance = Math.abs(
        destination.x - this.bounds.position.x
      )
      if (up) nextState = BackpackerState.WALK_UP
      if (down) nextState = BackpackerState.WALK_DOWN
      if ((left || right) && ((!up && !down) || horizontalDistance > 5))
        nextState = BackpackerState.WALK_RIGHT
    }

    const scale = this.getScale().copy()
    if (up || down || right) scale.x = Math.abs(scale.x)
    if (left) scale.x = -1 * Math.abs(scale.x)

    this.setScale(scale)
    this.setState(nextState)

    return status
  }
}
export enum BackpackerState {
  IDLE_UP = 'idleUp',
  IDLE_RIGHT = 'idleRight',
  IDLE_DOWN = 'idleDown',
  WALK_UP = 'walkUp',
  WALK_RIGHT = 'walkRight',
  WALK_DOWN = 'walkDown'
}
export namespace Backpacker {
  export function collides(
    backpacker: Entity,
    entity: Entity,
    state: UpdateState
  ): void {
    if (entity.collisionType & CollisionType.OBSTACLE) {
      const idle = calculateIdleState(backpacker)
      backpacker.setState(idle)
      if (state.level.destination)
        state.level.destination.setState(Entity.State.HIDDEN)
    }
  }
}

function calculateIdleState(
  backpacker: Entity
): Entity.State | BackpackerState {
  switch (backpacker.machine.state) {
    case BackpackerState.WALK_UP:
    case BackpackerState.IDLE_UP:
      return BackpackerState.IDLE_UP
    case BackpackerState.IDLE_RIGHT:
    case BackpackerState.WALK_RIGHT:
      return BackpackerState.IDLE_RIGHT
  }
  return BackpackerState.IDLE_DOWN
}

function calculateDestination(
  backpacker: Backpacker,
  state: UpdateState
): Maybe<XY> {
  if (
    !state.level.destination ||
    state.level.destination.machine.state === Entity.State.HIDDEN
  )
    return
  const {x, y} = state.level.destination.bounds.position.add(
    backpacker.imageRect().origin
  )
  return new XY(
    NumberUtil.clamp(x, 0, state.level.size.w - backpacker.bounds.size.w),
    NumberUtil.clamp(y, 0, state.level.size.h - backpacker.bounds.size.h)
  )
}

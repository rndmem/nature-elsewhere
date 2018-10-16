import {DrawOrder} from '../textures/draw-order.js'
import {SuperBallAnimation} from '../textures/super-ball-animation.js'
import {Entity} from './entity.js'

export class SuperBall extends Entity {
  /**
   * @arg {XY} position
   * @arg {XY} speed
   */
  constructor(position, speed) {
    super([new SuperBallAnimation(position)], speed)
  }

  /** @return {DrawOrder} */
  get drawOrder() {
    return DrawOrder.SUPER_BALL
  }
}
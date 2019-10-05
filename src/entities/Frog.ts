import {Entity} from '../entity/Entity'
import {EntityType} from '../entity/EntityType'
import {UpdatePredicate} from '../updaters/updatePredicate/UpdatePredicate'
import {CollisionType} from '../collision/CollisionType'
import {CollisionPredicate} from '../collision/CollisionPredicate'
import {Rect} from '../math/Rect'
import {ImageRect} from '../imageStateMachine/ImageRect'
import {Image} from '../image/Image'
import {Layer} from '../image/Layer'
import {AtlasID} from '../atlas/AtlasID'
import {Atlas} from 'aseprite-atlas'
import {XY} from '../math/XY'

export class Frog extends Entity {
  constructor(atlas: Atlas, props?: Optional<Entity.Props, 'type'>) {
    super({
      type: EntityType.CHAR_FROG,
      state: FrogState.IDLE,
      map: {
        [Entity.State.HIDDEN]: new ImageRect(),
        [FrogState.IDLE]: new ImageRect({
          images: [
            new Image(atlas, {id: AtlasID.CHAR_FROG_IDLE}),
            new Image(atlas, {
              id: AtlasID.CHAR_FROG_IDLE_SHADOW,
              position: new XY(-1, 1),
              layer: Layer.SHADOW
            })
          ]
        })
      },
      updatePredicate: UpdatePredicate.INTERSECTS_VIEWPORT,
      collisionType: CollisionType.TYPE_CHARACTER | CollisionType.OBSTACLE,
      collisionPredicate: CollisionPredicate.BODIES,
      collisionBodies: [Rect.make(1, 14, 6, 2)],
      ...props
    })
  }
}

export enum FrogState {
  IDLE = 'idle'
}
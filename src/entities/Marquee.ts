import {Atlas} from 'aseprite-atlas'
import {AtlasID} from '../atlas/AtlasID'
import {Cursor} from './Cursor'
import {EntityCollider} from '../collision/EntityCollider'
import {Entity} from '../entity/Entity'
import {EntityID} from '../entity/EntityID'
import {EntitySerializer} from '../entity/EntitySerializer'
import {EntityType} from '../entity/EntityType'
import {Image} from '../image/Image'
import {ImageRect} from '../imageStateMachine/ImageRect'
import {Input} from '../inputs/Input'
import {JSONValue} from '../utils/JSON'
import {Layer} from '../image/Layer'
import {NumberUtil} from '../math/NumberUtil'
import {ObjectUtil} from '../utils/ObjectUtil'
import {Rect} from '../math/Rect'
import {UpdatePredicate} from '../updaters/updatePredicate/UpdatePredicate'
import {UpdateState} from '../updaters/UpdateState'
import {UpdateStatus} from '../updaters/updateStatus/UpdateStatus'
import {WH} from '../math/WH'
import {XY} from '../math/XY'

export class Marquee extends Entity<Marquee.Variant, Marquee.State> {
  private _selection?: Entity
  /** The offset from the top-left of the selection to the cursor when the
      cursor is active. */
  private readonly _cursorOffset: XY

  constructor(
    atlas: Atlas,
    props?: Entity.SubProps<Marquee.Variant, Marquee.State>
  ) {
    super({
      ...defaults,
      map: {
        [Entity.BaseState.HIDDEN]: new ImageRect(),
        [Marquee.State.VISIBLE]: new ImageRect({
          images: [
            new Image(atlas, {
              id: AtlasID.UI_CHECKERBOARD_BLACK_WHITE,
              layer: Layer.UI_HIHI,
              wrapVelocity: new XY(20, 0)
            }),
            new Image(atlas, {
              id: AtlasID.UI_CHECKERBOARD_BLACK_WHITE,
              layer: Layer.UI_HIHI,
              wrapVelocity: new XY(20, 0)
            }),
            new Image(atlas, {
              id: AtlasID.UI_CHECKERBOARD_BLACK_WHITE,
              layer: Layer.UI_HIHI,
              wrapVelocity: new XY(20, 0)
            }),
            new Image(atlas, {
              id: AtlasID.UI_CHECKERBOARD_BLACK_WHITE,
              layer: Layer.UI_HIHI,
              wrapVelocity: new XY(20, 0)
            })
          ]
        })
      },
      ...props
    })
    this._selection = undefined
    this._cursorOffset = new XY(0, 0)
  }

  get selection(): Maybe<Entity> {
    return this._selection
  }

  setSelection(selection: Maybe<Entity>, cursor: Cursor): UpdateStatus {
    let status = UpdateStatus.UNCHANGED

    // If the state is now visible, transition prior to trying to manipulate the
    // marquee images as they only exist in visible.
    status |= this.transition(
      selection ? Marquee.State.VISIBLE : Entity.BaseState.HIDDEN
    )

    if (selection) {
      status |= UpdateStatus.UPDATED
      const to = selection.bounds.position.sub(new XY(1, 1))
      status |= this.moveTo(to)
      this._resize(to, selection)
    }

    this._selection = selection
    const offset = selection
      ? selection.bounds.position.sub(cursor.bounds.position)
      : new XY(0, 0)
    this._cursorOffset.x = offset.x
    this._cursorOffset.y = offset.y
    return status
  }

  update(state: UpdateState): UpdateStatus {
    let status = super.update(state)

    const {pick} = state.inputs
    if (!pick || !pick.active) return status

    const sandbox = Entity.findAnyByID(
      state.level.parentEntities,
      EntityID.UI_LEVEL_EDITOR_SANDBOX
    )
    if (!sandbox) return status

    const sandboxChildren = this._sandboxChildrenCollidingWithCursor(
      sandbox,
      state
    )
    const hudCollision = !!EntityCollider.collidesEntities(
      state.level.cursor,
      state.level.hud
    ).length

    const triggered = Input.activeTriggered(state.inputs.pick)
    if (triggered && !hudCollision) {
      const {selection} = this
      const currentIndex = selection
        ? sandboxChildren.findIndex(entity => entity.equal(selection))
        : -1
      const nextIndex = NumberUtil.wrap(
        currentIndex + 1,
        0,
        sandboxChildren.length
      )
      const entity: Maybe<Entity> = sandboxChildren[nextIndex]
      return this.setSelection(entity, state.level.cursor)
    }

    if (!triggered && this._selection) {
      const destination = state.level.cursor.bounds.position.add(
        this._cursorOffset
      )
      status |= this.moveTo(destination.sub(new XY(1, 1)))
      status |= this._selection.moveTo(destination)
      sandbox.invalidateBounds()
      return status | UpdateStatus.UPDATED
    }

    return status
  }

  toJSON(): JSONValue {
    return EntitySerializer.serialize(this, defaults)
  }

  private _sandboxChildrenCollidingWithCursor(
    sandbox: Entity,
    state: UpdateState
  ): Entity[] {
    const pickCenter = Rect.centerOf(state.level.cursor.bounds)
    return EntityCollider.collidesEntity(state.level.cursor, sandbox).sort(
      compareCentroidTo(pickCenter)
    )
  }

  /** These images are only present in the visible state. */
  private _resize(destination: XY, sandboxEntity: Entity): void {
    const marqueeImages = this.images()

    marqueeImages[Images.TOP].moveTo(destination)
    marqueeImages[Images.TOP].sizeTo(new WH(sandboxEntity.bounds.size.w + 2, 1))

    marqueeImages[Images.LEFT].moveTo(destination)
    marqueeImages[Images.LEFT].sizeTo(
      new WH(1, sandboxEntity.bounds.size.h + 2)
    )

    marqueeImages[Images.RIGHT].moveTo(
      new XY(destination.x + sandboxEntity.bounds.size.w + 1, destination.y)
    )
    marqueeImages[Images.RIGHT].sizeTo(
      new WH(1, sandboxEntity.bounds.size.h + 2)
    )
    marqueeImages[Images.RIGHT].wrapTo(
      new XY((sandboxEntity.bounds.size.w + 1) & 1 ? 1 : 0, 0)
    )

    marqueeImages[Images.BOTTOM].moveTo(
      new XY(destination.x, destination.y + sandboxEntity.bounds.size.h + 1)
    )
    marqueeImages[Images.BOTTOM].sizeTo(
      new WH(sandboxEntity.bounds.size.w + 2, 1)
    )
    marqueeImages[Images.BOTTOM].wrapTo(
      new XY((sandboxEntity.bounds.size.h + 1) & 1 ? 1 : 0, 0)
    )

    this.invalidateImageBounds()
    this.invalidateBounds()
  }
}

export namespace Marquee {
  export enum Variant {
    NONE = 'none'
  }

  export enum State {
    VISIBLE = 'visible'
  }
}

enum Images {
  TOP = 0,
  RIGHT = 1,
  BOTTOM = 2,
  LEFT = 3
}

const defaults = ObjectUtil.freeze({
  type: EntityType.UI_MARQUEE,
  variant: Marquee.Variant.NONE,
  state: Entity.BaseState.HIDDEN,
  updatePredicate: UpdatePredicate.ALWAYS
})

function compareCentroidTo(
  to: Readonly<XY>
): (lhs: Readonly<Entity>, rhs: Readonly<Entity>) => number {
  return (lhs, rhs) =>
    Rect.centerOf(lhs.bounds)
      .sub(to)
      .magnitude() -
    Rect.centerOf(rhs.bounds)
      .sub(to)
      .magnitude()
}

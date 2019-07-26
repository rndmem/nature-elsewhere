import {AnimationID, ReverseAnimationID} from '../images/animation-id'
import * as Aseprite from './aseprite'
import * as Atlas from './atlas'

export function parse({meta, frames}: Aseprite.File): Atlas.State {
  return meta.frameTags.reduce(
    (sum, val) => ({
      ...sum,
      [parseAnimationIDKey(val)]: parseAnimation(val, frames, meta.slices)
    }),
    <Atlas.State>{}
  )
}

export function parseAnimationIDKey({
  name
}: Aseprite.FrameTag): keyof typeof AnimationID {
  if (isAnimationID(name)) return ReverseAnimationID[name]
  throw new Error(`"${name}" is not an AnimationID key.`)
}

export function isAnimationID(val: string): val is ValueOf<typeof AnimationID> {
  return val in ReverseAnimationID
}

export function parseAnimation(
  frameTag: Aseprite.FrameTag,
  frames: Aseprite.FrameMap,
  slices: readonly Aseprite.Slice[]
): Atlas.Animation {
  const cels = []
  for (let i = frameTag.from; i <= frameTag.to; ++i)
    cels.push(parseCel(frameTag, frames[`${frameTag.name} ${i}`], i, slices))

  let duration = cels.reduce((sum, {duration}) => sum + duration, 0)
  const pingPong = frameTag.direction === Aseprite.AnimationDirection.PING_PONG
  if (pingPong && cels.length > 2)
    duration += duration - (cels[0].duration + cels[cels.length - 1].duration)

  const size = frames[`${frameTag.name} ${frameTag.from}`].sourceSize
  return {...size, cels, duration, direction: parseAnimationDirection(frameTag)}
}

export function parseAnimationDirection({
  direction
}: Aseprite.FrameTag): Atlas.AnimationDirection {
  if (isAnimationDirection(direction)) return direction
  throw new Error(`"${direction}" is not a Direction.`)
}

export function isAnimationDirection(
  val: string
): val is Atlas.AnimationDirection {
  return Object.values(Atlas.AnimationDirection).includes(val)
}

export function parseCel(
  frameTag: Aseprite.FrameTag,
  frame: Aseprite.Frame,
  frameNumber: number,
  slices: readonly Aseprite.Slice[]
): Atlas.Cel {
  const duration = parseDuration(frame.duration)
  const collision = parseCollision(frameTag, frameNumber, slices)
  return {...parsePosition(frame), duration, collision}
}

export function parsePosition(frame: Aseprite.Frame): XY {
  const padding = parsePadding(frame)
  return {x: frame.frame.x + padding.w / 2, y: frame.frame.y + padding.h / 2}
}

export function parsePadding({frame, sourceSize}: Aseprite.Frame): WH {
  return {w: frame.w - sourceSize.w, h: frame.h - sourceSize.h}
}

export function parseDuration(duration: Aseprite.Duration): number {
  const infinite = duration === Aseprite.INFINITE_DURATION
  return infinite ? Number.POSITIVE_INFINITY : duration
}

export function parseCollision(
  frameTag: Aseprite.FrameTag,
  frameNumber: number,
  slices: readonly Aseprite.Slice[]
): readonly Rect[] {
  const offset = frameNumber - frameTag.from
  return (
    slices
      // Filter out Slices not for this Tag.
      .filter(slice => slice.name === frameTag.name)
      // For each Slice, get the greatest relevant Key.
      .map(({keys}) => keys.filter(key => key.frame <= offset).slice(-1)[0])
      .map(({bounds}) => bounds)
  )
}
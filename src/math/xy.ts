// do i really want these to be radonly verywhere?
export interface XY {
  readonly x: number
  readonly y: number
}

export namespace XY {
  export function add({x, y}: XY, rhs: XY): XY {
    return {x: x + rhs.x, y: y + rhs.y}
  }

  export function sub({x, y}: XY, rhs: XY): XY {
    return {x: x - rhs.x, y: y - rhs.y}
  }

  export function equal({x, y}: XY, rhs: XY): boolean {
    return x === rhs.x && y === rhs.y
  }

  export function min({x, y}: XY, rhs: XY): XY {
    return {x: Math.min(x, rhs.x), y: Math.min(y, rhs.y)}
  }

  export function max({x, y}: XY, rhs: XY): XY {
    return {x: Math.max(x, rhs.x), y: Math.max(y, rhs.y)}
  }

  export function trunc({x, y}: XY): XY {
    return {x: Math.trunc(x), y: Math.trunc(y)}
  }
}

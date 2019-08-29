export namespace ArrayUtil {
  export function unique<T>(
    equals: (lhs: T, rhs: T) => boolean
  ): Parameters<T[]['filter']>[0] {
    return (item: T, _: number, array: readonly T[]) =>
      array.findIndex(rhs => equals(item, rhs)) !== -1
  }

  /** Type guard. */
  export function is<T>(val: T | null | undefined): val is T {
    return val !== null && val !== undefined
  }

  export function bifurcate<T>(
    array: readonly T[],
    fn: (val: T, index: number, array: readonly T[]) => boolean
  ): readonly [readonly T[], readonly T[]] {
    return array.reduce(
      (sum, val, i) => (sum[fn(val, i, array) ? 1 : 0].push(val), sum),
      <[T[], T[]]>[[], []]
    )
  }
}

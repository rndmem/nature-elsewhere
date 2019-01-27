import {InputMask} from './input-mask'
import {Recorder} from './recorder'

const LEFT = InputMask.LEFT
const RIGHT = InputMask.RIGHT
const UP = InputMask.UP
const DOWN = InputMask.DOWN

const inputs: InputMask[] = Object.values(InputMask).filter(
  val => typeof val === 'number'
)
type InputMethod = Exclude<
  keyof Recorder,
  'write' | 'set' | 'read' | 'combo' | 'active'
>
type MaskMethod = Readonly<{method: InputMethod; mask: InputMask}>

const maskMethods: MaskMethod[] = [
  {mask: LEFT, method: 'left'},
  {mask: RIGHT, method: 'right'},
  {mask: UP, method: 'up'},
  {mask: DOWN, method: 'down'},
  {mask: InputMask.MENU, method: 'menu'},
  {mask: InputMask.DEBUG_CONTEXT_LOSS, method: 'debugContextLoss'}
]

describe('Mask', () => {
  test.each(inputs)('%# Mask %p is unique', (input: InputMask) =>
    expect(inputs.filter((val: InputMask) => input === val)).toHaveLength(1)
  )

  test.each(inputs)(
    '%# Mask %p is a nonzero power of two',
    (input: InputMask) => expect(Math.log2(input) % 1).toStrictEqual(0)
  )
})

describe('State', () => {
  test.each(maskMethods)('%# no input %p', ({method}: MaskMethod) => {
    const state = new Recorder().read(1)
    expect(state[method]()).toStrictEqual(false)
    expect(state[method](true)).toStrictEqual(false)
    expect(state.combo()).toStrictEqual(true)
    expect(state.combo(true)).toStrictEqual(false)
  })

  test.each(maskMethods)('%# tapped input %p', ({mask, method}: MaskMethod) => {
    const state = new Recorder().set(mask, true).read(1)
    expect(state[method]()).toStrictEqual(true)
    expect(state[method](true)).toStrictEqual(true)
    expect(state.combo(false, mask)).toStrictEqual(true)
    expect(state.combo(true, mask)).toStrictEqual(true)
  })

  test.each(maskMethods)(
    '%# old tapped input %p',
    ({mask, method}: MaskMethod) => {
      const state = new Recorder().set(mask, true).read(1000)
      expect(state[method]()).toStrictEqual(true)
      expect(state[method](true)).toStrictEqual(true)
      expect(state.combo(false, mask)).toStrictEqual(true)
      expect(state.combo(true, mask)).toStrictEqual(true)
    }
  )

  test.each(maskMethods)('%# held input %p', ({mask, method}: MaskMethod) => {
    const state = new Recorder()
      .set(mask, true)
      .read(1)
      .write()
      .read(1)
    expect(state[method]()).toStrictEqual(true)
    expect(state[method](true)).toStrictEqual(false)
    expect(state.combo(false, mask)).toStrictEqual(true)
    expect(state.combo(true, mask)).toStrictEqual(false)
  })

  test.each(maskMethods)(
    '%# long held input %p',
    ({mask, method}: MaskMethod) => {
      const state = new Recorder()
        .set(mask, true)
        .read(1)
        .write()
        .read(1000)
      expect(state[method]()).toStrictEqual(true)
      expect(state[method](true)).toStrictEqual(false)
      expect(state.combo(false, mask)).toStrictEqual(true)
      expect(state.combo(true, mask)).toStrictEqual(false)
    }
  )

  test.each(maskMethods)(
    '%# tapped and released input %p',
    ({mask, method}: MaskMethod) => {
      const state = new Recorder()
        .set(mask, true)
        .read(1)
        .write()
        .set(mask, false)
        .read(1)
      expect(state[method]()).toStrictEqual(false)
      expect(state[method](true)).toStrictEqual(false)
      expect(state.combo(false, mask)).toStrictEqual(true)
      expect(state.combo(true, mask)).toStrictEqual(false)
    }
  )

  test.each(maskMethods)(
    '%# toggled 3x input %p',
    ({mask, method}: MaskMethod) => {
      const state = new Recorder()
        .set(mask, true)
        .read(1)
        .write()
        .set(mask, false)
        .read(1)
        .write()
        .set(mask, true)
        .read(1)
      expect(state[method]()).toStrictEqual(true)
      expect(state[method](true)).toStrictEqual(true)
      expect(state.combo(false, mask, mask)).toStrictEqual(true)
      expect(state.combo(true, mask, mask)).toStrictEqual(true)
    }
  )

  test('Changed input without release', () => {
    const state = new Recorder()
      .set(UP, true)
      .read(1)
      .write()
      .set(DOWN, true)
      .read(1)

    expect(state.up()).toStrictEqual(true)
    expect(state.up(true)).toStrictEqual(false)
    expect(state.down()).toStrictEqual(true)
    expect(state.down(true)).toStrictEqual(true)

    expect(state.combo(false, UP)).toStrictEqual(false)
    expect(state.combo(true, UP)).toStrictEqual(false)
    expect(state.combo(false, DOWN)).toStrictEqual(false)
    expect(state.combo(true, DOWN)).toStrictEqual(false)
    expect(state.combo(false, UP | DOWN)).toStrictEqual(true)
    expect(state.combo(true, UP | DOWN)).toStrictEqual(true)
    expect(state.combo(false, UP, UP | DOWN)).toStrictEqual(true)
    expect(state.combo(true, UP, UP | DOWN)).toStrictEqual(true)
  })

  test.each(maskMethods)(
    '%# missed input release %p',
    ({mask, method}: MaskMethod) => {
      const state = new Recorder()
        .set(mask, true)
        .read(1)
        .write()
        .set(mask, true)
        .read(1)
      expect(state[method]()).toStrictEqual(true)
      expect(state[method](true)).toStrictEqual(false)
      expect(state.combo(false, mask)).toStrictEqual(true)
      expect(state.combo(true, mask)).toStrictEqual(false)
    }
  )

  test.each(maskMethods)(
    '%# missed input tapped %p',
    ({mask, method}: MaskMethod) => {
      const state = new Recorder()
        .set(mask, true)
        .read(1)
        .write()
        .set(mask, false)
        .read(1)
        .write()
        .set(mask, false)
        .read(1)
      expect(state[method]()).toStrictEqual(false)
      expect(state[method](true)).toStrictEqual(false)
      expect(state.combo(false, mask)).toStrictEqual(true)
      expect(state.combo(true, mask)).toStrictEqual(false)
    }
  )

  test('1x combo', () => {
    const state = new Recorder().set(UP, true).read(1)
    expect(state.up()).toStrictEqual(true)
    expect(state.up(true)).toStrictEqual(true)
    expect(state.combo(false, UP)).toStrictEqual(true)
    expect(state.combo(true, UP)).toStrictEqual(true)
  })

  test('2x combo', () => {
    const state = new Recorder()
      .set(UP, true)
      .read(1)
      .write()
      .set(UP, false)
      .read(1)
      .write()
      .set(UP, true)
      .read(1)
    expect(state.up()).toStrictEqual(true)
    expect(state.up(true)).toStrictEqual(true)
    expect(state.combo(false, UP, UP)).toStrictEqual(true)
    expect(state.combo(true, UP, UP)).toStrictEqual(true)
  })

  test('Long combo', () => {
    const state = new Recorder()
      .set(UP, true)
      .read(100)
      .write()
      .set(UP, false)
      .read(100)
      .write()
      .set(UP, true)
      .read(100)
      .write()
      .set(UP, false)
      .read(100)
      .write()
      .set(DOWN, true)
      .read(100)
      .write()
      .set(DOWN, false)
      .read(100)
      .write()
      .set(DOWN, true)
      .read(100)
      .write()
      .set(DOWN, false)
      .read(100)
      .write()
      .set(LEFT, true)
      .read(100)
      .write()
      .set(LEFT, false)
      .read(100)
      .write()
      .set(RIGHT, true)
      .read(100)
      .write()
      .set(RIGHT, false)
      .read(100)
      .write()
      .set(LEFT, true)
      .read(100)
      .write()
      .set(LEFT, false)
      .read(100)
      .write()
      .set(RIGHT, true)
      .read(100)

    expect(state.up()).toStrictEqual(false)
    expect(state.up(true)).toStrictEqual(false)
    expect(state.down()).toStrictEqual(false)
    expect(state.down(true)).toStrictEqual(false)
    expect(state.left()).toStrictEqual(false)
    expect(state.left(true)).toStrictEqual(false)
    expect(state.right()).toStrictEqual(true)
    expect(state.right(true)).toStrictEqual(true)

    const combo = [UP, UP, DOWN, DOWN, LEFT, RIGHT, LEFT, RIGHT]
    expect(state.combo(false, ...combo)).toStrictEqual(true)
    expect(state.combo(true, ...combo)).toStrictEqual(true)
  })

  test('After combo', () => {
    const state = new Recorder()
      .set(UP, true)
      .read(1)
      .write()
      .set(UP, false)
      .read(1)
      .write()
      .set(UP, true)
      .read(1)
      .write()
      .set(UP, false)
      .read(1)
    expect(state.up()).toStrictEqual(false)
    expect(state.up(true)).toStrictEqual(false)
    expect(state.combo(false, UP, UP)).toStrictEqual(true)
    expect(state.combo(true, UP, UP)).toStrictEqual(false)
  })

  test('Around the world combo', () => {
    const state = new Recorder()
      .set(UP, true)
      .read(1)
      .write()
      .set(LEFT, true)
      .read(1)
      .write()
      .set(UP, false)
      .read(1)
      .write()
      .set(DOWN, true)
      .read(1)
      .write()
      .set(LEFT, false)
      .read(1)
      .write()
      .set(RIGHT, true)
      .read(1)
      .write()
      .set(DOWN, false)
      .read(1)

    expect(state.up()).toStrictEqual(false)
    expect(state.up(true)).toStrictEqual(false)
    expect(state.left()).toStrictEqual(false)
    expect(state.left(true)).toStrictEqual(false)
    expect(state.down()).toStrictEqual(false)
    expect(state.down(true)).toStrictEqual(false)
    expect(state.right()).toStrictEqual(true)
    expect(state.right(true)).toStrictEqual(false)

    const combo = [UP, UP | LEFT, LEFT, LEFT | DOWN, DOWN, DOWN | RIGHT, RIGHT]
    expect(state.combo(false, ...combo)).toStrictEqual(true)
    expect(state.combo(true, ...combo)).toStrictEqual(true)
  })

  test('Combo missed', () => {
    const state = new Recorder()
      .set(UP, true)
      .read(1)
      .write()
      .set(UP, false)
      .read(1000)
      .write()
      .set(UP, true)
      .read(1)
    expect(state.up()).toStrictEqual(true)
    expect(state.up(true)).toStrictEqual(true)
    expect(state.combo(false, UP, UP)).toStrictEqual(false)
    expect(state.combo(true, UP, UP)).toStrictEqual(false)
  })

  test('Combo subset', () => {
    const state = new Recorder()
      .set(DOWN, true)
      .read(1)
      .write()
      .set(DOWN, false)
      .read(1)
      .write()
      .set(UP, true)
      .read(1)
      .write()
      .set(UP, false)
      .read(1)
      .write()
      .set(UP, true)
      .read(1)
    expect(state.up()).toStrictEqual(true)
    expect(state.up(true)).toStrictEqual(true)
    expect(state.combo(false, DOWN, UP, UP)).toStrictEqual(true)
    expect(state.combo(true, DOWN, UP, UP)).toStrictEqual(true)
    expect(state.combo(false, UP, UP)).toStrictEqual(true)
    expect(state.combo(true, UP, UP)).toStrictEqual(true)
    expect(state.combo(false, UP)).toStrictEqual(true)
    expect(state.combo(true, UP)).toStrictEqual(true)
  })

  test('Held combo', () => {
    const state = new Recorder()
      .set(DOWN, true)
      .read(1)
      .write()
      .set(DOWN, false)
      .read(1)
      .write()
      .set(UP, true)
      .read(1000)
    expect(state.up()).toStrictEqual(true)
    expect(state.up(true)).toStrictEqual(true)
    expect(state.combo(false, DOWN, UP)).toStrictEqual(true)
    expect(state.combo(true, DOWN, UP)).toStrictEqual(true)
  })

  test('After held combo', () => {
    const state = new Recorder()
      .set(DOWN, true)
      .read(1)
      .write()
      .set(DOWN, false)
      .read(1)
      .write()
      .set(UP, true)
      .read(1000)
      .write()
      .read(1)
    expect(state.up()).toStrictEqual(true)
    expect(state.up(true)).toStrictEqual(false)
    expect(state.combo(false, DOWN, UP)).toStrictEqual(true)
    expect(state.combo(true, DOWN, UP)).toStrictEqual(false)
  })

  test('Long after held combo', () => {
    const state = new Recorder()
      .set(DOWN, true)
      .read(1)
      .write()
      .set(DOWN, false)
      .read(1)
      .write()
      .set(UP, true)
      .read(1000)
      .write()
      .read(1000)
    expect(state.up()).toStrictEqual(true)
    expect(state.up(true)).toStrictEqual(false)
    expect(state.combo(false, DOWN, UP)).toStrictEqual(true)
    expect(state.combo(true, DOWN, UP)).toStrictEqual(false)
  })

  test('Simultaneous input combo', () => {
    const state = new Recorder()
      .set(UP | DOWN, true)
      .read(1)
      .write()
      .set(UP | DOWN, false)
      .read(1)
      .write()
      .set(UP | DOWN, true)
      .read(1)
      .write()
      .set(DOWN, false)
      .read(1)
    expect(state.up()).toStrictEqual(true)
    expect(state.up(true)).toStrictEqual(false)
    expect(state.down()).toStrictEqual(false)
    expect(state.down(true)).toStrictEqual(false)
    expect(state.combo(false, UP | DOWN, UP | DOWN, UP)).toStrictEqual(true)
    expect(state.combo(true, UP | DOWN, UP | DOWN, UP)).toStrictEqual(true)
  })
})

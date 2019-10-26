import {Renderer} from './Renderer'

export interface RendererStateMachine {
  readonly win: Window
  readonly canvas: HTMLCanvasElement
  renderer: Renderer
  frameID?: number
  onFrame(time: number): void
  onPause(): void
  newRenderer(): Renderer
  onEvent(event: Event): void
}

export namespace RendererStateMachine {
  export function make(
    props: Omit<RendererStateMachine, 'renderer' | 'onEvent'>
  ): RendererStateMachine {
    const machine = {
      ...props,
      renderer: props.newRenderer(),
      onEvent: (event: Event) => onEvent(machine, event)
    }
    return machine
  }

  export function start(machine: RendererStateMachine): void {
    register(machine, true)
    resume(machine)
  }

  export function stop(machine: RendererStateMachine): void {
    pause(machine)
    register(machine, false)
  }
}

function pause(machine: RendererStateMachine): void {
  if (machine.frameID !== undefined)
    machine.win.cancelAnimationFrame(machine.frameID)
  machine.frameID = undefined
  machine.onPause()
}

function resume(machine: RendererStateMachine): void {
  const focused = machine.win.document.hasFocus()
  if (
    focused &&
    !machine.renderer.gl.isContextLost() &&
    machine.frameID === undefined
  )
    loop(machine)
}

function onEvent(machine: RendererStateMachine, event: Event): void {
  if (event.type === 'webglcontextrestored') {
    machine.renderer = machine.newRenderer()
    resume(machine)
  } else if (event.type === 'focus') resume(machine)
  else pause(machine)
  event.preventDefault()
}

function loop(machine: RendererStateMachine, then?: number): void {
  machine.frameID = machine.win.requestAnimationFrame(now => {
    // Duration can be great when a frame is held for debugging. Limit it to one
    // second.
    const time = Math.min(now - (then ?? now), 1000)
    machine.onFrame(time)

    // If not paused by client, request a new frame.
    if (machine.frameID !== undefined) loop(machine, now)
  })
}

function register(machine: RendererStateMachine, register: boolean): void {
  const fn = register ? 'addEventListener' : 'removeEventListener'
  for (const type of ['webglcontextrestored', 'webglcontextlost'])
    machine.canvas[fn](type, machine.onEvent)
  for (const type of ['focus', 'blur']) machine.win[fn](type, machine.onEvent)
}

import {Assets} from './loaders/assets'
import {FunctionUtil} from './utils/function-util'
import {LevelStateMachine} from './levels/level-state-machine'
import {Renderer} from './graphics/renderer/renderer'
import {RendererStateMachine} from './graphics/renderer/renderer-state-machine'
import {Settings} from './settings/settings'
import {Synth} from './audio/synth'
import {Viewport} from './graphics/viewport'
import {WindowModeSetting} from './settings/window-mode-setting'
import {UpdateState} from './entities/updaters/update-state'
import {InputPoller} from './inputs/input-poller'
import {InputState} from './inputs/input-state'

export interface Game {
  readonly win: Window
  readonly doc: Document
  /** The total execution time in milliseconds excluding pauses. */
  age: Milliseconds
  /** The outstanding time to execute in milliseconds. */
  time: Milliseconds
  /** The exact duration in milliseconds to apply each update. Any number of
      updates may occur per animation frame. */
  readonly tick: Milliseconds
  levelStateMachine: LevelStateMachine
  readonly rendererStateMachine: RendererStateMachine
  readonly inputPoller: InputPoller
  readonly synth: Synth
  requestWindowSetting: FunctionUtil.Once
  readonly settings: Settings
}

export namespace Game {
  export function make(
    win: Window,
    canvas: HTMLCanvasElement,
    {atlas, atlasImage, shaderLayout}: Assets,
    settings: Settings
  ): Game {
    const doc = win.document
    const tick = 1000 / 60
    const ret: Game = {
      win,
      doc,
      age: 0,
      time: 0,
      tick,
      levelStateMachine: LevelStateMachine.make(shaderLayout, atlas),
      rendererStateMachine: RendererStateMachine.make({
        window: win,
        canvas,
        onFrame: time => onFrame(ret, time),
        onPause: () => {},
        newRenderer: () => Renderer.make(canvas, atlasImage, shaderLayout)
      }),
      inputPoller: InputPoller.make(),
      synth: Synth.make(),
      requestWindowSetting: newRequestWindowSetting(settings.windowMode, doc),
      settings
    }
    return ret
  }

  export function start(game: Game): void {
    // Disable the context menu.
    game.doc.oncontextmenu = () => false
    RendererStateMachine.start(game.rendererStateMachine)
    InputPoller.register(game.inputPoller, game.win, true)
    Synth.play(game.synth, 'sawtooth', 200, 500, 0.15)
  }

  export function stop(game: Game): void {
    InputPoller.register(game.inputPoller, game.win, false)
    RendererStateMachine.stop(game.rendererStateMachine)
    game.win.close()
  }
}

function newRequestWindowSetting(
  windowMode: WindowModeSetting,
  doc: Document
): FunctionUtil.Once {
  const full = () => doc.documentElement.requestFullscreen().catch(() => {})
  return windowMode === WindowModeSetting.FULLSCREEN
    ? FunctionUtil.once(full)
    : FunctionUtil.never()
}

function onFrame(game: Game, time: number): void {
  if (!game.levelStateMachine.level) return Game.stop(game)

  const canvasWH = Viewport.canvasWH(game.doc)
  const {minViewport} = game.levelStateMachine.level
  const scale = Viewport.scale(canvasWH, minViewport, 0)
  const camWH = Viewport.camWH(canvasWH, scale)
  game.levelStateMachine.level.cam.bounds.w = camWH.w
  game.levelStateMachine.level.cam.bounds.h = camWH.h

  const anyInput = InputState.anyActive(game.inputPoller.inputs)
  game.requestWindowSetting = game.requestWindowSetting(anyInput)

  game.time += time
  game.age += game.time - (game.time % game.tick)
  while (game.levelStateMachine.level && game.time >= game.tick) {
    game.time -= game.tick
    game.levelStateMachine = LevelStateMachine.update(
      game.levelStateMachine,
      UpdateState.make(
        game.tick,
        game.levelStateMachine.level,
        canvasWH,
        game.inputPoller.inputs
      )
    )
    InputPoller.update(game.inputPoller, game.tick)
  }

  const {renderer} = game.rendererStateMachine
  const {level, store} = game.levelStateMachine
  if (level)
    Renderer.render(
      renderer,
      game.age,
      canvasWH,
      scale,
      level.cam.bounds,
      store
    )
  else Game.stop(game)
}

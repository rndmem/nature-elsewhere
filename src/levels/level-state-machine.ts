import {Atlas} from '../atlas/atlas'
import {Level} from './level'
import {LevelConfigs} from './level-configs'
import {LevelParser} from './level-parser'
import {Recorder} from '../inputs/recorder'
import {Rect} from '../math/rect'
import {ShaderLayout} from '../graphics/shaders/shader-layout'
import {Store} from '../store/store'

export interface LevelStateMachine {
  readonly level?: Level
  readonly store: Store
}

export namespace LevelStateMachine {
  export const make = (
    layout: ShaderLayout,
    atlas: Atlas
  ): LevelStateMachine => {
    const level = LevelParser.parse(atlas, LevelConfigs.fields)
    return {level, store: Store.make(layout, atlas)}
  }

  export const update = (
    state: LevelStateMachine,
    cam: Rect,
    time: number,
    recorder: Recorder
  ): LevelStateMachine => {
    if (!state.level) return state
    const store = Store.update(
      state.store,
      cam,
      state.level.entities,
      state.level,
      time,
      recorder
    )
    return {level: state.level, store}
  }
}

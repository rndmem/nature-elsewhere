import {Atlas} from '../images/atlas'
import {Image} from '../images/image'
import {Rect} from '../math/rect'
import {Shader} from '../graphics/shaders/shader'

export interface StoreUpdate {
  /** instances.byteLength may exceed bytes to be rendered. length is the only
      accurate number of instances. */
  readonly instances: DataView
  readonly length: number
}

export class Store {
  private readonly images: Image[] = []
  private _instances: DataView
  constructor(
    private readonly _shaderLayout: ShaderLayout,
    private readonly _atlas: Atlas.Definition
  ) {
    this._instances = Shader.newInstanceBuffer(_shaderLayout, 0)
  }

  addImages(...images: readonly Image[]): void {
    images.forEach(image => this.addImage(image))
  }

  addImage(image: Image): void {
    const index = this.images.findIndex(val => image.layer() <= val.layer())
    this.images.splice(index === -1 ? this.images.length : index, 0, image)
  }

  update(milliseconds: number, cam: Rect): StoreUpdate {
    const minBytes = this.images.length * this._shaderLayout.perInstance.stride
    if (this._instances.byteLength < minBytes) {
      this._instances = Shader.newInstanceBuffer(
        this._shaderLayout,
        this.images.length * 2
      )
    }

    let i = 0
    this.images.forEach(image => {
      image.update(milliseconds)
      if (Rect.intersects(image.target(), cam)) {
        Shader.packInstance(
          this._shaderLayout,
          this._atlas,
          this._instances,
          i,
          image
        )
        ++i
      }
    })
    return {instances: this._instances, length: i}
  }
}

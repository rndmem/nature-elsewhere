import {Shader} from './shader'

export type UniformLocations = Readonly<Record<string, GLUniformLocation>>
export type AttributeLocations = Readonly<Record<string, number>>

export const GL = WebGL2RenderingContext

export namespace GLUtil {
  export function initAttribute(
    gl: GL,
    program: GLProgram,
    attribute: Shader.Attribute,
    stride: number,
    divisor: number,
    buffer: GLBuffer
  ): void {
    const location = gl.getAttribLocation(program, attribute.name)
    gl.enableVertexAttribArray(location)
    gl.bindBuffer(GL.ARRAY_BUFFER, buffer)
    gl.vertexAttribIPointer(
      location,
      attribute.length,
      attribute.type,
      stride,
      attribute.offset
    )
    gl.vertexAttribDivisor(location, divisor)
    gl.bindBuffer(GL.ARRAY_BUFFER, null)
  }

  export function buildProgram(
    gl: GL,
    vertexShaderSource: string,
    fragmentShaderSource: string
  ): GLProgram {
    const program = gl.createProgram()
    if (program === null) throw new Error('WebGL program creation failed.')

    const vertexShader = compileShader(gl, GL.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(
      gl,
      GL.FRAGMENT_SHADER,
      fragmentShaderSource
    )
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    const log = gl.getProgramInfoLog(program)
    if (log) console.error(log)

    // Mark shaders for deletion when unused.
    gl.detachShader(program, fragmentShader)
    gl.detachShader(program, vertexShader)
    gl.deleteShader(fragmentShader)
    gl.deleteShader(vertexShader)

    return program
  }

  export function compileShader(
    gl: GL,
    type: number,
    source: string
  ): GLShader {
    const shader = gl.createShader(type)
    if (!shader) throw new Error('Shader creation failed.')

    gl.shaderSource(shader, source.trim())
    gl.compileShader(shader)

    const log = gl.getShaderInfoLog(shader)
    if (log) console.error(log)

    return shader
  }

  export function bufferData(
    gl: GL,
    buffer: GLBuffer,
    data: GLBufferData,
    usage: number
  ): void {
    gl.bindBuffer(GL.ARRAY_BUFFER, buffer)
    gl.bufferData(GL.ARRAY_BUFFER, data, usage)
    gl.bindBuffer(GL.ARRAY_BUFFER, null)
  }

  export function loadTexture(
    gl: GL,
    textureUnit: number,
    image: HTMLImageElement
  ): GLTexture {
    gl.activeTexture(textureUnit)
    const texture = gl.createTexture()
    gl.bindTexture(GL.TEXTURE_2D, texture)
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST)
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST)
    gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image)
    gl.bindTexture(GL.TEXTURE_2D, null)
    return texture
  }

  export function getUniformLocations(
    gl: GL,
    program: GLProgram
  ): UniformLocations {
    const length = gl.getProgramParameter(program, GL.ACTIVE_UNIFORMS) || 0
    const locations: Mutable<UniformLocations> = {}
    for (let i = 0; i < length; ++i) {
      const uniform = gl.getActiveUniform(program, i)
      const name = uniform ? uniform.name : null
      const location = name ? gl.getUniformLocation(program, name) : null
      locations[name || i] = location
    }
    return locations
  }

  export function getAttributeLocations(
    gl: GL,
    program: GLProgram
  ): AttributeLocations {
    const length = gl.getProgramParameter(program, GL.ACTIVE_ATTRIBUTES) || 0
    const locations: Mutable<AttributeLocations> = {}
    for (let i = 0; i < length; ++i) {
      const attr = gl.getActiveAttrib(program, i)
      const location = attr ? gl.getAttribLocation(program, attr.name) : i
      locations[attr ? attr.name : location] = location
    }
    return locations
  }
}

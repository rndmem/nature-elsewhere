import * as aseprite from '../parsers/aseprite.js'
import {AnimationID} from '../assets/animation-id.js'

/** @typedef {Readonly<{size: WH; animations: AnimationMap}>} Atlas */

/** @typedef {Readonly<Record<AnimationID, Animation>>} AnimationMap */

/**
 * Animation and collision frames.
 * @typedef {Readonly<{
 *   cels: ReadonlyArray<Cel>
 *   direction: AnimationDirection
 * }>} Animation
 */

/**
 * A single cel of animation sequence.
 * @typedef {Object} Cel
 * @prop {Rect} bounds Texture bounds within the atlas.
 * @prop {number} duration Cel exposure in milliseconds, possibly infinite.
 * @prop {ReadonlyArray<Rect>} collision Collision bounds within the texture.
 */

/** @enum {string} */
export const AnimationDirection = aseprite.Direction

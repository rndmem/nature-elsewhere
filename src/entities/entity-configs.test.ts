import {AnimationID} from '../images/animation-id'
import * as ArrayUtil from '../utils/array-util'
import {EntityConfigs} from './entity-configs'
import {EntityID} from './entity-id'
import {ImageConfig} from '../images/image-config'
import {Layer} from '../images/layer'
import * as ObjectUtil from '../utils/object-util'

const ids: readonly string[] = Object.freeze(
  ObjectUtil.values(EntityConfigs)
    .filter(ArrayUtil.is)
    .map(({id}) => id)
)

test.each(ids)('%# ID %p is an EntityID key', id =>
  expect(id in EntityID).toBeTruthy()
)

test.each(ids)('%# ID %p is unique', id =>
  expect(ids.filter(val => id === val)).toHaveLength(1)
)

const images: readonly ImageConfig[] = Object.freeze(
  ObjectUtil.values(EntityConfigs)
    .filter(ArrayUtil.is)
    .map(({images}) => images)
    .filter(ArrayUtil.is)
    .reduce((sum, val) => [...sum, ...val])
)

test.each(images)('%# image has a valid ID %p', ({id}) =>
  expect(id in AnimationID).toBeTruthy()
)

test.each(images)('%# image has a valid layer or no layer %p', ({layer}) => {
  if (layer) expect(layer in Layer).toBeTruthy()
  else expect(layer).toBeUndefined()
})
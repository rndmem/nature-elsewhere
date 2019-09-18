import {Entity} from '../../entity'
import {EntityType} from '../entity-type'
import {Cloud} from '../scenery/cloud'
import {ObjectUtil} from '../../../utils/object-util'

export namespace CloudParser {
  export function parse(cloud: Entity): Cloud {
    if (!EntityType.assert<Cloud>(cloud, EntityType.SCENERY_CLOUD))
      throw new Error()
    if (
      ObjectUtil.isValueOf(EntityType, cloud.state) ||
      ObjectUtil.isValueOf(Cloud.Precipitation, cloud.state)
    )
      return cloud
    throw new Error(`Unknown EntityState "${cloud.state}".`)
  }
}

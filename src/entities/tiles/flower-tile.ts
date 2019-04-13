import {AnimationID} from '../../images/animation-id'
import {Atlas} from '../../images/atlas'
import {Image} from '../../images/image'
import {ObjectUtil} from '../../utils/object-util'
import {Palette} from '../../images/palette'
import {Random} from '../../math/random'

const flowerIDs: readonly AnimationID[] = ObjectUtil.freeze([
  AnimationID.FLOWER_DARK,
  AnimationID.FLOWER_LIGHT
])

export namespace FlowerTile {
  export function create(
    atlas: Atlas.Definition,
    layer: number,
    wh: WH,
    random: Random
  ): readonly Image[] {
    const flowers = []
    for (
      let i = 0,
        len = random.int(0, Math.max(1, Math.trunc((wh.w * wh.h) / 512)));
      i < len;
      ++i
    ) {
      const id = randomFlowerID(random)
      const position = {
        x: random.int(0, wh.w),
        y: random.int(0, wh.h - atlas.animations[id].size.h + 1)
      }
      flowers.push(
        Image.new(atlas, id, {
          palette: Palette.FLOWER,
          layer: layer + 1,
          position
        })
      )
    }
    return flowers
  }
}

function randomFlowerID(random: Random): AnimationID {
  return flowerIDs[random.int(0, flowerIDs.length)]
}

/** The Atlas.Animation identifier. These are used to reference immutable image
    source properties, such as dimensions and animation duration, from the
    Atlas. These animations are mostly referenced directly from entity configs
    but also in some cases where Images are instantiated or manipulated
    dynamically in code. */
export enum AtlasID {
  CHAR_ARROW_DIAGONAL = 'charArrow-upRight',
  CHAR_ARROW_HORIZONTAL = 'charArrow-right',
  CHAR_ARROW_VERTICAL = 'charArrow-up',
  CHAR_BACKPACKER_IDLE_DOWN = 'charBackpacker-idleDown',
  CHAR_BACKPACKER_IDLE_RIGHT = 'charBackpacker-idleRight',
  CHAR_BACKPACKER_IDLE_UP = 'charBackpacker-idleUp',
  CHAR_BACKPACKER_WALK_DOWN = 'charBackpacker-walkDown',
  CHAR_BACKPACKER_WALK_RIGHT = 'charBackpacker-walkRight',
  CHAR_BACKPACKER_WALK_RIGHT_SHADOW = 'charBackpacker-walkRightShadow',
  CHAR_BACKPACKER_WALK_UP = 'charBackpacker-walkUp',
  CHAR_BACKPACKER_WALK_VERTICAL_SHADOW = 'charBackpacker-walkUpDownShadow',
  CHAR_BEE_BLOOD = 'charBee-blood',
  CHAR_BEE = 'charBee',
  CHAR_BEE_DEAD = 'charBee-dead',
  CHAR_BEE_SHADOW = 'charBee-shadow',
  CHAR_BIRD_FLY = 'charBird-fly',
  CHAR_BIRD_REST = 'charBird-rest',
  CHAR_BIRD_RISE = 'charBird-rise',
  CHAR_BUNNY_BLOOD = 'charBunny-blood',
  CHAR_BUNNY = 'charBunny',
  CHAR_BUNNY_DEAD = 'charBunny-dead',
  CHAR_BUNNY_SHADOW = 'charBunny-shadow',
  CHAR_FROG_EAT = 'charFrog-eat',
  CHAR_FROG_IDLE = 'charFrog-idle',
  CHAR_FROG_IDLE_SHADOW = 'charFrog-idleShadow',
  CHAR_FROG_LEAP = 'charFrog-leap',
  CHAR_PIG = 'charPig',
  CHAR_SNAKE = 'charSnake',
  CHAR_SNAKE_SHADOW = 'charSnake-shadow',
  MEM_FONT_000 = 'memFont-000',
  MEM_FONT_001 = 'memFont-001',
  MEM_FONT_002 = 'memFont-002',
  MEM_FONT_003 = 'memFont-003',
  MEM_FONT_004 = 'memFont-004',
  MEM_FONT_005 = 'memFont-005',
  MEM_FONT_006 = 'memFont-006',
  MEM_FONT_007 = 'memFont-007',
  MEM_FONT_008 = 'memFont-008',
  MEM_FONT_009 = 'memFont-009',
  MEM_FONT_010 = 'memFont-010',
  MEM_FONT_011 = 'memFont-011',
  MEM_FONT_012 = 'memFont-012',
  MEM_FONT_013 = 'memFont-013',
  MEM_FONT_014 = 'memFont-014',
  MEM_FONT_015 = 'memFont-015',
  MEM_FONT_016 = 'memFont-016',
  MEM_FONT_017 = 'memFont-017',
  MEM_FONT_018 = 'memFont-018',
  MEM_FONT_019 = 'memFont-019',
  MEM_FONT_020 = 'memFont-020',
  MEM_FONT_021 = 'memFont-021',
  MEM_FONT_022 = 'memFont-022',
  MEM_FONT_023 = 'memFont-023',
  MEM_FONT_024 = 'memFont-024',
  MEM_FONT_025 = 'memFont-025',
  MEM_FONT_026 = 'memFont-026',
  MEM_FONT_027 = 'memFont-027',
  MEM_FONT_028 = 'memFont-028',
  MEM_FONT_029 = 'memFont-029',
  MEM_FONT_030 = 'memFont-030',
  MEM_FONT_031 = 'memFont-031',
  MEM_FONT_032 = 'memFont-032',
  MEM_FONT_033 = 'memFont-033',
  MEM_FONT_034 = 'memFont-034',
  MEM_FONT_035 = 'memFont-035',
  MEM_FONT_036 = 'memFont-036',
  MEM_FONT_037 = 'memFont-037',
  MEM_FONT_038 = 'memFont-038',
  MEM_FONT_039 = 'memFont-039',
  MEM_FONT_040 = 'memFont-040',
  MEM_FONT_041 = 'memFont-041',
  MEM_FONT_042 = 'memFont-042',
  MEM_FONT_043 = 'memFont-043',
  MEM_FONT_044 = 'memFont-044',
  MEM_FONT_045 = 'memFont-045',
  MEM_FONT_046 = 'memFont-046',
  MEM_FONT_047 = 'memFont-047',
  MEM_FONT_048 = 'memFont-048',
  MEM_FONT_049 = 'memFont-049',
  MEM_FONT_050 = 'memFont-050',
  MEM_FONT_051 = 'memFont-051',
  MEM_FONT_052 = 'memFont-052',
  MEM_FONT_053 = 'memFont-053',
  MEM_FONT_054 = 'memFont-054',
  MEM_FONT_055 = 'memFont-055',
  MEM_FONT_056 = 'memFont-056',
  MEM_FONT_057 = 'memFont-057',
  MEM_FONT_058 = 'memFont-058',
  MEM_FONT_059 = 'memFont-059',
  MEM_FONT_060 = 'memFont-060',
  MEM_FONT_061 = 'memFont-061',
  MEM_FONT_062 = 'memFont-062',
  MEM_FONT_063 = 'memFont-063',
  MEM_FONT_064 = 'memFont-064',
  MEM_FONT_065 = 'memFont-065',
  MEM_FONT_066 = 'memFont-066',
  MEM_FONT_067 = 'memFont-067',
  MEM_FONT_068 = 'memFont-068',
  MEM_FONT_069 = 'memFont-069',
  MEM_FONT_070 = 'memFont-070',
  MEM_FONT_071 = 'memFont-071',
  MEM_FONT_072 = 'memFont-072',
  MEM_FONT_073 = 'memFont-073',
  MEM_FONT_074 = 'memFont-074',
  MEM_FONT_075 = 'memFont-075',
  MEM_FONT_076 = 'memFont-076',
  MEM_FONT_077 = 'memFont-077',
  MEM_FONT_078 = 'memFont-078',
  MEM_FONT_079 = 'memFont-079',
  MEM_FONT_080 = 'memFont-080',
  MEM_FONT_081 = 'memFont-081',
  MEM_FONT_082 = 'memFont-082',
  MEM_FONT_083 = 'memFont-083',
  MEM_FONT_084 = 'memFont-084',
  MEM_FONT_085 = 'memFont-085',
  MEM_FONT_086 = 'memFont-086',
  MEM_FONT_087 = 'memFont-087',
  MEM_FONT_088 = 'memFont-088',
  MEM_FONT_089 = 'memFont-089',
  MEM_FONT_090 = 'memFont-090',
  MEM_FONT_091 = 'memFont-091',
  MEM_FONT_092 = 'memFont-092',
  MEM_FONT_093 = 'memFont-093',
  MEM_FONT_094 = 'memFont-094',
  MEM_FONT_095 = 'memFont-095',
  MEM_FONT_096 = 'memFont-096',
  MEM_FONT_097 = 'memFont-097',
  MEM_FONT_098 = 'memFont-098',
  MEM_FONT_099 = 'memFont-099',
  MEM_FONT_100 = 'memFont-100',
  MEM_FONT_101 = 'memFont-101',
  MEM_FONT_102 = 'memFont-102',
  MEM_FONT_103 = 'memFont-103',
  MEM_FONT_104 = 'memFont-104',
  MEM_FONT_105 = 'memFont-105',
  MEM_FONT_106 = 'memFont-106',
  MEM_FONT_107 = 'memFont-107',
  MEM_FONT_108 = 'memFont-108',
  MEM_FONT_109 = 'memFont-109',
  MEM_FONT_110 = 'memFont-110',
  MEM_FONT_111 = 'memFont-111',
  MEM_FONT_112 = 'memFont-112',
  MEM_FONT_113 = 'memFont-113',
  MEM_FONT_114 = 'memFont-114',
  MEM_FONT_115 = 'memFont-115',
  MEM_FONT_116 = 'memFont-116',
  MEM_FONT_117 = 'memFont-117',
  MEM_FONT_118 = 'memFont-118',
  MEM_FONT_119 = 'memFont-119',
  MEM_FONT_120 = 'memFont-120',
  MEM_FONT_121 = 'memFont-121',
  MEM_FONT_122 = 'memFont-122',
  MEM_FONT_123 = 'memFont-123',
  MEM_FONT_124 = 'memFont-124',
  MEM_FONT_125 = 'memFont-125',
  MEM_FONT_126 = 'memFont-126',
  MEM_FONT_127 = 'memFont-127',
  PALETTE_BLACK = 'palette-black',
  PALETTE_BLUE = 'palette-blue',
  PALETTE_DARK_GREEN = 'palette-darkGreen',
  PALETTE_GREEN = 'palette-green',
  PALETTE_GREY = 'palette-grey',
  PALETTE_LIGHT_BLUE = 'palette-lightBlue',
  PALETTE_LIGHT_GREEN = 'palette-lightGreen',
  PALETTE_LIGHT_GREY = 'palette-lightGrey',
  PALETTE_ORANGE = 'palette-orange',
  PALETTE_PALE_GREEN = 'palette-paleGreen',
  PALETTE_RED = 'palette-red',
  PALETTE_TRANSPARENT = 'palette-transparent',
  PALETTE_WHITE = 'palette-white',
  SCENERY_BUSH = 'sceneryBush',
  SCENERY_BUSH_SHADOW = 'sceneryBush-shadow',
  SCENERY_CATTAILS = 'sceneryCattails',
  SCENERY_CLOUD_MEDIUM = 'sceneryCloud-medium',
  SCENERY_CLOUD_MEDIUM_SHADOW = 'sceneryCloud-mediumShadow',
  SCENERY_CLOUD_LARGE = 'sceneryCloud-large',
  SCENERY_CLOUD_LARGE_SHADOW = 'sceneryCloud-largeShadow',
  SCENERY_CLOUD_RAIN_PUDDLE = 'sceneryCloudRain-puddle',
  SCENERY_CLOUD_RAIN = 'sceneryCloudRain',
  SCENERY_CLOUD_RAIN_SPLASH = 'sceneryCloudRainSplash',
  SCENERY_CLOUD_RAIN_SPRINKLE = 'sceneryCloudRain-sprinkle',
  SCENERY_CLOVER_0x0 = 'sceneryClover-0x0',
  SCENERY_CLOVER_0x1 = 'sceneryClover-0x1',
  SCENERY_CLOVER_0x2 = 'sceneryClover-0x2',
  SCENERY_CLOVER_0x3 = 'sceneryClover-0x3',
  SCENERY_CLOVER_0x4 = 'sceneryClover-0x4',
  SCENERY_CLOVER_1x0 = 'sceneryClover-1x0',
  SCENERY_CLOVER_1x1 = 'sceneryClover-1x1',
  SCENERY_CLOVER_1x2 = 'sceneryClover-1x2',
  SCENERY_CLOVER_1x3 = 'sceneryClover-1x3',
  SCENERY_CLOVER_1x4 = 'sceneryClover-1x4',
  SCENERY_CONIFER = 'sceneryConifer',
  SCENERY_CONIFER_SHADOW = 'sceneryConifer-shadow',
  SCENERY_FLAG = 'sceneryFlag',
  SCENERY_FLAG_SHADOW = 'sceneryFlag-shadow',
  SCENERY_GRASS_0 = 'sceneryGrass-0',
  SCENERY_GRASS_10 = 'sceneryGrass-10',
  SCENERY_GRASS_1 = 'sceneryGrass-1',
  SCENERY_GRASS_2 = 'sceneryGrass-2',
  SCENERY_GRASS_3 = 'sceneryGrass-3',
  SCENERY_GRASS_4 = 'sceneryGrass-4',
  SCENERY_GRASS_5 = 'sceneryGrass-5',
  SCENERY_GRASS_6 = 'sceneryGrass-6',
  SCENERY_GRASS_7 = 'sceneryGrass-7',
  SCENERY_GRASS_8 = 'sceneryGrass-8',
  SCENERY_GRASS_9 = 'sceneryGrass-9',
  SCENERY_ISO_GRASS = 'sceneryIsoGrass-/0',
  SCENERY_MOUNTAIN = 'sceneryMountain',
  SCENERY_MOUNTAIN_SHADOW = 'sceneryMountain-shadow',
  SCENERY_PATH_CORNER_E = 'sceneryPath->',
  SCENERY_PATH_CORNER_N = 'sceneryPath-^',
  SCENERY_PATH_NE = 'sceneryPath-/',
  SCENERY_POND = 'sceneryPond',
  SCENERY_PYRAMID = 'sceneryPyramid',
  SCENERY_PYRAMID_SHADOW = 'sceneryPyramid-shadow',
  SCENERY_SUBSHRUB = 'scenerySubshrub',
  SCENERY_SUBSHRUB_SHADOW = 'scenerySubshrub-shadow',
  SCENERY_TREE = 'sceneryTree',
  SCENERY_TREE_SHADOW = 'sceneryTree-shadow',
  UI_BUTTON_BASE = 'uiButton-base',
  UI_BUTTON_CREATE = 'uiButton-create',
  UI_BUTTON_DECREMENT = 'uiButton-decrement',
  UI_BUTTON_DESTROY = 'uiButton-destroy',
  UI_BUTTON_INCREMENT = 'uiButton-increment',
  UI_BUTTON_PRESSED = 'uiButton-pressed',
  UI_BUTTON_TOGGLE_GRID = 'uiButton-toggleGrid',
  UI_CHECKERBOARD_BLACK_TRANSPARENT = 'uiCheckerboard-blackTransparent',
  UI_CHECKERBOARD_BLACK_WHITE = 'uiCheckerboard-blackWhite',
  UI_CHECKERBOARD_BLUE_GREY = 'uiCheckerboard-blueGrey',
  UI_DESTINATION_MARKER = 'uiDestinationMarker',
  UI_GRID = 'uiGrid',
  UI_SWITCH = 'uiSwitch',
  UI_WINDOW_MODE_CHART = 'uiWindowModeChart',
  UI_ZOOM_MULTIPLIER_CHART = 'uiZoomMultiplierChart'
}

export const MEM_FONT_PREFIX = 'memFont-'

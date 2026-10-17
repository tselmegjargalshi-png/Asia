import type { CategoryId } from './destinations'
import type { WorldStateId } from './world'

export interface Category {
  id: CategoryId
  label: string
  line: string
  image: string
  /** World atmosphere the 3D scene shifts toward while this category is focused. */
  world: WorldStateId
}

export const categories: Category[] = [
  {
    id: 'mountains',
    label: 'Mountains',
    line: 'Thin air, long shadows, the hush above the tree line.',
    image: '1531275090635-95f0974c3073',
    world: 'mountains',
  },
  {
    id: 'oceans',
    label: 'Oceans',
    line: 'Water so clear the boat seems to hover.',
    image: '1523632117739-12cc7fa95ad0',
    world: 'ocean',
  },
  {
    id: 'deserts',
    label: 'Deserts',
    line: 'Silence you can feel on your skin.',
    image: '1639402479478-f5e7881c0ccc',
    world: 'ancient',
  },
  {
    id: 'forests',
    label: 'Forests',
    line: 'Moss, mist and the slow breathing of old trees.',
    image: '1502252430442-aac78f397426',
    world: 'hidden',
  },
  {
    id: 'islands',
    label: 'Islands',
    line: 'Small worlds with their own weather.',
    image: '1514282401047-d79a71a590e8',
    world: 'ocean',
  },
  {
    id: 'ancient',
    label: 'Ancient Worlds',
    line: 'Stone that has outlived every empire around it.',
    image: '1548786811-dd6e453ccca7',
    world: 'ancient',
  },
  {
    id: 'hidden',
    label: 'Hidden Places',
    line: 'Where the road ends and the map goes quiet.',
    image: '1495072667656-424d680e6299',
    world: 'hidden',
  },
  {
    id: 'aurora',
    label: 'Northern Lights',
    line: 'When the night sky decides to move.',
    image: '1488415032361-b7e238421f1b',
    world: 'night',
  },
]

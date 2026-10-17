export type CategoryId =
  | 'mountains'
  | 'oceans'
  | 'deserts'
  | 'forests'
  | 'islands'
  | 'ancient'
  | 'hidden'
  | 'aurora'

export type MoodId = 'stillness' | 'wildness' | 'wonder' | 'solitude'

export interface Destination {
  slug: string
  name: string
  region: string
  country: string
  /** Latitude / longitude in decimal degrees. */
  lat: number
  lon: number
  /** Unsplash photo id (images.unsplash.com/photo-...). */
  image: string
  imageAlt: string
  /** Optional second frame used in chapter stories. */
  detailImage?: string
  detailAlt?: string
  headline: string
  description: string
  fact: string
  season: string
  climate: string
  mood: string
  categories: CategoryId[]
  /** Best months to go, 1 = January. */
  months: number[]
  moods: MoodId[]
  /** Accent used for UI details tied to this place. */
  accent: string
}

export const destinations: Destination[] = [
  {
    slug: 'patagonia',
    name: 'Patagonia',
    region: 'Torres del Paine',
    country: 'Chile',
    lat: -50.94,
    lon: -73.41,
    image: '1558517286-8a9cb0b8c793',
    imageAlt: 'Granite peaks of Patagonia rising above a glacial lake',
    detailImage: '1652837242953-9868740cad74',
    detailAlt: 'A glacier meeting cold blue water in southern Patagonia',
    headline: 'The wind arrives before you do.',
    description:
      'Granite towers, glacial lakes the colour of crushed jade, and a wind that has crossed half the Pacific to meet you. Patagonia does not perform. It simply continues, enormous and indifferent, and lets you walk inside it.',
    fact: 'The three towers that give the park its name are granite, pushed up and carved by ice over roughly twelve million years.',
    season: 'November to March',
    climate: '5 to 18 °C, wind is the constant',
    mood: 'Wild, wind scoured, humbling',
    categories: ['mountains', 'hidden'],
    months: [11, 12, 1, 2, 3],
    moods: ['wildness', 'solitude'],
    accent: '#8fd3c7',
  },
  {
    slug: 'dolomites',
    name: 'Dolomites',
    region: 'Seceda, South Tyrol',
    country: 'Italy',
    lat: 46.6,
    lon: 11.72,
    image: '1534106474077-f9e9c6f5a47c',
    imageAlt: 'The jagged ridge of Seceda in the Dolomites at first light',
    detailImage: '1531275090635-95f0974c3073',
    detailAlt: 'A turquoise alpine lake below pine forest and pale peaks',
    headline: 'A reef that learned to stand.',
    description:
      'Pale spires that turn rose and then violet as the sun leaves them. Meadows stitched with wooden huts, trails that climb straight into the light. The Dolomites feel composed, as if someone arranged every ridge for the hour after dawn.',
    fact: 'The peaks are the remains of tropical coral reefs that grew in a warm sea more than 230 million years ago.',
    season: 'June to September',
    climate: '10 to 22 °C in summer',
    mood: 'Serene, vertical, golden',
    categories: ['mountains'],
    months: [6, 7, 8, 9],
    moods: ['stillness', 'wonder'],
    accent: '#e9c58f',
  },
  {
    slug: 'maldives',
    name: 'Maldives',
    region: 'Noonu Atoll',
    country: 'Maldives',
    lat: 5.85,
    lon: 73.31,
    image: '1514282401047-d79a71a590e8',
    imageAlt: 'Overwater villas linked by winding walkways above a turquoise lagoon',
    detailImage: '1523632117739-12cc7fa95ad0',
    detailAlt: 'Aerial view of reef and open ocean in shifting shades of blue',
    headline: 'Blue, in every depth of it.',
    description:
      'Twenty six atolls strung across the Indian Ocean like a sentence the sea forgot to finish. From above the reefs glow in a hundred shades of blue. From the water, the only sound is the tide turning over coral.',
    fact: 'Around eighty percent of the country sits less than one metre above sea level, making it the lowest nation on Earth.',
    season: 'November to April',
    climate: '27 to 31 °C, water near 28 °C',
    mood: 'Weightless, still, luminous',
    categories: ['oceans', 'islands'],
    months: [11, 12, 1, 2, 3, 4],
    moods: ['stillness'],
    accent: '#5fd6d2',
  },
  {
    slug: 'fiordland',
    name: 'Fiordland',
    region: 'Piopiotahi, Milford Sound',
    country: 'New Zealand',
    lat: -44.64,
    lon: 167.9,
    image: '1495072667656-424d680e6299',
    imageAlt: 'Mitre Peak wrapped in low cloud above the dark water of Milford Sound',
    detailImage: '1554710565-1a60a70ce204',
    detailAlt: 'A waterfall dissolving into fog against a mossy cliff',
    headline: 'Where the rain writes waterfalls.',
    description:
      'Cliffs rise straight out of black water and disappear into cloud. After rain, hundreds of temporary waterfalls pour from the rock at once. It feels less like a landscape and more like the world before anyone named it.',
    fact: 'It is a fiord carved by glaciers, not a sound, and it receives close to seven metres of rain a year.',
    season: 'December to March',
    climate: '10 to 19 °C, rain most days',
    mood: 'Primeval, misted, immense',
    categories: ['forests', 'hidden', 'oceans'],
    months: [12, 1, 2, 3],
    moods: ['wildness', 'wonder'],
    accent: '#7fc4a4',
  },
  {
    slug: 'altai',
    name: 'Altai',
    region: 'Bayan Ölgii',
    country: 'Mongolia',
    lat: 48.97,
    lon: 89.96,
    image: '1742205025290-f8d83fe1bb58',
    imageAlt: 'A horse rider looking across snowy mountains and open steppe',
    detailImage: '1537212429608-6b5f5449cdf8',
    detailAlt: 'Bird’s eye view of folded brown mountains in western Mongolia',
    headline: 'A horizon you can ride toward for days.',
    description:
      'At the far western edge of Mongolia the steppe folds into glaciers and the roads simply stop. Families move with the seasons, golden eagles ride on their arms, and the sky is so large it becomes the landscape.',
    fact: 'Kazakh families here still train golden eagles to hunt, a practice handed down through generations.',
    season: 'June to September, eagle festivals in early October',
    climate: '-5 to 20 °C, nights fall below freezing',
    mood: 'Vast, nomadic, unhurried',
    categories: ['hidden', 'mountains'],
    months: [6, 7, 8, 9, 10],
    moods: ['solitude', 'wildness'],
    accent: '#d9b27c',
  },
  {
    slug: 'petra',
    name: 'Petra',
    region: 'Wadi Musa, Ma’an',
    country: 'Jordan',
    lat: 30.33,
    lon: 35.44,
    image: '1580834341580-8c17a3a630ca',
    imageAlt: 'The Treasury carved into rose sandstone cliffs at Petra',
    detailImage: '1548786811-dd6e453ccca7',
    detailAlt: 'Sandstone tombs cut into the cliffs of Petra',
    headline: 'A city carved from the colour of dusk.',
    description:
      'You walk a kilometre through the Siq, a narrow gorge of rose stone, and then the Treasury steps out of the rock in front of you. The Nabataeans built a capital out of cliffs. Two thousand years later it still feels like a secret.',
    fact: 'Archaeologists estimate that most of the ancient city still lies unexcavated beneath the sand.',
    season: 'March to May, September to November',
    climate: '15 to 28 °C, cold desert nights',
    mood: 'Reverent, warm, cinematic',
    categories: ['ancient', 'deserts'],
    months: [3, 4, 5, 9, 10, 11],
    moods: ['wonder'],
    accent: '#e39a6b',
  },
  {
    slug: 'namib',
    name: 'Namib',
    region: 'Sossusvlei and Deadvlei',
    country: 'Namibia',
    lat: -24.73,
    lon: 15.29,
    image: '1639402479478-f5e7881c0ccc',
    imageAlt: 'Towering red dunes of the Namib under a clear blue sky',
    detailImage: '1579885487896-abc1a9ebb77b',
    detailAlt: 'A dead camelthorn tree on white clay under the night sky',
    headline: 'The oldest desert keeps perfect time.',
    description:
      'Apricot dunes taller than skyscrapers, shadows sharp enough to cut, and a white clay pan where black trees stand exactly where they died. The Namib is quiet in a way that changes how you hear everything after.',
    fact: 'The camelthorn trees of Deadvlei died around nine centuries ago and have not decayed, because the air is too dry.',
    season: 'May to September',
    climate: '20 to 35 °C by day, near freezing at night',
    mood: 'Silent, surreal, sculptural',
    categories: ['deserts', 'ancient'],
    months: [5, 6, 7, 8, 9],
    moods: ['solitude', 'wonder'],
    accent: '#f0a868',
  },
  {
    slug: 'iceland',
    name: 'Iceland',
    region: 'The North Atlantic',
    country: 'Iceland',
    lat: 64.96,
    lon: -19.02,
    image: '1504858700536-882c978a3464',
    imageAlt: 'Green and violet aurora above a dark lake and distant mountains',
    detailImage: '1488415032361-b7e238421f1b',
    detailAlt: 'Aurora borealis rippling over a snow covered mountain',
    headline: 'The sky, unedited.',
    description:
      'On a clear winter night the sky above Iceland begins to move. Green light gathers, folds, and pours across the dark like silk caught in wind. You will forget the cold. You will not forget the silence.',
    fact: 'The green glow comes from oxygen around 100 to 300 kilometres up, struck by particles thrown out by the sun.',
    season: 'September to March',
    climate: '-5 to 3 °C on aurora nights',
    mood: 'Electric, hushed, otherworldly',
    categories: ['aurora', 'islands'],
    months: [9, 10, 11, 12, 1, 2, 3],
    moods: ['wonder', 'stillness'],
    accent: '#7ef0c0',
  },
]

export const destinationBySlug = Object.fromEntries(
  destinations.map((d) => [d.slug, d]),
) as Record<string, Destination>

export function formatCoords(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}° ${ns}   ${Math.abs(lon).toFixed(2)}° ${ew}`
}

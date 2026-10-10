export const ACTIVITIES = [
  { id: 'onesie-generic', label: 'Onesie Generic' },
  { id: 'fluid-art', label: 'Fluid Art' },
  { id: 'canvas-regular', label: 'Canvas Regular' },
  { id: 'canvas-kit', label: 'Canvas Kit' },
  { id: 'mosaic-article', label: 'Mosaic Article' },
  { id: 'mosaic-serving-tray', label: 'Mosaic Serving Tray' },
  { id: 'mosaic-coasters', label: 'Mosaic Coasters' },
  { id: 'mosaic-shapes', label: 'Mosaic Shapes' },
  { id: 'photo-frame', label: 'Photo Frame' },
  { id: 'no-base', label: 'No Base' },
  { id: 'tote-bags', label: 'Tote Bags' },
  { id: 'candle', label: 'Candle' },
  { id: 'toy-painting', label: 'Toy Painting' },
  { id: 'flower-making', label: 'Flower Making' },
  { id: 'serving-tray', label: 'Serving Tray' },
  { id: 'wine-glass', label: 'Wine Glass' },
  { id: 'jelly-bag', label: 'Jelly Bag' },
  { id: 'coaster-painting', label: 'Coaster Painting' },
  { id: 'tumbler', label: 'Tumbler' }
];

export const MUST_HAVE_ITEMS = [
  'Mike/Speaker',
  'Sign board & Easel stand',
  'Brown sheet',
  'Paper bags',
  'References',
  'Fevicryl planning',
  'Cutter'
];

export const ACTIVITY_SPECIFIC_ITEMS = {
  'onesie-generic': [
    'Paints & markers',
    'Canvas',
    'Brushes',
    'Apron',
    'Plastic cups',
    'Palates',
    'Easel stand',
    'Onesie',
    'Pencil, eraser & sharpener'
  ],
  'fluid-art': [
    'Bears',
    'Paints',
    'Apron',
    'Brushes',
    'Gloves',
    'Cups',
    'Spoons',
    'Boxes & stickers',
    'Plates'
  ],
  'canvas-regular': [
    'Canvas',
    'Paints',
    'Apron',
    'Palates',
    'Plastic cups',
    'Easel stand',
    'Brushes',
    'Boxes & stickers'
  ],
  'canvas-kit': [
    'Canvas',
    'Paints',
    'Apron',
    'Palates',
    'Plastic cups',
    'Easel stand',
    'Brushes',
    'Boxes & stickers'
  ],
  'mosaic-article': [
    'Base',
    'Tiles',
    'Grout',
    'Sponge',
    'Glue',
    'Tile nipper',
    'Paints and brushes',
    'Gloves',
    'Apron',
    'Bowls for tiles',
    'Spoons',
    'Cups for mixing grout',
    'Boxes & stickers'
  ],
  'mosaic-serving-tray': [
    'Base',
    'Tiles',
    'Grout',
    'Sponge',
    'Glue',
    'Tile nipper',
    'Paints and brushes',
    'Gloves',
    'Apron',
    'Bowls for tiles',
    'Spoons',
    'Cups for mixing grout',
    'Boxes & stickers'
  ],
  'mosaic-coasters': [
    'Base',
    'Tiles',
    'Grout',
    'Sponge',
    'Glue',
    'Tile nipper',
    'Paints and brushes',
    'Gloves',
    'Apron',
    'Bowls for tiles',
    'Spoons',
    'Cups for mixing grout',
    'Boxes & stickers'
  ],
  'mosaic-shapes': [
    'Base',
    'Tiles',
    'Grout',
    'Sponge',
    'Glue',
    'Tile nipper',
    'Paints and brushes',
    'Gloves',
    'Apron',
    'Bowls for tiles',
    'Spoons',
    'Cups for mixing grout',
    'Boxes & stickers'
  ],
  'photo-frame': [
    'Base',
    'Paints',
    'Apron',
    'Palates',
    'Plastic cups',
    'Easel stand',
    'Brushes',
    'Boxes & stickers'
  ],
  'serving-tray': [
    'Base',
    'Paints',
    'Apron',
    'Palates',
    'Plastic cups',
    'Easel stand',
    'Brushes',
    'Boxes & stickers'
  ],
  'no-base': [
    'Base',
    'Paints',
    'Apron',
    'Palates',
    'Plastic cups',
    'Easel stand',
    'Brushes',
    'Boxes & stickers'
  ],
  'toy-painting': [
    'Base',
    'Paints',
    'Apron',
    'Palates',
    'Plastic cups',
    'Easel stand',
    'Brushes',
    'Boxes & stickers'
  ],
  'wine-glass': [
    'Base',
    'Paints',
    'Apron',
    'Palates',
    'Plastic cups',
    'Easel stand',
    'Brushes',
    'Boxes & stickers'
  ],
  'coaster-painting': [
    'Base',
    'Paints',
    'Apron',
    'Palates',
    'Plastic cups',
    'Easel stand',
    'Brushes',
    'Boxes & stickers'
  ],
  'tote-bags': [
    'Tote bags',
    'Sheets',
    'Paints',
    'Apron',
    'Palates',
    'Plastic cups',
    'Easel stand',
    'Brushes',
    'Boxes & stickers'
  ],
  'candle': [
    'Wax',
    'Fragrance',
    'Colour',
    'Wicks',
    'Wick stickers',
    'Wick holders',
    'Base',
    'Decorative items',
    'Melting Jars',
    'Cups & sticks',
    'Boxes & stickers',
    'Thermometer',
    'Wick cutter',
    'Weighing scale',
    'Heat gun',
    'Display trays',
    'Power cord'
  ],
  'flower-making': [
    'Base',
    'Pipe cleaners',
    'Display trays',
    'Sticks/ markers',
    'Glue gun',
    'Scissors',
    'Boxes & stickers',
    'Power cord'
  ],
  'tumbler': [
    'Base',
    'Glue',
    'Stickers',
    'Display trays'
  ],
  'jelly-bag': [
    'Base',
    'Glue',
    'Stickers',
    'Display trays'
  ]
};

// Generates the combined default checklist for an activity
export const getDefaultChecklistForActivity = (activityId) => {
  const mustHaves = MUST_HAVE_ITEMS.map((text, idx) => ({
    id: `must-have-${idx}`,
    text,
    category: 'Must Have',
    checked: false
  }));

  const specificList = ACTIVITY_SPECIFIC_ITEMS[activityId] || [];
  const specific = specificList.map((text, idx) => ({
    id: `${activityId}-${idx}`,
    text,
    category: 'Activity Supplies',
    checked: false
  }));

  return [...mustHaves, ...specific];
};

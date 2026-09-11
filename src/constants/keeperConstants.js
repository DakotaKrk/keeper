import { Album, Folder, Home, Tags, UserRound } from 'lucide-react';

export const STORAGE_KEY = 'keeper-tree-v1';
export const LEGACY_STORAGE_KEY = 'minnesboard-tree-v1';

export const BRANCH_COLORS = ['green', 'gold', 'blue', 'rose'];
export const BRANCH_TYPES = ['Year', 'Month', 'Album', 'Event', 'Person', 'Collection'];

export const PEOPLE = ['Nathalie', 'Klara', 'Mom', 'Grandma', 'Friends'];
export const TAGS_INDEX = ['family', 'winter', 'travel', 'client work', 'favorites', 'legacy'];

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'board', label: 'Board', icon: Folder },
  { id: 'albums', label: 'Albums', icon: Album },
  { id: 'people', label: 'People', icon: UserRound },
  { id: 'tags', label: 'Tags', icon: Tags }
];

export const ENGLISH_KIND = {
  Huvudnod: 'Root',
  År: 'Year',
  Månad: 'Month',
  Plats: 'Place',
  Samling: 'Collection'
};

export const ENGLISH_COPY = {
  'Mitt liv': 'My life',
  Familj: 'Family',
  'Mina bästa år med mormor': 'The best years with grandma',
  Fjällen: 'The mountains',
  Januari: 'January',
  Sommar: 'Summer',
  Resor: 'Travel',
  'Alla mina minnen hänger ihop.': 'Every memory belongs somewhere.',
  'Människorna jag vill minnas.': 'The people I want to remember.',
  'Inte perfekta bilder – viktiga minnen.': 'Not perfect photos. Important memories.',
  'Ett år av minnen.': 'A year of memories.',
  'Snö, tystnad och tid tillsammans.': 'Snow, quiet and time together.',
  'Vintern, vardagen och små ögonblick.': 'Winter, daily life and small moments.',
  'Ljusa dagar. Stora minnen.': 'Long days. Big memories.',
  'Platser som förändrar oss.': 'Places that changed us.',
  Åre: 'Aspen'
};

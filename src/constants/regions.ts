import type { Region } from '../types';

export const PRESET_REGIONS: Region[] = [
  {
    id: 'india',
    name: 'Indian Subcontinent',
    lamin: 8.0,
    lamax: 32.0,
    lomin: 68.0,
    lomax: 92.0,
    center: [20.5937, 78.9629],
    zoom: 5,
    description: 'Major civil and domestic transit routes across Mumbai, Delhi, Bengaluru, and Chennai FIRs.'
  },
  {
    id: 'europe',
    name: 'Western Europe',
    lamin: 42.0,
    lamax: 56.0,
    lomin: -5.0,
    lomax: 15.0,
    center: [49.5, 5.0],
    zoom: 5,
    description: 'High-density European airspace covering London, Paris, Frankfurt, and Amsterdam corridors.'
  },
  {
    id: 'na_east',
    name: 'North America (East)',
    lamin: 25.0,
    lamax: 46.0,
    lomin: -88.0,
    lomax: -70.0,
    center: [38.0, -78.0],
    zoom: 5,
    description: 'Eastern seaboard corridor including New York, Atlanta, Washington, and Chicago.'
  },
  {
    id: 'east_asia',
    name: 'East Asia',
    lamin: 28.0,
    lamax: 42.0,
    lomin: 124.0,
    lomax: 142.0,
    center: [35.5, 135.0],
    zoom: 5,
    description: 'High-altitude Pacific transit and domestic routes over Japan and South Korea.'
  },
  {
    id: 'gulf',
    name: 'Middle East (Gulf)',
    lamin: 18.0,
    lamax: 32.0,
    lomin: 46.0,
    lomax: 60.0,
    center: [25.0, 54.0],
    zoom: 6,
    description: 'Ultra-dense global hub airspace spanning Dubai, Abu Dhabi, Doha, and Muscat.'
  }
];

export const DEFAULT_REGION = PRESET_REGIONS[0]; // Indian Subcontinent for CodeChef-VIT context!

/**
 * Custom Google Maps Style JSON
 *
 * Odyssey Journal themed map styles matching the app's
 * warm sepia/parchment (light) and deep brown (dark) color palette.
 *
 * Generated using Google Maps Styling Wizard conventions.
 * Each array entry targets a Google Maps feature type + element type.
 */

/** Light theme – warm cream/parchment with amber accents */
export const mapStyleLight = [
  // ── Geometry ──────────────────────────────────────────
  {
    elementType: 'geometry',
    stylers: [{ color: '#F5F1E8' }], // parchment background
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B5B47' }], // warm brown labels
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#F5F1E8' }, { weight: 2 }],
  },

  // ── Administrative ────────────────────────────────────
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E8DCC8' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#A89984' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#D4A574' }, { weight: 1.2 }],
  },

  // ── POI ───────────────────────────────────────────────
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#E8DCC8' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8B7355' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#D5DCBE' }], // muted olive green
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B8E23' }],
  },

  // ── Road ──────────────────────────────────────────────
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#EEDFC4' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8B7355' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#E5CFA9' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#D4A574' }, { weight: 0.6 }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#EEDFC4' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#F0E6D4' }],
  },

  // ── Transit ───────────────────────────────────────────
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#E3D5C0' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8B7355' }],
  },

  // ── Water ─────────────────────────────────────────────
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#B8CCD8' }], // desaturated blue-grey
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4A6FA5' }],
  },

  // ── Landscape ─────────────────────────────────────────
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#EDE5D5' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#F0E8DA' }],
  },
];

/** Dark theme – deep brown/espresso with warm amber highlights */
export const mapStyleDark = [
  // ── Geometry ──────────────────────────────────────────
  {
    elementType: 'geometry',
    stylers: [{ color: '#1A1410' }], // deep brown background
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#A89984' }], // muted warm label
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1A1410' }, { weight: 2 }],
  },

  // ── Administrative ────────────────────────────────────
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#3D2F20' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B5B47' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#8B7355' }, { weight: 1 }],
  },

  // ── POI ───────────────────────────────────────────────
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#241C14' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8B7355' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2A3522' }], // deep olive green
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B8E4D' }],
  },

  // ── Road ──────────────────────────────────────────────
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2C2018' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8B7355' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3D2F20' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#5C4A36' }, { weight: 0.6 }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#302418' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#261C14' }],
  },

  // ── Transit ───────────────────────────────────────────
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2C2018' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8B7355' }],
  },

  // ── Water ─────────────────────────────────────────────
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1A2530' }], // deep steel-blue
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4A6FA5' }],
  },

  // ── Landscape ─────────────────────────────────────────
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1E1814' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#221A14' }],
  },
];

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass,
  ArrowUpRight,
  BookOpen,
  UtensilsCrossed,
  Instagram,
  X,
} from 'lucide-react';
import { SolidPlacePinIcon } from './Icons';
import { DateVibeItem, MoodType } from '../types';
import { toggleInPageAudio, fadeAndStopAudio, subscribeAudioState } from '../utils/audioPlayer';

interface PlaceViewProps {
  dishes: DateVibeItem[];
  onSelectDish: (dish: DateVibeItem) => void;
  selectedCityName?: string;
  selectedCookedAt?: string;
  onNavigateToDish: () => void;
}

// 12-point explosive starburst for Busy life state with outer shockwave waveform outline
const ExplosiveBurstIcon: React.FC<{
  color: string;
  isCooked: boolean;
  size?: number;
  className?: string;
  showWaveform?: boolean;
}> = ({ color, isCooked, size = 28, className = '', showWaveform = true }) => {
  const points = useMemo(() => {
    const pts: string[] = [];
    const numPoints = 12;
    const outerR = 12.5;
    const innerR = 5.5;
    const cx = 14;
    const cy = 14;
    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i * Math.PI) / numPoints - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      className={`shrink-0 overflow-visible transition-transform duration-200 ${className}`}
    >
      {/* Outer outline exploding waveform shockwave */}
      {showWaveform && (
        <polygon
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="animate-burst-wave pointer-events-none"
        />
      )}
      {/* Main Starburst */}
      <polygon
        points={points}
        fill={isCooked ? color : 'transparent'}
        stroke={color}
        strokeWidth={isCooked ? 0 : 2}
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface CookedAtLocationNode {
  id: string;
  locationName: string;
  cityName: string;
  dishes: DateVibeItem[];
  count: number;
  latestDish: DateVibeItem;
  x: number;
  y: number;
}

interface CityTemplate {
  country: string;
  period: string;
  lineName: string;
  proseTitle: string;
  proseParagraphs: string[];
  latCoord: string;
  lonCoord: string;
  elevation: string;
}

const KNOWN_CITY_TEMPLATES: Record<string, CityTemplate> = {
  hsinchu: {
    country: 'Taiwan, Worldwide',
    period: '2026 — 2027',
    lineName: 'HSINCHU, TAIWAN CULINARY TRACE',
    proseTitle: 'Hsinchu Life',
    proseParagraphs: [
      'Living in Hsinchu, discovering local produce and late-night markets.',
      'Finding warmth in simple home-cooked meals after midnight.',
      'A personal cartography of memories and flavors across the city.',
    ],
    latCoord: `24°48'13" N`,
    lonCoord: `120°58'07" E`,
    elevation: '40m',
  },
  taipei: {
    country: 'Taiwan, Worldwide',
    period: '2026 — 2027',
    lineName: 'TAIPEI URBAN TRACE',
    proseTitle: 'Taipei Life',
    proseParagraphs: [
      'Living in Taipei, wrapped in evening drizzle reflecting neon street signs against wet asphalt.',
      'Walking home with fresh seasonal produce from neighborhood markets.',
      'Watching steam rise into the night air from small home kitchens.',
    ],
    latCoord: `25°02'24" N`,
    lonCoord: `121°31'55" E`,
    elevation: '18m',
  },
  tokyo: {
    country: 'Japan, Worldwide',
    period: '2026 — 2027',
    lineName: 'TOKYO CULINARY CIRCUIT',
    proseTitle: 'Tokyo Life',
    proseParagraphs: [
      'Living in Tokyo, experiencing a tranquil pulse and simmering broths after dark.',
      'Taking the quiet train at dusk, returning to prepare hot bowls of nourishment.',
      'Every station holds an ingredient, a memory, and a quiet midnight hour.',
    ],
    latCoord: `35°41'22" N`,
    lonCoord: `139°41'30" E`,
    elevation: '44m',
  },
  paris: {
    country: 'France, Worldwide',
    period: '2026 — 2027',
    lineName: 'PARIS SEINE BASIN TRACE',
    proseTitle: 'Paris Life',
    proseParagraphs: [
      'Living in Paris, hearing clock chimes through cool windowpanes in late evening.',
      'Cooking pot-au-feu with rustic root vegetables tied with kitchen twine.',
      'Taking time to let humble ingredients reveal their quiet warmth.',
    ],
    latCoord: `48°51'24" N`,
    lonCoord: `2°21'07" E`,
    elevation: '35m',
  },
  barcelona: {
    country: 'Spain, Worldwide',
    period: '2026 — 2027',
    lineName: 'BARCELONA MEDITERRANEAN TRACE',
    proseTitle: 'Barcelona Life',
    proseParagraphs: [
      'Living in Barcelona, wandering along sunlit markets filled with olive oil, paprika, and seafood.',
      'Evenings lingering over bubbling pans of saffron rice and grilled peppers.',
      'A warm coastal rhythm woven into every shared midnight dinner.',
    ],
    latCoord: `41°23'20" N`,
    lonCoord: `2°10'33" E`,
    elevation: '12m',
  },
  kyoto: {
    country: 'Japan, Worldwide',
    period: '2026 — 2027',
    lineName: 'KYOTO RIVER TRANSIT LINE',
    proseTitle: 'Kyoto Life',
    proseParagraphs: [
      'Living in Kyoto, walking along the Kamogawa riverbank under dusk lanterns.',
      'Simmering seasonal vegetables in quiet residential neighborhoods.',
      'A delicate serenity that gently fills the kitchen as midnight approaches.',
    ],
    latCoord: `35°00'42" N`,
    lonCoord: `135°46'05" E`,
    elevation: '54m',
  },
  london: {
    country: 'UK, Worldwide',
    period: '2026 — 2027',
    lineName: 'LONDON METROPOLITAN TRACE',
    proseTitle: 'London Life',
    proseParagraphs: [
      'Living in London, walking through autumnal rain along quiet Victorian terraces.',
      'Gathering hearty herbs and root vegetables to simmer after long tube commutes.',
      'A comforting hearth glowing quietly amidst the London fog.',
    ],
    latCoord: `51°30'26" N`,
    lonCoord: `0°07'39" W`,
    elevation: '15m',
  },
};

const KNOWN_SPOT_COORDS: Record<string, { x: number; y: number }> = {
  iaa: { x: 30, y: 36 },
  'nycu iaa': { x: 30, y: 36 },
  'iaa lab': { x: 30, y: 36 },
  'iaa studio': { x: 30, y: 36 },
  'nycu corner': { x: 66, y: 32 },
  'nycu lab dorm': { x: 40, y: 66 },
  'lab dorm': { x: 40, y: 66 },
  nycu: { x: 70, y: 38 },
  'zhongshan studio': { x: 55, y: 64 },
  'daan studio': { x: 44, y: 38 },
  'shinjuku loft': { x: 58, y: 42 },
  'barcelona kitchen': { x: 52, y: 45 },
  'barcelona, spain': { x: 52, y: 45 },
  barcelona: { x: 52, y: 45 },
  'marais attic': { x: 48, y: 38 },
  'kamogawa riverbank': { x: 64, y: 52 },
};



const getMoodColor = (mood?: MoodType) => {
  switch (mood) {
    case 'happy':
      return '#f97316';
    case 'soso':
      return '#ffffff';
    case 'sad':
      return '#818cf8';
    default:
      return '#f97316';
  }
};

// Mood + Life indicator with the EXACT same icons & styling as YearView
const YearVibeIcon: React.FC<{
  mood?: MoodType;
  lifeState?: string;
  isCooked?: boolean;
  size?: number;
}> = ({ mood = 'happy', lifeState = 'moderate', isCooked = true, size = 18 }) => {
  const color = getMoodColor(mood);
  if (lifeState === 'busy') {
    return (
      <ExplosiveBurstIcon color={color} isCooked={isCooked} size={size + 6} />
    );
  }
  if (lifeState === 'free') {
    return (
      <span
        className="rounded-full inline-block shrink-0"
        style={{
          width: Math.round(size * 0.55),
          height: Math.round(size * 0.55),
          backgroundColor: isCooked ? color : 'transparent',
          border: isCooked ? 'none' : `1.5px solid ${color}`,
          boxShadow: isCooked ? `0 0 6px ${color}66` : 'none',
        }}
        title={`Mood: ${mood} · Life: Free · ${isCooked ? 'Cooked' : 'No Cook'}`}
      />
    );
  }
  // default moderate: medium circle
  return (
    <span
      className="rounded-full inline-block shrink-0"
      style={{
        width: Math.round(size * 0.85),
        height: Math.round(size * 0.85),
        backgroundColor: isCooked ? color : 'transparent',
        border: isCooked ? 'none' : `2px solid ${color}`,
        boxShadow: isCooked ? `0 0 8px ${color}66` : 'none',
      }}
      title={`Mood: ${mood} · Life: Moderate · ${isCooked ? 'Cooked' : 'No Cook'}`}
    />
  );
};

export const getSpotIntro = (spotName: string, cityName: string): string => {
  const s = spotName.toLowerCase();
  if (s.includes('iaa')) {
    return 'Living around IAA (Institute of Applied Arts). Late-night design experiments, quiet kitchen moments between critique cycles, and midnight warmth.';
  }
  if (s.includes('nycu')) {
    return 'Living around NYCU campus. Midnight cooking after lab sessions, simmering one-pot dishes in quiet midnight air, and late-night reflections.';
  }
  if (s.includes('dorm') || s.includes('lab')) {
    return 'Dormitory studio kitchen. Simple ingredients, steaming pots, and moments of calm amidst research days.';
  }
  if (s.includes('zhongshan') || s.includes('daan')) {
    return 'Neighborhood studio kitchen. Morning strolls to the market, evening aromas drifting through balcony doors.';
  }
  if (s.includes('loft') || s.includes('shinjuku')) {
    return 'Tokyo loft living. Quiet train rides home at dusk, heating up seasonal ingredients after dark.';
  }
  if (s.includes('barcelona')) {
    return 'Mediterranean home cooking. Sun-ripened olive oil, garlic, and fresh seaside vegetables in late evenings.';
  }
  if (s.includes('paris') || s.includes('marais')) {
    return 'Parisian attic kitchen. Autumnal produce from local markets, simple rustic warmth beside rain-streaked windows.';
  }
  if (s.includes('kyoto') || s.includes('kamogawa')) {
    return 'Riverside living in Kyoto. Simmering seasonal dashi, dusk lanterns glowing quietly along residential streets.';
  }
  return `Living around ${spotName} in ${cityName}. A quiet personal hearth, simple comforting flavors, and midnight reflections.`;
};

// Intelligently extract the Cooked At place and region from a dish
export function parseCookedPlace(dish: DateVibeItem) {
  const cookedAt = (dish.city?.location || '').trim();
  const livedIn = (dish.city?.name || '').trim();
  const rawCountry = (dish.city?.country || '').trim();

  // Helper to detect country from string
  const detectCountry = (str: string, fallback?: string): string => {
    const s = str.toLowerCase();
    if (s.includes('spain') || s.includes('barcelona') || s.includes('madrid')) return 'Spain';
    if (s.includes('japan') || s.includes('tokyo') || s.includes('kyoto') || s.includes('osaka')) return 'Japan';
    if (s.includes('france') || s.includes('paris')) return 'France';
    if (s.includes('uk') || s.includes('united kingdom') || s.includes('london')) return 'UK';
    if (s.includes('usa') || s.includes('united states') || s.includes('new york') || s.includes('san francisco')) return 'USA';
    if (s.includes('brazil') || s.includes('sao paulo')) return 'Brazil';
    if (s.includes('new zealand') || s.includes('auckland')) return 'New Zealand';
    if (s.includes('australia') || s.includes('sydney')) return 'Australia';
    if (s.includes('south africa') || s.includes('cape town')) return 'South Africa';
    if (s.includes('china') || s.includes('shanghai')) return 'China';
    if (s.includes('germany') || s.includes('berlin')) return 'Germany';
    if (s.includes('norway') || s.includes('oslo')) return 'Norway';
    if (s.includes('denmark') || s.includes('copenhagen')) return 'Denmark';
    if (s.includes('sweden') || s.includes('stockholm')) return 'Sweden';
    if (s.includes('finland') || s.includes('helsinki')) return 'Finland';
    if (s.includes('taiwan') || s.includes('hsinchu') || s.includes('taipei') || s.includes('tainan')) return 'Taiwan';
    return fallback || 'Worldwide';
  };

  // Helper to extract known city
  const detectCity = (str: string): string | null => {
    const s = str.toLowerCase();
    if (s.includes('barcelona')) return 'Barcelona';
    if (s.includes('madrid')) return 'Madrid';
    if (s.includes('tokyo')) return 'Tokyo';
    if (s.includes('kyoto')) return 'Kyoto';
    if (s.includes('paris')) return 'Paris';
    if (s.includes('london')) return 'London';
    if (s.includes('new york')) return 'New York';
    if (s.includes('san francisco')) return 'San Francisco';
    if (s.includes('sao paulo')) return 'Sao Paulo';
    if (s.includes('auckland')) return 'Auckland';
    if (s.includes('sydney')) return 'Sydney';
    if (s.includes('cape town')) return 'Cape Town';
    if (s.includes('shanghai')) return 'Shanghai';
    if (s.includes('berlin')) return 'Berlin';
    if (s.includes('oslo')) return 'Oslo';
    if (s.includes('copenhagen')) return 'Copenhagen';
    if (s.includes('stockholm')) return 'Stockholm';
    if (s.includes('helsinki')) return 'Helsinki';
    if (s.includes('taipei')) return 'Taipei';
    if (s.includes('hsinchu')) return 'Hsinchu';
    if (s.includes('tainan')) return 'Tainan';
    return null;
  };

  // City is derived strictly from "Lived In" (d.city?.name)
  const resolvedCity = detectCity(livedIn) || livedIn || detectCity(cookedAt) || 'Hsinchu';
  const resolvedCountry = detectCountry(resolvedCity, rawCountry);

  // Spot name is Cooked At location.
  // Distinct galaxy rule: IAA must NEVER be combined with NYCU or be in the same circle.
  let spotName = cookedAt || `${resolvedCity} Kitchen`;
  const lowerSpot = spotName.toLowerCase();
  if (lowerSpot === 'iaa' || lowerSpot.includes('iaa')) {
    spotName = 'IAA';
  } else if (lowerSpot.includes('corner')) {
    spotName = 'NYCU Corner';
  } else if (lowerSpot === 'nycu' || (lowerSpot.includes('nycu') && !lowerSpot.includes('lab') && !lowerSpot.includes('dorm'))) {
    spotName = 'NYCU';
  } else if (lowerSpot.includes('lab') || lowerSpot.includes('dorm')) {
    spotName = 'NYCU Lab Dorm';
  }

  return {
    cityName: resolvedCity,
    countryName: resolvedCountry,
    spotName,
    displayName: `${resolvedCity}, ${resolvedCountry}`,
    livedIn: resolvedCity,
  };
}

export const PlaceView: React.FC<PlaceViewProps> = ({
  dishes,
  onSelectDish,
  selectedCityName,
  selectedCookedAt,
}) => {
  // 1. Dishes in Place: ONLY include dishes that are cooked (d.cooked !== false)
  const cookedDishes = useMemo(
    () => dishes.filter((d) => d.cooked !== false),
    [dishes]
  );

  // Place view modes:
  // - 'city': Circular Arc Wheel (Exact format of image.png with blue dot indicator)
  // - 'circuit': Integrated Circuit Map + Magazine Spread (Harmonious two-page book/magazine)
  const [placeTab, setPlaceTab] = useState<'city' | 'dish'>('city');

  // Group cities strictly by "Lived In" (d.city?.name) for dishes the user actually recorded
  const availableCitiesSummary = useMemo(() => {
    const cityMap = new Map<
      string,
      {
        cityName: string;
        country: string;
        displayName: string;
        dishes: DateVibeItem[];
        spotMap: Map<string, DateVibeItem[]>;
      }
    >();

    // Only populate cities that have recorded cooked dishes
    cookedDishes.forEach((d) => {
      const parsed = parseCookedPlace(d);
      const key = parsed.cityName.toLowerCase();
      const existing = cityMap.get(key) || {
        cityName: parsed.cityName,
        country: parsed.countryName,
        displayName: parsed.displayName,
        dishes: [] as DateVibeItem[],
        spotMap: new Map<string, DateVibeItem[]>(),
      };

      existing.dishes.push(d);
      const locKey = parsed.spotName;
      const spotList = existing.spotMap.get(locKey) || [];
      spotList.push(d);
      existing.spotMap.set(locKey, spotList);
      cityMap.set(key, existing);
    });

    const userCities = Array.from(cityMap.values()).map((c) => {
      const cookedAtSpots = Array.from(c.spotMap.entries()).map(
        ([spotName, items]) => {
          const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
          const latestDish = sorted[0];
          return {
            locationName: spotName,
            count: items.length,
            moodColor: getMoodColor(latestDish?.mood),
            latestDish,
          };
        }
      );

      return {
        name: c.cityName,
        country: c.country,
        displayName: `${c.cityName}, ${c.country}`,
        totalDishes: c.dishes.length,
        cookedAtSpots,
      };
    });

    return userCities;
  }, [cookedDishes]);

  // Active city index on wheel (default to Hsinchu if present, else 0)
  const [activeCityIndex, setActiveCityIndex] = useState(() => {
    const idx = availableCitiesSummary.findIndex(
      (c) => c.name.toLowerCase() === 'hsinchu'
    );
    return idx !== -1 ? idx : 0;
  });

  const safeActiveCityIndex = Math.max(
    0,
    Math.min(activeCityIndex, Math.max(0, availableCitiesSummary.length - 1))
  );

  // Sync incoming navigation from props
  useEffect(() => {
    if ((selectedCookedAt || selectedCityName) && availableCitiesSummary.length > 0) {
      const targetQuery = (selectedCookedAt || selectedCityName || '').toLowerCase();
      const idx = availableCitiesSummary.findIndex(
        (c) =>
          c.name.toLowerCase() === targetQuery ||
          targetQuery.includes(c.name.toLowerCase()) ||
          c.cookedAtSpots.some((s) => s.locationName.toLowerCase() === targetQuery)
      );
      if (idx !== -1) {
        setActiveCityIndex(idx);
        setPlaceTab('dish');
      }
    }
  }, [selectedCookedAt, selectedCityName, availableCitiesSummary]);

  const currentCitySummary =
    availableCitiesSummary[safeActiveCityIndex] || availableCitiesSummary[0];
  const currentCityName = currentCitySummary?.name || 'Hsinchu';
  const cityKey = currentCityName.toLowerCase();

  const cityTemplate: CityTemplate = KNOWN_CITY_TEMPLATES[cityKey] || {
    country: `${currentCitySummary?.country || 'Worldwide'}, Worldwide`,
    period: '2026 — 2027',
    lineName: `${currentCityName.toUpperCase()} CULINARY TRACE`,
    proseTitle: `${currentCityName} Life`,
    proseParagraphs: [
      `Living in ${currentCityName}, discovering local produce and late-night markets.`,
      `Finding warmth in simple home-cooked meals after midnight.`,
      `A personal cartography of memories and flavors across the city.`,
    ],
    latCoord: `24°48'13" N`,
    lonCoord: `120°58'07" E`,
    elevation: '30m',
  };

  // Group dishes for the Circuit Map of the current city
  const locationNodes: CookedAtLocationNode[] = useMemo(() => {
    if (!currentCitySummary) return [];

    const cityDishes = cookedDishes.filter((d) => {
      const parsed = parseCookedPlace(d);
      return parsed.cityName.toLowerCase() === cityKey;
    });

    const groupMap = new Map<string, DateVibeItem[]>();
    cityDishes.forEach((d) => {
      const parsed = parseCookedPlace(d);
      const locKey = parsed.spotName;
      const existing = groupMap.get(locKey) || [];
      existing.push(d);
      groupMap.set(locKey, existing);
    });

    const entries = Array.from(groupMap.entries());

    if (entries.length === 0) {
      // Default circuit node for cities without recorded dishes yet
      return [
        {
          id: `${cityKey}-central`,
          locationName: `${currentCityName} Kitchen`,
          cityName: currentCityName,
          dishes: [],
          count: 1,
          latestDish: {
            id: 'mock-1',
            dishNumber: '1',
            title: `${currentCityName} Midnight Pot`,
            date: '2026-10-15',
            mood: 'happy' as MoodType,
            lifeState: 'moderate',
            cooked: true,
            emotion: { hue: 40, text: 'Happy' },
            note: `Quiet midnight warmth in ${currentCityName}. Simmering broths and late night reflections.`,
            image: '',
          },
          x: 50,
          y: 45,
        },
      ];
    }

    return entries.map(([locKey, items], index) => {
      const lookupKey = locKey.toLowerCase().replace(/\s+/g, ' ');
      let coords: { x: number; y: number } | undefined;

      // Strict Rule: IAA is always its own distinct galaxy coordinate, completely separated from NYCU
      if (lookupKey === 'iaa' || lookupKey.includes('iaa')) {
        coords = KNOWN_SPOT_COORDS['iaa'];
      } else if (lookupKey.includes('corner')) {
        coords = KNOWN_SPOT_COORDS['nycu corner'];
      } else if (lookupKey.includes('lab') || lookupKey.includes('dorm')) {
        coords = KNOWN_SPOT_COORDS['nycu lab dorm'];
      } else if (lookupKey === 'nycu' || (lookupKey.includes('nycu') && !lookupKey.includes('iaa'))) {
        coords = KNOWN_SPOT_COORDS['nycu'];
      } else if (KNOWN_SPOT_COORDS[lookupKey]) {
        coords = KNOWN_SPOT_COORDS[lookupKey];
      }

      if (!coords) {
        for (const [k, v] of Object.entries(KNOWN_SPOT_COORDS)) {
          // Never allow IAA to match NYCU or NYCU to match IAA
          if (lookupKey.includes('iaa') && k.includes('nycu')) continue;
          if (lookupKey.includes('nycu') && k.includes('iaa')) continue;
          if (lookupKey.includes(k) || k.includes(lookupKey)) {
            coords = v;
            break;
          }
        }
      }

      if (!coords) {
        const angle =
          (index / Math.max(entries.length, 1)) * 2 * Math.PI - Math.PI / 4;
        const radius = 18;
        coords = {
          x: Math.round(50 + radius * Math.cos(angle)),
          y: Math.round(50 + radius * Math.sin(angle)),
        };
      }

      const sortedByDate = [...items].sort((a, b) =>
        b.date.localeCompare(a.date)
      );
      const latestDish = sortedByDate[0];

      return {
        id: `${cityKey}-${locKey.replace(/\s+/g, '-')}`,
        locationName: locKey,
        cityName: currentCityName,
        dishes: sortedByDate,
        count: items.length,
        latestDish,
        x: coords.x,
        y: coords.y,
      };
    });
  }, [cookedDishes, currentCitySummary, cityKey, currentCityName]);

  // Selected spot on city circuit map
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  // Selected icon variant inside the galaxy (to filter marquee dishes strictly by icon definition)
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(
    null
  );
  const [previewDishIndex, setPreviewDishIndex] = useState<number>(0);
  const touchStartXRef = useRef<number>(0);

  // Map Pan & Zoom states + Left Canvas measured dimensions
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [mapPan, setMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState<boolean>(false);
  const [mapDragStart, setMapDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapDragDistanceRef = useRef<number>(0);
  const galaxyCanvasRef = useRef<HTMLDivElement | null>(null);
  const [canvasBounds, setCanvasBounds] = useState<{ width: number; height: number }>({
    width: 540,
    height: 520,
  });

  useEffect(() => {
    if (placeTab !== 'dish') return;
    const el = galaxyCanvasRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasBounds({ width: rect.width, height: rect.height });
      }
    };
    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setCanvasBounds({ width, height });
          }
        }
      });
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [placeTab]);

  // Fit all galaxy circles and their curved labels strictly inside left panel bounds on initial entry
  const positionedLocationNodes = useMemo(() => {
    const { width, height } = canvasBounds;
    const minDim = Math.min(width, height);
    const sizeScale = Math.max(0.55, Math.min(1, minDim / 500));

    return locationNodes.map((node) => {
      const rawDiameter = Math.max(114, Math.min(198, 94 + node.count * 16));
      const maxFitDiameter = Math.max(68, Math.floor(Math.min(width - 56, height - 64)));
      const outerGalaxyDiameter = Math.min(Math.round(rawDiameter * sizeScale), maxFitDiameter);
      const r = outerGalaxyDiameter / 2;

      const padLeft = r + 32;
      const padRight = r + 14;
      const padTop = r + 36;
      const padBottom = r + 16;

      const rawPx = (node.x / 100) * width;
      const rawPy = (node.y / 100) * height;

      const minX = padLeft;
      const maxX = width - padRight;
      const px = minX <= maxX ? Math.max(minX, Math.min(maxX, rawPx)) : width / 2;

      const extraBottomForZoomControls = px > width - 148 - r ? 44 : 0;
      const minY = padTop;
      const maxY = height - Math.max(padBottom, r + 16 + extraBottomForZoomControls);
      const py = minY <= maxY ? Math.max(minY, Math.min(maxY, rawPy)) : (minY + maxY) / 2;

      return {
        ...node,
        px,
        py,
        outerGalaxyDiameter,
        sizeScale,
      };
    });
  }, [locationNodes, canvasBounds]);

  // Parse status key into formatted label e.g., 'Happy・Free'
  const getVariantLabel = (vKey: string | null) => {
    if (!vKey) return '';
    const [m, l] = vKey.split('-');
    const moodMap: Record<string, string> = { happy: 'Happy', soso: 'So-so', sad: 'Sad' };
    const lifeMap: Record<string, string> = { busy: 'Busy', moderate: 'Moderate', free: 'Free' };
    const moodStr = moodMap[m] || 'Happy';
    const lifeStr = lifeMap[l] || 'Moderate';
    return `${moodStr}・${lifeStr}`;
  };

  // Jump to Instagram page on click of dish card or IG icon
  const handleOpenInstagram = (e: React.MouseEvent, dish: DateVibeItem) => {
    e.stopPropagation();
    fadeAndStopAudio(400);
    const targetUrl =
      dish.igUrl ||
      (dish.title
        ? `https://www.instagram.com/explore/tags/${encodeURIComponent(
            dish.title.replace(/\s+/g, '')
          )}/`
        : 'https://www.instagram.com/');
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const [playingPlaceDishId, setPlayingPlaceDishId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAudioState((id) => setPlayingPlaceDishId(id));
    return unsub;
  }, []);

  const handleAudioIconClick = (e: React.MouseEvent, dishId: string, youtubeUrl?: string | null) => {
    e.stopPropagation();
    toggleInPageAudio(dishId, youtubeUrl, (activeId: string | null) => setPlayingPlaceDishId(activeId));
  };

  const handleMusicTextClick = (e: React.MouseEvent, youtubeUrl?: string | null) => {
    e.stopPropagation();
    const url = youtubeUrl || 'https://youtube.com';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const AudioBarsIcon: React.FC<{ isPlaying?: boolean }> = ({ isPlaying }) => (
    <span className="inline-flex items-end gap-0.5 h-3.5 w-3.5 px-0.5 shrink-0">
      <span
        className={`w-0.5 rounded-full bg-white ${
          isPlaying ? 'animate-bounce h-3' : 'h-1.5'
        }`}
        style={{ animationDuration: '0.6s' }}
      />
      <span
        className={`w-0.5 rounded-full bg-white ${
          isPlaying ? 'animate-bounce h-3.5' : 'h-3'
        }`}
        style={{ animationDuration: '0.4s', animationDelay: '0.1s' }}
      />
      <span
        className={`w-0.5 rounded-full bg-white ${
          isPlaying ? 'animate-bounce h-2.5' : 'h-2'
        }`}
        style={{ animationDuration: '0.5s', animationDelay: '0.2s' }}
      />
    </span>
  );

  useEffect(() => {
    setSelectedLocationId(null);
    setSelectedVariantKey(null);
    setPreviewDishIndex(0);
  }, [currentCityName, placeTab]);

  const selectedNode = useMemo(() => {
    if (!selectedLocationId) return null;
    return locationNodes.find((n) => n.id === selectedLocationId) || null;
  }, [selectedLocationId, locationNodes]);

  const selectedDish = useMemo(() => {
    if (!selectedNode || selectedNode.dishes.length === 0) return null;
    const safeIdx = Math.min(
      Math.max(previewDishIndex, 0),
      selectedNode.dishes.length - 1
    );
    return selectedNode.dishes[safeIdx];
  }, [selectedNode, previewDishIndex]);

  // Filtered dishes for marquee: strictly matching clicked icon definition if selected
  const marqueeDishes = useMemo(() => {
    if (!selectedNode) return [];
    if (!selectedVariantKey) return selectedNode.dishes;
    return selectedNode.dishes.filter((d) => {
      const key = `${d.mood || 'happy'}-${d.lifeState || 'moderate'}-${d.cooked !== false}`;
      return key === selectedVariantKey;
    });
  }, [selectedNode, selectedVariantKey]);

  // Seamless track array for continuous right-to-left marquee auto-scrolling
  const marqueeTrackDishes = useMemo(() => {
    if (marqueeDishes.length === 0) return [];
    let items = [...marqueeDishes];
    while (items.length < 6) {
      items = [...items, ...marqueeDishes];
    }
    return [...items, ...items];
  }, [marqueeDishes]);

  const checkIsMobilePortrait = () => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth < 768 &&
      window.matchMedia('(orientation: portrait)').matches
    );
  };

  const [isMobilePortrait, setIsMobilePortrait] = useState<boolean>(checkIsMobilePortrait);

  useEffect(() => {
    const updateOrientation = () => setIsMobilePortrait(checkIsMobilePortrait());
    updateOrientation();
    const orientationMq = window.matchMedia('(orientation: portrait)');
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    orientationMq.addEventListener('change', updateOrientation);
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
      orientationMq.removeEventListener('change', updateOrientation);
    };
  }, []);

  const handleCloseGalaxySheet = () => {
    setSelectedLocationId(null);
    setSelectedVariantKey(null);
  };

  useEffect(() => {
    if (!isMobilePortrait || !selectedNode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseGalaxySheet();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobilePortrait, selectedNode]);





  // Dragging and Wheel for the Circular Arc Wheel (City View)
  const isCityDraggingRef = useRef<boolean>(false);
  const cityDragStartYRef = useRef<number>(0);
  const cityWheelAccRef = useRef<number>(0);
  const lastCityWheelTimeRef = useRef<number>(0);
  const [isCityMouseDown, setIsCityMouseDown] = useState<boolean>(false);
  const cityMouseStartYRef = useRef<number>(0);

  // Slow, measured wheel scrolling with deliberate accumulation and cooldown
  const handleCityWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastCityWheelTimeRef.current < 160) {
      return;
    }
    cityWheelAccRef.current += e.deltaY;
    if (Math.abs(cityWheelAccRef.current) >= 75) {
      const step = cityWheelAccRef.current > 0 ? 1 : -1;
      cityWheelAccRef.current = 0;
      lastCityWheelTimeRef.current = now;
      setActiveCityIndex((prev) =>
        Math.max(0, Math.min(availableCitiesSummary.length - 1, prev + step))
      );
    }
  };

  const handleCityMouseDown = (e: React.MouseEvent) => {
    setIsCityMouseDown(true);
    cityMouseStartYRef.current = e.clientY;
  };

  const handleCityMouseMove = (e: React.MouseEvent) => {
    if (!isCityMouseDown) return;
    const deltaY = e.clientY - cityMouseStartYRef.current;
    if (Math.abs(deltaY) > 55) {
      const step = deltaY < 0 ? 1 : -1;
      setActiveCityIndex((prev) =>
        Math.max(0, Math.min(availableCitiesSummary.length - 1, prev + step))
      );
      cityMouseStartYRef.current = e.clientY;
    }
  };

  const handleCityMouseUp = () => {
    setIsCityMouseDown(false);
  };

  const handleCityTouchStart = (e: React.TouchEvent) => {
    isCityDraggingRef.current = true;
    cityDragStartYRef.current = e.touches[0].clientY;
  };

  const handleCityTouchMove = (e: React.TouchEvent) => {
    if (!isCityDraggingRef.current) return;
    const deltaY = e.touches[0].clientY - cityDragStartYRef.current;
    if (Math.abs(deltaY) > 50) {
      const step = deltaY < 0 ? 1 : -1;
      setActiveCityIndex((prev) =>
        Math.max(0, Math.min(availableCitiesSummary.length - 1, prev + step))
      );
      cityDragStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleCityTouchEnd = () => {
    isCityDraggingRef.current = false;
  };

  // =========================================================================
  // VIEW 1: CITY CIRCULAR ARC WHEEL
  // "City 的地方和附圖一樣的格式" (Matches user reference image.png)
  // Deep pure black background, curved text arc on right, glowing blue dot ●
  // =========================================================================
  if (placeTab === 'city') {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col space-y-8 animate-fadeIn text-[#f5f5f5] font-sans select-none">
        {/* Top Header: Always keep Place 大標 + 小字維持在上面，滑動時不消失 */}
        <header className="sticky top-14 z-40 bg-[#080808]/95 backdrop-blur-md py-4 -mx-4 sm:-mx-6 px-4 sm:px-6 flex flex-row items-end justify-between gap-4 transition-all">
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-[#ffffff] leading-none">
              Place
            </h1>
            <p className="text-xs sm:text-sm text-[#888888] font-normal leading-relaxed truncate">
              "WHERE" I've cooked at, and the lives I've lived in.
            </p>
          </div>

        {/* Navigation Mode Tabs: City, Dish */}
        <div className="flex items-center p-1 rounded-xl bg-[#121214] border border-[#222228] text-xs shrink-0">
          <button
            type="button"
            className="px-3 py-1 rounded-lg bg-white text-black font-semibold shadow-sm cursor-pointer"
          >
            City
          </button>
          <button
            type="button"
            onClick={() => setPlaceTab('dish')}
            className="px-3 py-1 rounded-lg text-[#777777] hover:text-white transition-colors cursor-pointer"
          >
            Dish
          </button>
        </div>
        </header>

        {/* Minimalist Pitch Black Canvas matching image.png */}
        <div
          onWheel={handleCityWheel}
          onMouseDown={handleCityMouseDown}
          onMouseMove={handleCityMouseMove}
          onMouseUp={handleCityMouseUp}
          onMouseLeave={handleCityMouseUp}
          onTouchStart={handleCityTouchStart}
          onTouchMove={handleCityTouchMove}
          onTouchEnd={handleCityTouchEnd}
          className="w-full h-[460px] sm:h-[500px] bg-black rounded-3xl overflow-hidden relative flex items-center justify-end p-4 sm:p-12 cursor-grab active:cursor-grabbing shadow-2xl select-none"
        >
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent pointer-events-none" />

          {/* Circular Wheel on the right side of the screen - Shifted rightward to avoid clipping on vertical screens */}
          <div className="relative w-full h-full flex items-center justify-end overflow-hidden pr-2 sm:pr-12 pl-12 sm:pl-24">
            {/* Arc Items: curved along the circular arc with opening facing left `)` */}
            <div className="relative w-[320px] sm:w-[420px] h-[540px] flex items-center justify-start pr-2 sm:pr-0">
              {availableCitiesSummary.map((item, index) => {
                const diff = index - safeActiveCityIndex;
                if (Math.abs(diff) > 7) return null;

                const isFocused = diff === 0;

                // Vertical step: ~44px per city
                const y = diff * 44;

                // Circular arc opening to the left `)`:
                // At apex (diff === 0), curveX is 0 (furthest right).
                // Above & below, points retract toward the left (negative X).
                const curveX = -Math.pow(Math.abs(diff), 1.45) * 24;

                // Opacity fades smoothly away from center
                const opacity = Math.max(0.18, 1 - Math.abs(diff) * 0.15);

                return (
                  <div
                    key={`${item.name}-${index}`}
                    onMouseEnter={() => setActiveCityIndex(index)}
                    onClick={() => {
                      if (isFocused) {
                        // Click on focused city enters integrated Circuit & Editorial view!
                        setPlaceTab('dish');
                      } else {
                        setActiveCityIndex(index);
                      }
                    }}
                    className="absolute left-0 flex items-center transition-all duration-300 ease-out cursor-pointer whitespace-nowrap group/cityitem"
                    style={{
                      transform: `translate(${curveX}px, ${y}px)`,
                      opacity,
                      zIndex: 30 - Math.abs(diff),
                    }}
                  >
                    <div className="relative flex items-center">
                      {/* The White Indicator Dot: Sits directly to the left of the active focused city */}
                      {isFocused && (
                        <div className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)] border border-white pointer-events-none" />
                      )}

                      {/* Purely horizontal text (zero rotation/tilt) */}
                      <span
                        className={`font-sans tracking-tight transition-all duration-200 select-none ${
                          isFocused
                            ? 'text-white font-semibold text-xl sm:text-3xl drop-shadow-[0_2px_14px_rgba(255,255,255,0.4)]'
                            : 'text-[#858a9e] hover:text-white font-normal text-base sm:text-xl'
                        }`}
                      >
                        {item.displayName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }



  // =========================================================================
  // VIEW 3: INTEGRATED CIRCUIT MAP & EDITORIAL MAGAZINE SPREAD
  // "把雜誌的頁面和 Circuit Map 整合" (Unified open book/magazine experience!)
  // - Left Page: Cartographic Circuit Map (Transit roads, river, GPS coordinates, spot nodes)
  // - Right Page: Magazine Typography & Photograph (Headline [City] Life, authentic quote, dual columns, full-bleed photo)
  // =========================================================================
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col space-y-8 text-[#f5f5f5] font-sans">
      {/* Top Header: Always keep Place 大標 + 小字維持在上面，滑動時不消失 */}
      <header className="sticky top-14 z-40 bg-[#080808]/95 backdrop-blur-md py-4 -mx-4 sm:-mx-6 px-4 sm:px-6 flex flex-row items-end justify-between gap-4 transition-all">
        <div className="space-y-1.5 min-w-0">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-[#ffffff] leading-none">
            Place
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] font-normal leading-relaxed truncate">
            "WHERE" I've cooked at, and the lives I've lived in.
          </p>
        </div>

        {/* Navigation Mode Tabs: City, Dish */}
        <div className="flex items-center p-1 rounded-xl bg-[#121214] border border-[#222228] text-xs shrink-0">
          <button
            type="button"
            onClick={() => setPlaceTab('city')}
            className="px-3 py-1 rounded-lg text-[#777777] hover:text-white transition-colors cursor-pointer"
          >
            City
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded-lg bg-white text-black font-semibold shadow-sm cursor-pointer"
          >
            Dish
          </button>
        </div>
      </header>

      {/* LUXURIOUS INTEGRATED DOUBLE-PAGE SPREAD */}
      <div className="grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 min-h-[480px] landscape:min-h-[360px] md:min-h-[520px] bg-[#0c0c0e] border border-[#222222] rounded-3xl overflow-hidden shadow-2xl relative">
        {/* ================= LEFT SPREAD: CELESTIAL GALAXIES CANVAS (NO MAP BACKGROUND) ================= */}
        <div
          ref={galaxyCanvasRef}
          className="landscape:col-span-6 md:col-span-6 relative min-h-[400px] landscape:min-h-[360px] md:min-h-[520px] flex items-center justify-center overflow-hidden border-b landscape:border-b-0 landscape:border-r md:border-b-0 md:border-r border-[#1a1a22] bg-[#050508] cursor-grab active:cursor-grabbing select-none"
          onClick={() => {
            // Clicking empty area outside any galaxy resets selection back to City description
            if (mapDragDistanceRef.current < 8) {
              setSelectedLocationId(null);
              setSelectedVariantKey(null);
            }
          }}
          onMouseDown={(e) => {
            setIsMapDragging(true);
            mapDragDistanceRef.current = 0;
            setMapDragStart({ x: e.clientX - mapPan.x, y: e.clientY - mapPan.y });
          }}
          onMouseMove={(e) => {
            if (!isMapDragging) return;
            mapDragDistanceRef.current += Math.abs(e.movementX) + Math.abs(e.movementY);
            setMapPan({
              x: e.clientX - mapDragStart.x,
              y: e.clientY - mapDragStart.y,
            });
          }}
          onMouseUp={() => setIsMapDragging(false)}
          onMouseLeave={() => setIsMapDragging(false)}
          onWheel={(e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.08 : -0.08;
            setMapZoom((prev) => Math.max(0.7, Math.min(2.5, prev + delta)));
          }}
        >
          {/* Zoom & Reset Floating Controls (BOTTOM-RIGHT CORNER) */}
          <div
            className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 p-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs select-none shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setMapZoom((z) => Math.min(2.5, z + 0.25))}
              className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center transition-colors font-bold cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setMapZoom((z) => Math.max(0.7, z - 0.25))}
              className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center transition-colors font-bold cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => {
                setMapZoom(1);
                setMapPan({ x: 0, y: 0 });
              }}
              className="px-2 h-7 rounded-lg hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors text-[10px] font-mono cursor-pointer"
              title="Reset View"
            >
              Reset
            </button>
          </div>

          {/* Deep Space Cosmic Canvas (Panned & Zoomed Transform Container) */}
          <div
            className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
            style={{
              transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Celestial Star Particles */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
              viewBox="0 0 560 560"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cosmic dust dots */}
              <g fill="#ffffff" opacity="0.2">
                <circle cx="80" cy="90" r="1.5" />
                <circle cx="210" cy="60" r="1" />
                <circle cx="450" cy="110" r="1.8" />
                <circle cx="120" cy="380" r="1.2" />
                <circle cx="490" cy="420" r="1.5" />
                <circle cx="310" cy="500" r="1" />
                <circle cx="50" cy="240" r="1.6" />
                <circle cx="420" cy="280" r="1.2" />
              </g>
            </svg>

            {/* Interconnecting galaxy laser tether threads aligned strictly to clamped node pixel centers */}
            {positionedLocationNodes.length > 1 && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none select-none"
                viewBox={`0 0 ${canvasBounds.width} ${canvasBounds.height}`}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d={(() => {
                    const pts = positionedLocationNodes.map(
                      (n) => `${n.px.toFixed(1)},${n.py.toFixed(1)}`
                    );
                    return `M ${pts.join(' L ')} Z`;
                  })()}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.35)"
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                />
              </svg>
            )}

            {/* Cooked At Star Systems (Galaxies) */}
            <div className="absolute inset-0 w-full h-full">
              {positionedLocationNodes.map((node) => {
                const isSelected = selectedLocationId === node.id;

                // Group dishes at this Cooked At galaxy by unique status icon variants
                const variantMap = new Map<
                  string,
                  { dish: DateVibeItem; count: number }
                >();
                node.dishes.forEach((d) => {
                  const key = `${d.mood || 'happy'}-${d.lifeState || 'moderate'}-${
                    d.cooked !== false
                  }`;
                  const existing = variantMap.get(key);
                  if (existing) {
                    existing.count += 1;
                  } else {
                    variantMap.set(key, { dish: d, count: 1 });
                  }
                });
                const uniqueVariants = Array.from(variantMap.values());

                const outerGalaxyDiameter = node.outerGalaxyDiameter;

                return (
                  <div
                    key={node.id}
                    style={{ left: `${node.px}px`, top: `${node.py}px` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer flex flex-col items-center justify-center group/galaxy transition-transform duration-300 hover:scale-105 animate-float"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLocationId(node.id);
                      setSelectedVariantKey(null);
                      setPreviewDishIndex(0);
                    }}
                    title={`Cooked At Galaxy: ${node.locationName} (${node.count} recorded)`}
                  >
                    {/* Cooked At Location Text Label curved at TOP-LEFT arc with distance gap from outer circle */}
                    <svg
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 select-none overflow-visible"
                      style={{
                        width: outerGalaxyDiameter + 60,
                        height: outerGalaxyDiameter + 60,
                        left: '50%',
                        top: '50%',
                      }}
                      viewBox={`0 0 ${outerGalaxyDiameter + 60} ${outerGalaxyDiameter + 60}`}
                    >
                      <defs>
                        <path
                          id={`cooked-at-arc-${node.id}`}
                          d={(() => {
                            const cx = (outerGalaxyDiameter + 60) / 2;
                            const cy = (outerGalaxyDiameter + 60) / 2;
                            const r = outerGalaxyDiameter / 2 + 14;
                            const x1 = cx - r;
                            const y1 = cy;
                            const x2 = cx;
                            const y2 = cy - r;
                            return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
                          })()}
                          fill="none"
                        />
                      </defs>
                      <text className="fill-white font-extrabold text-[11px] sm:text-xs tracking-widest uppercase font-sans drop-shadow-md">
                        <textPath
                          href={`#cooked-at-arc-${node.id}`}
                          startOffset="50%"
                          textAnchor="middle"
                        >
                          {node.locationName}
                        </textPath>
                      </text>
                    </svg>

                    {/* Distinct Galaxy Outer Circle Border Line */}
                    <div
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-300 pointer-events-none ${
                        isSelected && !selectedVariantKey
                          ? 'border-white bg-white/10 ring-2 ring-white/30'
                          : isSelected
                          ? 'border-white/80 bg-white/5'
                          : 'border-white/80 group-hover/galaxy:border-white'
                      }`}
                      style={{
                        width: outerGalaxyDiameter,
                        height: outerGalaxyDiameter,
                        left: '50%',
                        top: '50%',
                      }}
                    />

                    {/* Galaxy Core Icons Container with Gravitational Attraction */}
                    <div className="relative flex items-center justify-center flex-wrap gap-2 sm:gap-3 p-2 sm:p-3 my-auto z-20">
                      {uniqueVariants.map((v, vIdx) => {
                        const vDish = v.dish;
                        const vMoodColor = getMoodColor(vDish.mood);
                        const vIsCooked = vDish.cooked !== false;
                        const vLifeState = vDish.lifeState || 'moderate';

                        // Dynamic icon size based on mention count and scaled cleanly to galaxy bounds
                        const baseIconDimension = Math.max(22, Math.min(50, 16 + v.count * 10));
                        const iconDimension = Math.max(
                          18,
                          Math.round(baseIconDimension * Math.max(0.72, node.sizeScale))
                        );
                        const variantKey = `${vDish.mood || 'happy'}-${vDish.lifeState || 'moderate'}-${vDish.cooked !== false}`;
                        const isThisIconActive = isSelected && selectedVariantKey === variantKey;
                        // Mutual gravitational attraction animation
                        const gravityClass = uniqueVariants.length > 1 ? `animate-gravity-${(vIdx % 4) + 1}` : '';

                        return (
                          <div
                            key={vIdx}
                            className={`flex items-center justify-center relative group/icon cursor-pointer transition-transform duration-300 hover:scale-125 ${gravityClass}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLocationId(node.id);
                              setSelectedVariantKey(variantKey);
                              const dishIdx = node.dishes.findIndex(
                                (d) =>
                                  `${d.mood || 'happy'}-${d.lifeState || 'moderate'}-${d.cooked !== false}` ===
                                  variantKey
                              );
                              setPreviewDishIndex(dishIdx !== -1 ? dishIdx : 0);
                            }}
                            title={`Filter dishes: ${vDish.mood || 'happy'} · ${vLifeState} (${v.count})`}
                          >
                            {/* Selected Pulse Ring */}
                            {isThisIconActive && (
                              <div
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white bg-white/20 animate-ping pointer-events-none"
                                style={{
                                  width: iconDimension * 1.8,
                                  height: iconDimension * 1.8,
                                }}
                              />
                            )}

                            {vLifeState === 'busy' ? (
                              <div className={`relative flex items-center justify-center ${isThisIconActive ? 'scale-115 ring-2 ring-white/80 rounded-full' : ''}`}>
                                <ExplosiveBurstIcon
                                  color={vMoodColor}
                                  isCooked={vIsCooked}
                                  size={iconDimension + 10}
                                />
                                {/* Mention Count displayed INSIDE icon center */}
                                <span
                                  className="absolute inset-0 flex items-center justify-center font-mono font-extrabold text-white pointer-events-none"
                                  style={{
                                    fontSize: Math.max(9, Math.min(13, iconDimension * 0.45)),
                                  }}
                                >
                                  {v.count}
                                </span>
                              </div>
                            ) : (
                              <span
                                className={`rounded-full flex items-center justify-center font-mono font-extrabold transition-all duration-200 select-none shadow-sm ${
                                  isThisIconActive ? 'ring-2 ring-white scale-110' : ''
                                }`}
                                style={{
                                  width: iconDimension,
                                  height: iconDimension,
                                  backgroundColor: vIsCooked
                                    ? vMoodColor
                                    : 'transparent',
                                  border: vIsCooked
                                    ? 'none'
                                    : `2px solid ${vMoodColor}`,
                                  color:
                                    vIsCooked &&
                                    (vDish.mood === 'soso' || vMoodColor === '#ffffff')
                                      ? '#000000'
                                      : '#ffffff',
                                  fontSize: Math.max(9, Math.min(13, iconDimension * 0.45)),
                                }}
                              >
                                {v.count}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Bar: Celestial Coordinates */}
          <div className="absolute top-4 left-6 z-10 flex items-center gap-2.5 text-[10px] font-mono text-[#666a7e] select-none pointer-events-none">
            <Compass className="w-3.5 h-3.5 text-[#888ea4]" />
            <span>
              LAT {cityTemplate.latCoord} · LON {cityTemplate.lonCoord} · ELEV.{' '}
              {cityTemplate.elevation}
            </span>
          </div>
        </div>

        {/* ================= RIGHT SPREAD: EDITORIAL OVERVIEW & DISH MARQUEE (NO FULL-BLEED IMAGE) ================= */}
        <div className="landscape:col-span-6 md:col-span-6 relative min-h-[400px] landscape:min-h-[360px] md:min-h-[520px] flex flex-col justify-between overflow-hidden bg-[#090a0d] select-none p-6 sm:p-10">
          {/* Top Editorial: Clickable City Name (returns to City wheel) + Spot Intro / City Prose */}
          <div className="space-y-4 max-w-lg w-full">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#888888] tracking-widest uppercase">
                {currentCitySummary?.country || 'Worldwide'}
              </span>
              <button
                type="button"
                onClick={() => setPlaceTab('city')}
                className="text-left group/citytitle flex items-baseline gap-3 cursor-pointer"
                title="Click to return to City wheel"
              >
                <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-none group-hover/citytitle:text-[#bbbbbb] transition-colors">
                  {currentCityName}
                </h2>
              </button>
            </div>

            {/* Living in... / Spot Intro text with compact line spacing */}
            {selectedNode ? (
              <div className="space-y-2 text-xs sm:text-[13px] text-[#c0c4d6] leading-snug font-light animate-fadeIn">
                <p className="text-white font-medium text-sm font-sans flex items-center gap-2">
                  <SolidPlacePinIcon className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>{selectedNode.locationName}</span>
                  {selectedVariantKey && (
                    <span className="text-[11px] font-mono text-[#888888] font-normal">
                      · {getVariantLabel(selectedVariantKey)}
                    </span>
                  )}
                </p>
                <p>{getSpotIntro(selectedNode.locationName, currentCityName)}</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs sm:text-[13px] text-[#c0c4d6] leading-snug font-light">
                {cityTemplate.proseParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Area: Dish Marquee ONLY appears when a Place galaxy or icon is clicked */}
          {selectedNode && (
            <div className="w-full pt-4 border-t border-white/10 mt-6 animate-fadeIn">
              {marqueeDishes.length > 0 ? (
                marqueeDishes.length >= 4 ? (
                  /* Auto continuous right-to-left scroll marquee when count meets threshold */
                  <div className="relative w-full overflow-hidden py-1">
                    <div className="animate-marquee-rtl flex items-center gap-3.5">
                      {marqueeTrackDishes.map((dish, idx) => (
                        <div
                          key={`${dish.id}-${idx}`}
                          onClick={(e) => handleOpenInstagram(e, dish)}
                          className="group/dish relative w-32 sm:w-36 h-44 sm:h-48 rounded-2xl overflow-hidden shrink-0 shadow-xl cursor-pointer bg-[#141416] transition-transform duration-300 hover:scale-105 select-none"
                        >
                          {/* Background Image or Fallback */}
                          {dish.image ? (
                            <img
                              src={dish.image}
                              alt={dish.title || 'Dish'}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/dish:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#18181c] flex items-center justify-center p-3 text-center" />
                          )}

                          {/* Instagram Icon Badge at TOP-RIGHT */}
                          <div
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 group-hover/dish:text-white group-hover/dish:bg-black/85 flex items-center justify-center shadow-lg transition-all"
                            title="Open Instagram"
                            onClick={(e) => handleOpenInstagram(e, dish)}
                          >
                            <Instagram className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Static clean row without auto-scroll when items are fewer than threshold */
                  <div className="relative w-full overflow-x-auto scrollbar-none py-1">
                    <div className="flex items-center gap-3.5">
                      {marqueeDishes.map((dish, idx) => (
                        <div
                          key={`${dish.id}-${idx}`}
                          onClick={(e) => handleOpenInstagram(e, dish)}
                          className="group/dish relative w-32 sm:w-36 h-44 sm:h-48 rounded-2xl overflow-hidden shrink-0 shadow-xl cursor-pointer bg-[#141416] transition-transform duration-300 hover:scale-105 select-none"
                        >
                          {/* Background Image or Fallback */}
                          {dish.image ? (
                            <img
                              src={dish.image}
                              alt={dish.title || 'Dish'}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/dish:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#18181c] flex items-center justify-center p-3 text-center" />
                          )}

                          {/* Instagram Icon Badge at TOP-RIGHT */}
                          <div
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 group-hover/dish:text-white group-hover/dish:bg-black/85 flex items-center justify-center shadow-lg transition-all"
                            title="Open Instagram"
                            onClick={(e) => handleOpenInstagram(e, dish)}
                          >
                            <Instagram className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="py-6 text-center text-xs font-mono text-[#666666]">
                  No dishes found matching this icon definition.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE PORTRAIT BOTTOM SHEET (Option A): Presents Right-Spread spot info & dish marquee when tapping a galaxy or icon */}
      {isMobilePortrait &&
        selectedNode &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end">
            <div
              onClick={handleCloseGalaxySheet}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fadeIn"
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={selectedNode.locationName}
              className="relative z-10 w-full bg-[#111111] border-t border-x border-[#262626] rounded-t-3xl px-5 pt-3 pb-7 max-h-[82vh] overflow-y-auto shadow-2xl animate-slide-up flex flex-col select-none"
            >
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4 shrink-0" aria-hidden="true" />

              {/* Header: Country, City, Close */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-mono text-[#888888] tracking-widest uppercase block">
                    {currentCitySummary?.country || 'Worldwide'}
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight leading-none">
                    {currentCityName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleCloseGalaxySheet}
                  className="p-2 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Spot Info */}
              <div className="space-y-2 text-xs text-[#c0c4d6] leading-snug font-light pt-4">
                <p className="text-white font-medium text-sm font-sans flex items-center gap-2">
                  <SolidPlacePinIcon className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                  <span>{selectedNode.locationName}</span>
                  {selectedVariantKey && (
                    <span className="text-[11px] font-mono text-[#888888] font-normal">
                      · {getVariantLabel(selectedVariantKey)}
                    </span>
                  )}
                </p>
                <p>{getSpotIntro(selectedNode.locationName, currentCityName)}</p>
              </div>

              {/* Dish Marquee / Cards */}
              <div className="w-full pt-4 border-t border-white/10 mt-5">
                {marqueeDishes.length > 0 ? (
                  marqueeDishes.length >= 4 ? (
                    <div className="relative w-full overflow-hidden py-1">
                      <div className="animate-marquee-rtl flex items-center gap-3.5">
                        {marqueeTrackDishes.map((dish, idx) => (
                          <div
                            key={`${dish.id}-${idx}`}
                            onClick={(e) => handleOpenInstagram(e, dish)}
                            className="group/dish relative w-32 h-44 rounded-2xl overflow-hidden shrink-0 shadow-xl cursor-pointer bg-[#141416] transition-transform duration-300 hover:scale-105 select-none"
                          >
                            {dish.image ? (
                              <img
                                src={dish.image}
                                alt={dish.title || 'Dish'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/dish:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#18181c] flex items-center justify-center p-3 text-center" />
                            )}
                            <div
                              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 group-hover/dish:text-white group-hover/dish:bg-black/85 flex items-center justify-center shadow-lg transition-all"
                              title="Open Instagram"
                              onClick={(e) => handleOpenInstagram(e, dish)}
                            >
                              <Instagram className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full overflow-x-auto scrollbar-none py-1">
                      <div className="flex items-center gap-3.5">
                        {marqueeDishes.map((dish, idx) => (
                          <div
                            key={`${dish.id}-${idx}`}
                            onClick={(e) => handleOpenInstagram(e, dish)}
                            className="group/dish relative w-32 h-44 rounded-2xl overflow-hidden shrink-0 shadow-xl cursor-pointer bg-[#141416] transition-transform duration-300 hover:scale-105 select-none"
                          >
                            {dish.image ? (
                              <img
                                src={dish.image}
                                alt={dish.title || 'Dish'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/dish:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#18181c] flex items-center justify-center p-3 text-center" />
                            )}
                            <div
                              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 group-hover/dish:text-white group-hover/dish:bg-black/85 flex items-center justify-center shadow-lg transition-all"
                              title="Open Instagram"
                              onClick={(e) => handleOpenInstagram(e, dish)}
                            >
                              <Instagram className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="py-6 text-center text-xs font-mono text-[#666666]">
                    No dishes found matching this icon definition.
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

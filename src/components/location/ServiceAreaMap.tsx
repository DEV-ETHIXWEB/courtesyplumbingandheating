import { useEffect, useMemo, useRef, useState, useId } from 'react';
import type { Location } from '../../data/locations';
import './ServiceAreaMap.css';

interface Props {
  locations: Location[];
}


function slugMatches(loc: Location, query: string) {
  return loc.name.toLowerCase().includes(query.trim().toLowerCase());
}

/**
 * Bounds that fit every city, extended southward past the primary (HQ) marker
 * so its always-open popup card has room to render without the map having to
 * auto-pan (which otherwise compounds with fitBounds and over-zooms out).
 */
function computeFitBounds(L: typeof import('leaflet'), locations: Location[]) {
  const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
  return bounds.pad(0.1);
}

export default function ServiceAreaMap({ locations }: Props) {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map());
  const leafletRef = useRef<typeof import('leaflet') | null>(null);

  const [ready, setReady] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(
    locations.find((l) => l.primary)?.slug ?? null
  );
  const [query, setQuery] = useState('');
  const titleId = useId();

  const active = useMemo(() => locations.find((l) => l.slug === activeSlug) ?? null, [activeSlug, locations]);
  const primary = useMemo(() => locations.find((l) => l.primary) ?? null, [locations]);

  const filtered = useMemo(() => {
    if (!query.trim()) return locations;
    return locations.filter((l) => slugMatches(l, query));
  }, [locations, query]);

  const sortedForPanel = useMemo(
    () => [...filtered].sort((a, b) => a.name.localeCompare(b.name)),
    [filtered]
  );

  function selectLocation(slug: string, opts: { pan?: boolean; openPopup?: boolean } = {}) {
    setActiveSlug(slug);
    const loc = locations.find((l) => l.slug === slug);
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!loc || !map || !L) return;

    if (opts.pan) {
      map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 11), { duration: 0.6 });
    }
    if (opts.openPopup) {
      const marker = markersRef.current.get(slug);
      marker?.openPopup();
    }
  }

  // Initialize the map once.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import('leaflet');
      if (cancelled || !mapElRef.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(mapElRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: true,
        minZoom: 7,
        maxZoom: 15,
      });
      mapRef.current = map;

      map.fitBounds(computeFitBounds(L, locations));

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Enable scroll-zoom only once the user has interacted, so page scroll isn't trapped.
      map.on('focus', () => map.scrollWheelZoom.enable());
      map.on('blur', () => map.scrollWheelZoom.disable());
      mapElRef.current.addEventListener('mouseenter', () => map.scrollWheelZoom.enable());
      mapElRef.current.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

      // Coverage boundary: a soft convex hull around all service cities.
      const pts: [number, number][] = locations.map((l) => [l.lat, l.lng]);
      const hull = convexHull(pts);
      if (hull.length > 2) {
        L.polygon(hull, {
          color: '#0f5fa8',
          weight: 2,
          opacity: 0.5,
          fillColor: '#1f79c9',
          fillOpacity: 0.08,
        }).addTo(map);
      }

      const navyIcon = L.divIcon({
        className: 'sam-marker sam-marker--navy',
        html: markerSvg('#0f4070'),
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -36],
      });
      const redIcon = L.divIcon({
        className: 'sam-marker sam-marker--red',
        html: markerSvg('#c22a2e'),
        iconSize: [34, 46],
        iconAnchor: [17, 46],
        popupAnchor: [0, -42],
      });

      for (const loc of locations) {
        const icon = loc.primary ? redIcon : navyIcon;
        const marker = L.marker([loc.lat, loc.lng], {
          icon,
          keyboard: false, // keyboard access provided via the city panel, not the map itself
          title: loc.name,
          alt: loc.name,
        }).addTo(map);

        marker.bindPopup(popupHtml(loc), {
          closeButton: true,
          className: 'sam-popup',
          offset: [0, -4],
          maxWidth: 225,
          autoPan: false,
        });

        marker.on('click', () => selectLocation(loc.slug, { openPopup: false }));
        marker.on('mouseover', () => setActiveSlug(loc.slug));

        markersRef.current.set(loc.slug, marker);
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open the primary (Castle Rock) popup by default once the map is ready.
  useEffect(() => {
    if (!ready || !primary) return;
    const marker = markersRef.current.get(primary.slug);
    marker?.openPopup();
  }, [ready, primary]);

  function handleZoom(delta: number) {
    mapRef.current?.setZoom(mapRef.current.getZoom() + delta);
  }

  function handleRecenter() {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;
    map.fitBounds(computeFitBounds(L, locations), { animate: true });
    if (primary) selectLocation(primary.slug, { openPopup: true });
  }

  return (
    <div className="sam-root">
      <div className="sam-map-col">
        <div className="sam-map-frame">
          <div
            ref={mapElRef}
            role="img"
            aria-labelledby={titleId}
            className="sam-map"
            tabIndex={0}
          />
          <span id={titleId} className="sr-only">
            Map of Courtesy Plumbing &amp; Heating&apos;s Castle Rock and Denver Metro service area
          </span>

          <div className="sam-controls" role="group" aria-label="Map zoom controls">
            <button type="button" className="sam-control-btn" onClick={() => handleZoom(1)} aria-label="Zoom in">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" /></svg>
            </button>
            <button type="button" className="sam-control-btn" onClick={() => handleZoom(-1)} aria-label="Zoom out">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" /></svg>
            </button>
            <button type="button" className="sam-control-btn sam-control-btn--recenter" onClick={handleRecenter} aria-label="Reset map view">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="currentColor" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>

          <div className="sam-legend">
            <span className="sam-legend-item">
              <span className="sam-legend-dot sam-legend-dot--navy" aria-hidden="true" />
              Service Location
            </span>
            <span className="sam-legend-item">
              <span className="sam-legend-ring" aria-hidden="true" />
              Service Area Boundary
            </span>
            <span className="sam-legend-item">
              <span className="sam-legend-dot sam-legend-dot--red" aria-hidden="true" />
              Office Location
            </span>
          </div>
        </div>
      </div>

      <div className="sam-panel">
        <div className="sam-hint">
          <span className="sam-hint-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M12 11v5M12 8v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </span>
          <p>Hover or select a city on the map to see local service details.</p>
        </div>

        <label className="sam-search">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="sam-search-icon">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Search city</span>
          <input
            type="text"
            placeholder="Search city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <ul className="sam-city-grid" role="list">
          {sortedForPanel.map((loc) => (
            <li key={loc.slug}>
              <button
                type="button"
                className="sam-city-btn"
                data-active={loc.slug === activeSlug}
                data-primary={loc.primary ? 'true' : undefined}
                onClick={() => selectLocation(loc.slug, { pan: true, openPopup: true })}
                onFocus={() => setActiveSlug(loc.slug)}
              >
                {loc.primary && (
                  <svg viewBox="0 0 24 24" width="13" height="13" className="sam-city-btn-pin" aria-hidden="true">
                    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.7a1 1 0 0 0 1.4 0C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill="currentColor" />
                  </svg>
                )}
                <span>{loc.name}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" className="sam-city-btn-chevron" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </button>
            </li>
          ))}
          {sortedForPanel.length === 0 && (
            <li className="sam-city-empty">No cities match &ldquo;{query}&rdquo;.</li>
          )}
        </ul>

        <a href="/service-area" className="sam-see-all">
          See All Service Areas
        </a>
      </div>

      {active && (
        <div className="sr-only" role="status" aria-live="polite">
          {active.name} selected{active.primary ? ', headquarters' : ''}.
        </div>
      )}
    </div>
  );
}

function markerSvg(fill: string) {
  return `
    <svg viewBox="0 0 30 40" width="30" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 13.2 23.7 13.8 24.3a1.7 1.7 0 0 0 2.4 0C16.8 38.7 30 25.5 30 15 30 6.7 23.3 0 15 0Z" fill="${fill}" stroke="white" stroke-width="1.5"/>
      <circle cx="15" cy="15" r="5.5" fill="white"/>
    </svg>
  `;
}

function popupHtml(loc: Location) {
  const badge = loc.primary
    ? '<span class="sam-popup-badge">HEADQUARTERS</span>'
    : '<span class="sam-popup-badge sam-popup-badge--muted">SERVICE AREA</span>';
  const desc = loc.primary
    ? 'Our home base! Providing expert plumbing, heating, and cooling services with Courtesy.'
    : `Courtesy provides licensed plumbing, heating, and cooling service to ${escapeHtml(loc.name)} and surrounding neighborhoods.`;
  const href = loc.hasPage ? `/service-area/${loc.slug}` : '/contact';
  const cta = loc.hasPage ? `View Services in ${escapeHtml(loc.name)}` : 'Schedule Service';

  return `
    <div class="sam-popup-inner">
      <div class="sam-popup-title-row">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.7a1 1 0 0 0 1.4 0C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill="currentColor"/></svg>
        <span class="sam-popup-title">${escapeHtml(loc.name)}</span>
      </div>
      ${badge}
      <p class="sam-popup-desc">${desc}</p>
      <a class="sam-popup-cta" href="${href}">${cta}</a>
    </div>
  `;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Minimal convex hull (monotone chain) for the coverage-area polygon. */
function convexHull(points: [number, number][]): [number, number][] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;

  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();

  // Pad the hull outward slightly so markers sit inside the boundary, not on its edge.
  const hull = [...lower, ...upper];
  const cx = hull.reduce((s, p) => s + p[0], 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p[1], 0) / hull.length;
  return hull.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    return [cx + dx * 1.18, cy + dy * 1.18] as [number, number];
  });
}

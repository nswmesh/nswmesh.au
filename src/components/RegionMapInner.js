import React, {useEffect, useState} from 'react';
import {MapContainer, TileLayer, GeoJSON, useMap} from 'react-leaflet';
import {useColorMode} from '@docusaurus/theme-common';
import 'leaflet/dist/leaflet.css';

const ACTIVE_COLOUR = '#f43f5e';
const FUTURE_COLOUR = '#6b7280';
// References to the gradient defs in the hidden SVG rendered below, used as the hover colour
const HOVER_GRADIENT = 'url(#nswmesh-hover-gradient)';
const FUTURE_HOVER_GRADIENT = 'url(#nswmesh-hover-gradient-future)';

// Arbitrary bounds for NSW, to prevent panning too far away from the map.
const NSW_MAX_BOUNDS = [
  [-41, 136],
  [-25, 158]
];

// Carto basemap tiles for light and dark, used by the "auto" base layer to follow the site's theme
const AUTO_TILE_LAYERS = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
};

const AUTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const SATELLITE_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics';

// Work out which tile URL/attribution to use for the selected base layer. "auto" is the
// only one that depends on the site's colour mode, since satellite/map imagery doesn't have a dark variant
function getTileConfig(baseLayer, colorMode) {
  if (baseLayer === 'satellite') {
    return {url: SATELLITE_TILE_URL, attribution: SATELLITE_ATTRIBUTION};
  }

  if (baseLayer === 'map') {
    return {url: MAP_TILE_URL, attribution: MAP_ATTRIBUTION};
  }

  return {url: AUTO_TILE_LAYERS[colorMode], attribution: AUTO_ATTRIBUTION};
}

// Get the status of a region
function getStatus(feature) {
  const status = feature?.properties?.Status || feature?.properties?.status;
  const normalized = typeof status === 'string' ? status.toLowerCase() : '';
  return normalized === 'tentative' || normalized === 'future' ? normalized : 'active';
}

const STATUS_STACK_ORDER = {future: 0, tentative: 1, active: 2};

// Leaflet stacks SVG paths in DOM order, so rendering Future first (bottom) and Active
// last (top) keeps shared borders tidy where regions of different status overlap
function getLayerStackOrder(data) {
  const status = getStatus(data?.features?.[0] || {});
  return STATUS_STACK_ORDER[status] ?? STATUS_STACK_ORDER.active;
}

// Set the style for a region based on its status
function regionStyle(feature) {
  const status = getStatus(feature);

  if (status === 'future') {
    return {
      color: FUTURE_COLOUR,
      weight: 2,
      fillColor: FUTURE_COLOUR,
      fillOpacity: 0.08,
      dashArray: '6, 6',
      smoothFactor: 0
    };
  }

  if (status === 'tentative') {
    return {
      color: ACTIVE_COLOUR,
      weight: 2,
      fillColor: ACTIVE_COLOUR,
      fillOpacity: 0.08,
      dashArray: '6, 6',
      smoothFactor: 0
    };
  }

  return {
    color: ACTIVE_COLOUR,
    weight: 2,
    fillColor: ACTIVE_COLOUR,
    fillOpacity: 0.1,
    smoothFactor: 0
  };
}

// Escape region data before it's inserted as raw HTML in labels and popups
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => (
    {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]
  ));
}

function listItems(values) {
  return values.map((value) => `<li>${escapeHtml(value)}</li>`).join('');
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Leaflet's Tooltip options don't support a style prop, so the hover colour has to be
// applied directly to the DOM element rather than passed in when binding the tooltip
function applyHoverStyle(layer, feature) {
  const isFuture = getStatus(feature) === 'future';
  const gradient = isFuture ? FUTURE_HOVER_GRADIENT : HOVER_GRADIENT;

  layer.setStyle({
    color: gradient,
    fillColor: gradient,
    weight: 4,
    fillOpacity: 0.35
  });
  layer.bringToFront();

  const pathEl = layer.getElement && layer.getElement();
  if (pathEl) {
    pathEl.classList.add(isFuture ? 'nswmesh-region-hover--future' : 'nswmesh-region-hover');
  }

  const tooltipEl = layer.getTooltip && layer.getTooltip() && layer.getTooltip().getElement();
  if (tooltipEl) {
    tooltipEl.style.color = '#fff';
    tooltipEl.classList.add('nswmesh-region-label--hover');
  }
}

// Revert a region to its default style, used on mouseout and when its popup closes
function clearHoverStyle(layer, feature) {
  layer.setStyle(regionStyle(feature));

  const pathEl = layer.getElement && layer.getElement();
  if (pathEl) pathEl.classList.remove('nswmesh-region-hover', 'nswmesh-region-hover--future');

  const tooltipEl = layer.getTooltip && layer.getTooltip() && layer.getTooltip().getElement();
  if (tooltipEl) {
    tooltipEl.style.color = '';
    tooltipEl.classList.remove('nswmesh-region-label--hover');
  }
}

// Bind the label, popup, and hover behaviour for a single region polygon
function onEachFeature(feature, layer) {
  const props = feature.properties || {};
  const iata = props.IATA || props.iata || '';
  const region = props.Region || props.region || props.name || props.label || '';
  const status = getStatus(feature);
  const statusModifier = `nswmesh-region-popup--${status}`;

  if (iata) {
    const labelClassName =
      status === 'future' ? 'nswmesh-region-label nswmesh-region-label--future' : 'nswmesh-region-label';
    layer.bindTooltip(`<span class="nswmesh-region-label__text">${escapeHtml(iata)}</span>`, {
      permanent: true,
      direction: 'center',
      className: labelClassName
    });
  }

  // Scopes come straight from the geojson where available, falling back to a guess from the IATA code
  const scopesRaw = props.Scopes || props.scopes;
  const scopes = scopesRaw
    ? String(scopesRaw).split(',').map((scope) => scope.trim()).filter(Boolean)
    : (iata ? ['au', 'au-nsw', `au-nsw-${iata.toLowerCase()}`] : ['au', 'au-nsw']);

  const channelsRaw = props.Channels || props.channels;
  const channels = channelsRaw
    ? String(channelsRaw).split(',').map((channel) => channel.trim()).filter(Boolean)
    : ['None'];

  const popupHtml = `
    <div class="nswmesh-region-popup ${statusModifier}">
      <span class="nswmesh-region-popup__status-label">${escapeHtml(capitalize(status))}</span>
      ${iata ? `<div class="nswmesh-region-popup__iata">${escapeHtml(iata)}</div>` : ''}
      ${region ? `<div class="nswmesh-region-popup__region">${escapeHtml(region)}</div>` : ''}
      <div class="nswmesh-region-popup__section">
        <strong>Local Scopes:</strong>
        <ul>${listItems(scopes)}</ul>
      </div>
      <div class="nswmesh-region-popup__section">
        <strong>Local Channels:</strong>
        <ul>${listItems(channels)}</ul>
      </div>
    </div>
  `;
  layer.bindPopup(popupHtml);

  layer.on('mouseover', () => applyHoverStyle(layer, feature));

  // Don't clear the hover style on mouseout if the popup is still open, so a clicked
  // region stays highlighted until its popup is closed, regardless of the cursor
  layer.on('mouseout', () => {
    if (!layer.isPopupOpen()) clearHoverStyle(layer, feature);
  });

  layer.on('popupopen', () => applyHoverStyle(layer, feature));
  layer.on('popupclose', () => clearHoverStyle(layer, feature));
}

// Rendered as a child of MapContainer so useMap() only resolves once the Leaflet map
// instance actually exists, instead of racing a ref that populates asynchronously
function CtrlScrollZoom() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    function handleWheel(event) {
      if (event.ctrlKey || event.metaKey) {
        // Block the browser's own page zoom and hand the gesture to Leaflet instead
        event.preventDefault();
        if (!map.scrollWheelZoom.enabled()) map.scrollWheelZoom.enable();
      } else if (map.scrollWheelZoom.enabled()) {
        map.scrollWheelZoom.disable();
      }
    }

    container.addEventListener('wheel', handleWheel, {passive: false});
    return () => container.removeEventListener('wheel', handleWheel);
  }, [map]);

  return null;
}

// Segmented control for picking the base layer: satellite imagery, plain OSM street
// map, or "auto", which follows the site's light/dark theme (the half-filled icon)
function BaseLayerSwitcher({baseLayer, onChange}) {
  return (
    <div className="nswmesh-region-map__base-layer" role="group" aria-label="Base map style">
      <button
        aria-label="Satellite view"
        aria-pressed={baseLayer === 'satellite'}
        className="nswmesh-region-map__base-layer-button"
        onClick={() => onChange('satellite')}
        title="Satellite"
        type="button">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
          />
        </svg>
      </button>
      <button
        aria-label="Map view"
        aria-pressed={baseLayer === 'map'}
        className="nswmesh-region-map__base-layer-button"
        onClick={() => onChange('map')}
        title="Map"
        type="button">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"
          />
        </svg>
      </button>
      <button
        aria-label="Auto (follow site theme)"
        aria-pressed={baseLayer === 'auto'}
        className="nswmesh-region-map__base-layer-button"
        onClick={() => onChange('auto')}
        title="Auto"
        type="button">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"
          />
        </svg>
      </button>
    </div>
  );
}

// Very important function!
function LogoEasterEgg({state}) {
  if (state === 0) return null;

  return (
    <div key={state} className="nswmesh-region-map__easter-egg">
      <span role="img" aria-label={state === 1 ? 'cow' : 'penguin'}>
        {state === 1 ? '\u{1F42E}' : '\u{1F427}'}
      </span>
      <span className="nswmesh-region-map__easter-egg-arrow">&gt;</span>
      <span role="img" aria-label={state === 1 ? 'penguin' : 'cow'}>
        {state === 1 ? '\u{1F427}' : '\u{1F42E}'}
      </span>
    </div>
  );
}

// Dismissible hint explaining the ctrl+scroll gesture above, since scroll-to-zoom
// is off by default (a plain page scroll shouldn't get hijacked by the map)
function ZoomHint() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="nswmesh-region-map__zoom-hint">
      <span>Ctrl + scroll to zoom</span>
      <button
        aria-label="Dismiss hint"
        className="nswmesh-region-map__zoom-hint-close"
        onClick={() => setDismissed(true)}
        type="button">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6Z" />
        </svg>
      </button>
    </div>
  );
}

// Legend with swatches for each status, and an expandable panel explaining what they mean
function LegendDescription({expanded, children}) {
  return (
    <div
      className={
        expanded
          ? 'nswmesh-region-map__legend-description-wrap nswmesh-region-map__legend-description-wrap--expanded'
          : 'nswmesh-region-map__legend-description-wrap'
      }>
      <div className="nswmesh-region-map__legend-description-inner">
        <p className="nswmesh-region-map__legend-description">{children}</p>
      </div>
    </div>
  );
}

function RegionMapLegend() {
  const [expanded, setExpanded] = useState(false);
  // Toggled true on click and cleared once the pop animation finishes, so it can replay every click
  const [pop, setPop] = useState(false);

  function handleToggle() {
    setExpanded((prev) => !prev);
    setPop(true);
  }

  return (
    <div className="nswmesh-region-map__legend">
      <div className="nswmesh-region-map__legend-header">
        <span>Legend</span>
        <button
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide legend details' : 'Show legend details'}
          className={
            pop
              ? 'nswmesh-region-map__legend-toggle nswmesh-region-map__legend-toggle--pop'
              : 'nswmesh-region-map__legend-toggle'
          }
          onAnimationEnd={() => setPop(false)}
          onClick={handleToggle}
          type="button">
          ?
        </button>
      </div>
      <div className="nswmesh-region-map__legend-item">
        <div className="nswmesh-region-map__legend-item-label">
          <span className="nswmesh-region-map__legend-swatch nswmesh-region-map__legend-swatch--active" />
          Active
        </div>
        <LegendDescription expanded={expanded}>
          The region has active users, and its scopes and channels are in active use.
        </LegendDescription>
      </div>
      <div className="nswmesh-region-map__legend-item">
        <div className="nswmesh-region-map__legend-item-label">
          <span className="nswmesh-region-map__legend-swatch nswmesh-region-map__legend-swatch--tentative" />
          Tentative
        </div>
        <LegendDescription expanded={expanded}>
          The region has users and traffic, but its borders, scopes, and channels haven&apos;t been fully settled, so
          scopes may or may not be in active use.
        </LegendDescription>
      </div>
      <div className="nswmesh-region-map__legend-item">
        <div className="nswmesh-region-map__legend-item-label">
          <span className="nswmesh-region-map__legend-swatch nswmesh-region-map__legend-swatch--future" />
          Future
        </div>
        <LegendDescription expanded={expanded}>
          An early idea of what a region might use or look like. If you&apos;re within or near its tentative
          borders, join the Discord to take part in discussing the region and help shape it.
        </LegendDescription>
      </div>
    </div>
  );
}

export default function RegionMapInner({geojsonUrls, center, zoom, height, logoUrlLight, logoUrlDark}) {
  const {colorMode} = useColorMode();
  const [layers, setLayers] = useState([]);
  const [failedUrls, setFailedUrls] = useState([]);
  const [baseLayer, setBaseLayer] = useState('auto');
  const [eggState, setEggState] = useState(0);
  const tileConfig = getTileConfig(baseLayer, colorMode);

  // Satellite/OSM imagery doesn't have a dark variant, so always use the light logo and
  // label styling on those, regardless of the site's theme; only "auto" follows colorMode
  const isBusyBasemap = baseLayer !== 'auto';
  const logoUrl = isBusyBasemap || colorMode !== 'dark' ? logoUrlLight : logoUrlDark;

  // Fetch every region file in parallel and keep track of any that fail, rather than
  // letting one bad file stop the rest of the regions from loading
  useEffect(() => {
    let cancelled = false;

    Promise.all(
      geojsonUrls.map((url) =>
        fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to load ${url}`);
            return res.json();
          })
          .then((data) => ({url, data}))
          .catch(() => ({url, data: null}))
      )
    ).then((results) => {
      if (cancelled) return;
      setLayers(results.filter((result) => result.data));
      setFailedUrls(results.filter((result) => !result.data).map((result) => result.url));
    });

    return () => {
      cancelled = true;
    };
  }, [geojsonUrls]);

  return (
    <div
      className={isBusyBasemap ? 'nswmesh-region-map nswmesh-region-map--busy-basemap' : 'nswmesh-region-map'}
      style={{height, width: '100%', position: 'relative'}}>
      {/* Hidden defs so the hover gradients can be referenced via url(#...) from region styles */}
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="nswmesh-hover-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff6a00" />
            <stop offset="1" stopColor="#e11d48" />
          </linearGradient>
          <linearGradient id="nswmesh-hover-gradient-future" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8f867e" />
            <stop offset="1" stopColor="#8a7278" />
          </linearGradient>
        </defs>
      </svg>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{height: '100%', width: '100%'}}
        scrollWheelZoom={false}
        maxBounds={NSW_MAX_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={6}>
        <TileLayer key={`${baseLayer}-${colorMode}`} attribution={tileConfig.attribution} url={tileConfig.url} />
        {[...layers]
          .sort((a, b) => getLayerStackOrder(a.data) - getLayerStackOrder(b.data))
          .map(({url, data}) => (
            <GeoJSON key={url} data={data} style={regionStyle} onEachFeature={onEachFeature} />
          ))}
        <CtrlScrollZoom />
      </MapContainer>
      {logoUrl && (
        <div className="nswmesh-region-map__logo">
          <button
            aria-label="NSW Mesh"
            className="nswmesh-region-map__logo-button"
            onClick={(event) => {
              event.stopPropagation();
              setEggState((prev) => (prev + 1) % 3);
            }}
            type="button">
            <img src={logoUrl} alt="NSW Mesh" />
          </button>
          <LogoEasterEgg state={eggState} />
        </div>
      )}
      <ZoomHint />
      <BaseLayerSwitcher baseLayer={baseLayer} onChange={setBaseLayer} />
      <RegionMapLegend />
      {failedUrls.length > 0 && (
        <p className="nswmesh-region-map__error">Could not load region data from: {failedUrls.join(', ')}.</p>
      )}
    </div>
  );
}

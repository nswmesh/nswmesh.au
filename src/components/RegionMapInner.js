import React, {useEffect, useRef, useState} from 'react';
import {MapContainer, TileLayer, GeoJSON, useMap} from 'react-leaflet';
import {useColorMode} from '@docusaurus/theme-common';
import 'leaflet/dist/leaflet.css';

const ACTIVE_COLOUR = '#f43f5e';
const FUTURE_COLOUR = '#6b7280';

// Touch devices fire mouseover on tap, so this stops taps triggering hover styling too
const supportsHover =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(hover: hover)').matches
    : true;

// Gradient defs are in the hidden SVG below
const HOVER_GRADIENT = 'url(#nswmesh-hover-gradient)';
const FUTURE_HOVER_GRADIENT = 'url(#nswmesh-hover-gradient-future)';

// IATA -> layer, so ?region= links can find and select the right one (see the deep-link effect below)
const regionLayersByIata = new Map();

// Popup content is raw HTML, so these buttons are plain SVG markup rather than JSX
const COPY_ICON_SVG =
  '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 4c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4Zm2 0v16h16V4H4Zm2.7 3.29 4 4a1 1 0 0 1 0 1.42l-4 4-1.4-1.42L8.58 12 5.3 8.71l1.4-1.42ZM12 15h6v2h-6v-2Z" /></svg>';
const LINK_ICON_SVG =
  '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>';
const CHECK_ICON_SVG =
  '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.3 6.7 9 18l-5.3-5.3 1.4-1.4L9 15.2 18.9 5.3l1.4 1.4Z" /></svg>';

function buildCliCommands(scopes) {
  const lines = scopes.flatMap((scope) => [`region put ${scope}`, `region allowf ${scope}`]);
  lines.push('region save');
  return lines.join('\n');
}

// Briefly swaps a button's icon to a checkmark after a successful copy
function flashCopied(button, defaultIconSvg, defaultTitle) {
  button.innerHTML = CHECK_ICON_SVG;
  button.title = 'Copied!';

  window.setTimeout(() => {
    button.innerHTML = defaultIconSvg;
    button.title = defaultTitle;
  }, 1500);
}

// navigator.clipboard is undefined outside a secure context (e.g. testing over LAN http on
// a phone), which would otherwise throw
function copyToClipboard(text, onSuccess) {
  if (!navigator.clipboard || !navigator.clipboard.writeText) return;
  navigator.clipboard.writeText(text).then(onSuccess).catch(() => {});
}

// Rough NSW bounds, so panning can't wander off too far
const NSW_MAX_BOUNDS = [
  [-41, 136],
  [-25, 158]
];

// Carto tiles for the "auto" base layer, which follows the site's light/dark theme
const AUTO_TILE_LAYERS = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
};

const AUTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function getTileConfig(baseLayer, colorMode, cartoApiKey) {
  if (baseLayer === 'map') {
    return {url: MAP_TILE_URL, attribution: MAP_ATTRIBUTION};
  }

  const url = cartoApiKey
    ? `${AUTO_TILE_LAYERS[colorMode]}?key=${encodeURIComponent(cartoApiKey)}`
    : AUTO_TILE_LAYERS[colorMode];
  return {url, attribution: AUTO_ATTRIBUTION};
}

function getStatus(feature) {
  const status = feature?.properties?.Status || feature?.properties?.status;
  const normalized = typeof status === 'string' ? status.toLowerCase() : '';
  return normalized === 'tentative' || normalized === 'future' ? normalized : 'active';
}

// Leaflet stacks SVG paths in DOM order, so Future renders first (bottom) and Active last
// (top), keeping shared borders tidy.
const STATUS_ORDER = ['future', 'tentative', 'active'];

function partitionFeaturesByStatus(features) {
  const buckets = {future: [], tentative: [], active: []};
  features.forEach((feature) => buckets[getStatus(feature)].push(feature));
  return buckets;
}

function regionStyle(feature) {
  const status = getStatus(feature);

  if (status === 'future') {
    return {
      color: FUTURE_COLOUR,
      weight: 2,
      fillColor: FUTURE_COLOUR,
      fillOpacity: 0.08,
      dashArray: '6, 6',
      smoothFactor: 1.3
    };
  }

  if (status === 'tentative') {
    return {
      color: ACTIVE_COLOUR,
      weight: 2,
      fillColor: ACTIVE_COLOUR,
      fillOpacity: 0.08,
      dashArray: '6, 6',
      smoothFactor: 1.3
    };
  }

  return {
    color: ACTIVE_COLOUR,
    weight: 2,
    fillColor: ACTIVE_COLOUR,
    fillOpacity: 0.1,
    smoothFactor: 1.3
  };
}

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

// "Wollongong / Illawarra" -> ["Wollongong", "Illawarra"]
function splitRegionName(region) {
  return region.split('/').map((part) => part.trim()).filter(Boolean);
}

// Each part gets its own line, with the second (and any further) marked as secondary
function buildNameLinesHtml(parts, baseClass) {
  return parts
    .map((part, index) => `<span class="${baseClass}${index > 0 ? ` ${baseClass}--secondary` : ''}">${escapeHtml(part)}</span>`)
    .join('');
}

const activeHoverLayers = new Set();

const HOVER_FADE_MIN_ZOOM = 8;
const HOVER_FADE_MAX_ZOOM = 16;
const HOVER_FADE_MAX_OPACITY = 0.35;
const HOVER_FADE_MIN_OPACITY = 0.05;

// Fades the hover fill out at high zoom, so it doesn't hide the map on a small border area
function getHoverFillOpacity(zoom) {
  const t = Math.min(Math.max((zoom - HOVER_FADE_MIN_ZOOM) / (HOVER_FADE_MAX_ZOOM - HOVER_FADE_MIN_ZOOM), 0), 1);
  return HOVER_FADE_MAX_OPACITY - t * (HOVER_FADE_MAX_OPACITY - HOVER_FADE_MIN_OPACITY);
}

function applyHoverStyle(layer, feature) {
  const isFuture = getStatus(feature) === 'future';
  const gradient = isFuture ? FUTURE_HOVER_GRADIENT : HOVER_GRADIENT;
  const zoom = layer._map ? layer._map.getZoom() : HOVER_FADE_MIN_ZOOM;

  // Forcing a reflow between bringToFront() and setStyle() makes sure the stroke-width
  // transition actually plays, even hovering straight from one region onto its neighbour
  layer.bringToFront();
  const pathEl = layer.getElement && layer.getElement();
  if (pathEl) void pathEl.getBoundingClientRect();

  layer.setStyle({
    color: gradient,
    fillColor: gradient,
    weight: 4,
    fillOpacity: getHoverFillOpacity(zoom)
  });
  activeHoverLayers.add(layer);

  if (pathEl) {
    pathEl.classList.add(isFuture ? 'nswmesh-region-hover--future' : 'nswmesh-region-hover');
  }

  const tooltipEl = layer.getTooltip && layer.getTooltip() && layer.getTooltip().getElement();
  if (tooltipEl) {
    tooltipEl.style.color = '#fff';
    tooltipEl.classList.add('nswmesh-region-label--hover');
  }
}

function clearHoverStyle(layer, feature) {
  layer.setStyle(regionStyle(feature));
  activeHoverLayers.delete(layer);

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
  const regionParts = splitRegionName(region);

  if (iata) {
    regionLayersByIata.set(iata.toUpperCase(), layer);

    const labelClassName =
      status === 'future' ? 'nswmesh-region-label nswmesh-region-label--future' : 'nswmesh-region-label';
    layer.bindTooltip(`<span class="nswmesh-region-label__text">${escapeHtml(iata)}</span>`, {
      permanent: true,
      direction: 'center',
      className: labelClassName
    });
  }

  // Never invent data the source doesn't have - say so plainly rather than guessing
  const scopesRaw = props.Scopes || props.scopes;
  const hasScopes = Boolean(scopesRaw);
  const scopes = hasScopes
    ? String(scopesRaw).split(',').map((scope) => scope.trim()).filter(Boolean)
    : ['Unknown'];

  const channelsRaw = props.Channels || props.channels;
  const channels = channelsRaw
    ? String(channelsRaw).split(',').map((channel) => channel.trim()).filter(Boolean)
    : ['Unknown'];

  const cliCommands = hasScopes ? buildCliCommands(scopes) : '';
  const regionHtml = buildNameLinesHtml(regionParts, 'nswmesh-region-popup__region-line');

  const popupHtml = `
    <div class="nswmesh-region-popup ${statusModifier}">
      <span class="nswmesh-region-popup__status-label">${escapeHtml(capitalize(status))}</span>
      ${iata ? `
        <div class="nswmesh-region-popup__iata-row">
          <div class="nswmesh-region-popup__iata">${escapeHtml(iata)}</div>
          <button type="button" class="nswmesh-region-popup__action nswmesh-region-popup__action--share" title="Copy link to this region" aria-label="Copy link to ${escapeHtml(iata)}">${LINK_ICON_SVG}</button>
        </div>
      ` : ''}
      ${region ? `<div class="nswmesh-region-popup__region">${regionHtml}</div>` : ''}
      <div class="nswmesh-region-popup__section">
        <strong class="nswmesh-region-popup__section-heading">
          Scopes
          ${hasScopes ? `<button type="button" class="nswmesh-region-popup__action nswmesh-region-popup__action--copy" title="Copy CLI commands" aria-label="Copy CLI commands for ${escapeHtml(iata || region)}">${COPY_ICON_SVG}</button>` : ''}
        </strong>
        <ul>${listItems(scopes)}</ul>
      </div>
      <div class="nswmesh-region-popup__section">
        <strong>Channels</strong>
        <ul>${listItems(channels)}</ul>
      </div>
    </div>
  `;
  layer.bindPopup(popupHtml, {closeButton: false});

  if (supportsHover) {
    layer.on('mouseover', () => applyHoverStyle(layer, feature));
    layer.on('mouseout', () => {
      if (!layer.isPopupOpen()) clearHoverStyle(layer, feature);
    });
  }

  layer.on('popupopen', () => {
    applyHoverStyle(layer, feature);

    const popupEl = layer.getPopup().getElement();
    if (!popupEl) return;

    const copyButton = popupEl.querySelector('.nswmesh-region-popup__action--copy');
    if (copyButton) {
      copyButton.onclick = (event) => {
        event.stopPropagation();
        copyToClipboard(cliCommands, () => flashCopied(copyButton, COPY_ICON_SVG, 'Copy CLI commands'));
      };
    }

    const shareButton = popupEl.querySelector('.nswmesh-region-popup__action--share');
    if (shareButton) {
      shareButton.onclick = (event) => {
        event.stopPropagation();
        const shareUrl = `${window.location.origin}${window.location.pathname}?region=${encodeURIComponent(iata)}`;
        copyToClipboard(shareUrl, () => flashCopied(shareButton, LINK_ICON_SVG, 'Copy link to this region'));
      };
    }
  });

  layer.on('popupclose', () => clearHoverStyle(layer, feature));
}

// Keeps the hover fade in sync with zoom
function HoverZoomFade() {
  const map = useMap();

  useEffect(() => {
    function handleZoom() {
      const opacity = getHoverFillOpacity(map.getZoom());
      activeHoverLayers.forEach((layer) => layer.setStyle({fillOpacity: opacity}));
    }

    map.on('zoom', handleZoom);
    return () => map.off('zoom', handleZoom);
  }, [map]);

  return null;
}


// Base layer switcher buttons
function BaseLayerSwitcher({baseLayer, onChange}) {
  return (
    <div className="nswmesh-region-map__base-layer" role="group" aria-label="Base map style">
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

// Very important function
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

// Collapsible legend
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
      <button
        aria-expanded={expanded}
        aria-label={expanded ? 'Hide legend' : 'Show legend'}
        className="nswmesh-region-map__legend-header"
        onClick={handleToggle}
        type="button">
        <span>Legend</span>
        <span
          className={
            pop ? 'nswmesh-region-map__legend-chevron-pop nswmesh-region-map__legend-chevron-pop--active' : 'nswmesh-region-map__legend-chevron-pop'
          }
          onAnimationEnd={() => setPop(false)}>
          <svg
            aria-hidden="true"
            className={
              expanded
                ? 'nswmesh-region-map__legend-chevron nswmesh-region-map__legend-chevron--expanded'
                : 'nswmesh-region-map__legend-chevron'
            }
            viewBox="0 0 24 24">
            <path fill="currentColor" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
          </svg>
        </span>
      </button>
      <div
        className={
          expanded
            ? 'nswmesh-region-map__legend-items-wrap nswmesh-region-map__legend-items-wrap--expanded'
            : 'nswmesh-region-map__legend-items-wrap'
        }>
        <div className="nswmesh-region-map__legend-items-inner">
          <div className="nswmesh-region-map__legend-items">
            <div className="nswmesh-region-map__legend-item">
              <div className="nswmesh-region-map__legend-item-label">
                <span className="nswmesh-region-map__legend-swatch nswmesh-region-map__legend-swatch--active" />
                Active
              </div>
              <p className="nswmesh-region-map__legend-description">Established, with channels and scopes in use.</p>
            </div>
            <div className="nswmesh-region-map__legend-item">
              <div className="nswmesh-region-map__legend-item-label">
                <span className="nswmesh-region-map__legend-swatch nswmesh-region-map__legend-swatch--tentative" />
                Tentative
              </div>
              <p className="nswmesh-region-map__legend-description">
                Mesh activity, but details and borders aren&apos;t confirmed.
              </p>
            </div>
            <div className="nswmesh-region-map__legend-item">
              <div className="nswmesh-region-map__legend-item-label">
                <span className="nswmesh-region-map__legend-swatch nswmesh-region-map__legend-swatch--future" />
                Future
              </div>
              <p className="nswmesh-region-map__legend-description">An early guess, entirely subject to change.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegionMapInner({geojsonUrl, center, zoom, height, logoUrlLight, logoUrlDark, cartoApiKey}) {
  const {colorMode} = useColorMode();
  const [features, setFeatures] = useState([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [baseLayer, setBaseLayer] = useState('auto');
  const [eggState, setEggState] = useState(0);
  const tileConfig = getTileConfig(baseLayer, colorMode, cartoApiKey);
  const wrapperRef = useRef(null);
  const deepLinkHandledRef = useRef(false);

  const isBusyBasemap = baseLayer !== 'auto';
  const logoUrl = isBusyBasemap || colorMode !== 'dark' ? logoUrlLight : logoUrlDark;

  useEffect(() => {
    let cancelled = false;

    fetch(geojsonUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${geojsonUrl}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setFeatures(data.features || []);
        setRegionsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadFailed(true);
        setRegionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [geojsonUrl]);

  useEffect(() => {
    const targetIata = new URLSearchParams(window.location.search).get('region');
    if (!targetIata) return;
    if (wrapperRef.current) wrapperRef.current.scrollIntoView({behavior: 'smooth', block: 'center'});
  }, []);

  // Once that region's layer has loaded, pan/zoom to it and open its popup
  useEffect(() => {
    if (deepLinkHandledRef.current) return;

    const targetIata = new URLSearchParams(window.location.search).get('region');
    if (!targetIata) return;

    const layer = regionLayersByIata.get(targetIata.toUpperCase());
    if (!layer || !layer._map) return;

    deepLinkHandledRef.current = true;

    layer._map.fitBounds(layer.getBounds(), {maxZoom: 12});
    layer.openPopup();
  }, [features]);

  const statusBuckets = partitionFeaturesByStatus(features);

  return (
    <div
      ref={wrapperRef}
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
        scrollWheelZoom={true}
        maxBounds={NSW_MAX_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={6}>
        <TileLayer key={`${baseLayer}-${colorMode}`} attribution={tileConfig.attribution} url={tileConfig.url} />
        {STATUS_ORDER.map((status) => {
          const features = statusBuckets[status];
          if (features.length === 0) return null;

          return (
            <GeoJSON
              key={status}
              data={{type: 'FeatureCollection', features}}
              style={regionStyle}
              onEachFeature={onEachFeature}
            />
          );
        })}
        <HoverZoomFade />
      </MapContainer>
      {regionsLoading && (
        <div className="nswmesh-region-map__loading" aria-live="polite" aria-label="Loading regions">
          <span className="nswmesh-region-map__loading-spinner" />
        </div>
      )}
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
      <BaseLayerSwitcher baseLayer={baseLayer} onChange={setBaseLayer} />
      <RegionMapLegend />
      {loadFailed && <p className="nswmesh-region-map__error">Could not load region data.</p>}
    </div>
  );
}

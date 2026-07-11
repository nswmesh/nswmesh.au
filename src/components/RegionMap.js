import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';

export default function RegionMap({geojson, center = [-33.0, 150.8], zoom = 7, height = '500px'}) {
  const {withBaseUrl} = useBaseUrlUtils();
  const geojsonUrls = (Array.isArray(geojson) ? geojson : [geojson]).map((url) => withBaseUrl(url));
  const logoUrlLight = withBaseUrl('/img/logo-horizontal.svg');
  const logoUrlDark = withBaseUrl('/img/logo-horizontal-dark.svg');

  return (
    // Leaflet needs window/document, so the real map only loads once we're in the browser
    <BrowserOnly fallback={<div style={{height}}>Loading map...</div>}>
      {() => {
        const RegionMapInner = require('./RegionMapInner').default;
        return (
          <RegionMapInner
            geojsonUrls={geojsonUrls}
            center={center}
            zoom={zoom}
            height={height}
            logoUrlLight={logoUrlLight}
            logoUrlDark={logoUrlDark}
          />
        );
      }}
    </BrowserOnly>
  );
}

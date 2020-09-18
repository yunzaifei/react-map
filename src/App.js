import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Map, TileLayer } from 'react-leaflet';
import './assets/stylesheets/App.css';
import 'leaflet/dist/leaflet.css';
import locations from './date/location.json';

const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;
const MAPBOX_USERID = process.env.REACT_APP_MAPBOX_USERID;
const MAPBOX_STYLEID = process.env.REACT_APP_MAPBOX_STYLEID;

function App() {
  const myRef = useRef();

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require( 'leaflet/dist/images/marker-icon-2x.png' ),
      iconUrl: require( 'leaflet/dist/images/marker-icon.png' ),
      shadowUrl: require( 'leaflet/dist/images/marker-shadow.png' ),
    });
  }, []);

  useEffect(() => {
    const { current = {} } = myRef;
    const { leafletElement: map } = current;

    if (!map) return;
    map.eachLayer((layer = {}) => {
      const { options: { name } } = layer;
      if ( name !== 'Mapbox' ) {
        map.removeLayer(layer);
      };
    });

    const geoJson = new L.GeoJSON(locations, {
      onEachFeature: (feature = {}, layer) => {
        console.log('feature', feature, 'layer', layer);
        const { properties = {} } = feature;
        const { name, delivery, tags, phone, website } = properties;
        const popup = new L.popup();

        const div = `
          <div class="restaurant-popup">
            <h3>${name}</h3>
            <ul>
              <li>
                ${tags.join(', ')}
              </li>
              <li>
                <strong>Delivery:</strong> ${delivery ? 'Yes' : 'No'}
              </li>
              <li>
                <strong>Phone:</strong> ${phone}
              </li>
              <li>
                <strong>Website:</strong> <a href="${website}">${website}</a>
              </li>
            </ul>
          </div>
        `;

        popup.setContent(div);

        layer.bindPopup(popup);
      },
    });
    geoJson.addTo(map);
  }, [myRef])

  return (
    <Map ref={myRef} center={[39.907132, 116.386546]} zoom={18}>
      <TileLayer 
        url={`https://api.mapbox.com/styles/v1/${MAPBOX_USERID}/${MAPBOX_STYLEID}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_API_KEY}`}
      />
    </Map>
  );
}

export default App;

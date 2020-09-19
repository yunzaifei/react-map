import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Map, TileLayer } from 'react-leaflet';
import './assets/stylesheets/App.css';
import 'leaflet/dist/leaflet.css';
import locations from './date/location.json';
import utensilsIcon from './assets/images/utensils-marker.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;
// const MAPBOX_USERID = process.env.REACT_APP_MAPBOX_USERID;
// const MAPBOX_STYLEID = process.env.REACT_APP_MAPBOX_STYLEID;

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
      pointToLayer: (feature = {}, latlng) => {
        return L.marker(latlng, {
          icon: new L.icon({
            iconUrl: utensilsIcon,
            iconSize: [26, 26],
            popupAnchor: [0, -15],
            shadowUrl: markerShadow,
            shadowAnchor: [13, 28]
          })
        })
      },
      onEachFeature: (feature = {}, layer) => {
        console.log('feature', feature, 'layer', layer);
        const { properties = {}, geometry = {} } = feature;
        const { name, delivery, deliveryRadius, tags, phone, address } = properties;
        const { coordinates } = geometry;

        let deliveryZoneCircle;
        if (deliveryRadius) {
          deliveryZoneCircle = L.circle(coordinates.reverse(), { radius: deliveryRadius });
        }

        const popup = new L.popup();

        const div = `
          <div class="restaurant-popup">
            <h3>${name}</h3>
            <ul>
              <li>
                <strong>外卖:</strong> ${delivery ? '是' : '否'}
              </li>
              <li>
                <strong>电话:</strong> ${phone}
              </li>
              <li>
                <strong>推荐菜：</strong> ${tags.join(', ')}
              </li>
              <li>
                <strong>地址:</strong> ${address}
              </li>
            </ul>
          </div>
        `;

        popup.setContent(div);

        layer.bindPopup(popup);

        layer.on('mouseover', () => {
          if (deliveryZoneCircle) {
            deliveryZoneCircle.addTo(map);
          }
        });
        layer.on('mouseout', () => {
          if (deliveryZoneCircle) {
            deliveryZoneCircle.removeFrom(map);
          }
        });
      },
    });
    geoJson.addTo(map);
  }, [myRef])

  return (
    <Map ref={myRef} center={[39.90331, 116.410077]} zoom={16}>
      <TileLayer 
        // url={`https://api.mapbox.com/styles/v1/${MAPBOX_USERID}/${MAPBOX_STYLEID}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_API_KEY}`}
        url={'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'}
        subdomains={['1', '2', '3', '4']}
      />
    </Map>
  );
}

export default App;

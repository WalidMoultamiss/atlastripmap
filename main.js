const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
let s = null;
if (!navigator.geolocation) {
  status.textContent = 'Geolocation is not supported by your device';
} else {
  let timeID;
  s = new WebSocket('wss://atlastripws.herokuapp.com?token=' + params.token);
  s.addEventListener('message', function ({ data }) {
    const dd = JSON.parse(data);
    if (!dd.success) {
      clearInterval(timeID);
      return s.close();
    }
    console.log(dd.users);
    const len = dd.users.length;
  });


  const opt = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
  }
  let marker = new mapboxgl.Marker({
    color: '#F84C4C'
  });
  mapboxgl.accessToken = 'pk.eyJ1IjoieXVzZnV1IiwiYSI6ImNrcXV0cDQ4MDA1NmcyeHA2dW93bzI1aW8ifQ.e09oaWi1aFqdsNdJbJAfjA';


  map = new mapboxgl.Map({
    container: 'map',
    zoom: 14,
    center: [-7.914576487196221, 31.060659351636488],
    pitch: 15,
    bearing: 80,
    style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y'
  });

  map.on('load', function () {

    map.addSource('mapbox-dem', {
      'type': 'raster-dem',
      'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
      'tileSize': 512,
      // 'maxzoom': 14
    });
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

    map.addLayer({
      'id': 'sky',
      'type': 'sky',
      'paint': {
        // 'sky-type': 'atmosphere',
        // 'sky-atmosphere-sun': [0.0, 0.0],
        // 'sky-atmosphere-sun-intensity': 15
      }
    });
    setTimeout(watch, 4000);
    timeID = setInterval(watch, 10000);
  });

  function watch() {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords;

      let json = {
        "geometry": {
          "type": "Point",
          "coordinates": [
            longitude,
            latitude
          ]
        },
        "type": "Feature",
        "properties": {

        }
      }

      map.flyTo({ center: json.geometry.coordinates, speed: 0.2, zoom: 18 });
      requestAnimationFrame(() => marker.setLngLat(json.geometry.coordinates).addTo(map));

      const geo = JSON.stringify({
        lan: latitude,
        lon: longitude,
      });


      s.send(geo);
    }, () => { }, opt);
  }
}
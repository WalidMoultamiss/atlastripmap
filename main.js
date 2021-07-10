if (!navigator.geolocation) {
  status.textContent = 'Geolocation is not supported by your device';
} else {
  const msg = {
    type: 'authenticate',
    payload: { token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MjU4NjA1MTcsImV4cCI6MTYyODQ5MDI2MywiZGQiOnsiZmlyc3RfbmFtZSI6ImNvc21vcyIsImxhc3RfbmFtZSI6Imhlcm1hbm8iLCJlbWFpbCI6InNhdm94eHl4QGJhbGluYS5jb20iLCJwaG9uZSI6NTU5MjUzNjIyNywiaWQiOiI4In19.RQD-Bs5hegZ4YOyFbNxZvKI8KLbZPwxLnB7V5kEk6z4' }
  };

  const s = new WebSocket('wss://atlastripws.herokuapp.com', [msg.payload.token]);
  s.addEventListener('message', function ({ data }) {
    console.log(JSON.parse(data).users);
    const len = JSON.parse(data).users.length;
  });

  const opt = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
  }
  let marker = new mapboxgl.Marker({
    color: '#F84C4C'
  });

  navigator.geolocation.getCurrentPosition(({ coords }) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoieXVzZnV1IiwiYSI6ImNrcXV0cDQ4MDA1NmcyeHA2dW93bzI1aW8ifQ.e09oaWi1aFqdsNdJbJAfjA';

    const { latitude, longitude } = coords;

    map = new mapboxgl.Map({
      container: 'map',
      zoom: 14,
      center: [longitude, latitude],
      pitch: 85,
      bearing: 80,
      style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y'
    });

    map.on('load', function () {

      map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });
      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });
      watch();
      setInterval(watch, 10000);
    });
  }, () => { }, opt);

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

      map.flyTo({ center: json.geometry.coordinates, speed: 0.3 });
      requestAnimationFrame(() => marker.setLngLat(json.geometry.coordinates).addTo(map));

      const geo = JSON.stringify({
        lan: latitude,
        lon: longitude,
      });


      s.send(geo);
    }, () => { }, opt);
  }
}
/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoidmVyY2NldHkiLCJhIjoiY2tsYWVqNzJrMTh5bjJ3bnA0c2xtdjUzYyJ9.aul1c-OgSHfdz77FyibkBw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/verccety/cklaeu6v71uf017pnqp63y4tl',
  scrollZoom: false,
});

// area that will be displayed
const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create a marker
  const el = document.createElement('div');
  el.className = 'marker';
  // Add a marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add a pop-up
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});

console.log("hello from the client side ");
const mapLocations = JSON.parse(
  document.getElementById("map").dataset.locations
);
// console.log(JSON.parse(locations));
mapboxgl.accessToken =
  "pk.eyJ1IjoiY2hoZXRyaSIsImEiOiJja2dvcHY2bmUwaW4yMnZtb3VuaDV0cWNpIn0.dT9quKMovetqUw-bEvsMeQ";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/chhetri/ckzedg7ji004615lpf20tn2jm",
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();
mapLocations.forEach((location) => {
  const el = document.createElement("div");
  el.className = "marker";

  // Marker
  new mapboxgl.Marker({
    element: el,
    anchor: "bottom",
  })
    .setLngLat(location.coordinates)
    .addTo(map);

  // popup
  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}:${location.description}</p>`)
    .addTo(map);
  bounds.extend(location.coordinates);
});
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});

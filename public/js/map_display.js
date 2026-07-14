const latlng = [coordinates[1], coordinates[0]];

const map = L.map("map").setView(latlng, 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

L.marker(latlng)
  .addTo(map)
  .bindPopup("Listing Location")
  .openPopup();

function goToListingLocation() {
  map.flyTo(latlng, 13); 
}

const locationButton = L.control({ position: "topleft" });

locationButton.onAdd = function () {
  const btn = L.DomUtil.create("button");
  
  btn.innerHTML = "📍";
  btn.title = "Go to listing location";
  btn.style.cssText =
    "background:white;border:2px solid gray;border-radius:8px;padding:8px;cursor:pointer;font-size:18px;";
  btn.onclick = goToListingLocation;
  return btn;
};
locationButton.addTo(map);

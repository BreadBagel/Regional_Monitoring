function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');

  // Initialize map only when map page is shown
  if (pageId === 'map' && !window.mapInitialized) {
    initMap();
    window.mapInitialized = true;
  }
}

function initMap() {
  // Create the map
  var map = L.map('mapContainer').setView([14.6, 121.0], 7);

  // Add base tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  var regionsLayer;
  var municipalitiesLayer;

  // Load regions
  fetch('http://localhost:3000/regions')
    .then(res => res.json())
    .then(data => {
      console.log("Regions data:", data);

      regionsLayer = L.geoJSON(data, {
        style: { color: '#0000ff', fillColor: '#0000ff', fillOpacity: 0.3 },
        onEachFeature: function (feature, layer) {
          layer.bindPopup("Region: " + feature.properties.adm2_en);

          layer.on('click', function () {
            if (municipalitiesLayer) map.removeLayer(municipalitiesLayer);

            map.flyToBounds(layer.getBounds(), { duration: 0.4 });

            fetch(`http://localhost:3000/municipalities/${feature.properties.adm1_psgc}`)
              .then(res => res.json())
              .then(muns => {
                console.log("Municipalities data:", muns);

                municipalitiesLayer = L.geoJSON(muns, {
                  style: { color: '#ffff00', fillColor: '#ffff00', fillOpacity: 0.4 },
                  onEachFeature: function (mFeature, mLayer) {
                    mLayer.bindPopup("Municipality: " + mFeature.properties.adm3_en);

                    mLayer.on('click', function () {
                      map.flyToBounds(mLayer.getBounds(), { duration: 0.4 });
                    });
                  }
                }).addTo(map);
              });
          });
        }
      }).addTo(map);

      // Fit map to all regions once loaded
      if (regionsLayer.getBounds().isValid()) {
        map.fitBounds(regionsLayer.getBounds());
      }

      // Force Leaflet to redraw now that container is visible
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    });
}

const POI_VISIT_RADIUS_METERS = 50;

const MapSystem = {
    map: null,
    markers: {},
    userMarker: null,

    init() {
        // Init Leaflet map (default centered on Paris, will update with GPS)
        this.map = L.map('map').setView([48.8566, 2.3522], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        this.startGeolocation();
    },

    addPOIMarker(poi, isVisited) {
        // Red if visited, Blue if not
        const color = isVisited ? 'var(--success-color)' : 'var(--primary-color)';

        const iconHtml = `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`;

        const icon = L.divIcon({
            className: 'poi-icon',
            html: iconHtml,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });

        const marker = L.marker([poi.lat, poi.lng], { icon }).addTo(this.map);

        const urlWithId = poi.url.includes('?') ? poi.url + '&id=' + encodeURIComponent(poi.id) : poi.url + '?id=' + encodeURIComponent(poi.id);

        let linkHtml = '';
        if (isVisited) {
            linkHtml = `<a href="${urlWithId}" style="display:inline-block; padding:8px 16px; background:var(--primary-color); color:white; text-decoration:none; border-radius:4px;">Visit</a>`;
        } else {
            linkHtml = `<span style="color: grey; font-size: 0.9em;">Get closer (${POI_VISIT_RADIUS_METERS}m) to unlock!</span>`;
        }

        // Bind popup with link to static POI page
        marker.bindPopup(`
            <div style="text-align: center;">
                <b>${poi.name}</b><br><br>
                ${linkHtml}
            </div>
        `);

        this.markers[poi.id] = marker;
    },

    updatePOIMarker(poi, isVisited) {
        const marker = this.markers[poi.id];
        if (marker) {
            const color = isVisited ? 'var(--success-color)' : 'var(--primary-color)';
            const iconHtml = `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`;
            const icon = L.divIcon({
                className: 'poi-icon',
                html: iconHtml,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });
            marker.setIcon(icon);

            const urlWithId = poi.url.includes('?') ? poi.url + '&id=' + encodeURIComponent(poi.id) : poi.url + '?id=' + encodeURIComponent(poi.id);

            let linkHtml = '';
            if (isVisited) {
                linkHtml = `<a href="${urlWithId}" style="display:inline-block; padding:8px 16px; background:var(--primary-color); color:white; text-decoration:none; border-radius:4px;">Visit</a>`;
            } else {
                linkHtml = `<span style="color: grey; font-size: 0.9em;">Get closer (${POI_VISIT_RADIUS_METERS}m) to unlock!</span>`;
            }

            marker.setPopupContent(`
                <div style="text-align: center;">
                    <b>${poi.name}</b><br><br>
                    ${linkHtml}
                </div>
            `);
        }
    },

    startGeolocation() {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by your browser");
            return;
        }

        // Watch user's position in real-time
        navigator.geolocation.watchPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            if (!this.userMarker) {
                // Create user marker as a semi-transparent circle on first fix
                this.userMarker = L.circle([lat, lng], {
                    color: '#ef4444',       // Border color
                    fillColor: '#ef4444',   // Fill color
                    fillOpacity: 0.2,       // Semi-transparent
                    weight: 2,
                    radius: POI_VISIT_RADIUS_METERS
                }).addTo(this.map);

                // Recenter map on user location initially
                this.map.setView([lat, lng], 14);
            } else {
                // Update position and radius
                this.userMarker.setLatLng([lat, lng]);
                this.userMarker.setRadius(POI_VISIT_RADIUS_METERS);
            }

            // Check distances to unvisited POIs
            if (typeof App !== 'undefined' && App.allPOIs) {
                App.allPOIs.forEach(poi => {
                    if (!App.visitedPOIs.includes(poi.id)) {
                        const distance = this.map.distance([lat, lng], [poi.lat, poi.lng]);
                        if (distance <= POI_VISIT_RADIUS_METERS) {
                            App.markAsVisited(poi.id);
                        }
                    }
                });
            }
        }, (error) => {
            console.error("Geolocation error:", error.message);
        }, {
            enableHighAccuracy: true,   // Important for tracking
            maximumAge: 10000,
            timeout: 5000
        });
    }
};

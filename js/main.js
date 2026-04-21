const App = {
    visitedPOIs: [],
    allPOIs: [],

    async init() {
        this.loadState();
        MapSystem.init();
        await this.loadPOIs();
    },

    // Read progression from localStorage
    loadState() {
        try {
            const state = localStorage.getItem('visitedPOIs');
            if (state) {
                this.visitedPOIs = JSON.parse(state);
            }
        } catch (e) {
            console.error("Local storage error:", e);
        }
    },

    // Fetch POIs and render markers based on state
    async loadPOIs() {
        try {
            const response = await fetch('data/pois.json');
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            this.allPOIs = data;
            
            data.forEach(poi => {
                const isVisited = this.visitedPOIs.includes(poi.id);
                MapSystem.addPOIMarker(poi, isVisited);
            });
        } catch (error) {
            console.error("Failed to load POIs:", error);
        }
    },

    markAsVisited(poiId) {
        if (!this.visitedPOIs.includes(poiId)) {
            this.visitedPOIs.push(poiId);
            localStorage.setItem('visitedPOIs', JSON.stringify(this.visitedPOIs));
            
            const poi = this.allPOIs.find(p => p.id === poiId);
            if (poi) {
                MapSystem.updatePOIMarker(poi, true);
                // Optional: alert or toast the user
                // alert(`You reached ${poi.name}!`);
            }
        }
    }
};

// Initialize after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

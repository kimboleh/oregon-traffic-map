import Map from "https://js.arcgis.com/4.30/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.30/@arcgis/core/views/MapView.js";
import FeatureLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/FeatureLayer.js";
import Graphic from "https://js.arcgis.com/4.30/@arcgis/core/Graphic.js";
import GraphicsLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/GraphicsLayer.js";

const map = new Map({
    basemap: "streets-navigation-vector"
});

// Current default map view starts around Bend, OR
const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-120.5, 43.8],
    zoom: 7
});

// Fetch incidents from the C# API endpoint
const response = await fetch("/api/incidents");
const incidents = await response.json();

// Create a graphics layer to hold incident points
const graphicsLayer = new GraphicsLayer();
map.add(graphicsLayer);

incidents.forEach(incident => {
    if (incident.longitude && incident.latitude) {
        const point = {
            type: "point",
            longitude: incident.longitude,
            latitude: incident.latitude
        };

        const symbol = {
            type: "simple-marker",
            color: severityColor(incident.severity),
            size: 10,
            outline: { color: "white", width: 1 }
        };

        const popupTemplate = {
            title: incident.eventType ?? "Traffic Incident",
            content: `
                <b>Category:</b> ${incident.category ?? "Unknown"}<br/>
                <b>Severity:</b> ${incident.severity ?? "Unknown"}<br/>
                <b>Route:</b> ${incident.route ?? "Unknown"}<br/>
                <b>Milepost:</b> ${incident.milepost ?? "Unknown"}<br/>
                <b>Location:</b> ${incident.locationName ?? "Unknown"}<br/>
                <b>Last Updated:</b> ${incident.lastUpdated ? new Date(incident.lastUpdated).toLocaleString() : "Unknown"}<br/>
                <b>Comments:</b> ${incident.comments ?? "None"}
            `
        };

        const graphic = new Graphic({
            geometry: point,
            symbol: symbol,
            popupTemplate: popupTemplate
        });

        graphicsLayer.add(graphic);
    }
});

// Color-code points by severity
function severityColor(severity) {
    if (!severity) return [128, 128, 128];
    const s = severity.toLowerCase();
    if (s.includes("closure")) return [180, 0, 0];
    if (s.includes("major") || s.includes("2 hr")) return [220, 80, 0];
    if (s.includes("minor") || s.includes("20 min")) return [230, 180, 0];
    return [0, 130, 80];
}
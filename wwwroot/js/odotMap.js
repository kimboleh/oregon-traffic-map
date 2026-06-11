import Map from "https://js.arcgis.com/4.30/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.30/@arcgis/core/views/MapView.js";
import FeatureLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/FeatureLayer.js";
import Graphic from "https://js.arcgis.com/4.30/@arcgis/core/Graphic.js";
import GraphicsLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/GraphicsLayer.js";

import { incidentTitle } from './incidentUtils.js';
import { getActiveTypes, initFilters, shouldShowIncident } from './incidentFilter.js';

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

// Fetch incidents from the API endpoint
const response = await fetch("/api/incidents");
const data = await response.json();
const allIncidents = data.incidents;
const cachedAt = new Date(data.cachedAt);
const count = data.count;

// Display "last updated" info on the page
document.getElementById("cache-info").textContent = 
    `${count} active incidents · Last updated ${cachedAt.toLocaleTimeString()}`;

// Create a graphics layer to hold incident points
const graphicsLayer = new GraphicsLayer();
map.add(graphicsLayer);

// Initialize filters, passing renderIncidents as the callback
initFilters(allIncidents, renderIncidents);

// Initial render
renderIncidents();

// Triggers a render of all incidents of active/displayed types
function renderIncidents() {
    const activeTypes = getActiveTypes();
    graphicsLayer.removeAll();

    allIncidents
        .filter(i => activeTypes.has(i.eventTypeId))
        .forEach(incident => {
            if (incident.longitude && incident.latitude) {
                const point = {
                    type: "point",
                    longitude: incident.longitude,
                    latitude: incident.latitude
                };

                const symbol = eventSymbol(incident.eventTypeId, incident.severity);

                const popupTemplate = {
                    title: incidentTitle(incident.eventTypeId),
                    content: `
                        <b>Headline:</b> ${incident.headline ?? "Unknown"}<br/>
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
}

// Returns the appropriate symbol to use for the incident
function eventSymbol(eventTypeId, severity) {
    var symbol = {};
    var color = severityColor(severity);

    // road work
    if (eventTypeId === "RW") symbol = {
        type: "picture-marker",
        url: "/img/icons/roadwork-" + (severityColor(severity) === 'red' ? 'red' : 
        'orange') + ".svg",
        width: "24px",
        height: "24px"
    };
    // obstruction
    else if (eventTypeId === "OB") symbol = {
        type: "picture-marker",
        url: "/img/icons/caution-" + (severityColor(severity) === 'red' ? 'red' : 
        'orange') + ".svg",
        width: "24px",
        height: "20px"
    };
    // device maintenance
    else if (eventTypeId === "DV") symbol = {
        type: "picture-marker",
        url: "/img/icons/device-maintenance.svg",
        width: "24px",
        height: "24px"
    };
    // vehicle accident
    else if (eventTypeId === "VH") symbol = {
        type: "picture-marker",
        url: "/img/icons/accident-" + severityColor(severity) + ".svg",
        width: "24px",
        height: "24px"
    };
    // closure
    else if (eventTypeId === "MS") symbol = {
        type: "picture-marker",
        url: "/img/icons/closure.svg",
        width: "20px",
        height: "20px"
    };
    // wildfire
    else if (eventTypeId === "DS") symbol = {
        type: "picture-marker",
        url: "/img/icons/wildfire.svg",
        width: "24px",
        height: "24px"
    };
    // default
    else symbol = {
        type: "simple-marker",
        color: severityColor(severity),
        size: 10,
        outline: { color: "white", width: 1 }
    };

    return symbol;
}

// Color-code points by severity
function severityColor(severity) {
    var sevColor = "green"; // default severity is minor
    const s = severity.toLowerCase();
    if (s.includes("minor") || 
        s.includes("20 min") || 
        s.includes("miminum delay"))
            sevColor= "green";
    else if (s.includes("major") || 
            s.includes("2 hr"))
                sevColor = "yellow";
    else if (s.includes("closure")) sevColor = "red";
    
    return sevColor;
}
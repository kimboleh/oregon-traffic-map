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

// Fetch incidents from the API endpoint
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

// Returns the appropriate symbol to use for the incident
function eventSymbol(eventTypeId, severity) {
    var symbol = {};

    if (eventTypeId === "RW") symbol = {
        type: "picture-marker",
        url: "/img/icons/roadwork.svg",
        width: "24px",
        height: "24px"
    };
    // TODO: implement other icons!
    // else if (eventTypeId === "OB") symbol = symbol;
    // else if (eventTypeId === "DV") symbol = symbol;
    // else if (eventTypeId === "VH") symbol = symbol;
    // else if (eventTypeId === "MS") symbol = symbol;
    // else if (eventTypeId === "DS") symbol = symbol;
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
    var sevColor = [0, 130, 80];
    const s = severity.toLowerCase();
    if (s.includes("minor") || 
        s.includes("20 min") || 
        s.includes("miminum delay")) 
            sevColor = [230, 180, 0]; // green
    else if (s.includes("major") || 
            s.includes("2 hr")) 
                sevColor = [220, 80, 0]; // yellow
    else if (s.includes("closure")) sevColor = [180, 0, 0]; // red
    
    return sevColor;
}

function incidentTitle(eventTypeId) {
    var popupHeadline = "";
    if (!eventTypeId) popupHeadline = "Misc. Incident";
    else if (eventTypeId === "RW") popupHeadline = "Road Work";
    else if (eventTypeId === "OB") popupHeadline = "Obstruction";
    else if (eventTypeId === "DV") popupHeadline = "Device Maintanence";
    else if (eventTypeId === "VH") popupHeadline = "Vehicle Crash";
    else if (eventTypeId === "MS") popupHeadline = "Closure";
    else if (eventTypeId === "DS") popupHeadline = "Wildfire";

    return popupHeadline;
}
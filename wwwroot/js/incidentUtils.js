export function incidentTitle(eventTypeId) {
    switch(eventTypeId) {
        case "RW": return "Road Work";
        case "OB": return "Obstruction";
        case "DV": return "Device Maintenance";
        case "VH": return "Vehicle Crash";
        case "MS": return "Closure";
        case "DS": return "Wildfire";
        default: return "Misc. Incident";
    }
}
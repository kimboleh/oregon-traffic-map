import { incidentTitle } from './incidentUtils.js';

/**
 * Dynamically populates the sidebar containing the incident type toggles
 * to display each type of incident currently active, allowing the user to
 * toggle which types of incidents they see on the map.
 */

const activeTypes = new Set();

export function initFilters(incidents, onFilterChange) {
    /// Get unique event types from current data
    const types = [...new Set(incidents.map(i => i.eventTypeId))];
    
    // Add all types to active set initially (everything shown by default)
    types.forEach(type => activeTypes.add(type));
    
    // Build sidebar HTML
    const sidebar = document.getElementById("filter-sidebar");

    // Add each type as a toggleable checkbox to the sidebar
    types.forEach(type => {
        const label = incidentTitle(type);
        const div = document.createElement("div");
        div.className = "form-check";
        div.innerHTML = `
            <input class="form-check-input incident-filter"
                   type="checkbox"
                   value="${type}"
                   id="filter-${type}"
                   checked />
            <label class="form-check-label" for="filter-${type}">
                ${label}
            </label>
        `;
        sidebar.appendChild(div);
    });
    
    // Listen for checkbox changes to re-render the GraphicLayer
    document.querySelectorAll(".incident-filter").forEach(checkbox => {
        checkbox.addEventListener("change", (e) => {
            if (e.target.checked) {
                activeTypes.add(e.target.value);
            } else {
                activeTypes.delete(e.target.value);
            }
            onFilterChange();
        });
    });
}

export function shouldShowIncident(incident) {
    return activeTypes.has(incident.eventTypeId);
}

export function getActiveTypes() {
    return activeTypes;
}
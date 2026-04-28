// Initialize map centered on France
const map = L.map('map').setView([46.2, 2.2], 6);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// Status color mapping
const statusColors = {
    'Completed': '#10b981',
    'Ongoing': '#3b82f6',
    'Planned': '#f59e0b'
};

// Add markers for each region
function initializeMarkers() {
    frenchWineRegions.forEach(region => {
        const color = statusColors[region.program_status] || '#6b7280';
        
        // Create circle marker
        const marker = L.circleMarker([region.coordinates.latitude, region.coordinates.longitude], {
            radius: 14,
            fillColor: color,
            color: '#fff',
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.85
        }).addTo(map);
        
        // Add click event to show sidebar
        marker.on('click', function() {
            displayRegionData(region);
        });
        
        // Add label
        L.tooltip({
            permanent: true,
            direction: 'top',
            className: 'region-label',
            offset: [0, -15]
        })
        .setContent(region.name)
        .setLatLng([region.coordinates.latitude, region.coordinates.longitude])
        .addTo(map);
    });
}

// Display region data in sidebar
function displayRegionData(region) {
    const sidebar = document.getElementById('sidebar');
    const sidebarTitle = document.getElementById('sidebarTitle');
    const sidebarContent = document.getElementById('sidebarContent');
    
    // Set title
    sidebarTitle.textContent = region.name;
    
    // Format funding
    const fundingFormatted = '€' + (region.funding_allocated / 1000).toFixed(0) + 'k';
    
    // Build HTML content
    let html = `
        <div class=\"data-section\">\n            <h3>Program Status</h3>\n            <div class=\"data-item\">\n                <div class=\"data-label\">Current Status</div>\n                <div class=\"data-value\" style=\"color: ${statusColors[region.program_status]}\">${region.program_status}</div>\n            </div>\n            <div class=\"data-item\">\n                <div class=\"data-label\">Started</div>\n                <div class=\"data-value\">${region.year_started}</div>\n            </div>\n            <div class=\"data-item\">\n                <div class=\"data-label\">Expected Completion</div>\n                <div class=\"data-value\">${region.expected_completion}</div>\n            </div>\n        </div>\n        \n        <div class=\"data-section\">\n            <h3>Vineyard Information</h3>\n            <div class=\"data-item\">\n                <div class=\"data-label\">Hectares Uprooted</div>\n                <div class=\"data-value\">${region.hectares_uprooted} ha</div>\n            </div>\n            <div class=\"data-item\">\n                <div class=\"data-label\">Producers Involved</div>\n                <div class=\"data-value\">${region.producer_count}</div>\n            </div>\n            <div class=\"data-item\">\n                <div class=\"data-label\">Grape Varieties</div>\n                <div class=\"data-value\">${region.grape_varieties.join(', ')}</div>\n            </div>\n        </div>\n        \n        <div class=\"data-section\">\n            <h3>Funding</h3>\n            <div class=\"data-item\">\n                <div class=\"data-label\">Total Allocated</div>\n                <div class=\"data-value\">${fundingFormatted}</div>\n            </div>\n        </div>\n        \n        <div class=\"data-section\">\n            <h3>Notes</h3>\n            <div class=\"data-item\">\n                <div class=\"data-value\" style=\"font-size: 0.95rem; line-height: 1.5; color: #555;\">${region.notes}</div>\n            </div>\n        </div>\n    `;
    
    sidebarContent.innerHTML = html;
    sidebar.classList.add('active');
}

// Close sidebar button
document.getElementById('closeBtn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.remove('active');
});

// Add legend
function addLegend() {
    const legend = L.control({position: 'bottomleft'});
    
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = '#fff';
        div.style.padding = '12px 16px';
        div.style.borderRadius = '4px';
        div.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
        div.style.fontSize = '13px';
        div.style.lineHeight = '1.8';
        div.style.fontWeight = '500';
        
        let html = '<strong style=\"display: block; margin-bottom: 8px; color: #1a1a1a;\">Program Status</strong>';
        
        Object.entries(statusColors).forEach(([status, color]) => {
            html += `<div style=\"margin-bottom: 4px;\"><i style=\"background: ${color}; width: 11px; height: 11px; border-radius: 50%; display: inline-block; margin-right: 8px;\"></i>${status}</div>`;
        });
        
        div.innerHTML = html;
        return div;
    };
    
    legend.addTo(map);
}

// Initialize on page load
window.addEventListener('load', function() {
    initializeMarkers();
    addLegend();
};
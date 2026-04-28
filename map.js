// Initialize map centered on France
const map = L.map('map').setView([46.2, 2.2], 6);
 
// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);
 
// Phase color mapping
const phaseColors = {
    'Phase 1 (2023) + Phase 2 (2024)': '#10b981',
    'Phase 2 (2024)': '#3b82f6',
    'Phase 2 (2024) — Limited Eligibility': '#f59e0b'
};
 
// Add markers for each region
function initializeMarkers() {
    franceData.regions.forEach(region => {
        const color = phaseColors[region.programPhase] || '#6b7280';
 
        // Create circle marker
        const marker = L.circleMarker(
            [region.coordinates.latitude, region.coordinates.longitude],
            {
                radius: 14,
                fillColor: color,
                color: '#fff',
                weight: 2.5,
                opacity: 1,
                fillOpacity: 0.85
            }
        ).addTo(map);
 
        // Add click event to show sidebar
        marker.on('click', function () {
            displayRegionData(region);
        });
 
        // Add label tooltip
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
 
    sidebarTitle.textContent = region.name;
 
    const html = `
        <div class="data-section">
            <h3>Program Info</h3>
            <div class="data-item">
                <div class="data-label">Phase</div>
                <div class="data-value">${region.programPhase}</div>
            </div>
            <div class="data-item">
                <div class="data-label">Admin Region</div>
                <div class="data-value">${region.adminRegion}</div>
            </div>
            <div class="data-item">
                <div class="data-label">Earliest Replant Date</div>
                <div class="data-value">${region.earliestReplantDate}</div>
            </div>
            <div class="data-item">
                <div class="data-label">Dominant Wine Type</div>
                <div class="data-value">${region.dominantWineType}</div>
            </div>
        </div>
 
        <div class="data-section">
            <h3>Vineyard Data</h3>
            <div class="data-item">
                <div class="data-label">Hectares Applied</div>
                <div class="data-value">${region.hectaresApplied.toLocaleString()} ha</div>
            </div>
            <div class="data-item">
                <div class="data-label">Permanent Removal</div>
                <div class="data-value">${region.hectaresPermanent.toLocaleString()} ha</div>
            </div>
            <div class="data-item">
                <div class="data-label">Partial Removal</div>
                <div class="data-value">${region.hectaresPartial.toLocaleString()} ha</div>
            </div>
            <div class="data-item">
                <div class="data-label">Growers Applied</div>
                <div class="data-value">${region.growersApplied.toLocaleString()}</div>
            </div>
            <div class="data-item">
                <div class="data-label">Full-Exit Growers</div>
                <div class="data-value">${region.fullExitGrowers.toLocaleString()}</div>
            </div>
            <div class="data-item">
                <div class="data-label">Key Appellations</div>
                <div class="data-value">${region.keyAppellations}</div>
            </div>
        </div>
 
        <div class="data-section">
            <h3>Compensation</h3>
            <div class="data-item">
                <div class="data-label">Rate per Hectare</div>
                <div class="data-value">€${region.compensationRate.toLocaleString()}</div>
            </div>
            <div class="data-item">
                <div class="data-label">Estimated Total</div>
                <div class="data-value">€${region.estimatedCompensation}M</div>
            </div>
        </div>
 
        <div class="data-section">
            <h3>Notes</h3>
            <p class="notes-text">${region.notes}</p>
        </div>
    `;
 
    sidebarContent.innerHTML = html;
    sidebar.classList.add('active');
}
 
// Close sidebar button
document.getElementById('closeBtn').addEventListener('click', function () {
    document.getElementById('sidebar').classList.remove('active');
});
 
// Add legend
function addLegend() {
    const legend = L.control({ position: 'bottomleft' });
 
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = '#fff';
        div.style.padding = '12px 16px';
        div.style.borderRadius = '4px';
        div.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
        div.style.fontSize = '13px';
        div.style.lineHeight = '1.8';
        div.style.fontWeight = '500';
 
        let html = '<strong style="display:block;margin-bottom:8px;color:#1a1a1a;">Program Phase</strong>';
 
        Object.entries(phaseColors).forEach(([phase, color]) => {
            html += `<div style="margin-bottom:4px;">
                <i style="background:${color};width:11px;height:11px;border-radius:50%;display:inline-block;margin-right:8px;"></i>
                ${phase}
            </div>`;
        });
 
        div.innerHTML = html;
        return div;
    };
 
    legend.addTo(map);
}
 
// Initialize on page load
window.addEventListener('load', function () {
    initializeMarkers();
    addLegend();
});

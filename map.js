// Initialize map centered on France
const map = L.map('map', {
    zoomControl: true
}).setView([46.2, 2.2], 6);
 
// ── Basemap ──────────────────────────────────────────────────────────────────
// CartoDB Positron (no labels variant) — white/light-grey, no roads,
// no terrain texture, no satellite, no country outlines drawn in the sea.
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);
 
// ── Phase → color (Pantone palette) ─────────────────────────────────────────
const phaseColors = {
    'Phase 1 (2023) + Phase 2 (2024)': '#BF1722',   // Pantone True Red
    'Phase 2 (2024)':                  '#00239C',   // Pantone Dark Blue C
    'Phase 2 (2024) — Limited Eligibility': '#3B2E8D' // Pantone 276C
};
 
// ── Markers ──────────────────────────────────────────────────────────────────
function initializeMarkers() {
    franceData.regions.forEach(region => {
        const color = phaseColors[region.programPhase] || '#555555';
 
        const marker = L.circleMarker(
            [region.coordinates.latitude, region.coordinates.longitude],
            {
                radius: 14,
                fillColor: color,
                color: '#FFFFFF',
                weight: 2.5,
                opacity: 1,
                fillOpacity: 0.9
            }
        ).addTo(map);
 
        marker.on('click', function () {
            displayRegionData(region);
        });
 
        // Region name label
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
 
// ── Sidebar ───────────────────────────────────────────────────────────────────
function displayRegionData(region) {
    const sidebar        = document.getElementById('sidebar');
    const sidebarTitle   = document.getElementById('sidebarTitle');
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
 
// Close sidebar
document.getElementById('closeBtn').addEventListener('click', function () {
    document.getElementById('sidebar').classList.remove('active');
});
 
// ── Legend ────────────────────────────────────────────────────────────────────
function addLegend() {
    const legend = L.control({ position: 'bottomleft' });
 
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = [
            'background:#ffffff',
            'padding:12px 16px',
            'border-radius:4px',
            'box-shadow:0 2px 8px rgba(0,35,156,0.15)',
            'font-size:12px',
            'line-height:1.9',
            'font-family:Arial,Helvetica,sans-serif',
            'font-style:normal',
            'border-top:3px solid #BF1722'
        ].join(';');
 
        let html = '<strong style="display:block;margin-bottom:8px;color:#00239C;font-family:Arial,Helvetica,sans-serif;font-style:normal;letter-spacing:0.05em;text-transform:uppercase;font-size:11px;">Program Phase</strong>';
 
        Object.entries(phaseColors).forEach(([phase, color]) => {
            html += `
                <div style="margin-bottom:4px;display:flex;align-items:center;gap:8px;font-style:normal;">
                    <span style="background:${color};width:12px;height:12px;border-radius:50%;display:inline-block;flex-shrink:0;"></span>
                    <span style="color:#1a1a2e;font-style:normal;">${phase}</span>
                </div>`;
        });
 
        div.innerHTML = html;
        return div;
    };
 
    legend.addTo(map);
}
 
// ── Init ──────────────────────────────────────────────────────────────────────
window.addEventListener('load', function () {
    initializeMarkers();
    addLegend();
});

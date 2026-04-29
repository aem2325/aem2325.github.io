// Initialize map centered on France
const map = L.map('map', { zoomControl: true }).setView([44.5, 1.8], 7);

// Paint the Leaflet map background (ocean/water areas) deep dark navy
map.getContainer().style.background = '#0a1628';

// ── Basemap ───────────────────────────────────────────────────────────────────
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// ── Phase colors ──────────────────────────────────────────────────────────────
const phaseColors = {
    'Phase 1 (2023) + Phase 2 (2024)':      '#4a4a4a',  // Dark grey
    'Phase 2 (2024)':                        '#ACE1AF',  // Celadon
    'Phase 2 (2024) — Limited Eligibility': '#00A693'   // Persian green
};

// ── Grape pill colors ─────────────────────────────────────────────────────────
const grapeColors = {
    red:   { bg: '#BF1722', text: '#ffffff', border: '#8a1018' },
    white: { bg: '#F6D500', text: '#1a1a1a', border: '#bba800' }
};

// ── Grape pill HTML builder ───────────────────────────────────────────────────
function buildGrapePills(grapes) {
    return grapes.map(function(g) {
        var c = grapeColors[g.type];
        return '<span class="grape-pill" style="background:' + c.bg + ';color:' + c.text + ';border:1px solid ' + c.border + ';" title="' + g.notes + '">' + g.name + '</span>';
    }).join('');
}

// ── Hover tooltip HTML ────────────────────────────────────────────────────────
function buildTooltipHTML(region) {
    var pills = region.grapes ? buildGrapePills(region.grapes) : '';
    var grapesBlock = pills ? '<div class="ht-grapes">' + pills + '</div>' : '';
    return '<div class="hover-tooltip">' +
        '<div class="ht-title">' + region.name + '</div>' +
        '<div class="ht-row"><span class="ht-label">Permanent removal</span><span class="ht-value">' + region.hectaresPermanent.toLocaleString() + ' ha</span></div>' +
        '<div class="ht-row"><span class="ht-label">Partial removal</span><span class="ht-value">' + region.hectaresPartial.toLocaleString() + ' ha</span></div>' +
        grapesBlock +
        '</div>';
}

// ── Phase 3 bar HTML ──────────────────────────────────────────────────────────
function buildPhase3Bar(pct) {
    if (pct == null) return '';
    return '<div class="phase3-bar-wrap">' +
        '<div class="phase3-bar-label">' +
            '<span class="phase3-bar-title">Share of Phase 3 Applications</span>' +
            '<span class="phase3-bar-pct">' + pct + '%</span>' +
        '</div>' +
        '<div class="phase3-bar-track">' +
            '<div class="phase3-bar-fill" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<div class="phase3-bar-axis">' +
            '<span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>' +
        '</div>' +
    '</div>';
}

// ── AOC boundary layers ───────────────────────────────────────────────────────
var aocLayersByRegionId = {};
var activeAocLayers = [];

var AOC_DEFAULT_STYLE = {
    color: '#7BBFEA', weight: 1.8, opacity: 0.85,
    fillColor: 'transparent', fillOpacity: 0, dashArray: '4 3'
};
var AOC_SELECTED_STYLE = {
    color: '#7BBFEA', weight: 2.2, opacity: 1,
    fillColor: '#7BBFEA', fillOpacity: 0.15, dashArray: '4 3'
};

var regionToAocId = {
    'gironde':        ['bordeaux'],
    'charente':       ['cognac'],
    'aude':           ['languedoc', 'corbieres'],
    'herault':        ['languedoc'],
    'gard':           ['languedoc'],
    'pyr-orientales': ['roussillon'],
    'vaucluse':       ['rhone-vaucluse'],
    'drome':          ['crozeshermitage'],
    'tarn':           ['gaillac'],
    'gers':           ['armagnac'],
    'lot-et-garonne': ['buzet']
};

function loadAOCBoundaries() {
    fetch('wine_regions.geojson')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            L.geoJSON(data, {
                style: AOC_DEFAULT_STYLE,
                onEachFeature: function(feature, layer) {
                    aocLayersByRegionId[feature.properties.id] = layer;
                    var center = layer.getBounds().getCenter();
                    L.marker(center, {
                        icon: L.divIcon({
                            className: 'aoc-label',
                            html: '<span>' + feature.properties.name + '</span>',
                            iconSize: [160, 20],
                            iconAnchor: [80, 10]
                        }),
                        interactive: false,
                        zIndexOffset: -1000
                    }).addTo(map);
                }
            }).addTo(map);

            map.eachLayer(function(l) {
                if (l instanceof L.CircleMarker) l.bringToFront();
            });
        })
        .catch(function(err) { console.warn('AOC GeoJSON failed to load:', err); });
}

function highlightAocForRegion(regionId) {
    activeAocLayers.forEach(function(l) { l.setStyle(AOC_DEFAULT_STYLE); });
    var ids = regionToAocId[regionId] || [];
    activeAocLayers = ids.map(function(id) { return aocLayersByRegionId[id]; }).filter(Boolean);
    activeAocLayers.forEach(function(l) { l.setStyle(AOC_SELECTED_STYLE); });
}

// ── Markers ───────────────────────────────────────────────────────────────────
function initializeMarkers() {
    franceData.regions.forEach(function(region) {
        var color = phaseColors[region.programPhase] || '#555555';

        var marker = L.circleMarker(
            [region.coordinates.latitude, region.coordinates.longitude],
            { radius: 14, fillColor: color, color: '#FFFFFF', weight: 2.5, opacity: 1, fillOpacity: 0.9 }
        ).addTo(map);

        marker.on('click', function() {
            displayRegionData(region);
            highlightAocForRegion(region.id);
        });

        marker.bindTooltip(buildTooltipHTML(region), {
            direction: 'top', permanent: false, opacity: 1,
            className: 'hover-tooltip-wrapper', offset: [0, -18]
        });

        L.tooltip({ permanent: true, direction: 'top', className: 'region-label', offset: [0, -15] })
            .setContent(region.name)
            .setLatLng([region.coordinates.latitude, region.coordinates.longitude])
            .addTo(map);
    });
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function displayRegionData(region) {
    var sidebar        = document.getElementById('sidebar');
    var sidebarTitle   = document.getElementById('sidebarTitle');
    var sidebarContent = document.getElementById('sidebarContent');

    sidebarTitle.textContent = region.name;

    var grapePillsHTML = region.grapes
        ? '<div class="grape-pills-container">' + buildGrapePills(region.grapes) + '</div>'
        : '';

    var grapeDetailsHTML = region.grapes ? region.grapes.map(function(g) {
        var c = grapeColors[g.type];
        return '<div class="grape-detail-row">' +
            '<span class="grape-pill grape-pill-sm" style="background:' + c.bg + ';color:' + c.text + ';border:1px solid ' + c.border + ';">' + g.name + '</span>' +
            '<span class="grape-detail-note">' + g.notes + '</span>' +
        '</div>';
    }).join('') : '';

    var html =
        '<div class="data-section">' +
            '<h3>Program Info</h3>' +
            '<div class="data-item"><div class="data-label">Phase</div><div class="data-value">' + region.programPhase + '</div></div>' +
            '<div class="data-item"><div class="data-label">Admin Region</div><div class="data-value">' + region.adminRegion + '</div></div>' +
            '<div class="data-item"><div class="data-label">Earliest Replant Date</div><div class="data-value">' + region.earliestReplantDate + '</div></div>' +
            '<div class="data-item"><div class="data-label">Dominant Wine Type</div><div class="data-value">' + region.dominantWineType + '</div></div>' +
        '</div>' +

        '<div class="data-section">' +
            '<h3>Vineyard Data</h3>' +
            '<div class="data-item"><div class="data-label">Hectares Applied</div><div class="data-value">' + region.hectaresApplied.toLocaleString() + ' ha</div></div>' +
            '<div class="data-item"><div class="data-label">Permanent Removal</div><div class="data-value">' + region.hectaresPermanent.toLocaleString() + ' ha</div></div>' +
            '<div class="data-item"><div class="data-label">Partial Removal</div><div class="data-value">' + region.hectaresPartial.toLocaleString() + ' ha</div></div>' +
            '<div class="data-item"><div class="data-label">Growers Applied</div><div class="data-value">' + region.growersApplied.toLocaleString() + '</div></div>' +
            '<div class="data-item"><div class="data-label">Full-Exit Growers</div><div class="data-value">' + region.fullExitGrowers.toLocaleString() + '</div></div>' +
            '<div class="data-item"><div class="data-label">Key Appellations</div><div class="data-value">' + region.keyAppellations + '</div></div>' +
        '</div>' +

        '<div class="data-section">' +
            '<h3>Compensation</h3>' +
            '<div class="data-item"><div class="data-label">Rate per Hectare</div><div class="data-value">&#8364;' + region.compensationRate.toLocaleString() + '</div></div>' +
            '<div class="data-item"><div class="data-label">Estimated Total</div><div class="data-value">&#8364;' + region.estimatedCompensation + 'M</div></div>' +
        '</div>' +

        '<div class="data-section">' +
            '<h3>Climate &amp; Terroir</h3>' +
            '<p class="notes-text">' + (region.climate || 'No data available.') + '</p>' +
        '</div>' +

        '<div class="data-section">' +
            '<h3>Key Grape Varieties</h3>' +
            grapePillsHTML +
            '<div class="grape-details">' + grapeDetailsHTML + '</div>' +
            '<div class="grape-legend">' +
                '<span class="grape-pill grape-pill-sm" style="background:#BF1722;color:#fff;border:1px solid #8a1018;">Red</span>' +
                '<span class="grape-legend-text">Red wine grape</span>' +
                '<span class="grape-pill grape-pill-sm" style="background:#F6D500;color:#1a1a1a;border:1px solid #bba800;">White</span>' +
                '<span class="grape-legend-text">White wine grape</span>' +
            '</div>' +
        '</div>' +

        '<div class="data-section">' +
            '<h3>Winemaking &amp; Style</h3>' +
            '<p class="notes-text">' + (region.winemaking || 'No data available.') + '</p>' +
        '</div>' +

        '<div class="data-section">' +
            '<h3>Notes</h3>' +
            '<p class="notes-text">' + region.notes + '</p>' +
            buildPhase3Bar(region.phase3Pct) +
        '</div>';

    sidebarContent.innerHTML = html;
    sidebar.classList.add('active');
}

// Close sidebar
document.getElementById('closeBtn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.remove('active');
});

// ── Legend ────────────────────────────────────────────────────────────────────
function addLegend() {
    var legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = [
            'background:#ffffff', 'padding:12px 16px', 'border-radius:4px',
            'box-shadow:0 2px 8px rgba(0,35,156,0.15)', 'font-size:12px',
            'line-height:1.9', 'font-family:Arial,Helvetica,sans-serif',
            'font-style:normal', 'border-top:3px solid #BF1722'
        ].join(';');

        var html = '<strong style="display:block;margin-bottom:8px;color:#00239C;font-family:Arial,Helvetica,sans-serif;font-style:normal;letter-spacing:0.05em;text-transform:uppercase;font-size:11px;">Program Phase</strong>';

        Object.entries(phaseColors).forEach(function(entry) {
            var phase = entry[0], color = entry[1];
            var border = color === '#ACE1AF' ? '1px solid #7db880' : 'none';
            html += '<div style="margin-bottom:4px;display:flex;align-items:center;gap:8px;">' +
                '<span style="background:' + color + ';width:12px;height:12px;border-radius:50%;display:inline-block;flex-shrink:0;border:' + border + ';box-sizing:border-box;"></span>' +
                '<span style="color:#1a1a2e;">' + phase + '</span>' +
            '</div>';
        });

        html += '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #eee;">' +
            '<strong style="display:block;margin-bottom:6px;color:#00239C;font-family:Arial,Helvetica,sans-serif;letter-spacing:0.05em;text-transform:uppercase;font-size:11px;">Wine Regions</strong>' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
                '<svg width="28" height="12" style="flex-shrink:0;"><line x1="0" y1="6" x2="28" y2="6" stroke="#7BBFEA" stroke-width="2" stroke-dasharray="4 3"/></svg>' +
                '<span style="color:#1a1a2e;">AOC Boundary (approx.)</span>' +
            '</div>' +
        '</div>';

        div.innerHTML = html;
        return div;
    };
    legend.addTo(map);
}

// ── Init ──────────────────────────────────────────────────────────────────────
window.addEventListener('load', function() {
    loadAOCBoundaries();
    initializeMarkers();
    addLegend();
    setTimeout(function() { map.invalidateSize(); }, 100);
});

window.addEventListener('resize', function() {
    map.invalidateSize();
});

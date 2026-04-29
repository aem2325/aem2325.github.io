// Initialize map centered on France
var map = L.map('map', { zoomControl: true }).setView([44.5, 1.8], 7);

// Paint the Leaflet map background (ocean) deep dark navy
map.getContainer().style.background = '#0a1628';

// ── Basemap ───────────────────────────────────────────────────────────────────
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// ── Phase colors ──────────────────────────────────────────────────────────────
var phaseColors = {
    'Phase 1 (2023) + Phase 2 (2024)':      '#4a4a4a',
    'Phase 2 (2024)':                        '#ACE1AF',
    'Phase 2 (2024) — Limited Eligibility': '#00A693'
};

// ── Grape pill colors ─────────────────────────────────────────────────────────
var grapeColors = {
    red:   { bg: '#BF1722', text: '#ffffff', border: '#8a1018' },
    white: { bg: '#F6D500', text: '#1a1a1a', border: '#bba800' }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildGrapePills(grapes) {
    return grapes.map(function(g) {
        var c = grapeColors[g.type];
        return '<span class="grape-pill" style="background:' + c.bg + ';color:' + c.text + ';border:1px solid ' + c.border + ';" title="' + g.notes + '">' + g.name + '</span>';
    }).join('');
}

function buildTooltipHTML(region) {
    var pills = region.grapes ? buildGrapePills(region.grapes) : '';
    var grapesBlock = pills ? '<div class="ht-grapes">' + pills + '</div>' : '';
    return '<div class="hover-tooltip">' +
        '<div class="ht-title">' + region.name + '</div>' +
        '<div class="ht-row"><span class="ht-label">Permanent removal</span><span class="ht-value">' + region.hectaresPermanent.toLocaleString() + ' ha</span></div>' +
        '<div class="ht-row"><span class="ht-label">Partial removal</span><span class="ht-value">' + region.hectaresPartial.toLocaleString() + ' ha</span></div>' +
        grapesBlock + '</div>';
}

function buildPhase3Bar(pct) {
    if (pct == null) return '';
    return '<div class="phase3-bar-wrap">' +
        '<div class="phase3-bar-label">' +
            '<span class="phase3-bar-title">Share of Phase 3 Applications</span>' +
            '<span class="phase3-bar-pct">' + pct + '%</span>' +
        '</div>' +
        '<div class="phase3-bar-track"><div class="phase3-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="phase3-bar-axis"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>' +
    '</div>';
}

// ── Winds ─────────────────────────────────────────────────────────────────────
var winds = [
    {
        name: 'Mistral',
        popup: 'Mistral: cold dry North wind down Rhône Valley; prevents mildew; moderates Mediterranean heat',
        coords: [
            [45.75, 4.83],
            [45.05, 4.78],
            [44.20, 4.70],
            [43.90, 4.63],
            [43.55, 4.90],
            [43.40, 5.05]
        ]
    },
    {
        name: 'Tramontane',
        popup: 'Tramontane: cold N/NW wind in Languedoc-Roussillon; similar drying effect to Mistral',
        coords: [
            [43.60, 2.24],
            [43.35, 2.65],
            [43.10, 2.98],
            [42.82, 3.01]
        ]
    }
];

function createArrowIcon(color) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="20" viewBox="0 0 14 20">' +
        '<polygon points="7,18 1,6 7,10 13,6" fill="' + color + '" stroke="' + color + '" stroke-width="1"/>' +
        '<line x1="7" y1="2" x2="7" y2="11" stroke="' + color + '" stroke-width="2"/>' +
    '</svg>';
    return L.divIcon({
        html: svg,
        className: 'wind-arrow-icon',
        iconSize: [14, 20],
        iconAnchor: [7, 10]
    });
}

function addWinds() {
    var windColor = '#b09fcc';

    winds.forEach(function(wind) {
        var line = L.polyline(wind.coords, {
            color: windColor,
            weight: 2,
            opacity: 0.9,
            dashArray: '8 5'
        }).addTo(map);

        var popupContent = '<div class="feature-popup">' + wind.popup + '</div>';
        line.bindTooltip(popupContent, {
            sticky: true,
            opacity: 1,
            className: 'feature-tooltip'
        });

        var lastCoord = wind.coords[wind.coords.length - 1];
        L.marker(lastCoord, {
            icon: createArrowIcon(windColor),
            interactive: false,
            zIndexOffset: 500
        }).addTo(map);

        var mid = wind.coords[Math.floor(wind.coords.length / 2)];
        L.marker(mid, {
            icon: L.divIcon({
                html: '<span class="wind-label" style="color:#b09fcc;">' + wind.name + '</span>',
                className: 'wind-label-icon',
                iconAnchor: [-6, 8]
            }),
            interactive: false,
            zIndexOffset: 400
        }).addTo(map);
    });
}

// ── Rivers ────────────────────────────────────────────────────────────────────
var rivers = [
    {
        name: 'Rhône',
        popup: 'Rhône: defines Northern and Southern Rhône wine regions; reflects sunlight on steep slopes',
        coords: [
            [44.92, 4.88],
            [44.73, 4.85],
            [44.55, 4.82],
            [44.33, 4.75],
            [44.10, 4.68],
            [43.90, 4.62],
            [43.67, 4.63],
            [43.55, 4.62],
            [43.50, 4.52]
        ]
    },
    {
        name: 'Gironde / Garonne',
        popup: 'Gironde: estuary and river system moderating Bordeaux climate',
        coords: [
            [45.57, -1.07],
            [45.25, -0.72],
            [44.97, -0.53],
            [44.80, -0.38],
            [44.60, -0.22],
            [44.42,  0.10],
            [44.28,  0.27]
        ]
    },
    {
        name: 'Ciron',
        popup: 'Ciron River: creates morning mist for Sauternes noble rot',
        coords: [
            [44.42,  0.10],
            [44.38, -0.07],
            [44.33, -0.17],
            [44.26, -0.31]
        ]
    }
];

function addRivers() {
    var riverColor = '#4a90d9';

    rivers.forEach(function(river) {
        var line = L.polyline(river.coords, {
            color: riverColor,
            weight: 2.2,
            opacity: 0.85,
            dashArray: null
        }).addTo(map);

        var popupContent = '<div class="feature-popup">' + river.popup + '</div>';
        line.bindTooltip(popupContent, {
            sticky: true,
            opacity: 1,
            className: 'feature-tooltip'
        });

        var mid = river.coords[Math.floor(river.coords.length / 2)];
        L.marker(mid, {
            icon: L.divIcon({
                html: '<span class="river-label" style="color:#4a90d9;">' + river.name + '</span>',
                className: 'river-label-icon',
                iconAnchor: [-6, 8]
            }),
            interactive: false,
            zIndexOffset: 400
        }).addTo(map);
    });
}

// ── AOC boundaries ────────────────────────────────────────────────────────────
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
        .catch(function(err) { console.warn('AOC GeoJSON failed:', err); });
}

function highlightAocForRegion(regionId) {
    activeAocLayers.forEach(function(l) { l.setStyle(AOC_DEFAULT_STYLE); });
    var ids = regionToAocId[regionId] || [];
    activeAocLayers = ids.map(function(id) { return aocLayersByRegionId[id]; }).filter(Boolean);
    activeAocLayers.forEach(function(l) { l.setStyle(AOC_SELECTED_STYLE); });
}

// ── Markers ───────────────────────────────────────────────────────────────────
var markersByRegionId = {};

function initializeMarkers() {
    franceData.regions.forEach(function(region) {
        var color = phaseColors[region.programPhase] || '#555555';

        var marker = L.circleMarker(
            [region.coordinates.latitude, region.coordinates.longitude],
            { radius: 14, fillColor: color, color: '#FFFFFF', weight: 2.5, opacity: 1, fillOpacity: 0.9 }
        ).addTo(map);

        markersByRegionId[region.id] = marker;

        marker.on('click', function() {
            // Close info sidebar if open before opening region sidebar
            document.getElementById('infoSidebar').classList.remove('active');
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
            '<h3>Exit Notes &amp; Statistics</h3>' +
            '<p class="notes-text">' + region.notes + '</p>' +
            buildPhase3Bar(region.phase3Pct) +
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
        '</div>';

    sidebarContent.innerHTML = html;
    sidebar.classList.add('active');
}

// ── Sidebar close buttons ─────────────────────────────────────────────────────
document.getElementById('closeBtn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.remove('active');
});

document.getElementById('infoCloseBtn').addEventListener('click', function() {
    document.getElementById('infoSidebar').classList.remove('active');
});

// ── Info button Leaflet control ───────────────────────────────────────────────
// Renders a rounded square "i" button below the zoom controls (topleft).
// Clicking it opens the info sidebar and closes the region sidebar if open.
function addInfoButton() {
    var InfoControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function() {
            var btn = L.DomUtil.create('div', 'info-btn-control');
            btn.title = 'Information';
            btn.innerHTML = '<span class="info-btn-letter">i</span>';

            L.DomEvent.on(btn, 'click', function(e) {
                L.DomEvent.stopPropagation(e);
                var infoSidebar  = document.getElementById('infoSidebar');
                var regionSidebar = document.getElementById('sidebar');
                // Close region sidebar when info opens
                regionSidebar.classList.remove('active');
                // Toggle info sidebar
                infoSidebar.classList.toggle('active');
            });

            L.DomEvent.disableClickPropagation(btn);
            return btn;
        }
    });
    new InfoControl().addTo(map);
}

// ── Combined Dropdown + Legend control (bottomleft) ───────────────────────────
function addLegendAndDropdown() {
    var control = L.control({ position: 'bottomleft' });
    control.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = [
            'background:#ffffff',
            'padding:12px 16px',
            'border-radius:4px',
            'box-shadow:0 2px 8px rgba(0,35,156,0.15)',
            'font-size:12px',
            'line-height:1.9',
            'font-family:Arial,Helvetica,sans-serif',
            'font-style:normal',
            'border-top:3px solid #BF1722',
            'min-width:220px'
        ].join(';');

        // ── Jump to Region label ──
        var dropLabel = document.createElement('div');
        dropLabel.style.cssText = [
            'color:#00239C',
            'font-family:Milker,Arial,Helvetica,sans-serif',
            'letter-spacing:0.05em',
            'text-transform:uppercase',
            'font-size:11px',
            'margin-bottom:8px',
            'font-weight:normal',
            'line-height:1.4'
        ].join(';');
        dropLabel.textContent = 'Jump to Region';
        div.appendChild(dropLabel);

        // ── Select element ──
        var select = document.createElement('select');
        select.id = 'regionSelect';
        select.style.cssText = [
            'width:100%',
            'font-family:Milker,Arial,Helvetica,sans-serif',
            'font-size:12px',
            'color:#1a1a2e',
            'border:1px solid #dde2f0',
            'border-radius:3px',
            'padding:5px 8px',
            'background:#f4f6fb',
            'cursor:pointer',
            'outline:none',
            'box-sizing:border-box'
        ].join(';');

        var placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '— Select a region —';
        select.appendChild(placeholder);

        franceData.regions.forEach(function(region) {
            var opt = document.createElement('option');
            opt.value = region.id;
            opt.textContent = region.name;
            select.appendChild(opt);
        });

        select.addEventListener('change', function() {
            var id = this.value;
            if (!id) return;
            var region = franceData.regions.find(function(r) { return r.id === id; });
            if (!region) return;
            // Close info sidebar if open
            document.getElementById('infoSidebar').classList.remove('active');
            map.setView([region.coordinates.latitude, region.coordinates.longitude], 8, { animate: true });
            displayRegionData(region);
            highlightAocForRegion(region.id);
            select.value = '';
        });

        div.appendChild(select);

        // ── Divider ──
        var divider = document.createElement('div');
        divider.style.cssText = 'border-top:1px solid #eee;margin:12px 0 10px 0;';
        div.appendChild(divider);

        // ── Legend content ──
        var legendDiv = document.createElement('div');
        var legendHTML =
            '<strong style="display:block;margin-bottom:8px;color:#00239C;font-family:Milker,Arial,Helvetica,sans-serif;letter-spacing:0.05em;text-transform:uppercase;font-size:11px;line-height:1.4;">Program Phase</strong>';

        Object.entries(phaseColors).forEach(function(entry) {
            var phase = entry[0], color = entry[1];
            var border = color === '#ACE1AF' ? '1px solid #7db880' : 'none';
            legendHTML += '<div style="margin-bottom:4px;display:flex;align-items:center;gap:8px;">' +
                '<span style="background:' + color + ';width:12px;height:12px;border-radius:50%;display:inline-block;flex-shrink:0;border:' + border + ';box-sizing:border-box;"></span>' +
                '<span style="color:#1a1a2e;">' + phase + '</span>' +
            '</div>';
        });

        legendHTML +=
            '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #eee;">' +
                '<strong style="display:block;margin-bottom:6px;color:#00239C;font-family:Milker,Arial,Helvetica,sans-serif;letter-spacing:0.05em;text-transform:uppercase;font-size:11px;line-height:1.4;">Wine Regions</strong>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
                    '<svg width="28" height="12" style="flex-shrink:0;"><line x1="0" y1="6" x2="28" y2="6" stroke="#7BBFEA" stroke-width="2" stroke-dasharray="4 3"/></svg>' +
                    '<span style="color:#1a1a2e;">AOC Boundary (approx.)</span>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
                    '<svg width="28" height="12" style="flex-shrink:0;"><line x1="0" y1="6" x2="28" y2="6" stroke="#4a90d9" stroke-width="2"/></svg>' +
                    '<span style="color:#1a1a2e;">River</span>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                    '<svg width="28" height="12" style="flex-shrink:0;"><line x1="0" y1="6" x2="28" y2="6" stroke="#b09fcc" stroke-width="2" stroke-dasharray="8 5"/></svg>' +
                    '<span style="color:#1a1a2e;">Wind</span>' +
                '</div>' +
            '</div>';

        legendDiv.innerHTML = legendHTML;
        div.appendChild(legendDiv);

        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.disableScrollPropagation(div);

        return div;
    };
    control.addTo(map);
}

// ── Init ──────────────────────────────────────────────────────────────────────
window.addEventListener('load', function() {
    loadAOCBoundaries();
    addRivers();
    addWinds();
    initializeMarkers();
    addInfoButton();
    addLegendAndDropdown();
    setTimeout(function() { map.invalidateSize(); }, 100);
});

window.addEventListener('resize', function() {
    map.invalidateSize();
});

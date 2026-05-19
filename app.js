// ===== DATA: Lokasi Palembang (koordinat akurat dari Google Maps) =====
const locations = [
    { id: 0, name: "Jembatan Ampera", lat: -2.9917, lng: 104.7635, desc: "Ikon utama Kota Palembang, jembatan bersejarah melintasi Sungai Musi." },
    { id: 1, name: "Benteng Kuto Besak", lat: -2.9914, lng: 104.7592, desc: "Benteng peninggalan Kesultanan Palembang Darussalam, dibangun tahun 1780." },
    { id: 2, name: "Masjid Agung SMB", lat: -2.9879, lng: 104.7603, desc: "Masjid Agung Sultan Mahmud Badaruddin II, terbesar di Sumatera Selatan." },
    { id: 3, name: "Monpera", lat: -2.9904, lng: 104.7602, desc: "Monumen Perjuangan Rakyat, mengenang pertempuran 5 hari 5 malam." },
    { id: 4, name: "Museum SMB II", lat: -2.9903, lng: 104.7611, desc: "Museum Sultan Mahmud Badaruddin II, koleksi sejarah Palembang." },
    { id: 5, name: "Pasar 16 Ilir", lat: -2.9891, lng: 104.7648, desc: "Pasar tradisional tertua dan terbesar di Palembang." },
    { id: 6, name: "Kambang Iwak", lat: -2.9926, lng: 104.7538, desc: "Taman kota dengan danau buatan, tempat rekreasi favorit warga." },
    { id: 7, name: "Jakabaring Sport City", lat: -3.0167, lng: 104.7750, desc: "Kompleks olahraga terbesar di Sumsel, venue Asian Games 2018." },
    { id: 8, name: "Punti Kayu", lat: -2.9465, lng: 104.7291, desc: "Hutan wisata dan taman rekreasi keluarga di Palembang." },
    { id: 9, name: "Bandara SMB II", lat: -2.8977, lng: 104.6981, desc: "Bandara internasional utama Kota Palembang." },
    { id: 10, name: "Palembang Indah Mall", lat: -2.9882, lng: 104.7523, desc: "Pusat perbelanjaan populer di kawasan Bukit Kecil." },
    { id: 11, name: "OPI Mall", lat: -3.0336, lng: 104.7937, desc: "Pusat perbelanjaan modern di kawasan Jakabaring." },
    { id: 12, name: "Palembang Icon", lat: -2.9863, lng: 104.7455, desc: "Mall dan pusat hiburan di Jl. POM IX Palembang." },
    { id: 13, name: "PS Mall", lat: -2.9767, lng: 104.7418, desc: "Palembang Square Mall, pusat perbelanjaan dan bioskop." },
    { id: 14, name: "Palembang Trade Center", lat: -2.9554, lng: 104.7679, desc: "Pusat perdagangan dan elektronik terbesar." },
    { id: 15, name: "Masjid Cheng Ho", lat: -2.9958, lng: 104.7903, desc: "Masjid Al-Islam Muhammad Cheng Hoo, arsitektur Tionghoa unik." },
    { id: 16, name: "Pulau Kemaro", lat: -2.9794, lng: 104.8211, desc: "Pulau kecil di Sungai Musi, situs bersejarah dan klenteng." },
    { id: 17, name: "RS Muhammadiyah", lat: -2.9984, lng: 104.7766, desc: "Rumah Sakit Muhammadiyah Palembang di 13 Ulu." },
    { id: 18, name: "UKMC", lat: -2.9733, lng: 104.7615, desc: "Universitas Katolik Musi Charitas, Jl. Bangau No.60, 9 Ilir." },
    { id: 19, name: "RS Charitas", lat: -2.9760, lng: 104.7528, desc: "Rumah Sakit RK Charitas, Jl. Jend. Sudirman No.1054." },
    { id: 20, name: "UNSRI Bukit", lat: -2.9864, lng: 104.7343, desc: "Universitas Sriwijaya Kampus Bukit, Jl. Srijaya Negara." },
    { id: 21, name: "Univ. Bina Darma", lat: -3.0030, lng: 104.7920, desc: "Universitas Bina Darma, Jl. Jend. A. Yani No.3, Plaju." }
];

// ===== Edge pairs (akan diambil jarak asli via OSRM) =====
const edgePairs = [
    [0, 1], [0, 3], [0, 4], [0, 5], [0, 7], [0, 17],
    [1, 2], [1, 3], [1, 6], [1, 10],
    [2, 3], [2, 10], [2, 4],
    [3, 4], [4, 5],
    [5, 14], [5, 7], [5, 18], [5, 0],
    [6, 10], [6, 12], [6, 19], [6, 1],
    [7, 11], [7, 15], [7, 17], [7, 21], [7, 0],
    [8, 9], [8, 13], [8, 20],
    [9, 8],
    [10, 12], [10, 13], [10, 6], [10, 19],
    [11, 15], [11, 16], [11, 21],
    [12, 13], [12, 20],
    [13, 8], [13, 19], [13, 20],
    [14, 16], [14, 18],
    [15, 17], [15, 21],
    [17, 7], [17, 21],
    [18, 19], [18, 14], [18, 5],
    [19, 13], [19, 6], [19, 10],
    [20, 13], [20, 8], [20, 12]
];

// ===== GLOBALS =====
let map, markers = [], edgeLines = [], weightLabels = [];
let showEdges = true, showWeights = true;
let pathLines = [];
let adjList = {};
let edgeRoutes = {};
let routesLoaded = false;
let tileLayers = {}, currentLayer = 'default', is3D = false;

// ===== OSRM: Fetch real road route WITH street names =====
async function fetchRoute(lat1, lng1, lat2, lng2) {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson&steps=true`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes.length > 0) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
            // Extract street names from steps
            const streets = [];
            if (route.legs && route.legs[0] && route.legs[0].steps) {
                for (const step of route.legs[0].steps) {
                    const name = step.name || '';
                    const dist = +(step.distance / 1000).toFixed(2);
                    if (name && dist > 0.01) {
                        streets.push({ name, dist, maneuver: step.maneuver?.type || '' });
                    }
                }
            }
            return { coords, dist: +(route.distance / 1000).toFixed(1), streets };
        }
    } catch (e) { console.warn('OSRM error:', e); }
    return { coords: [[lat1, lng1], [lat2, lng2]], dist: haversine(lat1, lng1, lat2, lng2), streets: [] };
}

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return +(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

async function loadAllRoutes() {
    const statusEl = document.querySelector('.splash-content p');
    const seen = new Set();
    const uniquePairs = [];
    for (const [u, v] of edgePairs) {
        const key = `${Math.min(u,v)}-${Math.max(u,v)}`;
        if (!seen.has(key)) { seen.add(key); uniquePairs.push([u, v]); }
    }
    for (let i = 0; i < uniquePairs.length; i++) {
        const [u, v] = uniquePairs[i];
        statusEl.textContent = `Memuat rute jalan ${i + 1}/${uniquePairs.length}...`;
        const route = await fetchRoute(locations[u].lat, locations[u].lng, locations[v].lat, locations[v].lng);
        edgeRoutes[`${u}-${v}`] = route;
        edgeRoutes[`${v}-${u}`] = { coords: [...route.coords].reverse(), dist: route.dist, streets: [...route.streets].reverse() };
    }
    routesLoaded = true;
}

// ===== BUILD GRAPH =====
function buildGraph() {
    adjList = {};
    locations.forEach(l => adjList[l.id] = []);
    const seen = new Set();
    for (const [u, v] of edgePairs) {
        const key = `${Math.min(u,v)}-${Math.max(u,v)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const dist = edgeRoutes[`${u}-${v}`]?.dist || 0;
        adjList[u].push({ to: v, w: dist });
        adjList[v].push({ to: u, w: dist });
    }
}

// ===== DIJKSTRA =====
function dijkstra(src, dst) {
    const dist = {}, prev = {}, visited = new Set(), steps = [];
    locations.forEach(l => { dist[l.id] = Infinity; prev[l.id] = null; });
    dist[src] = 0;
    while (true) {
        let u = -1, best = Infinity;
        for (const id in dist) {
            if (!visited.has(+id) && dist[id] < best) { best = dist[id]; u = +id; }
        }
        if (u === -1 || u === dst) break;
        visited.add(u);
        steps.push({ type: 'visit', node: u, dist: dist[u] });
        for (const edge of adjList[u]) {
            if (visited.has(edge.to)) continue;
            const alt = dist[u] + edge.w;
            if (alt < dist[edge.to]) {
                dist[edge.to] = alt; prev[edge.to] = u;
                steps.push({ type: 'update', from: u, to: edge.to, dist: alt });
            }
        }
    }
    const path = [];
    let cur = dst;
    while (cur !== null) { path.unshift(cur); cur = prev[cur]; }
    if (path[0] !== src) return { path: [], dist: Infinity, steps };
    return { path, dist: dist[dst], steps };
}



// ===== MARKER ICON =====
function createMarkerIcon(color = '#EA4335') {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin"><svg viewBox="0 0 32 42"><path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z" fill="${color}"/><circle cx="16" cy="15" r="6" fill="#fff"/></svg></div>`,
        iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -42]
    });
}

// ===== INIT MAP =====
function initMap() {
    map = L.map('map', { center: [-2.976, 104.750], zoom: 13, zoomControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile layers
    tileLayers.default = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap', maxZoom: 19
    });
    tileLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri', maxZoom: 19
    });
    tileLayers.traffic = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap HOT', maxZoom: 19
    });
    tileLayers.default.addTo(map);

    locations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng], { icon: createMarkerIcon() })
            .addTo(map).bindPopup(`<b>${loc.name}</b><br>${loc.desc}`);
        marker.on('click', () => showLocationInfo(loc.id));
        markers.push(marker);
    });
}

// ===== SWITCH MAP LAYER =====
function switchMapLayer(layerName) {
    if (tileLayers[currentLayer]) map.removeLayer(tileLayers[currentLayer]);
    currentLayer = layerName;
    if (tileLayers[layerName]) tileLayers[layerName].addTo(map);
    // Update button active states
    document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.layer-btn[data-layer="${layerName}"]`);
    if (btn) btn.classList.add('active');
}

// ===== TOGGLE 3D =====
function toggle3D() {
    is3D = !is3D;
    const mapEl = document.getElementById('map');
    if (is3D) {
        mapEl.classList.add('map-3d');
    } else {
        mapEl.classList.remove('map-3d');
    }
    document.getElementById('btn3D').classList.toggle('active', is3D);
    map.invalidateSize();
}

// ===== DRAW EDGES =====
function drawEdges() {
    clearEdges();
    for (const [u, v] of edgePairs) {
        const route = edgeRoutes[`${u}-${v}`];
        if (!route) continue;
        const line = L.polyline(route.coords, { color: '#5f6368', weight: 3, opacity: 0.45, dashArray: '6 4' }).addTo(map);
        edgeLines.push(line);
        const mid = route.coords[Math.floor(route.coords.length / 2)];
        const label = L.marker(mid, {
            icon: L.divIcon({ className: 'weight-label', html: `${route.dist} km`, iconSize: [52, 20], iconAnchor: [26, 10] }),
            interactive: false
        }).addTo(map);
        weightLabels.push(label);
    }
    updateEdgeVisibility();
}

function clearEdges() {
    edgeLines.forEach(l => map.removeLayer(l));
    weightLabels.forEach(l => map.removeLayer(l));
    edgeLines = []; weightLabels = [];
}

function updateEdgeVisibility() {
    edgeLines.forEach(l => l.setStyle({ opacity: showEdges ? 0.45 : 0 }));
    weightLabels.forEach(l => {
        const el = l.getElement();
        if (el) el.style.display = (showEdges && showWeights) ? '' : 'none';
    });
}

function clearPath() {
    pathLines.forEach(l => map.removeLayer(l));
    pathLines = [];
    markers.forEach(m => m.setIcon(createMarkerIcon()));
}

// ===== DRAW A ROUTE ON MAP =====
function drawRouteOnMap(path, color, weight, animated) {
    const lines = [];
    for (let i = 0; i < path.length - 1; i++) {
        const key = `${path[i]}-${path[i + 1]}`;
        const route = edgeRoutes[key];
        if (!route) continue;
        const line = L.polyline(route.coords, { color, weight, opacity: 0.85 }).addTo(map);
        lines.push(line);
        if (animated) {
            const anim = L.polyline(route.coords, {
                color: '#fff', weight: 2, opacity: 0.5, dashArray: '8 8', className: 'path-animated'
            }).addTo(map);
            lines.push(anim);
        }
    }
    return lines;
}

// ===== ANIMATE PATH =====
async function animatePath(path, color = '#4285F4') {
    for (let i = 0; i < path.length - 1; i++) {
        const key = `${path[i]}-${path[i + 1]}`;
        const route = edgeRoutes[key];
        if (!route) continue;
        await new Promise(resolve => {
            const line = L.polyline(route.coords, { color, weight: 6, opacity: 0.9 }).addTo(map);
            const anim = L.polyline(route.coords, {
                color: '#fff', weight: 2, opacity: 0.5, dashArray: '8 8', className: 'path-animated'
            }).addTo(map);
            pathLines.push(line, anim);
            if (i > 0 && i < path.length - 1) markers[path[i]].setIcon(createMarkerIcon(color));
            setTimeout(resolve, 500);
        });
    }
}

// ===== SHOW LOCATION INFO =====
function showLocationInfo(id) {
    const loc = locations[id];
    document.getElementById('locationName').textContent = loc.name;
    const neighbors = adjList[id] || [];
    let html = `<p class="location-desc">${loc.desc}</p>`;
    html += `<p class="location-desc"><strong>Koordinat:</strong> ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}</p>`;
    html += `<div class="location-neighbors"><h4>Terhubung ke (${neighbors.length} lokasi):</h4><div class="neighbor-list">`;
    neighbors.forEach(n => {
        html += `<div class="neighbor-item" onclick="flyToLocation(${n.to})"><span>${locations[n.to].name}</span><span class="neighbor-dist">${n.w} km</span></div>`;
    });
    html += '</div></div>';
    document.getElementById('locationContent').innerHTML = html;
    document.getElementById('locationPanel').classList.remove('hidden');
}

function flyToLocation(id) {
    map.flyTo([locations[id].lat, locations[id].lng], 16, { duration: 1 });
    markers[id].openPopup();
    showLocationInfo(id);
}

// ===== RENDER DIRECT STREET LIST =====
function renderDirectStreets(streets) {
    if (!streets || streets.length === 0) return '<p style="font-size:0.8rem;color:#80868b">Data jalan tidak tersedia</p>';
    let html = '<div class="street-list"><div class="street-segment">';
    html += '<div class="street-names">';
    streets.forEach(s => {
        let icon = '→';
        if (s.maneuver === 'turn') icon = '↱';
        else if (s.maneuver === 'fork') icon = '⑂';
        else if (s.maneuver === 'roundabout') icon = '↻';
        else if (s.maneuver === 'depart') icon = '🚩';
        else if (s.maneuver === 'arrive') icon = '📍';
        html += `<div class="street-item"><span class="si-icon">${icon}</span><span class="si-name">${s.name}</span><span class="si-dist">${s.dist.toFixed(2)} km</span></div>`;
    });
    html += '</div></div></div>';
    return html;
}

// ===== SHOW DIRECT ROUTE RESULT =====
function showDirectResult(directRoute, graphResult, src, dst) {
    const panel = document.getElementById('resultPanel');
    const content = document.getElementById('resultContent');
    const estMinutes = (directRoute.dist / 40 * 60).toFixed(0);

    let html = `<div class="compare-header">
        <div class="compare-title">🟢 Rute Terdekat</div>
        <div class="compare-subtitle">${locations[src].name} → ${locations[dst].name}</div>
    </div>`;

    // Direct route card
    html += `<div class="route-card shortest">
        <div class="route-badge">🗺️ RUTE LANGSUNG (via jalan raya)</div>
        <div class="route-distance">${directRoute.dist.toFixed(1)} km</div>
        <div class="route-info">Rute tercepat • ~${estMinutes} menit</div>
        <div class="street-section"><div class="street-title">🛣️ Jalan yang Dilalui:</div>${renderDirectStreets(directRoute.streets)}</div>
    </div>`;

    // Graph Dijkstra info
    html += `<div class="route-card" style="background:#f0f4ff;border-color:#c2d5ff">
        <div class="route-badge" style="color:#4285F4">📐 ANALISIS GRAF (Dijkstra)</div>
        <div class="route-distance" style="color:#4285F4;font-size:1.1rem">${graphResult.dist.toFixed(1)} km <small>via ${graphResult.path.length} simpul</small></div>
        <div class="route-path-list" style="margin-top:8px">`;
    graphResult.path.forEach((id, i) => {
        html += `<span class="rp-node">${locations[id].name}</span>`;
        if (i < graphResult.path.length - 1) html += `<span class="rp-arrow">→</span>`;
    });
    html += `</div></div>`;

    // Stats
    html += `<div class="compare-stats">
        <div class="cs-row"><span class="cs-label">Jarak Langsung</span><span class="cs-val">${directRoute.dist.toFixed(1)} km</span></div>
        <div class="cs-row"><span class="cs-label">Jarak via Graf</span><span class="cs-val">${graphResult.dist.toFixed(1)} km</span></div>
        <div class="cs-row"><span class="cs-label">Estimasi Waktu</span><span class="cs-val">~${estMinutes} menit</span></div>
    </div>`;

    content.innerHTML = html;
    panel.classList.remove('hidden');
}

function showStepTrace(steps) {
    let html = '';
    steps.forEach((s, i) => {
        if (s.type === 'visit') {
            html += `<div class="trace-item visited"><span class="trace-label">Langkah ${i + 1}: Kunjungi</span>${locations[s.node].name} — jarak = ${s.dist.toFixed(1)} km</div>`;
        } else {
            html += `<div class="trace-item current"><span class="trace-label">Langkah ${i + 1}: Update</span>${locations[s.from].name} → ${locations[s.to].name} = ${s.dist.toFixed(1)} km</div>`;
        }
    });
    document.getElementById('stepTraceContent').innerHTML = html;
    document.getElementById('stepTrace').classList.remove('hidden');
}

// ===== MATRIX =====
function renderMatrix(highlightPath) {
    const pathSet = new Set();
    if (highlightPath) {
        for (let i = 0; i < highlightPath.length - 1; i++) {
            pathSet.add(`${highlightPath[i]}-${highlightPath[i+1]}`);
            pathSet.add(`${highlightPath[i+1]}-${highlightPath[i]}`);
        }
    }
    let html = '<thead><tr><th></th>';
    locations.forEach(l => html += `<th title="${l.name}">${l.name.length > 8 ? l.name.substring(0, 7) + '…' : l.name}</th>`);
    html += '</tr></thead><tbody>';
    locations.forEach((li, i) => {
        html += `<tr><td>${li.name.length > 8 ? li.name.substring(0, 7) + '…' : li.name}</td>`;
        locations.forEach((lj, j) => {
            if (i === j) { html += '<td class="zero">0</td>'; return; }
            const edge = adjList[i]?.find(e => e.to === j);
            const hl = pathSet.has(`${i}-${j}`) ? ' highlight' : '';
            html += edge ? `<td class="has-weight${hl}">${edge.w}</td>` : '<td class="inf">∞</td>';
        });
        html += '</tr>';
    });
    html += '</tbody>';
    document.getElementById('adjMatrix').innerHTML = html;
}

function populateSelects() {
    const s1 = document.getElementById('startNode'), s2 = document.getElementById('endNode');
    locations.forEach(l => {
        s1.innerHTML += `<option value="${l.id}">${l.name}</option>`;
        s2.innerHTML += `<option value="${l.id}">${l.name}</option>`;
    });
}

function updateStats() {
    document.getElementById('statVertices').textContent = locations.length;
    document.getElementById('statEdges').textContent = edgePairs.length;
    let total = 0;
    edgePairs.forEach(([u, v]) => { total += edgeRoutes[`${u}-${v}`]?.dist || 0; });
    document.getElementById('statTotalDist').textContent = total.toFixed(1);
}

// ===== EVENTS =====
function setupEvents() {
    document.getElementById('btnFindPath').addEventListener('click', async () => {
        const src = +document.getElementById('startNode').value;
        const dst = +document.getElementById('endNode').value;
        if (isNaN(src) || isNaN(dst) || document.getElementById('startNode').value === '' || document.getElementById('endNode').value === '') {
            alert('Pilih titik awal dan tujuan!'); return;
        }
        if (src === dst) { alert('Titik awal dan tujuan harus berbeda!'); return; }

        clearPath();

        // 1. Get DIRECT road route from OSRM (like Google Maps)
        const a = locations[src], b = locations[dst];
        const directRoute = await fetchRoute(a.lat, a.lng, b.lat, b.lng);

        // 2. Draw direct route on map
        markers[src].setIcon(createMarkerIcon('#34A853'));
        markers[dst].setIcon(createMarkerIcon('#EA4335'));

        const mainLine = L.polyline(directRoute.coords, {
            color: '#4285F4', weight: 6, opacity: 0.9
        }).addTo(map);
        const animLine = L.polyline(directRoute.coords, {
            color: '#ffffff', weight: 2, opacity: 0.5,
            dashArray: '8 8', className: 'path-animated'
        }).addTo(map);
        pathLines.push(mainLine, animLine);

        // Fit bounds to direct route
        map.fitBounds(directRoute.coords, { padding: [80, 80] });

        // 3. Also run Dijkstra on graph (for educational sidebar)
        const graphResult = dijkstra(src, dst);

        showDirectResult(directRoute, graphResult, src, dst);
        showStepTrace(graphResult.steps);
        renderMatrix(graphResult.path);
    });

    document.getElementById('btnSwap').addEventListener('click', () => {
        const s1 = document.getElementById('startNode'), s2 = document.getElementById('endNode');
        [s1.value, s2.value] = [s2.value, s1.value];
    });
    document.getElementById('btnToggleSidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('closed');
        document.querySelector('.top-bar').classList.toggle('collapsed');
    });
    document.getElementById('btnToggleEdges').addEventListener('click', function () {
        showEdges = !showEdges; this.classList.toggle('active'); updateEdgeVisibility();
    });
    document.getElementById('btnToggleWeights').addEventListener('click', function () {
        showWeights = !showWeights; this.classList.toggle('active'); updateEdgeVisibility();
    });
    document.getElementById('btnResetView').addEventListener('click', () => {
        clearPath(); map.flyTo([-2.976, 104.750], 13, { duration: 1 });
        document.getElementById('resultPanel').classList.add('hidden');
        document.getElementById('stepTrace').classList.add('hidden');
        document.getElementById('locationPanel').classList.add('hidden');
        markers.forEach(m => m.setIcon(createMarkerIcon()));
        renderMatrix();
    });
    document.getElementById('btnShowMatrix').addEventListener('click', () => {
        renderMatrix(); document.getElementById('matrixModal').classList.remove('hidden');
    });
    document.getElementById('btnCloseMatrix').addEventListener('click', () => document.getElementById('matrixModal').classList.add('hidden'));
    document.getElementById('matrixModal').addEventListener('click', e => {
        if (e.target === e.currentTarget) document.getElementById('matrixModal').classList.add('hidden');
    });
    document.getElementById('btnClearResult').addEventListener('click', () => {
        document.getElementById('resultPanel').classList.add('hidden'); clearPath(); renderMatrix();
    });
    document.getElementById('btnCloseTrace').addEventListener('click', () => document.getElementById('stepTrace').classList.add('hidden'));
    document.getElementById('btnCloseLocation').addEventListener('click', () => document.getElementById('locationPanel').classList.add('hidden'));

    // Map layers
    document.querySelectorAll('.layer-btn').forEach(btn => {
        btn.addEventListener('click', () => switchMapLayer(btn.dataset.layer));
    });
    document.getElementById('btn3D').addEventListener('click', toggle3D);

    // Search
    const searchInput = document.getElementById('searchInput'), searchResults = document.getElementById('searchResults');
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();
        if (!q) { searchResults.classList.add('hidden'); return; }
        const matches = locations.filter(l => l.name.toLowerCase().includes(q));
        if (!matches.length) { searchResults.classList.add('hidden'); return; }
        searchResults.innerHTML = matches.map(l =>
            `<div class="search-result-item" data-id="${l.id}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${l.name}</div>`
        ).join('');
        searchResults.classList.remove('hidden');
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                flyToLocation(+item.dataset.id); searchResults.classList.add('hidden');
                searchInput.value = locations[+item.dataset.id].name;
            });
        });
    });
    document.addEventListener('click', e => { if (!e.target.closest('.search-box')) searchResults.classList.add('hidden'); });
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
    initMap();
    populateSelects();
    await loadAllRoutes();
    buildGraph();
    drawEdges();
    updateStats();
    renderMatrix();
    setupEvents();
    document.getElementById('loadingSplash').classList.add('hidden');
});

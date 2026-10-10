/**
 * FoodChain Enterprise Visualizers
 * Clean, modern, high-contrast visualizers for light enterprise logistics dashboards.
 */

const Visualizers = {
    // -------------------------------------------------------------------------
    // MODULE 1: String Highlights & Hazard Badges
    // -------------------------------------------------------------------------
    renderStringHighlights(containerId, text, pattern, matches) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const matchSet = new Set();
        (matches || []).forEach(startIdx => {
            for (let i = 0; i < pattern.length; i++) {
                matchSet.add(startIdx + i);
            }
        });

        let html = '<div class="highlight-document-box">';
        for (let i = 0; i < text.length; i++) {
            const isMatched = matchSet.has(i);
            const char = text[i] === ' ' ? '&nbsp;' : text[i];
            if (isMatched) {
                html += `<span class="matched-char" title="Offset ${i}: '${text[i]}'">${char}</span>`;
            } else {
                html += `<span>${char}</span>`;
            }
        }
        html += '</div>';

        const statusBanner = (matches && matches.length > 0)
            ? `<div class="result-callout-card success" style="margin-top:12px;">
                 <div class="result-callout-title">✓ Pattern Matches Discovered</div>
                 <div class="result-callout-value">${matches.length} Instance(s) Found</div>
                 <div class="result-callout-meta">Zero-indexed document offsets: <strong>[${matches.join(', ')}]</strong></div>
               </div>`
            : `<div class="result-callout-card warning" style="margin-top:12px;">
                 <div class="result-callout-title">Notice</div>
                 <div class="result-callout-value">0 Occurrences Detected</div>
                 <div class="result-callout-meta">The query pattern '${pattern}' was not found in this inspection record.</div>
               </div>`;

        container.innerHTML = html + statusBanner;
    },

    renderAhoCorasickAlerts(containerId, text, matches) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let alertDeck = '';
        if (matches && matches.length > 0) {
            alertDeck = `
            <div class="result-callout-card danger">
                <div class="result-callout-title">⚠️ Critical Contaminant Hazards Detected</div>
                <div class="result-callout-value">${matches.length} Active Safety Alert(s)</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">
                    ${matches.map(m => `
                        <span class="badge-clean danger">
                            <strong>${m.keyword.toUpperCase()}</strong> (Offset: ${m.startIndex})
                        </span>
                    `).join('')}
                </div>
            </div>`;
        } else {
            alertDeck = `
            <div class="result-callout-card success">
                <div class="result-callout-title">✓ 100% Regulatory Clearance</div>
                <div class="result-callout-value">Zero Pathogen Signatures Found</div>
                <div class="result-callout-meta">Document conforms with FSSAI and APEDA biosecurity standards.</div>
            </div>`;
        }

        let highlighted = text;
        const sorted = [...(matches || [])].sort((a, b) => b.startIndex - a.startIndex);
        sorted.forEach(m => {
            const b = highlighted.substring(0, m.startIndex);
            const mid = highlighted.substring(m.startIndex, m.endIndex + 1);
            const a = highlighted.substring(m.endIndex + 1);
            highlighted = `${b}<span class="matched-keyword-mark">${mid}</span>${a}`;
        });

        container.innerHTML = `
        ${alertDeck}
        <div class="highlight-document-box" style="margin-top:12px;">
            ${highlighted}
        </div>`;
    },

    // -------------------------------------------------------------------------
    // MODULE 2: Suffix Array & Kasai LCP Table
    // -------------------------------------------------------------------------
    renderSuffixArrayTable(containerId, rankedSuffixes, sampleLcpTable, longestRepeated) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let repeatedSection = '';
        if (longestRepeated && longestRepeated.length > 0) {
            repeatedSection = `
            <div class="result-callout-card info">
                <div class="result-callout-title">Longest Repeated Clause (Kasai LCP)</div>
                <div class="result-callout-value">"${longestRepeated.phrase}"</div>
                <div class="result-callout-meta">Repeated length: <strong>${longestRepeated.length} characters</strong> across multiple document offsets.</div>
            </div>`;
        }

        const rows = sampleLcpTable || rankedSuffixes || [];

        let tableHtml = `
        <div class="enterprise-table-wrap" style="max-height: 270px;">
            <table class="enterprise-table">
                <thead>
                    <tr>
                        <th style="width:65px;">Rank</th>
                        <th style="width:95px;">Suffix Index</th>
                        <th style="width:85px;">LCP Value</th>
                        <th>Suffix Lexicographical Preview</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.slice(0, 15).map(r => `
                        <tr>
                            <td><span class="badge-clean">#${r.rank}</span></td>
                            <td><code>${r.suffixIndex}</code></td>
                            <td><span style="font-weight:700; color:${r.lcpValue > 0 ? '#0284c7' : '#94a3b8'};">${r.lcpValue !== undefined ? r.lcpValue : '-'}</span></td>
                            <td style="font-family:var(--font-mono); color:#334155;">${r.suffixPreview || r.preview}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;

        container.innerHTML = repeatedSection + tableHtml;
    },

    // -------------------------------------------------------------------------
    // MODULE 3: Optimal Binary Search Tree (OBST)
    // -------------------------------------------------------------------------
    renderOBSTTree(containerId, tree, minCost, rootKey) {
        const container = document.getElementById(containerId);
        if (!container || !tree) return;

        function renderNode(node) {
            if (!node) return '';
            return `
            <div style="display:flex; flex-direction:column; align-items:center; margin: 4px 10px;">
                <div style="background:#ffffff; border:1px solid #2563eb; padding:6px 14px; border-radius:8px; text-align:center; min-width:90px; box-shadow:0 2px 4px rgba(37,99,235,0.08);">
                    <div style="font-weight:700; color:#0f172a; font-size:12px;">${node.key}</div>
                    <div style="font-size:11px; color:#2563eb; font-family:var(--font-mono); font-weight:600;">p = ${node.frequency}</div>
                </div>
                ${(node.left || node.right) ? `
                    <div style="display:flex; justify-content:center; gap:20px; margin-top:8px;">
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            ${node.left ? `<span style="font-size:10px; color:#64748b; font-weight:700;">L</span>${renderNode(node.left)}` : `<div style="width:20px;"></div>`}
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            ${node.right ? `<span style="font-size:10px; color:#64748b; font-weight:700;">R</span>${renderNode(node.right)}` : `<div style="width:20px;"></div>`}
                        </div>
                    </div>
                ` : ''}
            </div>`;
        }

        container.innerHTML = `
        <div class="result-callout-card info">
            <div class="result-callout-title">Optimal Catalog Search Topology</div>
            <div class="result-callout-value">Root Key: '${rootKey}'</div>
            <div class="result-callout-meta">Min Expected Search Depth: <strong>${minCost} comparisons</strong></div>
        </div>
        <div style="overflow-x:auto; padding:20px; background:#f8fafc; border:1px solid var(--border-color); border-radius:12px; display:flex; justify-content:center;">
            ${renderNode(tree)}
        </div>`;
    },

    // -------------------------------------------------------------------------
    // MODULE 4: Dinic's Multi-Tier Supply Flow SVG
    // -------------------------------------------------------------------------
    renderDinicFlowGraph(containerId, totalNodes, edgeResults, maxFlow) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = 640;
        const height = 300;
        const positions = [
            { x: 55,  y: 150, label: '0: Farm Source' },
            { x: 190, y: 70,  label: '1: Depot-North' },
            { x: 190, y: 230, label: '2: Depot-South' },
            { x: 330, y: 70,  label: '3: WH-Cold-1' },
            { x: 330, y: 230, label: '4: WH-Cold-2' },
            { x: 470, y: 70,  label: '5: Metro-Hub' },
            { x: 470, y: 230, label: '6: Port-Dock' },
            { x: 585, y: 150, label: '7: Retail Sink' }
        ];

        let svgEdges = '';
        (edgeResults || []).forEach(e => {
            const u = positions[e.from];
            const v = positions[e.to];
            if (!u || !v) return;

            const isSaturated = e.isSaturated;
            const strokeColor = isSaturated ? '#ef4444' : (e.flow > 0 ? '#2563eb' : '#cbd5e1');
            const strokeWidth = e.flow > 0 ? 2.5 : 1.5;

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            svgEdges += `
            <line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}" 
                  stroke="${strokeColor}" stroke-width="${strokeWidth}" />
            <circle cx="${midX}" cy="${midY}" r="11" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.5" />
            <text x="${midX}" y="${midY + 3.5}" font-size="8.5" font-family="'JetBrains Mono', monospace" 
                  text-anchor="middle" fill="${strokeColor}" font-weight="700">${e.flow}/${e.capacity}T</text>
            `;
        });

        let svgNodes = '';
        positions.slice(0, totalNodes).forEach((pos, idx) => {
            const isSource = idx === 0;
            const isSink = idx === totalNodes - 1;
            let fillColor = '#ffffff';
            let strokeColor = '#64748b';
            let textColor = '#0f172a';

            if (isSource) { fillColor = '#ecfdf5'; strokeColor = '#10b981'; textColor = '#065f46'; }
            else if (isSink) { fillColor = '#eff6ff'; strokeColor = '#2563eb'; textColor = '#1e40af'; }

            svgNodes += `
            <g>
                <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.5" />
                <text x="${pos.x}" y="${pos.y + 4}" font-size="11" font-family="'Plus Jakarta Sans', sans-serif" 
                      text-anchor="middle" fill="${textColor}" font-weight="800">${idx}</text>
                <text x="${pos.x}" y="${pos.y + 30}" font-size="9" font-family="'Plus Jakarta Sans', sans-serif" 
                      text-anchor="middle" fill="#64748b" font-weight="600">${pos.label.split(':')[1] || pos.label}</text>
            </g>`;
        });

        container.innerHTML = `
        <div class="result-callout-card success">
            <div class="result-callout-title">Delivered Intermodal Market Throughput</div>
            <div class="result-callout-value">${maxFlow} Metric Tons / Day</div>
            <div class="result-callout-meta">
                <span style="color:#ef4444; font-weight:700;">■ Red = Saturated Bottlenecks</span> • 
                <span style="color:#2563eb; font-weight:700;">■ Blue = Active Freight Flow</span>
            </div>
        </div>
        <div class="svg-render-area" style="background:#f8fafc;">
            <svg class="svg-canvas" viewBox="0 0 ${width} ${height}">
                ${svgEdges}
                ${svgNodes}
            </svg>
        </div>`;
    },

    // -------------------------------------------------------------------------
    // MODULE 4: Bipartite Matching Table
    // -------------------------------------------------------------------------
    renderBipartiteMatchingGraph(containerId, allocatedPairs, totalSuppliers, totalWarehouses) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
        <div class="result-callout-card success">
            <div class="result-callout-title">Optimal Certified Facility Assignment</div>
            <div class="result-callout-value">${allocatedPairs.length} Active Farmer-Hub Connections</div>
            <div class="result-callout-meta">Every agricultural producer mapped to temperature-certified facility without overflow.</div>
        </div>
        <div class="enterprise-table-wrap">
            <table class="enterprise-table">
                <thead>
                    <tr>
                        <th>Agricultural Producer</th>
                        <th>Network Status</th>
                        <th>Certified Cold-Chain Hub</th>
                    </tr>
                </thead>
                <tbody>
                    ${allocatedPairs.map(p => `
                        <tr>
                            <td style="font-weight:700; color:#0f172a;">🌾 ${p.supplierName}</td>
                            <td><span class="badge-clean success">CONNECTED</span></td>
                            <td style="color:#0284c7; font-weight:600;">❄️ ${p.warehouseName}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
    },

    // -------------------------------------------------------------------------
    // MODULE 5: Perishable Conflict Graph (Independent Set vs Vertex Cover)
    // -------------------------------------------------------------------------
    renderConflictGraph(containerId, items, conflictEdges, maxIndepSet, minVertexCover) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const indepLookup = new Set(maxIndepSet.itemIndices || []);

        container.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="result-callout-card success" style="margin-bottom:0;">
                <div class="result-callout-title">Max Independent Set (Safe Co-Storage)</div>
                <div class="result-callout-value">${maxIndepSet.size} Produce Categories</div>
                <div class="result-callout-meta">Can safely share identical shipping reefers without ethylene or chemical spoil.</div>
            </div>
            <div class="result-callout-card danger" style="margin-bottom:0;">
                <div class="result-callout-title">Min Vertex Cover (Isolation Required)</div>
                <div class="result-callout-value">${minVertexCover.size} High-Risk Items</div>
                <div class="result-callout-meta">Must be diverted to isolated negative-pressure chambers.</div>
            </div>
        </div>
        <div class="log-stream-list">
            ${items.map((item, idx) => {
                const isSafe = indepLookup.has(item.id !== undefined ? item.id : idx);
                return `
                <div class="log-entry-item ${isSafe ? 'success' : 'danger'}">
                    <strong>${item.name || item}</strong>: 
                    ${isSafe ? '<span style="color:#047857; font-weight:600;">✓ Safe In-Transit Co-Storage</span>' : '<span style="color:#b91c1c; font-weight:600;">⚠️ Route to Isolation Vault (Conflict Item)</span>'}
                </div>`;
            }).join('')}
        </div>`;
    },

    // -------------------------------------------------------------------------
    // MODULE 6: Blelloch Parallel Scan Timeline & Reservoir
    // -------------------------------------------------------------------------
    renderBlellochTimeline(containerId, hourlyInput, cumulativeOutput) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxVal = Math.max(...(cumulativeOutput || [1]));
        let barsHtml = '';

        (cumulativeOutput || []).forEach((cumVal, hr) => {
            const pct = Math.max(8, ((cumVal / maxVal) * 100).toFixed(0));
            const hourlyVal = hourlyInput[hr] || 0;
            barsHtml += `
            <div style="display:flex; flex-direction:column; align-items:center; flex:1; min-width:26px;">
                <div style="font-size:10px; color:#2563eb; font-family:var(--font-mono); font-weight:700;">${cumVal}</div>
                <div style="width:100%; height:140px; display:flex; align-items:flex-end; background:#f1f5f9; border-radius:4px; margin:4px 0; padding:2px;">
                    <div style="width:100%; height:${pct}%; background:linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius:3px;" 
                         title="Hour ${hr + 1}: +${hourlyVal}T (Cumulative: ${cumVal}T)"></div>
                </div>
                <div style="font-size:10px; color:#64748b; font-family:var(--font-mono); font-weight:600;">H${hr + 1}</div>
            </div>`;
        });

        container.innerHTML = `
        <div class="result-callout-card info">
            <div class="result-callout-title">Work-Efficient Parallel Scan (Blelloch)</div>
            <div class="result-callout-value">24-Hour Cumulative Depletion Curve</div>
            <div class="result-callout-meta">Work: <strong>O(n)</strong> operations • Critical Span: <strong>O(log n)</strong> parallel steps.</div>
        </div>
        <div style="display:flex; gap:6px; align-items:flex-end; padding:16px 12px; background:#ffffff; border:1px solid var(--border-color); border-radius:8px; overflow-x:auto;">
            ${barsHtml}
        </div>`;
    },

    renderReservoirTimeline(containerId, stepLogs, reservoir) {
        const container = document.getElementById(containerId);
        if (!container || !stepLogs) return;

        container.innerHTML = `
        <div class="result-callout-card success">
            <div class="result-callout-title">Extracted IoT Sensor Reservoir (Uniform Probability k = ${reservoir.length})</div>
            <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
                ${reservoir.map(item => `
                    <span class="badge-clean success" style="font-size:12px; font-weight:700;">
                        ❄️ ${item}°C
                    </span>
                `).join('')}
            </div>
            <div class="result-callout-meta" style="margin-top:6px;">
                Guarantees exact 1/N sampling probability without buffering the entire unbounded sensor stream.
            </div>
        </div>
        <div class="log-stream-list" style="max-height: 200px;">
            ${stepLogs.slice(0, 25).map(step => `
            `).join('')}
        </div>`;
    },

    // -------------------------------------------------------------------------
    // PREDICTIVE INTELLIGENCE & FORECASTING VISUALIZERS
    // -------------------------------------------------------------------------
    renderSpoilageGraph(containerId, productData) {
        const container = document.getElementById(containerId);
        if (!container || !productData) return;

        const { product, inputConditions, predictions } = productData;
        const curve = predictions.temperatureCurve || [];
        if (curve.length === 0) return;

        const width = 540;
        const height = 240;
        const pad = { top: 25, right: 30, bottom: 40, left: 50 };
        const plotW = width - pad.left - pad.right;
        const plotH = height - pad.top - pad.bottom;

        const minTemp = curve[0].temperature;
        const maxTemp = curve[curve.length - 1].temperature;

        const getX = (t) => pad.left + ((t - minTemp) / (maxTemp - minTemp)) * plotW;
        const getY = (p) => pad.top + plotH - (p / 100) * plotH;

        // Path generator
        let pathD = `M ${getX(curve[0].temperature)} ${getY(curve[0].spoilagePercent)}`;
        let areaD = `M ${getX(curve[0].temperature)} ${pad.top + plotH} L ${getX(curve[0].temperature)} ${getY(curve[0].spoilagePercent)}`;

        for (let i = 1; i < curve.length; i++) {
            const x = getX(curve[i].temperature);
            const y = getY(curve[i].spoilagePercent);
            pathD += ` L ${x} ${y}`;
            areaD += ` L ${x} ${y}`;
        }
        areaD += ` L ${getX(curve[curve.length - 1].temperature)} ${pad.top + plotH} Z`;

        // Current operating point
        const curX = getX(inputConditions.currentTemp);
        const curY = getY(predictions.spoilageProbabilityPercent);

        let svg = `
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:16px; box-shadow:var(--shadow-card);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div>
                    <span style="font-size:13px; font-weight:700; color:var(--text-primary);">${product.icon} Arrhenius Spoilage Kinetic Curve</span>
                    <span style="font-size:11px; color:var(--text-muted); margin-left:8px;">${product.name}</span>
                </div>
                <span class="badge-clean ${predictions.riskBadgeClass}" style="font-size:11px;">
                    ${predictions.spoilageProbabilityPercent}% Spoilage Risk
                </span>
            </div>
            <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; display:block; overflow:visible;">
                <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#10b981" />
                        <stop offset="45%" stop-color="#f59e0b" />
                        <stop offset="100%" stop-color="#f43f5e" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(244, 63, 94, 0.35)" />
                        <stop offset="60%" stop-color="rgba(245, 158, 11, 0.15)" />
                        <stop offset="100%" stop-color="rgba(16, 185, 129, 0.0)" />
                    </linearGradient>
                </defs>

                <!-- Gridlines -->
                <line x1="${pad.left}" y1="${getY(0)}" x2="${pad.left + plotW}" y2="${getY(0)}" stroke="var(--border-subtle)" stroke-width="1" />
                <line x1="${pad.left}" y1="${getY(25)}" x2="${pad.left + plotW}" y2="${getY(25)}" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="${pad.left}" y1="${getY(50)}" x2="${pad.left + plotW}" y2="${getY(50)}" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="${pad.left}" y1="${getY(75)}" x2="${pad.left + plotW}" y2="${getY(75)}" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="${pad.left}" y1="${getY(100)}" x2="${pad.left + plotW}" y2="${getY(100)}" stroke="var(--border-subtle)" stroke-width="1" />

                <!-- Safe / Danger Shaded Zones on Y axis -->
                <rect x="${pad.left}" y="${getY(100)}" width="${plotW}" height="${plotH * 0.3}" fill="rgba(244, 63, 94, 0.06)" />
                <rect x="${pad.left}" y="${getY(30)}" width="${plotW}" height="${plotH * 0.3}" fill="rgba(16, 185, 129, 0.06)" />

                <!-- Curve Area Fill -->
                <path d="${areaD}" fill="url(#areaGradient)" />

                <!-- Main Curve Line -->
                <path d="${pathD}" fill="none" stroke="url(#curveGradient)" stroke-width="3" stroke-linecap="round" />

                <!-- Axis Labels -->
                <text x="${pad.left - 10}" y="${getY(100) + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="var(--font-mono)">100%</text>
                <text x="${pad.left - 10}" y="${getY(50) + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="var(--font-mono)">50%</text>
                <text x="${pad.left - 10}" y="${getY(0) + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="var(--font-mono)">0%</text>

                <text x="${getX(minTemp)}" y="${pad.top + plotH + 20}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-family="var(--font-mono)">${minTemp}°C</text>
                <text x="${getX((minTemp + maxTemp) / 2)}" y="${pad.top + plotH + 20}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-family="var(--font-mono)">Storage Temp</text>
                <text x="${getX(maxTemp)}" y="${pad.top + plotH + 20}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-family="var(--font-mono)">${maxTemp}°C</text>

                <!-- Current Operating Temp Indicator -->
                <line x1="${curX}" y1="${pad.top}" x2="${curX}" y2="${pad.top + plotH}" stroke="var(--brand-primary)" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.8" />
                <circle cx="${curX}" cy="${curY}" r="7" fill="var(--brand-primary)" stroke="#ffffff" stroke-width="2" />
                <circle cx="${curX}" cy="${curY}" r="12" fill="none" stroke="var(--brand-primary)" stroke-width="1.5" opacity="0.5">
                    <animate attributeName="r" values="7;16;7" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>

                <!-- Tooltip Callout Pin -->
                <g transform="translate(${Math.min(width - 110, Math.max(pad.left + 10, curX - 50))}, ${Math.max(pad.top + 5, curY - 32)})">
                    <rect width="100" height="24" rx="4" fill="var(--bg-dark-surface)" stroke="var(--brand-primary)" stroke-width="1" />
                    <text x="50" y="16" fill="var(--text-on-dark)" font-size="10" font-weight="700" text-anchor="middle" font-family="var(--font-mono)">
                        ${inputConditions.currentTemp}°C • ${predictions.spoilageProbabilityPercent}% Risk
                    </text>
                </g>
            </svg>
        </div>`;

        container.innerHTML = svg;
    },

    renderRiskometer(containerId, spoilagePercent, riskLevel) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const val = Math.min(100, Math.max(0, Number(spoilagePercent) || 0));
        // Dial angle from -120 deg (0%) to +120 deg (100%)
        const angle = -120 + (val / 100) * 240;

        let riskColor = '#10b981';
        let statusText = 'Optimal Freshness';
        if (val >= 65) {
            riskColor = '#f43f5e';
            statusText = 'Critical Spoilage Danger';
        } else if (val >= 30) {
            riskColor = '#f59e0b';
            statusText = 'Accelerated Respiration';
        } else if (val >= 15) {
            riskColor = '#06b6d4';
            statusText = 'Moderate Cold-Chain Drift';
        }

        const dialSvg = `
        <div style="text-align:center; padding:12px;">
            <svg viewBox="0 0 220 150" style="width:100%; max-width:220px; margin:0 auto; display:block;">
                <defs>
                    <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#10b981" />
                        <stop offset="40%" stop-color="#06b6d4" />
                        <stop offset="70%" stop-color="#f59e0b" />
                        <stop offset="100%" stop-color="#f43f5e" />
                    </linearGradient>
                </defs>

                <!-- Background Track Arc -->
                <path d="M 30 130 A 80 80 0 1 1 190 130" fill="none" stroke="var(--bg-muted)" stroke-width="14" stroke-linecap="round" />

                <!-- Gradient Active Arc -->
                <path d="M 30 130 A 80 80 0 1 1 190 130" fill="none" stroke="url(#gaugeGradient)" stroke-width="14" stroke-linecap="round" opacity="0.9" />

                <!-- Center Hub -->
                <circle cx="110" cy="130" r="10" fill="var(--bg-surface-elevated)" stroke="var(--border-color)" stroke-width="3" />
                <circle cx="110" cy="130" r="4" fill="${riskColor}" />

                <!-- Animated Needle -->
                <g transform="translate(110, 130)">
                    <g transform="rotate(${angle})">
                        <polygon points="-3,-10 3,-10 1,-70 -1,-70" fill="${riskColor}" />
                        <circle cx="0" cy="-70" r="3" fill="${riskColor}" />
                    </g>
                </g>

                <!-- Labels -->
                <text x="25" y="145" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)">0%</text>
                <text x="110" y="45" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)" text-anchor="middle">50%</text>
                <text x="195" y="145" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)" text-anchor="end">100%</text>
            </svg>
            <div style="font-size:24px; font-weight:800; color:${riskColor}; font-family:var(--font-mono); margin-top:-10px;">
                ${val}%
            </div>
            <div style="font-size:12px; font-weight:700; color:var(--text-primary); margin-top:2px;">
                ${statusText}
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">
                Risk Classification: <strong>${riskLevel || 'NOMINAL'}</strong>
            </div>
        </div>`;

        container.innerHTML = dialSvg;
    },

    renderDepletionChart(containerId, forecastData) {
        const container = document.getElementById(containerId);
        if (!container || !forecastData || !forecastData.hourlyForecast) return;

        const { hourlyForecast, initialStockTons, productName, hoursToZeroStock, stockoutUrgency } = forecastData;
        const width = 540;
        const height = 240;
        const pad = { top: 25, right: 30, bottom: 40, left: 55 };
        const plotW = width - pad.left - pad.right;
        const plotH = height - pad.top - pad.bottom;

        const maxStock = Math.max(...hourlyForecast.map(h => h.remainingStockTons), initialStockTons);

        const getX = (hr) => pad.left + ((hr - 1) / (hourlyForecast.length - 1)) * plotW;
        const getY = (tons) => pad.top + plotH - (tons / maxStock) * plotH;

        let pathD = `M ${getX(hourlyForecast[0].hour)} ${getY(hourlyForecast[0].remainingStockTons)}`;
        let areaD = `M ${getX(hourlyForecast[0].hour)} ${pad.top + plotH} L ${getX(hourlyForecast[0].hour)} ${getY(hourlyForecast[0].remainingStockTons)}`;

        hourlyForecast.forEach(pt => {
            const x = getX(pt.hour);
            const y = getY(pt.remainingStockTons);
            pathD += ` L ${x} ${y}`;
            areaD += ` L ${x} ${y}`;
        });
        areaD += ` L ${getX(hourlyForecast[hourlyForecast.length - 1].hour)} ${pad.top + plotH} Z`;

        // Safety threshold line (25% of initial stock)
        const thresholdY = getY(initialStockTons * 0.25);

        let svg = `
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:16px; box-shadow:var(--shadow-card);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div>
                    <span style="font-size:13px; font-weight:700; color:var(--text-primary);">📉 24h Inventory Depletion Horizon</span>
                    <span style="font-size:11px; color:var(--text-muted); margin-left:8px;">${productName}</span>
                </div>
                <span class="badge-clean ${hoursToZeroStock < 36 ? 'warning' : 'success'}" style="font-size:11px;">
                    Zero-Stockout: ${hoursToZeroStock} hrs
                </span>
            </div>
            <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; display:block;">
                <defs>
                    <linearGradient id="depletionArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(6, 182, 212, 0.35)" />
                        <stop offset="100%" stop-color="rgba(6, 182, 212, 0.0)" />
                    </linearGradient>
                </defs>

                <!-- Gridlines -->
                <line x1="${pad.left}" y1="${getY(0)}" x2="${pad.left + plotW}" y2="${getY(0)}" stroke="var(--border-subtle)" stroke-width="1" />
                <line x1="${pad.left}" y1="${getY(maxStock * 0.5)}" x2="${pad.left + plotW}" y2="${getY(maxStock * 0.5)}" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="${pad.left}" y1="${getY(maxStock)}" x2="${pad.left + plotW}" y2="${getY(maxStock)}" stroke="var(--border-subtle)" stroke-width="1" />

                <!-- Reorder Threshold Buffer Line -->
                <line x1="${pad.left}" y1="${thresholdY}" x2="${pad.left + plotW}" y2="${thresholdY}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4" />
                <text x="${pad.left + plotW - 5}" y="${thresholdY - 5}" fill="#f59e0b" font-size="9" text-anchor="end" font-weight="600">Reorder Trigger (25%)</text>

                <!-- Area Fill & Main Line -->
                <path d="${areaD}" fill="url(#depletionArea)" />
                <path d="${pathD}" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" />

                <!-- Hourly Dots -->
                ${hourlyForecast.filter((_, idx) => idx % 3 === 0 || idx === hourlyForecast.length - 1).map(pt => `
                    <circle cx="${getX(pt.hour)}" cy="${getY(pt.remainingStockTons)}" r="4" fill="#06b6d4" stroke="#ffffff" stroke-width="1.5" />
                `).join('')}

                <!-- Y Axis Labels -->
                <text x="${pad.left - 10}" y="${getY(maxStock) + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="var(--font-mono)">${maxStock}T</text>
                <text x="${pad.left - 10}" y="${getY(maxStock * 0.5) + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="var(--font-mono)">${(maxStock * 0.5).toFixed(0)}T</text>
                <text x="${pad.left - 10}" y="${getY(0) + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end" font-family="var(--font-mono)">0T</text>

                <!-- X Axis Labels -->
                <text x="${getX(1)}" y="${pad.top + plotH + 20}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-family="var(--font-mono)">H1</text>
                <text x="${getX(12)}" y="${pad.top + plotH + 20}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-family="var(--font-mono)">H12 (Midday)</text>
                <text x="${getX(24)}" y="${pad.top + plotH + 20}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-family="var(--font-mono)">H24</text>
            </svg>
        </div>`;

        container.innerHTML = svg;
    },

    renderMultiCommodityBarChart(containerId, productScorecards) {
        const container = document.getElementById(containerId);
        if (!container || !productScorecards) return;

        const maxDays = Math.max(...productScorecards.map(p => p.predictions.remainingShelfLifeDays), 30);

        let barsHtml = productScorecards.map(item => {
            const days = item.predictions.remainingShelfLifeDays;
            const pct = Math.min(100, Math.max(6, (days / maxDays) * 100));
            const risk = item.predictions.riskLevel;
            let barColor = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
            if (days < 2.0) barColor = 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)';
            else if (days < 7.0) barColor = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
            else if (days < 20.0) barColor = 'linear-gradient(90deg, #06b6d4 0%, #0284c7 100%)';

            return `
            <div style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; font-size:12px;">
                    <span style="font-weight:600; color:var(--text-primary);">
                        ${item.product.icon} ${item.product.name}
                    </span>
                    <span style="font-family:var(--font-mono); font-weight:700; color:var(--text-primary);">
                        ${days} Days Remaining (${item.predictions.spoilageProbabilityPercent}% Spoilage Risk)
                    </span>
                </div>
                <div style="height:10px; background:var(--bg-muted); border-radius:999px; overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:${barColor}; border-radius:999px; transition:width 0.6s cubic-bezier(0.16, 1, 0.3, 1);"></div>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:18px; box-shadow:var(--shadow-card);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h4 style="font-size:14px; font-weight:700; color:var(--text-primary); margin:0;">
                    📊 Comparative Commodity Shelf-Life Benchmark
                </h4>
                <span style="font-size:11px; color:var(--text-muted);">Arrhenius Kinetic Forecast</span>
            </div>
            ${barsHtml}
        </div>`;
    },

    renderCommodityCardsGrid(containerId, productScorecards, onSelectSkuCallback) {
        const container = document.getElementById(containerId);
        if (!container || !productScorecards) return;

        let cardsHtml = productScorecards.map(item => {
            const { product, inputConditions, predictions } = item;
            return `
            <div class="commodity-score-card ${predictions.riskBadgeClass}" data-product-id="${product.id}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:26px;">${product.icon}</span>
                        <div>
                            <div style="font-weight:700; font-size:13px; color:var(--text-primary); line-height:1.2;">${product.name}</div>
                            <div style="font-size:11px; color:var(--text-muted);">${product.category} • ₹${product.pricePerKg}/kg</div>
                        </div>
                    </div>
                    <span class="badge-clean ${predictions.riskBadgeClass}" style="font-size:10px; padding:3px 8px;">
                        ${predictions.riskLevel}
                    </span>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; background:var(--bg-subtle); padding:8px 10px; border-radius:8px; font-size:11px;">
                    <div>
                        <div style="color:var(--text-muted);">Current Temp:</div>
                        <div style="font-weight:700; font-family:var(--font-mono); color:var(--text-primary);">${inputConditions.currentTemp}°C</div>
                    </div>
                    <div>
                        <div style="color:var(--text-muted);">Optimal Range:</div>
                        <div style="font-weight:600; font-family:var(--font-mono); color:var(--brand-primary);">${inputConditions.optimalRange}</div>
                    </div>
                    <div>
                        <div style="color:var(--text-muted);">Shelf Life Left:</div>
                        <div style="font-weight:700; font-family:var(--font-mono); color:${predictions.remainingShelfLifeDays < 3 ? '#f43f5e' : '#10b981'};">
                            ${predictions.remainingShelfLifeDays} Days
                        </div>
                    </div>
                    <div>
                        <div style="color:var(--text-muted);">Value at Risk:</div>
                        <div style="font-weight:700; font-family:var(--font-mono); color:var(--text-primary);">₹${(predictions.predictedLossRupees || predictions.predictedLossDollars || 0).toLocaleString('en-IN')}</div>
                    </div>
                </div>

                <button class="btn-brand-secondary btn-simulate-sku" data-product-id="${product.id}" type="button" style="width:100%; font-size:11px; padding:6px 10px; justify-content:center;">
                    <span>🔮 Simulate & Predict SKU</span>
                </button>
            </div>`;
        }).join('');

        container.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:14px;">
            ${cardsHtml}
        </div>`;

        // Wire click handlers for "Simulate SKU"
        container.querySelectorAll('.btn-simulate-sku').forEach(btn => {
            btn.addEventListener('click', () => {
                const pId = btn.getAttribute('data-product-id');
                if (typeof onSelectSkuCallback === 'function') {
                    onSelectSkuCallback(pId);
                }
            });
        });
    },

    renderUniversalSummary(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data) return;

        const { fleetKPIs, priorityActions, bottleneckPredictions, hazardPredictions } = data;

        let actionsHtml = (priorityActions || []).map(act => `
            <div style="display:flex; align-items:flex-start; gap:12px; padding:10px 12px; background:var(--bg-subtle); border-radius:8px; margin-bottom:8px; border-left:3px solid var(--brand-primary);">
                <span class="badge-clean ${act.priority.includes('P1') ? 'danger' : 'info'}" style="font-size:10px; font-weight:700; white-space:nowrap;">
                    ${act.priority}
                </span>
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:12px; color:var(--text-primary);">${act.target}</div>
                    <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${act.action}</div>
                    <div style="font-size:11px; color:var(--brand-emerald-dark); font-weight:600; margin-top:2px;">✦ Expected Impact: ${act.impact}</div>
                </div>
            </div>
        `).join('');

        let bottlenecksHtml = (bottleneckPredictions?.criticalBottleneckCorridors || []).map(corridor => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--bg-subtle); border-radius:6px; margin-bottom:6px; font-size:11px;">
                <div>
                    <strong>${corridor.from} ➔ ${corridor.to}</strong>
                    <div style="color:var(--text-muted);">Flow: ${corridor.utilizedFlowTons}/${corridor.capacityTons} MT (${corridor.saturationPercent}% saturated)</div>
                </div>
                <span class="badge-clean danger" style="font-size:10px;">+${corridor.predictedDelayHours}h Delay</span>
            </div>
        `).join('');

        let hazardsHtml = (hazardPredictions || []).map(hz => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--bg-subtle); border-radius:6px; margin-bottom:6px; font-size:11px;">
                <div>
                    <strong>${hz.reportTitle}</strong>
                    <div style="color:var(--text-muted);">${hz.inspector} • ${hz.date}</div>
                </div>
                <span class="badge-clean ${hz.verdictBadge}" style="font-size:10px;">${hz.clearanceStatus.replace(/_/g, ' ')}</span>
            </div>
        `).join('');

        container.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:18px; box-shadow:var(--shadow-card);">
                <h4 style="font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:12px;">
                    🛡️ AI Prescriptive Logistics Directives
                </h4>
                ${actionsHtml}
            </div>

            <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:18px; box-shadow:var(--shadow-card);">
                <h4 style="font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:12px;">
                    🚛 Critical Bottlenecks & Bio-Hazard Audits
                </h4>
                <div style="margin-bottom:12px;">
                    <div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">SATURATED TRANSIT CONDUITS:</div>
                    ${bottlenecksHtml || '<div style="color:var(--text-muted); font-size:11px;">All corridors operating below 90% capacity.</div>'}
                </div>
                <div>
                    <div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">LAB INSPECTION CLEARANCE AUDITS:</div>
                    ${hazardsHtml}
                </div>
            </div>
        </div>`;
    },

    // -------------------------------------------------------------------------
    // DATASET & FAST-FOOD CHAINS VISUALIZERS (TOP 50 CSV & INDIA SYNC)
    // -------------------------------------------------------------------------
    renderDatasetVisuals(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data) return;

        const { top10BySales, totalSalesFormattedINR, totalUnitsFormatted, franchiseSharePercent, categoryStats } = data;
        const maxSales = top10BySales && top10BySales.length > 0 ? top10BySales[0].salesCroresINR : 1;

        const barsHtml = (top10BySales || []).map((c, idx) => {
            const pct = Math.max(12, ((c.salesCroresINR / maxSales) * 100).toFixed(1));
            return `
            <div style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; margin-bottom:4px;">
                    <span style="font-weight:700; color:var(--text-primary);">
                        #${idx + 1} ${c.name} ${c.activeInIndia ? '<span class="badge-clean success" style="font-size:9px; padding:1px 5px;">🇮🇳 Active in India</span>' : ''}
                    </span>
                    <span style="font-family:var(--font-mono); font-weight:700; color:var(--brand-primary);">
                        ${c.salesFormattedINR} <span style="font-size:11px; color:var(--text-muted);">($${c.salesMillionUSD}M)</span>
                    </span>
                </div>
                <div style="height:10px; background:var(--bg-muted); border-radius:999px; overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); border-radius:999px; transition:width 0.6s ease;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-top:2px;">
                    <span>${c.foodCategory} • ${c.totalUnits.toLocaleString('en-IN')} Outlets</span>
                    <span>Franchised: ${c.franchiseRatioPercent}%</span>
                </div>
            </div>`;
        }).join('');

        const categoryPills = Object.keys(categoryStats || {}).map(cat => {
            const stat = categoryStats[cat];
            return `
            <div style="background:var(--bg-subtle); padding:10px 12px; border-radius:8px; border:1px solid var(--border-color);">
                <div style="font-size:11px; font-weight:700; color:var(--text-muted);">${cat.toUpperCase()}</div>
                <div style="font-size:16px; font-weight:800; color:var(--text-primary); margin-top:2px;">
                    ₹${stat.totalSalesCrores.toLocaleString('en-IN')} Cr
                </div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                    ${stat.totalUnits.toLocaleString('en-IN')} outlets (${stat.count} brands)
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
        <div style="display:grid; grid-template-columns:1.3fr 1fr; gap:20px;">
            <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:20px; box-shadow:var(--shadow-card);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h4 style="font-size:14px; font-weight:700; color:var(--text-primary); margin:0;">
                        🏆 Top 10 Food Chains by Systemwide Revenue (in ₹ Crores)
                    </h4>
                    <span class="badge-clean info">Synced CSV Dataset</span>
                </div>
                ${barsHtml}
            </div>

            <div style="display:flex; flex-direction:column; gap:16px;">
                <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:20px; box-shadow:var(--shadow-card);">
                    <h4 style="font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:12px;">
                        📊 Category Revenue & Store Footprint
                    </h4>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        ${categoryPills}
                    </div>
                </div>

                <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:12px; padding:16px; box-shadow:var(--shadow-card);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size:11px; font-weight:700; color:var(--text-muted);">FRANCHISE VS COMPANY MIX</div>
                            <div style="font-size:18px; font-weight:800; color:var(--text-primary); margin-top:2px;">
                                ${franchiseSharePercent}% Franchised
                            </div>
                        </div>
                        <span class="badge-clean success">High Operating Leverage</span>
                    </div>
                    <div style="height:10px; background:var(--bg-muted); border-radius:999px; overflow:hidden; margin-top:10px;">
                        <div style="height:100%; width:${franchiseSharePercent}%; background:linear-gradient(90deg, #10b981 0%, #06b6d4 100%);"></div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    renderDatasetTable(containerId, chains, onSearchFilterCallback) {
        const container = document.getElementById(containerId);
        if (!container || !chains) return;

        let rowsHtml = chains.map(c => `
            <tr>
                <td><span class="badge-clean" style="font-weight:700;">#${c.rank}</span></td>
                <td style="font-weight:700; color:var(--text-primary);">
                    ${c.name}
                    ${c.activeInIndia ? '<span class="badge-clean success" style="font-size:9px; margin-left:4px;">🇮🇳 India Presence</span>' : ''}
                </td>
                <td><span class="badge-clean info">${c.foodCategory}</span></td>
                <td style="font-weight:700; font-family:var(--font-mono); color:var(--brand-primary);">${c.salesFormattedINR}</td>
                <td style="font-family:var(--font-mono); color:var(--text-secondary);">${c.avgSalesFormattedINR}</td>
                <td><strong>${c.totalUnits.toLocaleString('en-IN')}</strong></td>
                <td>${c.franchiseRatioPercent}%</td>
                <td>
                    <button class="btn-brand-secondary btn-test-chain-co1" data-chain-name="${c.name}" type="button" style="font-size:10px; padding:4px 8px;" title="Analyze string matches in CO1">
                        🔍 Search in CO1
                    </button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
        <div class="enterprise-table-wrap" style="max-height:420px;">
            <table class="enterprise-table">
                <thead>
                    <tr>
                        <th style="width:60px;">Rank</th>
                        <th>Fast-Food Brand</th>
                        <th>Category</th>
                        <th>Sales (₹ INR)</th>
                        <th>Avg / Store</th>
                        <th>Total Stores</th>
                        <th>Franchise %</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>`;

        // Wire click handlers
        container.querySelectorAll('.btn-test-chain-co1').forEach(btn => {
            btn.addEventListener('click', () => {
                const chainName = btn.getAttribute('data-chain-name');
                if (typeof onSearchFilterCallback === 'function') {
                    onSearchFilterCallback(chainName);
                }
            });
        });
    },

    // -------------------------------------------------------------------------
    // CO1: Pathogen & Fast-Food Contaminant Frequency Bar Chart
    // -------------------------------------------------------------------------
    renderCO1PathogenStats(containerId, alertsCount = 4) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const pathogens = [
            { name: 'Salmonella enterica', count: 3, risk: 'High', color: '#f43f5e' },
            { name: 'Listeria monocytogenes', count: 1, risk: 'Critical', color: '#e11d48' },
            { name: 'Escherichia coli (STEC)', count: 2, risk: 'High', color: '#f59e0b' },
            { name: 'Aflatoxin B1 Fungal', count: 1, risk: 'Moderate', color: '#06b6d4' },
            { name: 'Histamine Toxicity', count: 0, risk: 'Clear', color: '#10b981' }
        ];

        let bars = pathogens.map(p => `
            <div style="margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
                    <span style="font-weight:600; color:var(--text-primary);">${p.name}</span>
                    <span style="font-weight:700; color:${p.color};">${p.count} Alert(s) [${p.risk}]</span>
                </div>
                <div style="height:6px; background:var(--bg-muted); border-radius:999px; overflow:hidden;">
                    <div style="height:100%; width:${p.count * 25}%; background:${p.color}; border-radius:999px;"></div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
        <div style="background:var(--bg-subtle); padding:12px 14px; border-radius:8px; border:1px solid var(--border-color); margin-top:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:11px; font-weight:700; color:var(--text-muted);">🔬 FSSAI MICROBIAL THREAT BREAKDOWN</span>
                <span class="badge-clean info" style="font-size:10px;">Live Aho-Corasick Profile</span>
            </div>
            ${bars}
        </div>`;
    },

    // -------------------------------------------------------------------------
    // CO6: Highway Reefer IoT 24h Telemetry Line Chart (NH44 Corridor)
    // -------------------------------------------------------------------------
    renderCO6HighwayTelemetry(containerId, readings) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = readings || [2.2, 2.4, 2.1, 2.5, 3.2, 3.8, 4.1, 3.9, 2.8, 2.4, 2.2, 2.0, 1.9, 2.3, 2.7, 3.4, 4.3, 4.8, 3.6, 2.9, 2.5, 2.2, 2.1, 2.0];
        const width = 520;
        const height = 150;
        const padding = 28;

        const minTemp = 0.5;
        const maxTemp = 5.5;

        const getX = (idx) => padding + (idx / (data.length - 1)) * (width - padding * 2);
        const getY = (val) => height - padding - ((val - minTemp) / (maxTemp - minTemp)) * (height - padding * 2);

        let pathD = `M ${getX(0)} ${getY(data[0])}`;
        let pointsSvg = '';

        data.forEach((val, i) => {
            const x = getX(i);
            const y = getY(val);
            if (i > 0) pathD += ` L ${x} ${y}`;
            const isAlert = val > 4.0;
            pointsSvg += `
                <circle cx="${x}" cy="${y}" r="${isAlert ? 4 : 2.5}" fill="${isAlert ? '#f43f5e' : '#10b981'}" />
            `;
        });

        // Safe zone line (4°C threshold)
        const thresholdY = getY(4.0);

        container.innerHTML = `
        <div style="background:var(--bg-subtle); border-radius:10px; border:1px solid var(--border-color); padding:14px; margin-top:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:12px; font-weight:700; color:var(--text-primary);">
                    🚛 NH44 Delhi-Mumbai Reefer Temperature Telemetry (24-Hour IoT Stream)
                </span>
                <span class="badge-clean success" style="font-size:10px;">FSSAI Safe Limit: 4.0°C</span>
            </div>
            <svg viewBox="0 0 ${width} ${height}" style="width:100%; max-height:150px; display:block;">
                <!-- Threshold Warning Line -->
                <line x1="${padding}" y1="${thresholdY}" x2="${width - padding}" y2="${thresholdY}" stroke="#f43f5e" stroke-dasharray="4,4" stroke-width="1.5" />
                <text x="${width - padding - 4}" y="${thresholdY - 4}" fill="#f43f5e" font-size="9" text-anchor="end" font-weight="700">4.0°C FSSAI CRITICAL BOUNDARY</text>

                <!-- Temperature Polyline -->
                <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="2.5" />
                ${pointsSvg}

                <!-- Axes -->
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border-color)" stroke-width="1" />
                <text x="${padding}" y="${height - 10}" fill="var(--text-muted)" font-size="9">Hour 1 (Punjab Departure)</text>
                <text x="${width - padding}" y="${height - 10}" fill="var(--text-muted)" font-size="9" text-anchor="end">Hour 24 (Mumbai Terminal)</text>
            </svg>
        </div>`;
    }
};

window.Visualizers = Visualizers;

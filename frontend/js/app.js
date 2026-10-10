/**
 * FoodChain Enterprise Application Coordinator
 * Professional event wiring, interactive slider/dropdown controls, and async REST API triggers.
 * Clean, modern light SaaS design integration.
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitcher();
    initPredictiveHub();
    initNavigation();
    initInteractiveControls();
    initActionHandlers();
    initBenchmarkModal();
    initCatalogExplorer();
    initDatasetExplorer();
    checkApiConnection();

    // Trigger initial Universal Prediction and CO1 microbial stats on load
    setTimeout(() => {
        runUniversalPrediction();
        Visualizers.renderCO1PathogenStats('m1-pathogen-stats-workbench', 4);
    }, 250);
});

// -----------------------------------------------------------------------------
// AMBIENT LIGHTING STUDIO, COLOR THEMES & BRIGHTNESS CONTROLS
// -----------------------------------------------------------------------------
function initThemeSwitcher() {
    const savedTheme = localStorage.getItem('foodchain_theme') || 'cosmic';
    const savedMode = localStorage.getItem('foodchain_mode') || 'dark';
    const savedBrightness = localStorage.getItem('foodchain_brightness') || '100';

    applyTheme(savedTheme);
    applyMode(savedMode);
    applyBrightness(savedBrightness);

    // Sidebar Drawer Elements
    const sidebar = document.getElementById('ambient-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const btnToggle = document.getElementById('btn-toggle-sidebar');
    const btnNavToggle = document.getElementById('btn-nav-toggle-sidebar');
    const btnClose = document.getElementById('btn-close-sidebar');

    const openSidebar = () => {
        sidebar?.classList.add('open');
        backdrop?.classList.add('open');
    };

    const closeSidebar = () => {
        sidebar?.classList.remove('open');
        backdrop?.classList.remove('open');
    };

    btnToggle?.addEventListener('click', openSidebar);
    btnNavToggle?.addEventListener('click', openSidebar);
    btnClose?.addEventListener('click', closeSidebar);
    backdrop?.addEventListener('click', closeSidebar);

    // Keyboard ESC to close sidebar
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
    });

    // Dark / Light Mode Switchers
    const btnDark = document.getElementById('btn-mode-dark');
    const btnLight = document.getElementById('btn-mode-light');

    btnDark?.addEventListener('click', () => applyMode('dark'));
    btnLight?.addEventListener('click', () => applyMode('light'));

    // Brightness Slider
    const brightnessSlider = document.getElementById('sidebar-brightness-slider');

    if (brightnessSlider) {
        brightnessSlider.value = savedBrightness;
        brightnessSlider.addEventListener('input', (e) => {
            applyBrightness(e.target.value);
        });
    }

    // Ambient Lighting Theme Cards
    const ambientCards = document.querySelectorAll('.ambient-theme-card');
    ambientCards.forEach(card => {
        card.addEventListener('click', () => {
            const theme = card.getAttribute('data-theme-set');
            if (theme) applyTheme(theme);
        });
    });

    // Custom Color Accent Picker
    const colorPicker = document.getElementById('sidebar-color-picker');
    colorPicker?.addEventListener('input', (e) => {
        const val = e.target.value;
        document.documentElement.style.setProperty('--brand-primary', val);
        document.documentElement.style.setProperty('--glow-color', val + '55');
        document.documentElement.style.setProperty('--ambient-glow-color', val + '33');
    });

    // Legacy theme controls fallback (if present in DOM)
    const swatches = document.querySelectorAll('.theme-swatch-btn');
    swatches.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme-set');
            if (theme) applyTheme(theme);
        });
    });
    const selectDropdown = document.getElementById('theme-selector');
    selectDropdown?.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });
}

function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('foodchain_theme', themeName);

    if (themeName === 'white') {
        applyMode('light');
    }

    // Update active state on ambient sidebar theme cards
    document.querySelectorAll('.ambient-theme-card').forEach(card => {
        if (card.getAttribute('data-theme-set') === themeName) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    // Update legacy swatch buttons if any
    document.querySelectorAll('.theme-swatch-btn').forEach(btn => {
        if (btn.getAttribute('data-theme-set') === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const selectDropdown = document.getElementById('theme-selector');
    if (selectDropdown && selectDropdown.value !== themeName) {
        selectDropdown.value = themeName;
    }
}

function applyMode(mode) {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('foodchain_mode', mode);

    const btnDark = document.getElementById('btn-mode-dark');
    const btnLight = document.getElementById('btn-mode-light');

    if (mode === 'light') {
        btnLight?.classList.add('active');
        btnDark?.classList.remove('active');
    } else {
        btnDark?.classList.add('active');
        btnLight?.classList.remove('active');
    }
}

function applyBrightness(val) {
    const num = Number(val) || 100;
    const factor = (num / 100).toFixed(2);
    document.documentElement.style.setProperty('--display-brightness', factor);
    localStorage.setItem('foodchain_brightness', num);

    const brightnessVal = document.getElementById('sidebar-brightness-val');
    if (brightnessVal) {
        brightnessVal.textContent = `${num}%`;
    }
}

// -----------------------------------------------------------------------------
// PREDICTIVE INTELLIGENCE & FORECASTING HUB
// -----------------------------------------------------------------------------
const SKU_DEFAULT_TEMPS = {
    'PRD-101': 2.5,
    'PRD-102': 10.0,
    'PRD-103': 2.0,
    'PRD-104': -0.5,
    'PRD-105': 12.0,
    'PRD-106': 16.0,
    'PRD-107': 1.5,
    'PRD-108': -18.0
};

function initPredictiveHub() {
    const tempSlider = document.getElementById('sim-temp-slider');
    const tempDisplay = document.getElementById('sim-temp-val');
    const humiditySlider = document.getElementById('sim-humidity-slider');
    const humidityDisplay = document.getElementById('sim-humidity-val');
    const hoursSlider = document.getElementById('sim-hours-slider');
    const hoursDisplay = document.getElementById('sim-hours-val');
    const skuSelect = document.getElementById('sim-sku-select');
    const ethyleneToggle = document.getElementById('sim-ethylene-toggle');
    const btnRunSim = document.getElementById('btn-run-sim');
    const btnPredictAll = document.getElementById('btn-predict-all-main');
    const btnReset = document.getElementById('btn-reset-simulation');

    tempSlider?.addEventListener('input', () => {
        if (tempDisplay) tempDisplay.textContent = `${tempSlider.value}°C`;
    });

    humiditySlider?.addEventListener('input', () => {
        if (humidityDisplay) humidityDisplay.textContent = `${humiditySlider.value}%`;
    });

    hoursSlider?.addEventListener('input', () => {
        if (hoursDisplay) hoursDisplay.textContent = `${hoursSlider.value} hrs`;
    });

    skuSelect?.addEventListener('change', () => {
        const pId = skuSelect.value;
        if (SKU_DEFAULT_TEMPS[pId] !== undefined && tempSlider && tempDisplay) {
            tempSlider.value = SKU_DEFAULT_TEMPS[pId];
            tempDisplay.textContent = `${tempSlider.value}°C`;
        }
        const badge = document.getElementById('sim-product-badge');
        if (badge) badge.textContent = `${pId} Selected`;
        runSingleSkuSimulation();
    });

    btnRunSim?.addEventListener('click', () => {
        runSingleSkuSimulation();
    });

    btnPredictAll?.addEventListener('click', () => {
        runUniversalPrediction();
    });

    btnReset?.addEventListener('click', () => {
        if (skuSelect) skuSelect.value = 'PRD-101';
        if (tempSlider) {
            tempSlider.value = 2.5;
            if (tempDisplay) tempDisplay.textContent = '2.5°C';
        }
        if (humiditySlider) {
            humiditySlider.value = 85;
            if (humidityDisplay) humidityDisplay.textContent = '85%';
        }
        if (hoursSlider) {
            hoursSlider.value = 12;
            if (hoursDisplay) hoursDisplay.textContent = '12 hrs';
        }
        if (ethyleneToggle) ethyleneToggle.checked = false;
        runUniversalPrediction();
    });
}

async function runSingleSkuSimulation(productIdOverride) {
    const skuSelect = document.getElementById('sim-sku-select');
    const tempSlider = document.getElementById('sim-temp-slider');
    const humiditySlider = document.getElementById('sim-humidity-slider');
    const hoursSlider = document.getElementById('sim-hours-slider');
    const ethyleneToggle = document.getElementById('sim-ethylene-toggle');

    const productId = productIdOverride || skuSelect?.value || 'PRD-101';
    if (skuSelect && skuSelect.value !== productId) {
        skuSelect.value = productId;
        const badge = document.getElementById('sim-product-badge');
        if (badge) badge.textContent = `${productId} Selected`;
        if (SKU_DEFAULT_TEMPS[productId] !== undefined && tempSlider) {
            tempSlider.value = SKU_DEFAULT_TEMPS[productId];
            const tempDisplay = document.getElementById('sim-temp-val');
            if (tempDisplay) tempDisplay.textContent = `${tempSlider.value}°C`;
        }
    }

    const temperature = tempSlider ? Number(tempSlider.value) : 2.5;
    const humidity = humiditySlider ? Number(humiditySlider.value) : 85;
    const transitHours = hoursSlider ? Number(hoursSlider.value) : 12;
    const ethyleneCoLocated = Boolean(ethyleneToggle?.checked);

    try {
        const [spoilageRes, depletionRes] = await Promise.all([
            FoodChainAPI.predictSpoilage({ productId, temperature, humidity, transitHours, ethyleneCoLocated }),
            FoodChainAPI.predictDepletion(productId, 24)
        ]);

        if (spoilageRes?.data) {
            const d = spoilageRes.data;
            Visualizers.renderRiskometer('sim-riskometer-wrap', d.predictions.spoilageProbabilityPercent, d.predictions.riskLevel);
            Visualizers.renderSpoilageGraph('sim-spoilage-chart-wrap', d);

            const dirWrap = document.getElementById('sim-directive-wrap');
            if (dirWrap) {
                dirWrap.innerHTML = `
                <div class="result-callout-card ${d.predictions.riskBadgeClass}" style="margin-bottom:0;">
                    <div class="result-callout-title">Prescriptive Recommendation</div>
                    <div style="font-size:12px; font-weight:700; color:var(--text-primary); margin:4px 0;">
                        ${d.predictions.recommendation}
                    </div>
                    <div class="result-callout-meta">
                        Remaining Shelf-Life: <strong>${d.predictions.remainingShelfLifeDays} days (${d.predictions.remainingShelfLifeHours} hrs)</strong> • Financial Exposure: <strong>₹${(d.predictions.predictedLossRupees || d.predictions.predictedLossDollars || 0).toLocaleString('en-IN')}</strong>
                    </div>
                </div>`;
            }
        }

        if (depletionRes?.data) {
            Visualizers.renderDepletionChart('sim-depletion-chart-wrap', depletionRes.data);
        }
    } catch (err) {
        console.error('[Single SKU Prediction Error]', err);
    }
}

async function runUniversalPrediction() {
    const btn = document.getElementById('btn-predict-all-main');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = `<span class="loader-spin"></span> <span>Running AI Predictive Models...</span>`;
        btn.disabled = true;
    }

    try {
        const res = await FoodChainAPI.predictAll();
        if (res && res.data) {
            const data = res.data;

            // Update KPIs
            const kpiHealth = document.getElementById('kpi-fleet-health');
            const kpiLoss = document.getElementById('kpi-val-at-risk');
            const kpiDays = document.getElementById('kpi-freshness-days');
            const kpiAlerts = document.getElementById('kpi-hazard-alerts');

            if (kpiHealth) kpiHealth.textContent = `${data.fleetKPIs.fleetHealthIndex}%`;
            if (kpiLoss) kpiLoss.textContent = data.fleetKPIs.totalValueAtRiskFormattedINR || `₹${(data.fleetKPIs.totalValueAtRiskRupees || data.fleetKPIs.totalValueAtRiskDollars || 0).toLocaleString('en-IN')}`;
            if (kpiDays) kpiDays.textContent = `${data.fleetKPIs.averageRemainingShelfLifeDays} Days`;
            if (kpiAlerts) {
                const count = data.fleetKPIs.criticalAttentionItemsCount;
                kpiAlerts.textContent = count > 0 ? `${count} Active Risk` : '0 Critical';
                kpiAlerts.style.color = count > 0 ? '#f43f5e' : '#10b981';
            }

            // Render visual charts
            Visualizers.renderMultiCommodityBarChart('predict-benchmark-bars-wrap', data.productScorecards);

            Visualizers.renderCommodityCardsGrid('predict-scorecards-grid-wrap', data.productScorecards, (selectedSkuId) => {
                runSingleSkuSimulation(selectedSkuId);
                const predSec = document.getElementById('predict-section');
                if (predSec) {
                    window.scrollTo({ top: predSec.offsetTop - 60, behavior: 'smooth' });
                }
            });

            Visualizers.renderUniversalSummary('predict-directives-grid-wrap', data);

            // Also refresh active simulation preview
            runSingleSkuSimulation();
        }
    } catch (err) {
        console.error('[Universal Prediction Error]', err);
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

// -----------------------------------------------------------------------------
// NAVIGATION TABS
// -----------------------------------------------------------------------------
function initNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn, .tab-nav-item');
    const sections = document.querySelectorAll('.module-section, .module-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            tabButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            const targetSec = document.getElementById(targetId);
            if (targetSec) {
                targetSec.classList.add('active');
                window.scrollTo({ top: targetSec.offsetTop - 90, behavior: 'smooth' });
            }
        });
    });
}

// -----------------------------------------------------------------------------
// SLIDERS & PRESET DROPDOWNS
// -----------------------------------------------------------------------------
const AUDIT_FILES = {
    spinach: `FSSAI AUDIT SUMMARY: Punjab Agri-Farmers Producer Co-op, Lot #PLK-982-PB. 
Standard bacteriological swab tests were conducted across washing flumes and cold-storage partitions. 
RESULTS: Zero detection of salmonella enterica and escherichia coli strains. 
Aerobic plate count is fully compliant with FSSAI Food Safety and Standards (Packaging & Labelling) Regulations 2020. 
WARNING NOTICE: Trace humidity in reefer transit van RFC-4402 could promote fungal spoilage if cold-chain temperature fluctuates above 4.5 degrees celsius. 
All crate seals verified intact with tamper-evident AGMARK RFID barcode.`,
    salmon: `APEDA MARINE INSPECTION PROTOCOL: Shipment SHIP-MH-9021-IN from Malabar Coastal Marine & Fisheries. 
Testing performed for heavy metals, listeria monocytogenes, and microbial histamine formation. 
SAMPLES: Batch 04A and 04B demonstrated core muscle temperature maintained at -0.8°C throughout Mumbai-Goa coastal highway transit. 
CRITICAL FINDING: No detectable listeria, no chemical pesticide residues, and mercury levels remain well below 0.1 ppm threshold. 
Batch cleared for immediate wholesale cold-chain distribution to regional metropolitan supermarket chains across Mumbai and Pune.`,
    wheat: `AGMARK & FSSAI GRAIN INSPECTION LOG: Punjab Central Grain Silo, elevator bin #12. 
Moisture sensor analysis reads 11.8% (optimal safety margin <13.5%). 
ELISA chromatography test conducted for fungal mycotoxins: aflatoxin B1, ochratoxin A, and deoxynivalenol. 
RESULTS: Negligible fungal activity; no aflatoxin detected. Grain aerated under laminar airflow. 
Certified suitable for long-term dry ambient silo buffering under national food security reserves.`
};

function initInteractiveControls() {
    // Dropdown for M1 Report Selector
    const reportSelect = document.getElementById('m1-report-select');
    reportSelect?.addEventListener('change', () => {
        const val = reportSelect.value;
        const textArea = document.getElementById('m1-doc-text');
        if (textArea && AUDIT_FILES[val]) {
            textArea.value = AUDIT_FILES[val];
        }
    });

    // M2 Sample Reset
    document.getElementById('btn-m2-load-sample')?.addEventListener('click', () => {
        const textArea = document.getElementById('m2-doc-text');
        if (textArea) textArea.value = AUDIT_FILES.salmon;
    });

    // Sliders for M3 Bitmask Cargo Package
    const weightSlider = document.getElementById('m3-weight-slider');
    const weightDisplay = document.getElementById('m3-weight-val');
    weightSlider?.addEventListener('input', () => {
        if (weightDisplay) weightDisplay.textContent = `${weightSlider.value} kg`;
    });

    const budgetSlider = document.getElementById('m3-budget-slider');
    const budgetDisplay = document.getElementById('m3-budget-val');
    budgetSlider?.addEventListener('input', () => {
        if (budgetDisplay) budgetDisplay.textContent = `₹${Number(budgetSlider.value).toLocaleString('en-IN')}`;
    });

    // M6 Reservoir k slider
    const kSlider = document.getElementById('m6-k-slider');
    const kDisplay = document.getElementById('m6-k-val');
    kSlider?.addEventListener('input', () => {
        if (kDisplay) kDisplay.textContent = `k = ${kSlider.value}`;
    });
}

// -----------------------------------------------------------------------------
// EXECUTION METRIC DOCKET
// -----------------------------------------------------------------------------
function updateDocket(prefix, res, summaryOutput) {
    const docket = document.getElementById(`${prefix}-docket`);
    if (!docket) return;

    docket.style.display = 'block';
    const timeElem = document.getElementById(`${prefix}-metric-time`);
    const nanosElem = document.getElementById(`${prefix}-metric-nanos`);
    const latencyElem = document.getElementById(`${prefix}-metric-latency`);
    const summaryElem = document.getElementById(`${prefix}-docket-summary`);
    const rawElem = document.getElementById(`${prefix}-docket-raw`);

    if (timeElem) timeElem.textContent = `${res.runtimeMs} ms`;
    if (nanosElem) nanosElem.textContent = `${res.runtimeNanos.toLocaleString()} ns`;
    if (latencyElem) latencyElem.textContent = `${res.clientLatencyMs} ms`;
    if (summaryElem) summaryElem.innerHTML = `<strong>Result:</strong> ${summaryOutput}`;
    if (rawElem) rawElem.textContent = JSON.stringify(res.data, null, 2);
}

function setBtnLoading(btn, isLoading, originalText) {
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.original = btn.innerHTML;
        btn.innerHTML = `<span class="loader-spin"></span> Processing...`;
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.original || originalText;
    }
}

// -----------------------------------------------------------------------------
// ACTION HANDLERS
// -----------------------------------------------------------------------------
function initActionHandlers() {
    // -------------------------------------------------------------------------
    // MODULE 1: STRING ALGORITHMS
    // -------------------------------------------------------------------------
    const btnAho = document.getElementById('btn-m1-aho');
    const btnKMP = document.getElementById('btn-m1-kmp');
    const btnZ = document.getElementById('btn-m1-z');
    const btnRK = document.getElementById('btn-m1-rk');

    btnAho?.addEventListener('click', async () => {
        const text = (document.getElementById('m1-doc-text')?.value || '').trim();
        setBtnLoading(btnAho, true);
        try {
            const res = await FoodChainAPI.runAhoCorasick(text);
            const countTag = document.getElementById('m1-alert-count');
            if (countTag) {
                if (res.data.totalAlertsFound > 0) {
                    countTag.className = 'badge-clean danger';
                    countTag.textContent = `${res.data.totalAlertsFound} Critical Alert(s)`;
                } else {
                    countTag.className = 'badge-clean success';
                    countTag.textContent = '0 Hazards (Passed)';
                }
            }
            updateDocket('m1', res, `Aho-Corasick Multi-Pattern: Detected ${res.data.totalAlertsFound} pathogen/hazard terms in document.`);
            Visualizers.renderAhoCorasickAlerts('m1-visualizer-workbench', text, res.data.matches);
            Visualizers.renderCO1PathogenStats('m1-pathogen-stats-workbench', res.data.totalAlertsFound);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnAho, false); }
    });

    // Quick Brand & Contaminant Preset Chips in CO1
    document.querySelectorAll('.btn-quick-search-co1').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query') || chip.textContent.trim();
            const patternInput = document.getElementById('m1-query-pattern');
            if (patternInput) patternInput.value = query;
            btnKMP?.click();
        });
    });

    btnKMP?.addEventListener('click', async () => {
        const text = (document.getElementById('m1-doc-text')?.value || '').trim();
        const pattern = (document.getElementById('m1-query-pattern')?.value || '').trim();
        setBtnLoading(btnKMP, true);
        try {
            const res = await FoodChainAPI.runKMP(text, pattern);
            updateDocket('m1', res, `KMP: Found ${res.data.matches.length} occurrence(s) for '${pattern}' in ${res.data.totalComparisons} comparisons.`);
            Visualizers.renderStringHighlights('m1-visualizer-workbench', text, pattern, res.data.matches);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnKMP, false); }
    });

    btnZ?.addEventListener('click', async () => {
        const text = (document.getElementById('m1-doc-text')?.value || '').trim();
        const pattern = (document.getElementById('m1-query-pattern')?.value || '').trim();
        setBtnLoading(btnZ, true);
        try {
            const res = await FoodChainAPI.runZAlgorithm(text, pattern);
            updateDocket('m1', res, `Z-Algorithm: Pattern '${pattern}' matched at ${res.data.matches.length} position(s). Repeated phrases discovered: ${res.data.detectedRepetitions.length}.`);
            Visualizers.renderStringHighlights('m1-visualizer-workbench', text, pattern, res.data.matches);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnZ, false); }
    });

    btnRK?.addEventListener('click', async () => {
        const text = (document.getElementById('m1-doc-text')?.value || '').trim();
        const pattern = (document.getElementById('m1-query-pattern')?.value || '').trim();
        setBtnLoading(btnRK, true);
        try {
            const res = await FoodChainAPI.runRabinKarp(text, pattern);
            updateDocket('m1', res, `Rabin-Karp Rolling Hash: Matched at index [${res.data.matches.join(', ')}] with ${res.data.spuriousHits} hash collision(s).`);
            Visualizers.renderStringHighlights('m1-visualizer-workbench', text, pattern, res.data.matches);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnRK, false); }
    });

    // -------------------------------------------------------------------------
    // MODULE 2: SUFFIX STRUCTURES
    // -------------------------------------------------------------------------
    const btnM2Index = document.getElementById('btn-m2-index');
    const btnM2Kasai = document.getElementById('btn-m2-kasai');

    btnM2Index?.addEventListener('click', async () => {
        const doc = (document.getElementById('m2-doc-text')?.value || '').trim();
        const query = (document.getElementById('m2-search-term')?.value || '').trim();
        setBtnLoading(btnM2Index, true);
        try {
            const res = await FoodChainAPI.runDocumentIndexer(doc, query);
            updateDocket('m2', res, `Indexed ${res.data.suffixArray.length} suffixes. Substring query for '${query}' exists: ${res.data.automatonStats.queryExists ? 'YES (Confirmed)' : 'NO'}.`);
            Visualizers.renderSuffixArrayTable('m2-visualizer-workbench', res.data.rankedSuffixes, res.data.sampleLcpTable, res.data.longestRepeatedSubstring);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnM2Index, false); }
    });

    btnM2Kasai?.addEventListener('click', async () => {
        const doc = (document.getElementById('m2-doc-text')?.value || '').trim();
        setBtnLoading(btnM2Kasai, true);
        try {
            const res = await FoodChainAPI.runKasaiLCP(doc);
            updateDocket('m2', res, `Kasai LCP: Longest duplicate clause "${res.data.longestRepeatedSubstring.phrase}" (${res.data.longestRepeatedSubstring.length} chars).`);
            Visualizers.renderSuffixArrayTable('m2-visualizer-workbench', [], res.data.sampleLcpTable, res.data.longestRepeatedSubstring);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnM2Kasai, false); }
    });

    // -------------------------------------------------------------------------
    // MODULE 3: DYNAMIC PROGRAMMING
    // -------------------------------------------------------------------------
    const btnAutocorrect = document.getElementById('btn-m3-autocorrect');
    const btnBundle = document.getElementById('btn-m3-bundle');
    const btnMCM = document.getElementById('btn-m3-mcm');
    const btnOBST = document.getElementById('btn-m3-obst');

    btnAutocorrect?.addEventListener('click', async () => {
        const query = (document.getElementById('m3-query-input')?.value || '').trim();
        setBtnLoading(btnAutocorrect, true);
        try {
            const res = await FoodChainAPI.runAutocorrect(query);
            updateDocket('m3', res, `Damerau-Levenshtein: Best Match '${res.data.bestMatch}' (${res.data.bestMatchSimilarity} confidence, Distance: ${res.data.bestMatchDistance}).`);
            
            const cont = document.getElementById('m3-visualizer-workbench');
            if (cont) {
                cont.innerHTML = `
                <div class="result-callout-card info">
                    <div class="result-callout-title">Fuzzy Autocorrect Resolution</div>
                    <div class="result-callout-value">Best Match: ${res.data.bestMatch}</div>
                    <div class="result-callout-meta">Confidence: <strong>${res.data.bestMatchSimilarity}</strong> • Damerau Distance: <strong>${res.data.bestMatchDistance} edit ops</strong></div>
                </div>
                <div class="enterprise-table-wrap">
                    <table class="enterprise-table">
                        <thead><tr><th>Rank</th><th>Candidate Catalog Entry</th><th>Edit Distance</th><th>Confidence Score</th></tr></thead>
                        <tbody>
                            ${res.data.rankedSuggestions.map((s, idx) => `
                                <tr>
                                    <td><span class="badge-clean">#${idx + 1}</span></td>
                                    <td style="font-weight:700; color:#0f172a;">${s.name}</td>
                                    <td>${s.editDistance}</td>
                                    <td><span class="badge-clean info">${s.similarityScore}%</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
            }
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnAutocorrect, false); }
    });

    btnBundle?.addEventListener('click', async () => {
        const weight = Number(document.getElementById('m3-weight-slider')?.value) || 50;
        const budget = Number(document.getElementById('m3-budget-slider')?.value) || 160;
        setBtnLoading(btnBundle, true);
        try {
            const res = await FoodChainAPI.runBitmaskBundle(null, weight, budget);
            updateDocket('m3', res, `Bitmask DP: Selected ${res.data.optimalBundle.totalItemsCount} items. Max Nutrition: ${res.data.optimalBundle.totalNutritionScore}. Payload: ${res.data.optimalBundle.totalWeightKg}kg / ${weight}kg.`);

            const cont = document.getElementById('m3-visualizer-workbench');
            if (cont) {
                cont.innerHTML = `
                <div class="result-callout-card success">
                    <div class="result-callout-title">Optimal Emergency Relief Cargo Package (Bitmask: ${res.data.optimalBundle.bitmaskSignature})</div>
                    <div class="result-callout-value">${res.data.optimalBundle.totalItemsCount} Cargo Items • Score: ${res.data.optimalBundle.totalNutritionScore} pts</div>
                    <div class="result-callout-meta">
                        Payload Weight: <strong>${res.data.optimalBundle.totalWeightKg}kg</strong> / ${weight}kg limit • Total Cost: <strong>₹${res.data.optimalBundle.totalCost.toLocaleString('en-IN')}</strong> / ₹${budget.toLocaleString('en-IN')} budget
                    </div>
                </div>
                <div class="enterprise-table-wrap">
                    <table class="enterprise-table">
                        <thead><tr><th>Selected Item</th><th>Weight</th><th>Cost (INR)</th><th>Nutrition Score</th></tr></thead>
                        <tbody>
                            ${res.data.optimalBundle.selectedItems.map(item => `
                                <tr>
                                    <td style="font-weight:700; color:var(--text-primary);">📦 ${item.name}</td>
                                    <td>${item.weightKg} kg</td>
                                    <td><strong>₹${item.cost.toLocaleString('en-IN')}</strong></td>
                                    <td><span class="badge-clean success">+${item.nutritionScore} pts</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
            }
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnBundle, false); }
    });

    btnMCM?.addEventListener('click', async () => {
        setBtnLoading(btnMCM, true);
        try {
            const res = await FoodChainAPI.runMatrixChain([40, 20, 30, 10, 30]);
            updateDocket('m3', res, `Matrix Chain Pipeline: Optimal Association ${res.data.optimalParenthesization} (Min Scalar Multiplications: ${res.data.minScalarMultiplications.toLocaleString()}).`);
            const cont = document.getElementById('m3-visualizer-workbench');
            if (cont) {
                cont.innerHTML = `
                <div class="result-callout-card info">
                    <div class="result-callout-title">Multi-Stage Pipeline Transform Optimization</div>
                    <div class="result-callout-value" style="font-family:var(--font-mono); font-size:18px;">
                        ${res.data.optimalParenthesization}
                    </div>
                    <div class="result-callout-meta">
                        Minimal Computational Multiplications: <strong>${res.data.minScalarMultiplications.toLocaleString()} operations</strong>
                    </div>
                </div>`;
            }
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnMCM, false); }
    });

    btnOBST?.addEventListener('click', async () => {
        setBtnLoading(btnOBST, true);
        try {
            const res = await FoodChainAPI.runOBST();
            updateDocket('m3', res, `OBST: Min Expected Search Cost: ${res.data.minExpectedSearchCost}. Root Key: '${res.data.rootKey}'.`);
            Visualizers.renderOBSTTree('m3-visualizer-workbench', res.data.treeStructure, res.data.minExpectedSearchCost, res.data.rootKey);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnOBST, false); }
    });

    // -------------------------------------------------------------------------
    // MODULE 4: NETWORK FLOW
    // -------------------------------------------------------------------------
    const btnDinic = document.getElementById('btn-m4-dinic');
    const btnEdmonds = document.getElementById('btn-m4-edmonds');
    const btnBipartite = document.getElementById('btn-m4-bipartite');

    btnDinic?.addEventListener('click', async () => {
        setBtnLoading(btnDinic, true);
        try {
            const res = await FoodChainAPI.runDinicFlow(8);
            updateDocket('m4', res, `Dinic's Algorithm: Max Delivered Flow = ${res.data.maxDistributionFlowTons} Metric Tons in ${res.data.bfsPhasesCount} BFS Phases.`);
            Visualizers.renderDinicFlowGraph('m4-visualizer-workbench', 8, res.data.edges, res.data.maxDistributionFlowTons);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnDinic, false); }
    });

    btnEdmonds?.addEventListener('click', async () => {
        setBtnLoading(btnEdmonds, true);
        try {
            const res = await FoodChainAPI.runEdmondsKarp();
            updateDocket('m4', res, `Edmonds-Karp: Max Flow = ${res.data.maxFlow} Tons. Bottleneck Cut Capacity = ${res.data.minCut.cutCapacity} Tons.`);
            Visualizers.renderDinicFlowGraph('m4-visualizer-workbench', 6, res.data.edgeFlows, res.data.maxFlow);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnEdmonds, false); }
    });

    btnBipartite?.addEventListener('click', async () => {
        setBtnLoading(btnBipartite, true);
        try {
            const res = await FoodChainAPI.runBipartiteMatching();
            updateDocket('m4', res, `Bipartite Matching: Assigned ${res.data.maximumMatchingSize} Agricultural Producers to Eligible Cold-Chain Hubs.`);
            Visualizers.renderBipartiteMatchingGraph('m4-visualizer-workbench', res.data.allocatedPairs, res.data.totalSuppliers, res.data.totalWarehouses);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnBipartite, false); }
    });

    // -------------------------------------------------------------------------
    // MODULE 5: NP-COMPLETENESS
    // -------------------------------------------------------------------------
    const btn3SAT = document.getElementById('btn-m5-3sat');
    const btnConflict = document.getElementById('btn-m5-conflict');
    const btnVC = document.getElementById('btn-m5-vc');

    btn3SAT?.addEventListener('click', async () => {
        setBtnLoading(btn3SAT, true);
        try {
            const res = await FoodChainAPI.run3SATStorage();
            updateDocket('m5', res, `3-SAT: ${res.data.isSatisfiable ? 'COMPLIANT & SATISFIABLE (Valid Storage Configuration)' : 'UNSATISFIABLE (Conflict)'}.`);
            
            const cont = document.getElementById('m5-visualizer-workbench');
            if (cont) {
                cont.innerHTML = `
                <div class="result-callout-card success">
                    <div class="result-callout-title">Cold-Chain 3-SAT Regulatory Verification</div>
                    <div class="result-callout-value">COMPLIANT (SATISFIED)</div>
                    <div class="result-callout-meta">All temperature, ethylene, and allergen constraints satisfied simultaneously.</div>
                </div>
                <div class="enterprise-table-wrap">
                    <table class="enterprise-table">
                        <thead><tr><th>Variable</th><th>Storage Rule</th><th>Evaluated Decision</th></tr></thead>
                        <tbody>
                            ${(res.data.satisfyingAssignment || []).map(a => `
                                <tr>
                                    <td><code>${a.variable}</code></td>
                                    <td style="font-weight:600; color:#0f172a;">${a.name}</td>
                                    <td><span class="badge-clean ${a.value ? 'success' : 'info'}">${a.interpretation}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
            }
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btn3SAT, false); }
    });

    btnConflict?.addEventListener('click', async () => {
        setBtnLoading(btnConflict, true);
        try {
            const res = await FoodChainAPI.runConflictAnalysis();
            updateDocket('m5', res, `Max Independent Set: ${res.data.maximumIndependentSet.size} safe items. Min Vertex Cover: ${res.data.minimumVertexCover.size} isolation vault items.`);
            Visualizers.renderConflictGraph('m5-visualizer-workbench', res.data.items, res.data.conflictEdges, res.data.maximumIndependentSet, res.data.minimumVertexCover);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnConflict, false); }
    });

    btnVC?.addEventListener('click', async () => {
        setBtnLoading(btnVC, true);
        try {
            const res = await FoodChainAPI.runVertexCoverHubs();
            updateDocket('m5', res, `Vertex Cover 2-Approx: Selected ${res.data.coverSize} inspection hubs {${res.data.vertexCover.join(', ')}} covering 100% of freight routes.`);
            const cont = document.getElementById('m5-visualizer-workbench');
            if (cont) {
                cont.innerHTML = `
                <div class="result-callout-card info">
                    <div class="result-callout-title">Strategic Inspection Checkpoints (2-Approximation)</div>
                    <div class="result-callout-value">
                        Selected Hub Checkpoints: {${res.data.vertexCover.join(', ')}} (${res.data.coverSize} Locations)
                    </div>
                    <div class="result-callout-meta">
                        Guarantees 100% freight corridor inspection coverage with mathematically bounded station deployment cost.
                    </div>
                </div>`;
            }
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnVC, false); }
    });

    // -------------------------------------------------------------------------
    // MODULE 6: RANDOMIZED & PARALLEL
    // -------------------------------------------------------------------------
    const btnReservoir = document.getElementById('btn-m6-reservoir');
    const btnQuickSort = document.getElementById('btn-m6-quicksort');
    const btnBlelloch = document.getElementById('btn-m6-blelloch');
    const btnMR = document.getElementById('btn-m6-mr');
    const btnBrent = document.getElementById('btn-m6-brent');

    btnReservoir?.addEventListener('click', async () => {
        const k = Number(document.getElementById('m6-k-slider')?.value) || 4;
        setBtnLoading(btnReservoir, true);
        try {
            const res = await FoodChainAPI.runReservoirIOT(null, k);
            updateDocket('m6', res, `Reservoir Sampling: Extracted ${res.data.reservoirSize} readings from live stream of ${res.data.streamSize} IoT events.`);
            Visualizers.renderReservoirTimeline('m6-visualizer-workbench', res.data.stepLogs, res.data.reservoir);
            Visualizers.renderCO6HighwayTelemetry('m6-telemetry-workbench');
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnReservoir, false); }
    });

    btnQuickSort?.addEventListener('click', async () => {
        setBtnLoading(btnQuickSort, true);
        try {
            const res = await FoodChainAPI.runQuickSortDemand();
            updateDocket('m6', res, `Randomized QuickSort: Ranked ${res.data.totalItemsSorted} items by demand priority in ${res.data.comparisons} comparisons.`);
            
            const cont = document.getElementById('m6-visualizer-workbench');
            if (cont) {
                cont.innerHTML = `
                <div class="enterprise-table-wrap">
                    <table class="enterprise-table">
                        <thead><tr><th>Priority</th><th>Product Description</th><th>Category</th><th>Demand Score</th><th>Unit Price</th></tr></thead>
                        <tbody>
                            ${res.data.sortedInventory.map((item, idx) => `
                                <tr>
                                    <td><span class="badge-clean">#${idx + 1}</span></td>
                                    <td style="font-weight:700; color:#0f172a;">${item.name}</td>
                                    <td>${item.category}</td>
                                    <td><span class="badge-clean success">${item.demandWeight}</span></td>
                                    <td><strong>₹${item.pricePerKg}</strong> / kg</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
            }
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnQuickSort, false); }
    });

    btnBlelloch?.addEventListener('click', async () => {
        setBtnLoading(btnBlelloch, true);
        try {
            const res = await FoodChainAPI.runBlellochDepletion();
            updateDocket('m6', res, `Blelloch Parallel Scan: Total 24h Tonnage = ${res.data.totalTonnageSum} MT (Work: O(n), Span: O(log n)).`);
            Visualizers.renderBlellochTimeline('m6-visualizer-workbench', res.data.hourlyDispatches, res.data.cumulativeDistributionCurve);
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnBlelloch, false); }
    });

    btnMR?.addEventListener('click', async () => {
        const lotNumber = (document.getElementById('m6-lot-input')?.value || '104729').trim();
        setBtnLoading(btnMR, true);
        try {
            const res = await FoodChainAPI.runMillerRabinLot(lotNumber, 6);
            updateDocket('m6', res, `Miller-Rabin Lot Verification: ${res.data.verdict} (Error Bound: ${res.data.errorProbability}).`);
            const cont = document.getElementById('m6-visualizer-workbench');
            if (cont) {
                cont.innerHTML = `
                <div class="result-callout-card success">
                    <div class="result-callout-title">Cryptographic Lot Signature Verification</div>
                    <div class="result-callout-value">${res.data.verdict}</div>
                    <div class="result-callout-meta">
                        Lot Signature: <strong>#${lotNumber}</strong> • Error Bound: <code>${res.data.errorProbability}</code> (Monte Carlo Randomized Test)
                    </div>
                </div>`;
            }
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnMR, false); }
    });

    btnBrent?.addEventListener('click', async () => {
        setBtnLoading(btnBrent, true);
        try {
            const res = await FoodChainAPI.runParallelReduceBrent(null, 10000, 14);
            updateDocket('m6', res, `Brent's Theorem: Theoretical Max Speedup = ${res.data.brentAnalysis.theoreticalMaxSpeedup}x across multi-core compute clusters.`);
            
            const cont = document.getElementById('m6-visualizer-workbench');
            if (cont) {
                cont.innerHTML = `
                <div class="result-callout-card info">
                    <div class="result-callout-title">Brent's Scheduling Theorem Speedup Analysis</div>
                    <div class="result-callout-value">Theoretical Max Speedup: ${res.data.brentAnalysis.theoreticalMaxSpeedup}x</div>
                    <div class="result-callout-meta">Bound: <code>T_p ≤ (W - S)/p + S</code> (Total Work: ${res.data.brentAnalysis.totalWorkW}, Critical Span: ${res.data.brentAnalysis.criticalPathSpanS})</div>
                </div>
                <div class="enterprise-table-wrap">
                    <table class="enterprise-table">
                        <thead><tr><th>Core Count (p)</th><th>Theoretical Execution Steps</th><th>Parallel Speedup</th><th>Cluster Efficiency</th></tr></thead>
                        <tbody>
                            ${res.data.brentAnalysis.speedupProfiles.map(p => `
                                <tr>
                                    <td><strong>${p.processorsP} Cores</strong></td>
                                    <td>${p.theoreticalExecutionTimeTp} steps</td>
                                    <td><span class="badge-clean info">${p.speedupFactor}x</span></td>
                                    <td>${p.processorEfficiency}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
            }
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnBrent, false); }
    });
}

// -----------------------------------------------------------------------------
// BENCHMARK MODAL RUNNER
// -----------------------------------------------------------------------------
function initBenchmarkModal() {
    const btnOpen = document.getElementById('btn-open-benchmark');
    const modal = document.getElementById('benchmark-modal');
    const btnClose = document.getElementById('btn-close-modal');
    const btnRunAll = document.getElementById('btn-execute-all-benchmarks');

    btnOpen?.addEventListener('click', () => modal?.classList.add('open'));
    btnClose?.addEventListener('click', () => modal?.classList.remove('open'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

    btnRunAll?.addEventListener('click', async () => {
        setBtnLoading(btnRunAll, true);
        try {
            const res = await FoodChainAPI.runFoodChainBenchmark();
            const container = document.getElementById('benchmark-results-container');
            if (container) {
                container.innerHTML = `
                <div class="result-callout-card success">
                    <div class="result-callout-title">Benchmark Complete</div>
                    <div class="result-callout-value">All 6 Modules Synchronized in ${res.totalRuntimeMs} ms</div>
                    <div class="result-callout-meta">Processed live catalog records, intermodal flows, and streaming IoT telematics without bottlenecks.</div>
                </div>
                <div class="enterprise-table-wrap">
                    <table class="enterprise-table">
                        <thead>
                            <tr>
                                <th>Module</th>
                                <th>Outcome</th>
                                <th>Algorithm Executed</th>
                                <th>Operational Metric</th>
                                <th>Execution Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Module 1</strong></td>
                                <td><span class="badge-clean info">M1 – CO1</span></td>
                                <td>Aho-Corasick Multi-Hazard</td>
                                <td>${res.results.m1_stringAlerts.totalAlerts} Pathogen Alerts Detected</td>
                                <td><span class="badge-clean success">${res.results.m1_stringAlerts.runtimeMs} ms</span></td>
                            </tr>
                            <tr>
                                <td><strong>Module 2</strong></td>
                                <td><span class="badge-clean info">M2 – CO2</span></td>
                                <td>Suffix Automaton & Kasai</td>
                                <td>${res.results.m2_suffixIndexing.distinctSubstrings.toLocaleString()} Indexed Substrings</td>
                                <td><span class="badge-clean success">${res.results.m2_suffixIndexing.runtimeMs} ms</span></td>
                            </tr>
                            <tr>
                                <td><strong>Module 3</strong></td>
                                <td><span class="badge-clean info">M3 – CO3</span></td>
                                <td>Damerau-Levenshtein Autocorrect</td>
                                <td>Best Match: ${res.results.m3_dpAutocorrect.bestMatch}</td>
                                <td><span class="badge-clean success">${res.results.m3_dpAutocorrect.runtimeMs} ms</span></td>
                            </tr>
                            <tr>
                                <td><strong>Module 4</strong></td>
                                <td><span class="badge-clean info">M4 – CO4</span></td>
                                <td>Dinic's Multi-Tier Flow</td>
                                <td>Max Flow: ${res.results.m4_dinicFlow.maxFlowTons} Metric Tons</td>
                                <td><span class="badge-clean success">${res.results.m4_dinicFlow.runtimeMs} ms</span></td>
                            </tr>
                            <tr>
                                <td><strong>Module 5</strong></td>
                                <td><span class="badge-clean info">M5 – CO5</span></td>
                                <td>Conflict Graph (Independent Set)</td>
                                <td>Safe Co-Storage Set: ${res.results.m5_conflictGraph.safeSetSize} Produce Items</td>
                                <td><span class="badge-clean success">${res.results.m5_conflictGraph.runtimeMs} ms</span></td>
                            </tr>
                            <tr>
                                <td><strong>Module 6</strong></td>
                                <td><span class="badge-clean info">M6 – CO6</span></td>
                                <td>Blelloch Parallel Scan</td>
                                <td>24h Tonnage: ${res.results.m6_parallelScan.totalTons} MT</td>
                                <td><span class="badge-clean success">${res.results.m6_parallelScan.runtimeMs} ms</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>`;
            }
        } catch (err) { alert(err.message); }
        finally { setBtnLoading(btnRunAll, false); }
    });
}

// -----------------------------------------------------------------------------
// LIVE CATALOG EXPLORER MODAL / VIEW
// -----------------------------------------------------------------------------
function initCatalogExplorer() {
    const btnOpen = document.getElementById('btn-open-catalog');
    const btnOpenHero = document.getElementById('btn-open-catalog-hero');
    const modal = document.getElementById('catalog-modal');
    const btnClose = document.getElementById('btn-close-catalog-modal');
    const cont = document.getElementById('catalog-content-container');

    const openCatalog = async () => {
        modal?.classList.add('open');
        if (cont && !cont.dataset.loaded) {
            cont.innerHTML = `<div style="text-align:center; padding:30px;"><span class="loader-spin"></span> Loading active food supply records...</div>`;
            try {
                const res = await FoodChainAPI.getCatalog();
                cont.dataset.loaded = 'true';
                cont.innerHTML = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div>
                        <h4 style="font-size:14px; font-weight:700; margin-bottom:8px; color:var(--text-primary);">🌾 Verified Agricultural Producers (${res.suppliers.length})</h4>
                        <div class="enterprise-table-wrap" style="max-height:220px;">
                            <table class="enterprise-table">
                                <thead><tr><th>Producer</th><th>Location</th><th>Primary Output</th></tr></thead>
                                <tbody>
                                    ${res.suppliers.map(s => `
                                        <tr>
                                            <td style="font-weight:700;">${s.name}</td>
                                            <td>${s.location}</td>
                                            <td><span class="badge-clean info">${s.primaryProduct}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <h4 style="font-size:14px; font-weight:700; margin-bottom:8px; color:var(--text-primary);">❄️ Cold Storage Facilities (${res.warehouses.length})</h4>
                        <div class="enterprise-table-wrap" style="max-height:220px;">
                            <table class="enterprise-table">
                                <thead><tr><th>Facility</th><th>City</th><th>Capacity</th><th>Temp Zone</th></tr></thead>
                                <tbody>
                                    ${res.warehouses.map(w => `
                                        <tr>
                                            <td style="font-weight:700;">${w.name}</td>
                                            <td>${w.location}</td>
                                            <td>${w.capacityTons} MT</td>
                                            <td><span class="badge-clean success">${w.tempZone}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div style="margin-top:20px;">
                    <h4 style="font-size:14px; font-weight:700; margin-bottom:8px; color:var(--text-primary);">📦 Monitored Food Cargo SKUs (${res.products.length})</h4>
                    <div class="enterprise-table-wrap" style="max-height:220px;">
                        <table class="enterprise-table">
                            <thead><tr><th>SKU</th><th>Product Description</th><th>Category</th><th>Opt Temp</th><th>Price / kg</th></tr></thead>
                            <tbody>
                                ${res.products.map(p => `
                                    <tr>
                                        <td><code>${p.id}</code></td>
                                        <td style="font-weight:700;">${p.name}</td>
                                        <td>${p.category}</td>
                                        <td><span class="badge-clean">${p.optTemp || p.tempZone}</span></td>
                                        <td><strong style="color:var(--brand-emerald);">₹${p.pricePerKg}/kg</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
            } catch (err) {
                cont.innerHTML = `<div style="color:#ef4444; padding:20px;">Failed to load catalog: ${err.message}</div>`;
            }
        }
    };

    btnOpen?.addEventListener('click', openCatalog);
    btnOpenHero?.addEventListener('click', openCatalog);
    btnClose?.addEventListener('click', () => modal?.classList.remove('open'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
}

// -----------------------------------------------------------------------------
// REAL-TIME API HEARTBEAT
// -----------------------------------------------------------------------------
async function checkApiConnection() {
    const badge = document.getElementById('api-status-badge');
    try {
        const res = await FoodChainAPI.checkHealth();
        if (res.status === 'ONLINE' && badge) {
            badge.innerHTML = `<span class="pulse-dot"></span> <span>API ONLINE (${res.clientLatencyMs}ms)</span>`;
            badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            badge.style.color = '#047857';
        }
    } catch (e) {
        if (badge) {
            badge.innerHTML = `<span class="pulse-dot" style="background:#ef4444; box-shadow:0 0 6px #ef4444;"></span> <span>API RECONNECTING</span>`;
            badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            badge.style.color = '#ef4444';
        }
    }
}

// -----------------------------------------------------------------------------
// DATASET EXPLORER (CSV SYNC & CO ANALYTICS)
// -----------------------------------------------------------------------------
function initDatasetExplorer() {
    const btnNavDs = document.getElementById('btn-nav-dataset');
    const tabDs = document.getElementById('tab-dataset');
    const searchInput = document.getElementById('dataset-search-input');
    const categoryFilter = document.getElementById('dataset-category-filter');

    btnNavDs?.addEventListener('click', () => {
        tabDs?.click();
    });

    let datasetChainsList = [];

    const filterAndRenderTable = () => {
        const query = (searchInput?.value || '').trim().toLowerCase();
        const cat = (categoryFilter?.value || 'ALL');

        let filtered = datasetChainsList;
        if (cat !== 'ALL') {
            filtered = filtered.filter(item => item.foodCategory === cat || item.category === cat);
        }
        if (query) {
            filtered = filtered.filter(item => 
                (item.name && item.name.toLowerCase().includes(query)) ||
                (item.foodCategory && item.foodCategory.toLowerCase().includes(query)) ||
                (item.segment && item.segment.toLowerCase().includes(query))
            );
        }

        Visualizers.renderDatasetTable('dataset-table-workbench', filtered, (chainName) => {
            // Quick action: search this fast-food chain in CO1
            const m1Tab = document.getElementById('tab-m1');
            const patternInput = document.getElementById('m1-query-pattern');
            if (patternInput) patternInput.value = chainName;
            m1Tab?.click();
            setTimeout(() => {
                document.getElementById('btn-m1-kmp')?.click();
            }, 300);
        });
    };

    const loadDataset = async () => {
        try {
            const [ovRes, chRes] = await Promise.all([
                FoodChainAPI.getDatasetOverview(),
                FoodChainAPI.getDatasetChains()
            ]);

            if (ovRes && ovRes.data) {
                const ov = ovRes.data;
                const elSales = document.getElementById('ds-kpi-sales');
                const elUnits = document.getElementById('ds-kpi-units');
                const elAvgSales = document.getElementById('ds-kpi-avg-sales');
                const elIndiaBrands = document.getElementById('ds-kpi-india-brands');

                if (elSales) elSales.textContent = ov.totalSalesFormattedINR || `₹${(ov.totalSalesCroresINR || 0).toLocaleString('en-IN')} Cr`;
                if (elUnits) elUnits.textContent = `${(ov.totalUnits || 0).toLocaleString('en-IN')} Outlets`;
                if (elAvgSales) {
                    const avgLakhs = Math.round(((ov.totalSalesCroresINR || 0) * 100) / (ov.totalUnits || 1));
                    elAvgSales.textContent = `₹${avgLakhs} L/unit`;
                }
                if (elIndiaBrands) elIndiaBrands.textContent = `${ov.activeIndiaChainsCount || 15} Chains`;

                Visualizers.renderDatasetVisuals('dataset-visuals-workbench', ov);
            }

            if (chRes && chRes.data) {
                datasetChainsList = chRes.data;
                filterAndRenderTable();
            }
        } catch (err) {
            console.error('[Dataset Explorer Load Error]', err);
            const container = document.getElementById('dataset-visuals-workbench');
            if (container) {
                container.innerHTML = `<div style="color:var(--brand-rose); padding:20px; text-align:center;">Failed to load dataset: ${err.message}</div>`;
            }
        }
    };

    searchInput?.addEventListener('input', filterAndRenderTable);
    categoryFilter?.addEventListener('change', filterAndRenderTable);

    loadDataset();
}


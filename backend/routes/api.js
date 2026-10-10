const express = require('express');
const router = express.Router();
const {
    module1,
    module2,
    module3,
    module4,
    module5,
    module6,
    metadata
} = require('../modules');
const {
    FOOD_PRODUCTS,
    FOOD_SUPPLIERS,
    WAREHOUSES,
    FOOD_QUALITY_REPORTS,
    SAMPLE_SHIPMENT_CODES
} = require('../data/foodChainData');
const {
    predictProductSpoilage,
    predictInventoryDepletion,
    predictBiologicalHazardRisk,
    predictLogisticsBottlenecks,
    predictAllTheThings
} = require('../modules/predictive_engine');
const {
    getChains,
    getDatasetExecutiveSummary,
    getDatasetCOAnalytics
} = require('../modules/dataset_sync');

function formatResponse(moduleName, operationSummary, resultData, runtimeNanos) {
    const ms = Number(runtimeNanos) / 1_000_000;
    return {
        status: 'SUCCESS',
        moduleName,
        operationSummary,
        timestamp: new Date().toISOString(),
        runtimeNanos: Number(runtimeNanos),
        runtimeMs: Number(ms.toFixed(4)),
        data: resultData
    };
}

// -----------------------------------------------------------------------------
// DATASET REPOSITORY & FAST-FOOD CHAINS SYNC (INDIA & USA CSV)
// -----------------------------------------------------------------------------
router.get('/dataset/overview', (req, res) => {
    try {
        const summary = getDatasetExecutiveSummary();
        res.json({ status: 'SUCCESS', data: summary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/dataset/chains', (req, res) => {
    try {
        const { search = '', category = '' } = req.query;
        let chains = getChains();
        if (search) {
            const q = search.toLowerCase();
            chains = chains.filter(c => c.name.toLowerCase().includes(q) || c.foodCategory.toLowerCase().includes(q));
        }
        if (category && category !== 'ALL') {
            chains = chains.filter(c => c.foodCategory === category);
        }
        res.json({ status: 'SUCCESS', total: chains.length, data: chains });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/dataset/co-analytics', (req, res) => {
    try {
        const coData = getDatasetCOAnalytics();
        res.json({ status: 'SUCCESS', data: coData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// SYSTEM STATUS & CATALOG REPOSITORY
// -----------------------------------------------------------------------------
router.get('/health', (req, res) => {
    res.json({
        status: 'ONLINE',
        platform: 'FoodChain – Food Supply & Distribution Management Platform',
        activeSuppliersCount: FOOD_SUPPLIERS.length,
        warehousesCount: WAREHOUSES.length,
        productsCount: FOOD_PRODUCTS.length,
        uptimeSeconds: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

router.get('/modules', (req, res) => {
    res.json(metadata);
});

router.get('/foodchain/catalog', (req, res) => {
    res.json({
        products: FOOD_PRODUCTS,
        suppliers: FOOD_SUPPLIERS,
        warehouses: WAREHOUSES,
        reports: FOOD_QUALITY_REPORTS,
        shipmentCodes: SAMPLE_SHIPMENT_CODES
    });
});

// -----------------------------------------------------------------------------
// MODULE 1: STRING ALGORITHMS (M1 – CO1)
// -----------------------------------------------------------------------------
// 1. KMP: Search product names & food-quality terms
router.post('/module1/kmp', (req, res) => {
    try {
        const { text = FOOD_QUALITY_REPORTS[0].content, pattern = 'salmonella' } = req.body;
        const result = module1.kmpSearch(text, pattern);
        res.json(formatResponse(
            'KMP Pattern Search (M1 – CO1)',
            `Searched '${pattern}' in text (len=${text.length})`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Z-Algorithm: Identify repeated descriptions in product records & certificates
router.post('/module1/z-algorithm', (req, res) => {
    try {
        const { text = FOOD_QUALITY_REPORTS[0].content, pattern = 'Organic' } = req.body;
        const result = module1.zSearchRepeatedPhrases(text, pattern);
        res.json(formatResponse(
            'Z-Algorithm Repetition Detection (M1 – CO1)',
            `Analyzed duplicate phrases & pattern '${pattern}'`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Rabin-Karp: Search product & shipment codes
router.post('/module1/rabin-karp', (req, res) => {
    try {
        const { text = FOOD_QUALITY_REPORTS[1].content, pattern = 'SHIP-MH-9021-IN', radix = 256, modulus = 101 } = req.body;
        const result = module1.rabinKarpSearch(text, pattern, radix, modulus);
        res.json(formatResponse(
            'Rabin-Karp Shipment Code Search (M1 – CO1)',
            `Scanned shipment code '${pattern}' via rolling hash`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Aho-Corasick: Multi-pattern food safety hazard alert scanner
router.post('/module1/aho-corasick', (req, res) => {
    try {
        const { text = FOOD_QUALITY_REPORTS[0].content + ' ' + FOOD_QUALITY_REPORTS[1].content, keywords } = req.body;
        const result = module1.scanFoodSafetyAlerts(text, keywords);
        res.json(formatResponse(
            'Aho-Corasick Hazard Alert Scanner (M1 – CO1)',
            `Scanned text for ${result.keywordsSearched.length} critical hazard terms. Found ${result.totalAlertsFound} alerts.`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// MODULE 2: SUFFIX STRUCTURES – DOCUMENT SIMILARITY (M2 – CO2)
// -----------------------------------------------------------------------------
router.post('/module2/document-indexer', (req, res) => {
    try {
        const { documentText = FOOD_QUALITY_REPORTS[0].content, queryPattern = 'FSSAI' } = req.body;
        const result = module2.indexAndAnalyzeFoodDocument(documentText, queryPattern);
        res.json(formatResponse(
            'Suffix Structures Document Indexer (M2 – CO2)',
            `Constructed Suffix Array, Kasai LCP, and Suffix Automaton for document (len=${documentText.length})`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/module2/kasai-lcp', (req, res) => {
    try {
        const { text = FOOD_QUALITY_REPORTS[0].content } = req.body;
        const saResult = module2.buildSuffixArray(text);
        const lcpResult = module2.computeLCPKasai(text, saResult.suffixArray);
        res.json(formatResponse(
            'Kasai LCP Repeated Claims Analysis (M2 – CO2)',
            `Longest Repeated Substring: "${lcpResult.longestRepeatedSubstring.phrase}" (${lcpResult.longestRepeatedSubstring.length} chars)`,
            lcpResult,
            lcpResult.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// MODULE 3: ADVANCED DYNAMIC PROGRAMMING (M3 – CO3)
// -----------------------------------------------------------------------------
// 1. Damerau-Levenshtein: Fuzzy autocorrect for product & supplier names
router.post('/module3/autocorrect', (req, res) => {
    try {
        const { query = 'palak spinch' } = req.body;
        const catalogNames = FOOD_PRODUCTS.map(p => p.name).concat(FOOD_SUPPLIERS.map(s => s.name));
        const result = module3.autocorrectFoodCatalog(query, catalogNames);
        res.json(formatResponse(
            'Damerau-Levenshtein Autocorrect (M3 – CO3)',
            `Query '${query}' -> Best Match: '${result.bestMatch}' (${result.bestMatchSimilarity})`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Bitmask DP: Optimal emergency food relief package / bundle selection
router.post('/module3/bitmask-bundle', (req, res) => {
    try {
        const { items, maxWeightKg = 50, budgetLimit = 12500 } = req.body;
        const result = module3.solveFoodBundleBitmaskDP(items, Number(maxWeightKg), Number(budgetLimit));
        res.json(formatResponse(
            'Bitmask DP Bundle Selection (M3 – CO3)',
            `Selected ${result.optimalBundle.totalItemsCount} items with max nutrition score ${result.optimalBundle.totalNutritionScore}`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Matrix-Chain Multiplication: Multi-stage supply pipeline transform optimizer
router.post('/module3/matrix-chain', (req, res) => {
    try {
        const { dimensions = [40, 20, 30, 10, 30] } = req.body;
        const result = module3.matrixChainOrder(dimensions);
        res.json(formatResponse(
            'Matrix-Chain Pipeline Optimizer (M3 – CO3)',
            `Min Multiplications: ${result.minScalarMultiplications} | Tree: ${result.optimalParenthesization}`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Optimal Binary Search Tree: Popular food catalog access tree
router.post('/module3/obst', (req, res) => {
    try {
        const { keys, frequencies } = req.body;
        const result = module3.buildOBST(keys, frequencies);
        res.json(formatResponse(
            'Optimal BST Catalog Optimizer (M3 – CO3)',
            `Min Expected Search Depth: ${result.minExpectedSearchCost} | Root Key: '${result.rootKey}'`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// MODULE 4: NETWORK FLOW (M4 – CO4)
// -----------------------------------------------------------------------------
// 1. Edmonds-Karp & Min-Cut: Distribution capacity and critical bottleneck cut
router.post('/module4/edmonds-karp', (req, res) => {
    try {
        const { capacity, source = 0, sink = 5 } = req.body;
        const defaultCap = [
            [0, 30, 25, 0, 0, 0],
            [0, 0, 15, 20, 0, 0],
            [0, 8, 0, 0, 22, 0],
            [0, 0, 10, 0, 0, 28],
            [0, 0, 0, 12, 0, 20],
            [0, 0, 0, 0, 0, 0]
        ];
        const result = module4.edmondsKarp(capacity || defaultCap, Number(source), Number(sink));
        res.json(formatResponse(
            'Edmonds-Karp Max Distribution Flow (M4 – CO4)',
            `Maximum Throughput: ${result.maxFlow} Tons | Bottleneck Cut Capacity: ${result.minCut.cutCapacity}`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Dinic's Algorithm: High-throughput multi-tier blocking flow
router.post('/module4/dinic-flow', (req, res) => {
    try {
        const { nodeCount = 8, edges, source = 0, sink = 7 } = req.body;
        const result = module4.runDinicDistributionNetwork(Number(nodeCount), edges, Number(source), Number(sink));
        res.json(formatResponse(
            "Dinic's Algorithm Multi-Tier Supply Flow (M4 – CO4)",
            `Computed Max Flow of ${result.maxDistributionFlowTons} Tons in ${result.bfsPhasesCount} BFS Phases`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Maximum Bipartite Matching: Assigning suppliers to certified warehouses
router.post('/module4/bipartite-matching', (req, res) => {
    try {
        const { suppliers, warehouses, eligibilityEdges } = req.body;
        const result = module4.solveBipartiteMatching(suppliers, warehouses, eligibilityEdges);
        res.json(formatResponse(
            'Bipartite Matching Supplier Allocation (M4 – CO4)',
            `Optimally assigned ${result.maximumMatchingSize} suppliers to certified cold-chain warehouses`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// MODULE 5: NP-COMPLETENESS & APPROXIMATION (M5 – CO5)
// -----------------------------------------------------------------------------
// 1. 3-SAT: Perishable storage & transport rule satisfaction
router.post('/module5/3sat-storage', (req, res) => {
    try {
        const { clauses, variableNames } = req.body;
        const result = module5.solveFoodSafety3SAT(clauses, variableNames);
        res.json(formatResponse(
            '3-SAT Perishable Storage Verification (M5 – CO5)',
            `Status: ${result.isSatisfiable ? 'SATISFIABLE (Compliant Storage Configuration)' : 'UNSATISFIABLE (Conflict Violation)'}`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Reductions & Perishable Food Storage Conflict Graph
router.post('/module5/conflict-analysis', (req, res) => {
    try {
        const { items, conflictEdges } = req.body;
        const result = module5.analyzeFoodStorageConflictGraph(items, conflictEdges);
        res.json(formatResponse(
            'Conflict Graph: Max Indep Set & Min Vertex Cover (M5 – CO5)',
            `Max Safe Co-Storage Set: ${result.maximumIndependentSet.size} items | Min Critical Isolation Cover: ${result.minimumVertexCover.size} items`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/module5/reduction-clique', (req, res) => {
    try {
        const { clauses } = req.body;
        const result = module5.reduce3SATtoClique(clauses);
        res.json(formatResponse(
            '3-SAT to CLIQUE Reduction (M5 – CO5)',
            `Transformed ${result.targetCliqueSizeK} clauses into graph with ${result.constructedGraph.verticesCount} vertices and ${result.constructedGraph.edgesCount} edges`,
            result,
            0
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Vertex Cover 2-Approximation: Critical transit inspection checkpoints
router.post('/module5/vertex-cover-hubs', (req, res) => {
    try {
        const { edges = [[0, 1], [0, 2], [1, 3], [3, 4], [4, 5]], numVertices = 6 } = req.body;
        const result = module5.vertexCoverApproximation(edges, Number(numVertices));
        res.json(formatResponse(
            'Vertex Cover 2-Approximation Inspection Hubs (M5 – CO5)',
            `Selected ${result.coverSize} strategic inspection hubs to monitor all ${result.numEdges} transit corridors`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// MODULE 6: RANDOMIZED & PARALLEL ALGORITHMS (M6 – CO6)
// -----------------------------------------------------------------------------
// 1. Randomized QuickSort: Dynamic market demand & expiry ranking
router.post('/module6/quicksort-demand', (req, res) => {
    try {
        const { items = FOOD_PRODUCTS, ascending = false } = req.body;
        const result = module6.randomizedQuickSort(items, (item) => item.demandWeight || item.pricePerKg, ascending);
        res.json(formatResponse(
            'Randomized QuickSort Demand Ranking (M6 – CO6)',
            `Ranked ${result.totalItemsSorted} products with randomized pivots in ${result.comparisons} comparisons`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Reservoir Sampling: Live continuous IoT sensor telemetry stream
router.post('/module6/reservoir-iot', (req, res) => {
    try {
        const { stream, k = 4 } = req.body;
        // Default stream: simulated temperature readings from cold-chain trucks (°C)
        const sensorStream = stream || [2.1, 2.4, 2.2, 3.1, 4.2, 2.0, 1.9, 2.5, 3.8, 4.5, 2.3, 2.1, 1.8, 2.7, 3.2, 4.1, 2.2, 2.6, 2.9, 3.0];
        const result = module6.reservoirSample(sensorStream, Number(k));
        res.json(formatResponse(
            'Reservoir Sampling Cold-Chain IoT Stream (M6 – CO6)',
            `Sampled ${result.reservoirSize} representative temperature readings from live stream of ${result.streamSize} events`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Miller-Rabin: Cryptographic batch verification of food lot numbers
router.post('/module6/miller-rabin-lot', (req, res) => {
    try {
        const { lotNumber = '104729', iterations = 6 } = req.body;
        const result = module6.isPrimeMillerRabin(lotNumber.toString(), Number(iterations));
        res.json(formatResponse(
            'Miller-Rabin Cryptographic Lot Verification (M6 – CO6)',
            `Lot Hash ${lotNumber} -> ${result.verdict} (Error Bound: ${result.errorProbability})`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Blelloch Parallel Scan: Work-efficient cumulative 24h inventory depletion curve
router.post('/module6/blelloch-depletion', (req, res) => {
    try {
        const { hourlyDispatches } = req.body;
        const result = module6.blellochParallelScan(hourlyDispatches);
        res.json(formatResponse(
            'Blelloch Work-Efficient Parallel Scan (M6 – CO6)',
            `Computed cumulative inventory curve over ${result.timePointsCount} hours (Total: ${result.totalTonnageSum} Tons)`,
            result,
            result.runtimeNanos
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Parallel Reduce & Brent's Theorem Speedup
router.post('/module6/parallel-reduce-brent', (req, res) => {
    try {
        const { batches, totalWorkW = 10000, criticalSpanS = 14 } = req.body;
        const reduceStats = module6.parallelReduceSupplyStats(batches);
        const brentAnalysis = module6.computeBrentsTheorem(Number(totalWorkW), Number(criticalSpanS));
        res.json(formatResponse(
            'Parallel Reduce & Brent’s Theorem Speedup (M6 – CO6)',
            `Aggregated ${reduceStats.totalBatchesProcessed} batches (Total: ${reduceStats.totalTonnageSum} T, Revenue: ₹${reduceStats.totalRevenueSum.toLocaleString('en-IN')}) | Brent Max Speedup: ${brentAnalysis.theoreticalMaxSpeedup}x`,
            { reduceStats, brentAnalysis },
            0
        ));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// COMPREHENSIVE FOODCHAIN BENCHMARK SUITE
// -----------------------------------------------------------------------------
router.post('/foodchain/benchmark', (req, res) => {
    try {
        const t0 = process.hrtime.bigint();

        // Run one key algorithm from each of the 6 modules:
        const r1 = module1.scanFoodSafetyAlerts(FOOD_QUALITY_REPORTS[0].content);
        const r2 = module2.indexAndAnalyzeFoodDocument(FOOD_QUALITY_REPORTS[1].content, 'listeria');
        const r3 = module3.autocorrectFoodCatalog('organc spinch');
        const r4 = module4.runDinicDistributionNetwork(8);
        const r5 = module5.analyzeFoodStorageConflictGraph();
        const r6 = module6.blellochParallelScan();

        const totalNanos = Number(process.hrtime.bigint() - t0);

        res.json({
            status: 'SUCCESS',
            benchmark: 'FoodChain Enterprise Algorithm & Logistics Diagnostic Suite',
            totalRuntimeMs: Number((totalNanos / 1_000_000).toFixed(4)),
            modulesExecutedCount: 6,
            results: {
                m1_stringAlerts: { totalAlerts: r1.totalAlertsFound, runtimeMs: r1.runtimeMs },
                m2_suffixIndexing: { distinctSubstrings: r2.automatonStats.distinctSubstrings, runtimeMs: r2.runtimeMs },
                m3_dpAutocorrect: { bestMatch: r3.bestMatch, similarity: r3.bestMatchSimilarity, runtimeMs: r3.runtimeMs },
                m4_dinicFlow: { maxFlowTons: r4.maxDistributionFlowTons, runtimeMs: r4.runtimeMs },
                m5_conflictGraph: { safeSetSize: r5.maximumIndependentSet.size, isolationCoverSize: r5.minimumVertexCover.size, runtimeMs: r5.runtimeMs },
                m6_parallelScan: { totalTons: r6.totalTonnageSum, runtimeMs: r6.runtimeMs }
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Alias for backwards compatibility
router.post('/benchmark/run-all', (req, res) => {
    res.redirect(307, '/api/foodchain/benchmark');
});

// -----------------------------------------------------------------------------
// PREDICTIVE LOGISTICS & FORECASTING INTELLIGENCE ENGINE
// -----------------------------------------------------------------------------
router.post('/predict/all', (req, res) => {
    try {
        const result = predictAllTheThings(req.body || {});
        res.json({
            status: 'SUCCESS',
            moduleName: 'Predictive Logistics & Spoilage Intelligence',
            operationSummary: `Executed universal predictive forecasting across ${result.productScorecards.length} monitored SKUs and ${result.hazardPredictions.length} quality audits`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/predict/spoilage', (req, res) => {
    try {
        const { productId, temperature, humidity, transitHours, ethyleneCoLocated } = req.body;
        const result = predictProductSpoilage(
            productId,
            typeof temperature === 'number' ? temperature : undefined,
            typeof humidity === 'number' ? humidity : undefined,
            transitHours,
            ethyleneCoLocated
        );
        res.json({
            status: 'SUCCESS',
            moduleName: 'Biological Kinetic Shelf-Life & Spoilage Predictor',
            operationSummary: `Forecast for ${result.product.name} @ ${result.inputConditions.currentTemp}°C: ${result.predictions.spoilageProbabilityPercent}% risk (${result.predictions.remainingShelfLifeDays} days left)`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/predict/depletion', (req, res) => {
    try {
        const { productId = 'PRD-101', horizonHours = 24 } = req.body;
        const result = predictInventoryDepletion(productId, Number(horizonHours));
        res.json({
            status: 'SUCCESS',
            moduleName: 'Inventory Depletion Velocity Predictor',
            operationSummary: `24h Depletion Forecast for ${result.productName} (Drain rate: ${result.dailyConsumptionRateTons} T/day)`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/predict/hazards', (req, res) => {
    try {
        const result = predictBiologicalHazardRisk();
        res.json({
            status: 'SUCCESS',
            moduleName: 'Pathogen & Biological Hazard Risk Predictor',
            operationSummary: `Screened ${result.length} inspection reports for bio-security risks`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/predict/bottlenecks', (req, res) => {
    try {
        const result = predictLogisticsBottlenecks();
        res.json({
            status: 'SUCCESS',
            moduleName: 'Intermodal Network Flow & Corridor Congestion Predictor',
            operationSummary: `Identified ${result.criticalBottleneckCorridors.length} bottleneck conduits at max capacity`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

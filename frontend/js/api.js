/**
 * FoodChain REST API Client
 * Enterprise asynchronous API client communicating with Node.js Express backend.
 */

const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? '/api'
    : 'http://localhost:5000/api';

class FoodChainAPI {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const startTime = performance.now();

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            const response = await fetch(url, config);
            const endTime = performance.now();
            const clientLatencyMs = (endTime - startTime).toFixed(2);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(errData.error || `HTTP ${response.status} Error`);
            }

            const data = await response.json();
            return {
                ...data,
                clientLatencyMs: Number(clientLatencyMs)
            };
        } catch (error) {
            console.error(`[FoodChain API Error] Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Health Check & Catalog
    static async checkHealth() {
        return this.request('/health', { method: 'GET' });
    }

    static async getCatalog() {
        return this.request('/foodchain/catalog', { method: 'GET' });
    }

    // -------------------------------------------------------------------------
    // MODULE 1: STRING ALGORITHMS
    // -------------------------------------------------------------------------
    static async runKMP(text, pattern) {
        return this.request('/module1/kmp', {
            method: 'POST',
            body: JSON.stringify({ text, pattern })
        });
    }

    static async runZAlgorithm(text, pattern) {
        return this.request('/module1/z-algorithm', {
            method: 'POST',
            body: JSON.stringify({ text, pattern })
        });
    }

    static async runRabinKarp(text, pattern, radix = 256, modulus = 101) {
        return this.request('/module1/rabin-karp', {
            method: 'POST',
            body: JSON.stringify({ text, pattern, radix, modulus })
        });
    }

    static async runAhoCorasick(text, keywords) {
        return this.request('/module1/aho-corasick', {
            method: 'POST',
            body: JSON.stringify({ text, keywords })
        });
    }

    // -------------------------------------------------------------------------
    // MODULE 2: SUFFIX STRUCTURES – DOCUMENT SIMILARITY
    // -------------------------------------------------------------------------
    static async runDocumentIndexer(documentText, queryPattern) {
        return this.request('/module2/document-indexer', {
            method: 'POST',
            body: JSON.stringify({ documentText, queryPattern })
        });
    }

    static async runKasaiLCP(text) {
        return this.request('/module2/kasai-lcp', {
            method: 'POST',
            body: JSON.stringify({ text })
        });
    }

    // -------------------------------------------------------------------------
    // MODULE 3: ADVANCED DYNAMIC PROGRAMMING
    // -------------------------------------------------------------------------
    static async runAutocorrect(query) {
        return this.request('/module3/autocorrect', {
            method: 'POST',
            body: JSON.stringify({ query })
        });
    }

    static async runBitmaskBundle(items, maxWeightKg = 50, budgetLimit = 160) {
        return this.request('/module3/bitmask-bundle', {
            method: 'POST',
            body: JSON.stringify({ items, maxWeightKg, budgetLimit })
        });
    }

    static async runMatrixChain(dimensions) {
        return this.request('/module3/matrix-chain', {
            method: 'POST',
            body: JSON.stringify({ dimensions })
        });
    }

    static async runOBST(keys, frequencies) {
        return this.request('/module3/obst', {
            method: 'POST',
            body: JSON.stringify({ keys, frequencies })
        });
    }

    // -------------------------------------------------------------------------
    // MODULE 4: NETWORK FLOW
    // -------------------------------------------------------------------------
    static async runEdmondsKarp(capacity, source = 0, sink = 5) {
        return this.request('/module4/edmonds-karp', {
            method: 'POST',
            body: JSON.stringify({ capacity, source, sink })
        });
    }

    static async runDinicFlow(nodeCount = 8, edges = null, source = 0, sink = 7) {
        return this.request('/module4/dinic-flow', {
            method: 'POST',
            body: JSON.stringify({ nodeCount, edges, source, sink })
        });
    }

    static async runBipartiteMatching(suppliers, warehouses, eligibilityEdges) {
        return this.request('/module4/bipartite-matching', {
            method: 'POST',
            body: JSON.stringify({ suppliers, warehouses, eligibilityEdges })
        });
    }

    // -------------------------------------------------------------------------
    // MODULE 5: NP-COMPLETENESS & APPROXIMATION
    // -------------------------------------------------------------------------
    static async run3SATStorage(clauses, variableNames) {
        return this.request('/module5/3sat-storage', {
            method: 'POST',
            body: JSON.stringify({ clauses, variableNames })
        });
    }

    static async runConflictAnalysis(items, conflictEdges) {
        return this.request('/module5/conflict-analysis', {
            method: 'POST',
            body: JSON.stringify({ items, conflictEdges })
        });
    }

    static async runVertexCoverHubs(edges, numVertices = 6) {
        return this.request('/module5/vertex-cover-hubs', {
            method: 'POST',
            body: JSON.stringify({ edges, numVertices })
        });
    }

    // -------------------------------------------------------------------------
    // MODULE 6: RANDOMIZED & PARALLEL ALGORITHMS
    // -------------------------------------------------------------------------
    static async runQuickSortDemand(items, ascending = false) {
        return this.request('/module6/quicksort-demand', {
            method: 'POST',
            body: JSON.stringify({ items, ascending })
        });
    }

    static async runReservoirIOT(stream, k = 4) {
        return this.request('/module6/reservoir-iot', {
            method: 'POST',
            body: JSON.stringify({ stream, k })
        });
    }

    static async runMillerRabinLot(lotNumber, iterations = 6) {
        return this.request('/module6/miller-rabin-lot', {
            method: 'POST',
            body: JSON.stringify({ lotNumber, iterations })
        });
    }

    static async runBlellochDepletion(hourlyDispatches) {
        return this.request('/module6/blelloch-depletion', {
            method: 'POST',
            body: JSON.stringify({ hourlyDispatches })
        });
    }

    static async runParallelReduceBrent(batches, totalWorkW = 10000, criticalSpanS = 14) {
        return this.request('/module6/parallel-reduce-brent', {
            method: 'POST',
            body: JSON.stringify({ batches, totalWorkW, criticalSpanS })
        });
    }

    // Comprehensive Benchmark
    static async runFoodChainBenchmark() {
        return this.request('/foodchain/benchmark', {
            method: 'POST'
        });
    }

    // -------------------------------------------------------------------------
    // PREDICTIVE INTELLIGENCE & FORECASTING SUITE
    // -------------------------------------------------------------------------
    static async predictAll(conditions = {}) {
        return this.request('/predict/all', {
            method: 'POST',
            body: JSON.stringify(conditions)
        });
    }

    static async predictSpoilage(params = {}) {
        return this.request('/predict/spoilage', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    static async predictDepletion(productId, horizonHours = 24) {
        return this.request('/predict/depletion', {
            method: 'POST',
            body: JSON.stringify({ productId, horizonHours })
        });
    }

    static async predictHazards() {
        return this.request('/predict/hazards', {
            method: 'POST'
        });
    }

    static async predictBottlenecks() {
        return this.request('/predict/bottlenecks', {
            method: 'POST'
        });
    }

    // -------------------------------------------------------------------------
    // DATASET & FAST-FOOD CHAINS SYNC (INDIA & USA CSV)
    // -------------------------------------------------------------------------
    static async getDatasetOverview() {
        return this.request('/dataset/overview', { method: 'GET' });
    }

    static async getDatasetChains(search = '', category = '') {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (category) query.append('category', category);
        const qStr = query.toString() ? `?${query.toString()}` : '';
        return this.request(`/dataset/chains${qStr}`, { method: 'GET' });
    }

    static async getDatasetCOAnalytics() {
        return this.request('/dataset/co-analytics', { method: 'GET' });
    }
}

window.FoodChainAPI = FoodChainAPI;

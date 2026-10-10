const module1 = require('./module1_string_matching');
const module2 = require('./module2_document_similarity');
const module3 = require('./module3_dynamic_programming');
const module4 = require('./module4_network_flow');
const module5 = require('./module5_np_approximation');
const module6 = require('./module6_randomized_algo');

module.exports = {
    module1,
    module2,
    module3,
    module4,
    module5,
    module6,
    metadata: {
        platform: 'FoodChain – Food Supply & Distribution Management Platform',
        version: '3.0.0-enterprise',
        description: 'Large-scale food-supply logistics platform processing farmers, warehouses, products, quality reports, and continuous IoT events via advanced DSA algorithms.',
        modules: [
            {
                id: 1,
                co: 'M1 – CO1',
                name: 'String Algorithms in Food Supply Chain',
                algorithms: ['KMP (Product Names & Terms)', 'Z-Function (Repeated Descriptions)', 'Rabin-Karp (Shipment Codes)', 'Aho-Corasick (Multi-Hazard Warnings)'],
                complexities: 'O(n + m) linear string search'
            },
            {
                id: 2,
                co: 'M2 – CO2',
                name: 'Suffix Structures – Document Similarity & Indexing',
                algorithms: ['Suffix Arrays (Document Indexing)', 'Kasai LCP (Repeated Quality Claims)', 'Suffix Automaton / SAM (Instant Substring Queries)'],
                complexities: 'O(n) Suffix Indexing & O(m) Substring Queries'
            },
            {
                id: 3,
                co: 'M3 – CO3',
                name: 'Advanced Dynamic Programming',
                algorithms: ['Damerau-Levenshtein (Fuzzy Product Autocorrect)', 'Bitmask DP (Emergency Food Bundles)', 'Matrix-Chain Multiplication (Pipeline Optimizer)', 'Optimal BST (Catalog Access Optimization)'],
                complexities: 'O(m·n), O(2ⁿ·n), O(n³)'
            },
            {
                id: 4,
                co: 'M4 – CO4',
                name: 'Network Flow & Distribution Optimization',
                algorithms: ['Edmonds-Karp (Distribution Capacity & Min-Cut)', "Dinic's Algorithm (Multi-Tier Blocking Flow)", 'Bipartite Matching (Supplier-to-Warehouse Allocation)'],
                complexities: 'O(V·E²), O(V²·E), O(V·E)'
            },
            {
                id: 5,
                co: 'M5 – CO5',
                name: 'NP-Completeness and Approximation',
                algorithms: ['3-SAT (Perishable Storage Rules)', '3-SAT → CLIQUE Reduction', 'CLIQUE → Independent Set → Vertex Cover (Conflict Graph)', 'Vertex Cover 2-Approximation (Inspection Checkpoints)'],
                complexities: 'NP-Complete reductions & Polynomial 2-Approximation'
            },
            {
                id: 6,
                co: 'M6 – CO6',
                name: 'Randomized and Parallel Algorithms',
                algorithms: ['Randomized QuickSort (Demand Ranking)', 'Reservoir Sampling (Live IoT Stream Monitoring)', 'Miller-Rabin (Cryptographic Batch Lot Verification)', 'Blelloch Scan (Cumulative Depletion Curve)', 'Parallel Reduce & Brent’s Theorem (Work-Span Speedup)'],
                complexities: 'O(n log n), O(N), O(k log³ n), Work O(n) / Span O(log n)'
            }
        ]
    }
};

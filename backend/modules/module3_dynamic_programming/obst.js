/**
 * Module 3: Advanced Dynamic Programming - Optimal Binary Search Tree (OBST)
 * Used in FoodChain for frequently searched food products based on access frequencies.
 * Minimizes expected search cost in high-frequency order dispatch systems.
 * Time Complexity: O(n³) | Space Complexity: O(n²)
 */

function buildOBST(keysList, frequenciesList) {
    const startTime = process.hrtime.bigint();

    const keys = keysList || ['Avocados', 'Beef', 'Milk', 'Salmon', 'Spinach', 'Wheat'];
    const p = (frequenciesList || [0.25, 0.10, 0.30, 0.05, 0.20, 0.10]).map(Number);
    const n = keys.length;

    // e[i][j] stores expected search cost of optimal subtree with keys k_i .. k_j
    // w[i][j] stores sum of probabilities in subtree
    // root[i][j] stores index of key chosen as root of optimal subtree
    const e = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(0));
    const w = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(0));
    const root = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));

    // Base cases
    for (let i = 1; i <= n + 1; i++) {
        e[i][i - 1] = 0;
        w[i][i - 1] = 0;
    }

    // Subtree length L from 1 to n
    for (let L = 1; L <= n; L++) {
        for (let i = 1; i <= n - L + 1; i++) {
            const j = i + L - 1;
            e[i][j] = Number.MAX_SAFE_INTEGER;
            w[i][j] = w[i][j - 1] + p[j - 1];

            for (let r = i; r <= j; r++) {
                const cost = e[i][r - 1] + e[r + 1][j] + w[i][j];
                if (cost < e[i][j]) {
                    e[i][j] = cost;
                    root[i][j] = r;
                }
            }
        }
    }

    // Reconstruct tree structure recursively
    function reconstructTree(i, j, depth = 0) {
        if (i > j) return null;
        const r = root[i][j];
        return {
            key: keys[r - 1],
            frequency: p[r - 1],
            depth,
            left: reconstructTree(i, r - 1, depth + 1),
            right: reconstructTree(r + 1, j, depth + 1)
        };
    }

    const tree = reconstructTree(1, n, 0);
    const minExpectedCost = Number(e[1][n].toFixed(4));

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Optimal Binary Search Tree (OBST)',
        keysWithFrequencies: keys.map((k, idx) => ({ key: k, probability: p[idx] })),
        minExpectedSearchCost: minExpectedCost,
        rootKey: keys[root[1][n] - 1],
        treeStructure: tree,
        costTable: e.slice(1, n + 1).map(row => row.slice(1, n + 1)),
        rootTable: root.slice(1, n + 1).map(row => row.slice(1, n + 1)),
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(N³)',
            space: 'O(N²)',
            application: 'Structures catalog search index according to query popularity to minimize search latency.'
        }
    };
}

module.exports = {
    buildOBST
};

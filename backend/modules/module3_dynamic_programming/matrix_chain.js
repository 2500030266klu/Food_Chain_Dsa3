/**
 * Module 3: Dynamic Programming - Matrix Chain Multiplication Order
 * Matches Fresh_Chain.java algorithm: Time O(n^3), Space O(n^2)
 */

function buildParenthesization(s, i, j) {
    if (i === j) {
        return `A${i}`;
    }
    const k = s[i][j];
    const left = buildParenthesization(s, i, k);
    const right = buildParenthesization(s, k + 1, j);
    return `(${left} × ${right})`;
}

function matrixChainOrder(dimensions) {
    const startTime = process.hrtime.bigint();
    const p = dimensions.map(Number);
    const n = p.length;

    if (n < 2) {
        const endTime = process.hrtime.bigint();
        return {
            minMultiplications: 0,
            dimensions: p,
            parenthesization: '',
            dpTable: [],
            splitTable: [],
            runtimeNanos: Number(endTime - startTime),
            runtimeMs: Number(endTime - startTime) / 1_000_000
        };
    }

    // dp[i][j] stores minimum number of scalar multiplications
    const dp = Array.from({ length: n }, () => new Array(n).fill(0));
    // split[i][j] stores index k that achieved minimum cost
    const split = Array.from({ length: n }, () => new Array(n).fill(0));

    // Matrices are A1..A_{n-1}, dimensions are p[0]..p[n-1]
    const matrices = [];
    for (let idx = 1; idx < n; idx++) {
        matrices.push({
            name: `A${idx}`,
            rows: p[idx - 1],
            cols: p[idx],
            label: `A${idx} (${p[idx - 1]} × ${p[idx]})`
        });
    }

    // Chain length L from 2 to n-1
    for (let L = 2; L < n; L++) {
        for (let i = 1; i < n - L + 1; i++) {
            const j = i + L - 1;
            dp[i][j] = Number.MAX_SAFE_INTEGER;
            for (let k = i; k <= j - 1; k++) {
                const cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];
                if (cost < dp[i][j]) {
                    dp[i][j] = cost;
                    split[i][j] = k;
                }
            }
        }
    }

    const minScalarOps = dp[1][n - 1];
    const parenthesizedStr = buildParenthesization(split, 1, n - 1);

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Matrix Chain Multiplication (Interval DP)',
        dimensions: p,
        matrices,
        numMatrices: n - 1,
        minScalarMultiplications: minScalarOps,
        optimalParenthesization: parenthesizedStr,
        costTable: dp,
        splitTable: split,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(n³)',
            space: 'O(n²)',
            description: 'Interval dynamic programming determining optimal associative evaluation tree to minimize scalar operations.'
        }
    };
}

module.exports = {
    matrixChainOrder
};

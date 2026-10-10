/**
 * Module 6: Randomized & Parallel Algorithms - Blelloch Parallel Scan
 * Work-efficient parallel prefix sum algorithm used in FoodChain to compute
 * cumulative inventory depletion curves and distribution timeline totals.
 * Work: O(n) | Span (Parallel Depth): O(log n)
 */

function blellochParallelScan(hourlyDispatchesTons) {
    const startTime = process.hrtime.bigint();

    // Default 16-hour distribution batch dispatches in metric tons
    const input = (hourlyDispatchesTons || [12, 18, 25, 30, 42, 55, 60, 48, 35, 28, 20, 15, 10, 8, 5, 2]).map(Number);
    
    // Pad to nearest power of 2
    let n = 1;
    while (n < input.length) n *= 2;
    const a = new Array(n).fill(0);
    for (let i = 0; i < input.length; i++) a[i] = input[i];

    const upSweepTree = [];
    const downSweepTree = [];

    // Phase 1: Up-Sweep (Parallel Reduce Tree)
    for (let d = 0; d < Math.log2(n); d++) {
        const step = 1 << (d + 1);
        const half = 1 << d;
        const levelOps = [];

        for (let k = 0; k < n; k += step) {
            a[k + step - 1] = a[k + half - 1] + a[k + step - 1];
            levelOps.push({ index: k + step - 1, val: a[k + step - 1] });
        }
        upSweepTree.push({ depth: d, operations: levelOps });
    }

    const totalTonnageSum = a[n - 1];
    // Set root to identity (0) for exclusive prefix sum
    a[n - 1] = 0;

    // Phase 2: Down-Sweep (Parallel Distribution Tree)
    for (let d = Math.log2(n) - 1; d >= 0; d--) {
        const step = 1 << (d + 1);
        const half = 1 << d;
        const levelOps = [];

        for (let k = 0; k < n; k += step) {
            const t = a[k + half - 1];
            a[k + half - 1] = a[k + step - 1];
            a[k + step - 1] = a[k + step - 1] + t;
            levelOps.push({ leftChild: k + half - 1, rightChild: k + step - 1 });
        }
        downSweepTree.push({ depth: d, operations: levelOps });
    }

    // Convert exclusive scan to inclusive prefix sum for timeline display
    const inclusiveCumulativeTons = [];
    for (let i = 0; i < input.length; i++) {
        inclusiveCumulativeTons.push(a[i] + input[i]);
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Blelloch Work-Efficient Parallel Prefix Scan',
        timePointsCount: input.length,
        hourlyDispatches: input,
        totalTonnageSum,
        cumulativeDistributionCurve: inclusiveCumulativeTons,
        exclusiveScan: a.slice(0, input.length),
        parallelMetrics: {
            workComplexity: 'O(n) - Total additions: 2n - 2',
            spanComplexity: 'O(log n) - Critical path depth: 2 log n',
            efficiency: 'Work-Efficient (Parallel algorithm does no more asymptotic work than sequential scan)'
        },
        upSweepTreeLevels: upSweepTree.length,
        downSweepTreeLevels: downSweepTree.length,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000
    };
}

module.exports = {
    blellochParallelScan
};

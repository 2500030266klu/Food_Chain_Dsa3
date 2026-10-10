/**
 * Module 6: Randomized & Parallel Algorithms - Parallel Reduce & Brent's Theorem
 * Used in FoodChain for enterprise supply aggregation (tonnage, revenue, spoilage)
 * and analyzing multi-processor parallel speedup bounds via Brent's Theorem.
 * Work: O(n) | Span: O(log n) | Brent's Bound: T_p <= W/p + S
 */

function parallelReduceSupplyStats(batches) {
    const defaultBatches = [
        { batchId: 'B-01', product: 'Spinach', tons: 45, revenue: 202500, spoilageTons: 0.8 },
        { batchId: 'B-02', product: 'Avocados', tons: 60, revenue: 372000, spoilageTons: 1.2 },
        { batchId: 'B-03', product: 'Milk', tons: 110, revenue: 231000, spoilageTons: 0.5 },
        { batchId: 'B-04', product: 'Salmon', tons: 25, revenue: 462500, spoilageTons: 0.2 },
        { batchId: 'B-05', product: 'Tomatoes', tons: 80, revenue: 304000, spoilageTons: 2.1 },
        { batchId: 'B-06', product: 'Wheat', tons: 220, revenue: 264000, spoilageTons: 1.0 },
        { batchId: 'B-07', product: 'Apples', tons: 95, revenue: 380000, spoilageTons: 1.5 },
        { batchId: 'B-08', product: 'Beef', tons: 35, revenue: 840000, spoilageTons: 0.3 }
    ];

    const data = batches && batches.length > 0 ? batches : defaultBatches;
    const n = data.length;

    // Parallel Reduction Tree for Total Tonnage & Revenue
    let tonsWork = 0;
    let revWork = 0;
    const treeLevels = [];

    let currentLevel = data.map(d => ({ tons: d.tons, revenue: d.revenue, spoilage: d.spoilageTons }));

    while (currentLevel.length > 1) {
        const nextLevel = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
            if (i + 1 < currentLevel.length) {
                tonsWork++;
                revWork++;
                nextLevel.push({
                    tons: currentLevel[i].tons + currentLevel[i + 1].tons,
                    revenue: currentLevel[i].revenue + currentLevel[i + 1].revenue,
                    spoilage: Number((currentLevel[i].spoilage + currentLevel[i + 1].spoilage).toFixed(2))
                });
            } else {
                nextLevel.push(currentLevel[i]);
            }
        }
        treeLevels.push({ levelSize: currentLevel.length, nextSize: nextLevel.length });
        currentLevel = nextLevel;
    }

    const totalStats = currentLevel[0];
    const totalWorkOps = tonsWork + revWork;
    const spanSteps = Math.ceil(Math.log2(n));

    return {
        totalBatchesProcessed: n,
        totalTonnageSum: totalStats.tons,
        totalRevenueSum: totalStats.revenue,
        totalSpoilageTons: totalStats.spoilage,
        parallelTreeDepth: spanSteps,
        reductionOperations: totalWorkOps
    };
}

function computeBrentsTheorem(totalWorkW = 10000, criticalSpanS = 14, processorCounts = [1, 2, 4, 8, 16, 32]) {
    const W = Number(totalWorkW);
    const S = Number(criticalSpanS);

    // Brent's Theorem: T_p <= floor((W - S) / p) + S
    const speedupProfiles = processorCounts.map(p => {
        const theoreticalTime = Math.floor((W - S) / p) + S;
        const linearSpeedupIdeal = p;
        const actualSpeedup = Number((W / theoreticalTime).toFixed(2));
        const efficiencyPct = Number(((actualSpeedup / p) * 100).toFixed(1));

        return {
            processorsP: p,
            theoreticalExecutionTimeTp: theoreticalTime,
            speedupFactor: actualSpeedup,
            processorEfficiency: `${efficiencyPct}%`
        };
    });

    return {
        theorem: "Brent's Scheduling Theorem: T_p ≤ (W - S)/p + S",
        totalWorkW: W,
        criticalPathSpanS: S,
        theoreticalMaxSpeedup: Number((W / S).toFixed(2)),
        speedupProfiles
    };
}

module.exports = {
    parallelReduceSupplyStats,
    computeBrentsTheorem
};

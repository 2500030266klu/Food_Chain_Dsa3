/**
 * Module 6: Randomised Algorithms - Reservoir Sampling
 * Matches Fresh_Chain.java algorithm: Samples k items uniformly from an unknown/streaming array of length N.
 * Time Complexity: O(N) | Space Complexity: O(k)
 */

function reservoirSample(stream, k) {
    const startTime = process.hrtime.bigint();
    const streamArr = Array.isArray(stream) ? stream.map(Number) : [];
    const n = streamArr.length;
    k = Math.max(1, Math.min(Number(k), n));

    const reservoir = [];
    const stepLogs = [];

    // Fill initial reservoir with first k elements
    for (let i = 0; i < k && i < n; i++) {
        reservoir[i] = streamArr[i];
        stepLogs.push({
            index: i,
            element: streamArr[i],
            probability: '1.00 (Initial Fill)',
            action: `Directly placed in reservoir slot [${i}]`,
            reservoirState: [...reservoir]
        });
    }

    // Process remaining elements from index k to n - 1
    for (let i = k; i < n; i++) {
        // j is random integer from 0 to i (inclusive)
        const j = Math.floor(Math.random() * (i + 1));
        const included = j < k;
        const prob = (k / (i + 1)).toFixed(4);

        if (included) {
            const evicted = reservoir[j];
            reservoir[j] = streamArr[i];
            stepLogs.push({
                index: i,
                element: streamArr[i],
                replacementSlot: j,
                evictedElement: evicted,
                probability: `${prob} (k / (i+1))`,
                action: `Selected! Replaced element ${evicted} at slot [${j}]`,
                reservoirState: [...reservoir]
            });
        } else {
            if (stepLogs.length < 50) {
                stepLogs.push({
                    index: i,
                    element: streamArr[i],
                    probability: `${prob} (k / (i+1))`,
                    action: `Skipped (random index ${j} ≥ k)`,
                    reservoirState: [...reservoir]
                });
            }
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Reservoir Sampling (Uniform Streaming Distribution)',
        streamSize: n,
        reservoirSize: k,
        reservoir,
        stepLogs,
        theoreticalProbability: n > 0 ? (k / n).toFixed(4) : 0,
        theoreticalFormula: `P(Any element in reservoir) = k / N = ${k} / ${n} = ${n > 0 ? (k / n).toFixed(4) : 0}`,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(N)',
            space: 'O(k)',
            description: 'Online streaming algorithm guaranteeing uniform 1/N selection probability without storing full dataset in memory.'
        }
    };
}

module.exports = {
    reservoirSample
};

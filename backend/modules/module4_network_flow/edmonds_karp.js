/**
 * Module 4: Network Flow - Edmonds-Karp Maximum Flow Algorithm
 * Matches Fresh_Chain.java algorithm: Time O(V * E^2), Space O(V^2)
 */

function bfsFlow(residual, source, sink, parent) {
    const v = residual.length;
    const visited = new Array(v).fill(false);
    const queue = [];

    queue.push(source);
    visited[source] = true;
    parent[source] = -1;

    while (queue.length > 0) {
        const u = queue.shift();
        for (let next = 0; next < v; next++) {
            if (!visited[next] && residual[u][next] > 0) {
                if (next === sink) {
                    parent[next] = u;
                    return true;
                }
                queue.push(next);
                parent[next] = u;
                visited[next] = true;
            }
        }
    }
    return false;
}

function edmondsKarp(capacityMatrix, source = 0, sink = null) {
    const startTime = process.hrtime.bigint();
    const v = capacityMatrix.length;
    if (sink === null) sink = v - 1;

    // Deep copy capacity to residual
    const residual = capacityMatrix.map(row => [...row]);
    const parent = new Array(v).fill(-1);
    let maxFlow = 0;
    const augmentingPaths = [];

    let iteration = 0;
    while (bfsFlow(residual, source, sink, parent)) {
        iteration++;
        let pathFlow = Number.MAX_SAFE_INTEGER;
        const currentPath = [];

        // Find bottleneck capacity along path
        for (let curr = sink; curr !== source; curr = parent[curr]) {
            const prev = parent[curr];
            pathFlow = Math.min(pathFlow, residual[prev][curr]);
        }

        // Reconstruct path
        for (let curr = sink; curr !== -1; curr = parent[curr]) {
            currentPath.unshift(curr);
        }

        // Update residual capacities
        for (let curr = sink; curr !== source; curr = parent[curr]) {
            const prev = parent[curr];
            residual[prev][curr] -= pathFlow;
            residual[curr][prev] += pathFlow;
        }

        maxFlow += pathFlow;

        augmentingPaths.push({
            iteration,
            path: currentPath,
            pathString: currentPath.join(' → '),
            bottleneckFlow: pathFlow,
            cumulativeFlow: maxFlow
        });
    }

    // Determine Min-Cut: find reachable nodes in residual network from source
    const visitedResidual = new Array(v).fill(false);
    const cutQueue = [source];
    visitedResidual[source] = true;
    while (cutQueue.length > 0) {
        const u = cutQueue.shift();
        for (let next = 0; next < v; next++) {
            if (!visitedResidual[next] && residual[u][next] > 0) {
                visitedResidual[next] = true;
                cutQueue.push(next);
            }
        }
    }

    const sourcePartition = [];
    const sinkPartition = [];
    for (let i = 0; i < v; i++) {
        if (visitedResidual[i]) sourcePartition.push(i);
        else sinkPartition.push(i);
    }

    // Compute edge flow matrix: flow = capacity - residual
    const edgeFlows = [];
    for (let i = 0; i < v; i++) {
        for (let j = 0; j < v; j++) {
            if (capacityMatrix[i][j] > 0) {
                const flowVal = capacityMatrix[i][j] - residual[i][j];
                edgeFlows.push({
                    from: i,
                    to: j,
                    capacity: capacityMatrix[i][j],
                    flow: Math.max(0, flowVal),
                    residualCapacity: residual[i][j],
                    isSaturated: flowVal >= capacityMatrix[i][j]
                });
            }
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Edmonds-Karp Maximum Flow (BFS Ford-Fulkerson)',
        numVertices: v,
        source,
        sink,
        maxFlow,
        augmentingPaths,
        edgeFlows,
        minCut: {
            sourcePartition,
            sinkPartition,
            cutCapacity: maxFlow
        },
        initialCapacity: capacityMatrix,
        residualCapacity: residual,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(V · E²)',
            space: 'O(V²)',
            description: 'Computes maximum network flow using BFS shortest augmenting paths, guaranteeing polynomial termination.'
        }
    };
}

module.exports = {
    edmondsKarp,
    bfsFlow
};

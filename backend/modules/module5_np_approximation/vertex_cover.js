/**
 * Module 5: NP-Completeness & Approximation - Vertex Cover 2-Approximation
 * Matches Fresh_Chain.java algorithm: Time O(V + E), Approximation Factor: 2
 */

function vertexCoverApproximation(edges, numVertices) {
    const startTime = process.hrtime.bigint();
    const visited = new Array(numVertices).fill(false);
    const vertexCover = [];
    const selectedEdges = [];
    const stepLogs = [];

    // Calculate vertex degrees
    const degrees = new Array(numVertices).fill(0);
    edges.forEach(([u, v]) => {
        if (u < numVertices) degrees[u]++;
        if (v < numVertices) degrees[v]++;
    });

    edges.forEach((edge, index) => {
        const [u, v] = edge;
        if (!visited[u] && !visited[v]) {
            visited[u] = true;
            visited[v] = true;
            vertexCover.push(u);
            vertexCover.push(v);
            selectedEdges.push({ u, v, edgeIndex: index });

            stepLogs.push({
                step: selectedEdges.length,
                edge: [u, v],
                action: `Selected independent edge (${u}, ${v}) and added both endpoints to cover set`,
                currentCover: [...vertexCover]
            });
        }
    });

    // Check coverage of all edges
    const edgeCoverage = edges.map(([u, v]) => {
        const isCovered = visited[u] || visited[v];
        return {
            edge: [u, v],
            covered: isCovered,
            coveredBy: visited[u] && visited[v] ? [u, v] : (visited[u] ? [u] : [v])
        };
    });

    const isAllCovered = edgeCoverage.every(e => e.covered);

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Vertex Cover 2-Approximation (Maximal Matching)',
        numVertices,
        numEdges: edges.length,
        edges,
        vertexCover: vertexCover.sort((a, b) => a - b),
        coverSize: vertexCover.length,
        selectedEdges,
        stepLogs,
        edgeCoverage,
        isAllCovered,
        approximationBound: {
            ratio: '2',
            theoreticalBound: 'Cover Size ≤ 2 × OPT(Minimum Vertex Cover)',
            matchedEdgesCount: selectedEdges.length
        },
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(V + E)',
            space: 'O(V)',
            description: 'Greedy maximal matching heuristic delivering polynomial 2-approximation for NP-hard minimum vertex cover.'
        }
    };
}

module.exports = {
    vertexCoverApproximation
};

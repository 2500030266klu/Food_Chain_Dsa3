/**
 * Module 4: Network Flow - Dinic's Algorithm
 * Used in FoodChain for large-scale multi-tier distribution networks
 * (Farms -> Processing Hubs -> Regional Depots -> Supermarket Markets).
 * Computes maximum flow using BFS Level Graphs and DFS Blocking Flows.
 * Time Complexity: O(V² · E) | Space Complexity: O(V + E)
 */

class DinicEdge {
    constructor(to, rev, cap, flow = 0) {
        this.to = to;
        this.rev = rev;
        this.cap = cap;
        this.flow = flow;
    }
}

class DinicGraph {
    constructor(v) {
        this.v = v;
        this.adj = Array.from({ length: v }, () => []);
        this.level = new Array(v).fill(-1);
        this.ptr = new Array(v).fill(0);
    }

    addEdge(from, to, cap) {
        const a = new DinicEdge(to, this.adj[to].length, cap);
        const b = new DinicEdge(from, this.adj[from].length, 0);
        this.adj[from].push(a);
        this.adj[to].push(b);
    }

    bfs(s, t) {
        this.level.fill(-1);
        this.level[s] = 0;
        const q = [s];

        while (q.length > 0) {
            const v = q.shift();
            for (const edge of this.adj[v]) {
                if (edge.cap - edge.flow > 0 && this.level[edge.to] === -1) {
                    this.level[edge.to] = this.level[v] + 1;
                    q.push(edge.to);
                }
            }
        }
        return this.level[t] !== -1;
    }

    dfs(v, t, pushed) {
        if (pushed === 0) return 0;
        if (v === t) return pushed;

        for (let cid = this.ptr[v]; cid < this.adj[v].length; cid++) {
            this.ptr[v] = cid;
            const edge = this.adj[v][cid];
            const tr = edge.to;

            if (this.level[v] + 1 !== this.level[tr] || edge.cap - edge.flow === 0) {
                continue;
            }

            const trPushed = this.dfs(tr, t, Math.min(pushed, edge.cap - edge.flow));
            if (trPushed === 0) continue;

            edge.flow += trPushed;
            this.adj[tr][edge.rev].flow -= trPushed;
            return trPushed;
        }
        return 0;
    }

    maxFlow(s, t) {
        let flow = 0;
        let phases = 0;

        while (this.bfs(s, t)) {
            phases++;
            this.ptr.fill(0);
            while (true) {
                const pushed = this.dfs(s, t, Number.MAX_SAFE_INTEGER);
                if (pushed === 0) break;
                flow += pushed;
            }
        }
        return { maxFlow: flow, phases };
    }
}

function runDinicDistributionNetwork(nodeCount = 8, customEdges = null, source = 0, sink = 7) {
    const startTime = process.hrtime.bigint();

    // Default multi-tier FoodChain distribution topology:
    // 0: Farm Aggregator
    // 1, 2: Cold Processing Depots
    // 3, 4: Regional Warehouses
    // 5, 6: City Cross-Docks
    // 7: Consumer Market
    const edges = customEdges || [
        { from: 0, to: 1, cap: 30, label: 'Farm -> Cold Depot Alpha' },
        { from: 0, to: 2, cap: 25, label: 'Farm -> Cold Depot Beta' },
        { from: 1, to: 3, cap: 18, label: 'Depot Alpha -> WH North' },
        { from: 1, to: 4, cap: 15, label: 'Depot Alpha -> WH Central' },
        { from: 2, to: 3, cap: 12, label: 'Depot Beta -> WH North' },
        { from: 2, to: 4, cap: 20, label: 'Depot Beta -> WH Central' },
        { from: 3, to: 5, cap: 22, label: 'WH North -> Metro Cross-Dock' },
        { from: 4, to: 6, cap: 25, label: 'WH Central -> Port Terminal' },
        { from: 5, to: 7, cap: 25, label: 'Metro -> Consumer Market' },
        { from: 6, to: 7, cap: 25, label: 'Port -> Consumer Market' }
    ];

    const graph = new DinicGraph(nodeCount);
    edges.forEach(e => graph.addEdge(e.from, e.to, e.cap));

    const result = graph.maxFlow(source, sink);

    // Extract edge flow results
    const edgeResults = [];
    for (let u = 0; u < nodeCount; u++) {
        for (const edge of graph.adj[u]) {
            if (edge.cap > 0) { // original forward edge
                edgeResults.push({
                    from: u,
                    to: edge.to,
                    capacity: edge.cap,
                    flow: edge.flow,
                    utilizationPct: Number(((edge.flow / edge.cap) * 100).toFixed(1)),
                    isSaturated: edge.flow >= edge.cap
                });
            }
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: "Dinic's Algorithm (Level Graph + Blocking Flow)",
        source,
        sink,
        totalNodes: nodeCount,
        maxDistributionFlowTons: result.maxFlow,
        bfsPhasesCount: result.phases,
        edges: edgeResults,
        saturatedBottlenecks: edgeResults.filter(e => e.isSaturated),
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(V² · E)',
            space: 'O(V + E)',
            application: 'Scales to large multi-tiered food supply networks with guaranteed polynomial blocking flows.'
        }
    };
}

module.exports = {
    DinicGraph,
    runDinicDistributionNetwork
};

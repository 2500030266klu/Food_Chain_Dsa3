/**
 * Module 5: NP-Completeness - Reductions & Conflict Graph Analysis
 * 1. 3-SAT → CLIQUE Reduction: Transforms k clauses into a graph where a k-clique
 *    corresponds to a valid constraint assignment.
 * 2. CLIQUE → INDEPENDENT SET → VERTEX COVER Reduction:
 *    Analyzes incompatible perishable foods (e.g. Apples emit ethylene -> ruins Spinach).
 *    Independent Set = Mutually compatible food bundle that can share the same compartment.
 *    Vertex Cover = Minimum set of conflicting items to isolate in specialized cold vaults.
 */

function reduce3SATtoClique(clausesInput) {
    const clauses = clausesInput || [
        [1, 2, 3],
        [-1, -2, 4],
        [2, -3, -4]
    ];

    const k = clauses.length; // target clique size
    const nodes = [];

    // Each literal occurrence in a clause becomes a vertex (clauseIndex, literal)
    clauses.forEach((clause, cIdx) => {
        clause.forEach((lit, pos) => {
            nodes.push({
                id: nodes.length,
                clauseId: cIdx,
                literal: lit,
                label: `C${cIdx + 1}:${lit > 0 ? `x${lit}` : `¬x${Math.abs(lit)}`}`
            });
        });
    });

    // Edges between vertices in different clauses that are NOT contradictions (lit1 != -lit2)
    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const u = nodes[i];
            const v = nodes[j];

            if (u.clauseId !== v.clauseId && u.literal !== -v.literal) {
                edges.push([u.id, v.id]);
            }
        }
    }

    return {
        reductionType: '3-SAT → CLIQUE',
        targetCliqueSizeK: k,
        constructedGraph: {
            verticesCount: nodes.length,
            edgesCount: edges.length,
            nodes,
            sampleEdges: edges.slice(0, 15)
        },
        soundnessGuarantee: `Formula is satisfiable iff graph contains a clique of size ${k}.`
    };
}

function analyzeFoodStorageConflictGraph(itemsInput, conflictsInput) {
    const startTime = process.hrtime.bigint();

    // Default perishable food products
    const items = itemsInput || [
        { id: 0, name: 'Hass Avocados (Ethylene Emitter)' },
        { id: 1, name: 'Baby Spinach (Ethylene Sensitive)' },
        { id: 2, name: 'Atlantic Salmon (Odor & Deep Chill)' },
        { id: 3, name: 'Whole Milk (Odor Absorber)' },
        { id: 4, name: 'Heirloom Tomatoes (Ethylene Emitter)' },
        { id: 5, name: 'Grass-Fed Beef (Raw Meat)' }
    ];

    // Conflict edges (items that CANNOT share unventilated compartment)
    const conflictEdges = conflictsInput || [
        [0, 1], // Avocados spoil Spinach
        [4, 1], // Tomatoes spoil Spinach
        [2, 3], // Salmon aroma contaminates Milk
        [5, 1], // Raw beef cross-contaminates Spinach
        [0, 3]  // Avocados odor affects Milk
    ];

    const n = items.length;
    // Find Maximum Independent Set (brute force for small n <= 16)
    let maxIndepSet = [];
    for (let mask = 0; mask < (1 << n); mask++) {
        const candidate = [];
        for (let i = 0; i < n; i++) {
            if ((mask & (1 << i)) !== 0) candidate.push(i);
        }

        let isIndependent = true;
        for (const [u, v] of conflictEdges) {
            if (candidate.includes(u) && candidate.includes(v)) {
                isIndependent = false;
                break;
            }
        }

        if (isIndependent && candidate.length > maxIndepSet.length) {
            maxIndepSet = candidate;
        }
    }

    // Minimum Vertex Cover is the complement V \ IndependentSet
    const minVertexCover = [];
    for (let i = 0; i < n; i++) {
        if (!maxIndepSet.includes(i)) {
            minVertexCover.push(i);
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'CLIQUE ↔ INDEPENDENT SET ↔ VERTEX COVER Conflict Analysis',
        numItems: n,
        conflictEdgesCount: conflictEdges.length,
        items,
        conflictEdges,
        maximumIndependentSet: {
            size: maxIndepSet.length,
            itemIndices: maxIndepSet,
            items: maxIndepSet.map(idx => items[idx].name),
            interpretation: 'Maximum mutually compatible food bundle that CAN safely be co-stored together without spoilage.'
        },
        minimumVertexCover: {
            size: minVertexCover.length,
            itemIndices: minVertexCover,
            items: minVertexCover.map(idx => items[idx].name),
            interpretation: 'Minimum critical products that must be removed/isolated in dedicated temperature vaults to eliminate all storage conflicts.'
        },
        dualityVerification: `${maxIndepSet.length} (Max Independent Set) + ${minVertexCover.length} (Min Vertex Cover) = ${n} (Total Products)`,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000
    };
}

module.exports = {
    reduce3SATtoClique,
    analyzeFoodStorageConflictGraph
};

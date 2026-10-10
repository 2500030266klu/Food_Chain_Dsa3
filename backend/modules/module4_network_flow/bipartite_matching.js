/**
 * Module 4: Network Flow - Maximum Bipartite Matching
 * Used in FoodChain to assign certified agricultural suppliers to eligible
 * temperature-controlled warehouses based on cold-chain certifications and capacity.
 * Time Complexity: O(V · E) | Space Complexity: O(V + E)
 */

function solveBipartiteMatching(suppliersList, warehousesList, eligibilityEdges) {
    const startTime = process.hrtime.bigint();

    const suppliers = suppliersList || [
        { id: 'S1', name: 'Green Valley Organic (Produce)' },
        { id: 'S2', name: 'Highland Orchard (Fruits)' },
        { id: 'S3', name: 'Cascade Dairy (Milk/Cheese)' },
        { id: 'S4', name: 'Pacific Blue Ocean (Seafood)' },
        { id: 'S5', name: 'Heartland Grain (Wheat/Corn)' }
    ];

    const warehouses = warehousesList || [
        { id: 'W1', name: 'Pacific Northwest Cold Hub' },
        { id: 'W2', name: 'Central Valley Multi-Temp' },
        { id: 'W3', name: 'Midwest Bulk Silo' },
        { id: 'W4', name: 'Bay Area Metro Cross-Dock' }
    ];

    // Default eligibility graph (Supplier index -> list of compatible Warehouse indices)
    // S0 (Produce) -> W0, W1, W3
    // S1 (Fruits)  -> W1, W3
    // S2 (Dairy)   -> W0, W1
    // S3 (Seafood) -> W0, W3
    // S4 (Grains)  -> W2
    const adj = eligibilityEdges || [
        [0, 1, 3], // S0 -> W0, W1, W3
        [1, 3],    // S1 -> W1, W3
        [0, 1],    // S2 -> W0, W1
        [0, 3],    // S3 -> W0, W3
        [2]        // S4 -> W2
    ];

    const numSuppliers = suppliers.length;
    const numWarehouses = warehouses.length;

    // matchWarehouse[w] = supplier matched to warehouse w (-1 if free)
    const matchWarehouse = new Array(numWarehouses).fill(-1);

    function bpmDFS(u, seen) {
        for (const v of (adj[u] || [])) {
            if (!seen[v]) {
                seen[v] = true;
                // If warehouse v is not assigned or previously assigned supplier can find alternate
                if (matchWarehouse[v] < 0 || bpmDFS(matchWarehouse[v], seen)) {
                    matchWarehouse[v] = u;
                    return true;
                }
            }
        }
        return false;
    }

    let matchCount = 0;
    const assignmentLog = [];

    for (let u = 0; u < numSuppliers; u++) {
        const seen = new Array(numWarehouses).fill(false);
        if (bpmDFS(u, seen)) {
            matchCount++;
        }
    }

    // Decode assignments
    const finalMatches = [];
    for (let w = 0; w < numWarehouses; w++) {
        const s = matchWarehouse[w];
        if (s >= 0) {
            finalMatches.push({
                supplierId: suppliers[s].id,
                supplierName: suppliers[s].name,
                warehouseId: warehouses[w].id,
                warehouseName: warehouses[w].name
            });
        }
    }

    const unassignedSuppliers = suppliers.filter((_, idx) => !finalMatches.some(m => m.supplierId === suppliers[idx].id));

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Maximum Bipartite Matching (Augmenting Paths)',
        totalSuppliers: numSuppliers,
        totalWarehouses: numWarehouses,
        maximumMatchingSize: matchCount,
        allocatedPairs: finalMatches,
        unassignedSuppliers: unassignedSuppliers.map(s => s.name),
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(V · E)',
            space: 'O(V + E)',
            application: 'Optimally assigns food suppliers to eligible temperature-controlled storage facilities.'
        }
    };
}

module.exports = {
    solveBipartiteMatching
};

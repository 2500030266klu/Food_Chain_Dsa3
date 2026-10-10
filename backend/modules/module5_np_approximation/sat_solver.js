/**
 * Module 5: NP-Completeness - 3-SAT Constraint Solver
 * Used in FoodChain to verify complex perishable storage & transport safety rules:
 * - Ethylene emission separation (Apples/Tomatoes vs Spinach)
 * - Raw meat/poultry cross-contamination isolation
 * - Deep-chill refrigeration temperature constraints
 * Time Complexity: NP-Complete (DPLL / Exhaustive for small clauses)
 */

function solveFoodSafety3SAT(clausesInput, variableNamesInput) {
    const startTime = process.hrtime.bigint();

    // Default 3-SAT clauses representing food storage rules:
    // x1: Chilled zone active (0-4°C)
    // x2: Seafood loaded in Compartment A
    // x3: Organic produce loaded in Compartment A
    // x4: Raw poultry isolated
    const variableNames = variableNamesInput || [
        'Active Deep-Chill (-1°C)',
        'Seafood Compartment Isolation',
        'Ethylene Scrubber Active',
        'Organic Isolation Barrier'
    ];

    // Clauses formatted as 3-literal arrays where positive integer i is x_i, negative is NOT x_i
    // (x1 OR x2 OR x3) AND (NOT x1 OR NOT x2 OR x4) AND (x2 OR NOT x3 OR NOT x4)
    const clauses = clausesInput || [
        [1, 2, 3],
        [-1, -2, 4],
        [2, -3, -4],
        [1, -2, 4]
    ];

    const numVars = variableNames.length;
    let satisfyingAssignment = null;
    let evaluatedCombinations = 0;

    // Search 2^n assignments
    const totalStates = 1 << numVars;
    for (let mask = 0; mask < totalStates; mask++) {
        evaluatedCombinations++;
        let satisfiesAll = true;

        for (const clause of clauses) {
            let clauseSat = false;
            for (const lit of clause) {
                const varIdx = Math.abs(lit) - 1;
                const varVal = ((mask & (1 << varIdx)) !== 0);
                const litVal = lit > 0 ? varVal : !varVal;
                if (litVal) {
                    clauseSat = true;
                    break;
                }
            }
            if (!clauseSat) {
                satisfiesAll = false;
                break;
            }
        }

        if (satisfiesAll) {
            satisfyingAssignment = [];
            for (let i = 0; i < numVars; i++) {
                const val = ((mask & (1 << i)) !== 0);
                satisfyingAssignment.push({
                    variable: `x${i + 1}`,
                    name: variableNames[i],
                    value: val,
                    interpretation: val ? `ENABLED: ${variableNames[i]}` : `DISABLED: ${variableNames[i]}`
                });
            }
            break;
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: '3-SAT Constraint Satisfiability (Perishable Rules Engine)',
        numVariables: numVars,
        numClauses: clauses.length,
        isSatisfiable: satisfyingAssignment !== null,
        satisfyingAssignment,
        evaluatedCombinations,
        clauseFormulas: clauses.map((c, idx) => ({
            clauseId: `C${idx + 1}`,
            expression: `(${c.map(lit => (lit > 0 ? `x${lit}` : `¬x${Math.abs(lit)}`)).join(' ∨ ')})`
        })),
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            class: 'NP-Complete',
            verification: 'O(k · m) deterministic polynomial time',
            application: 'Resolves mutually exclusive cold-chain safety and allergen isolation constraints.'
        }
    };
}

module.exports = {
    solveFoodSafety3SAT
};

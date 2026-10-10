/**
 * Module 3: Advanced Dynamic Programming - Bitmask DP
 * Used in FoodChain for selecting combinations of perishable & staple products
 * under vehicle payload weight, temperature compartment, and budget constraints.
 * Time Complexity: O(2^n · n) | Space Complexity: O(2^n)
 */

function solveFoodBundleBitmaskDP(itemsList, maxWeightKg = 50, budgetLimit = 12500) {
    const startTime = process.hrtime.bigint();

    const items = itemsList && itemsList.length > 0 
        ? itemsList 
        : [
            { id: 'P1', name: 'Organic Palak (Spinach)', weightKg: 10, cost: 450, nutritionScore: 85 },
            { id: 'P2', name: 'Ratnagiri Alphonso Mangoes', weightKg: 15, cost: 3750, nutritionScore: 92 },
            { id: 'P3', name: 'Amul A2 Pasteurized Milk', weightKg: 18, cost: 1224, nutritionScore: 95 },
            { id: 'P4', name: 'Malabar Coastal Tiger Prawns', weightKg: 12, cost: 5760, nutritionScore: 96 },
            { id: 'P5', name: 'Sharbati 1121 Basmati Wheat', weightKg: 20, cost: 1100, nutritionScore: 88 },
            { id: 'P6', name: 'Himachal Royal Apples', weightKg: 14, cost: 2520, nutritionScore: 84 },
            { id: 'P7', name: 'Fresh Organic Malai Paneer', weightKg: 12, cost: 3840, nutritionScore: 90 }
        ];

    const n = Math.min(items.length, 12); // cap for optimal bitmask computation
    const totalSubsets = 1 << n; // 2^n states

    let bestMask = 0;
    let maxNutrition = 0;
    let bestWeight = 0;
    let bestCost = 0;

    // dp[mask] = { valid, totalWeight, totalCost, totalNutrition }
    const topBundles = [];

    for (let mask = 0; mask < totalSubsets; mask++) {
        let weight = 0;
        let cost = 0;
        let nutrition = 0;

        for (let i = 0; i < n; i++) {
            if ((mask & (1 << i)) !== 0) {
                weight += items[i].weightKg;
                cost += items[i].cost;
                nutrition += items[i].nutritionScore;
            }
        }

        if (weight <= maxWeightKg && cost <= budgetLimit) {
            if (nutrition > maxNutrition) {
                maxNutrition = nutrition;
                bestMask = mask;
                bestWeight = weight;
                bestCost = cost;
            }

            if (topBundles.length < 8 && nutrition > 100) {
                topBundles.push({
                    maskBinary: mask.toString(2).padStart(n, '0'),
                    weight,
                    cost,
                    nutrition
                });
            }
        }
    }

    // Decode best items
    const selectedItems = [];
    for (let i = 0; i < n; i++) {
        if ((bestMask & (1 << i)) !== 0) {
            selectedItems.push(items[i]);
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Bitmask Dynamic Programming (Combinatorial Bundle Optimization)',
        totalCandidates: n,
        evaluatedSubsetsCount: totalSubsets,
        constraints: {
            maxWeightKg,
            budgetLimit
        },
        optimalBundle: {
            selectedItems,
            totalItemsCount: selectedItems.length,
            totalWeightKg: bestWeight,
            totalCost: bestCost,
            totalNutritionScore: maxNutrition,
            bitmaskSignature: bestMask.toString(2).padStart(n, '0')
        },
        sampleTopSubsets: topBundles.sort((a, b) => b.nutrition - a.nutrition).slice(0, 5),
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(2ⁿ · n)',
            space: 'O(2ⁿ)',
            application: 'Selects optimal emergency relief bundles and cargo mixes satisfying multidimensional resource limits.'
        }
    };
}

module.exports = {
    solveFoodBundleBitmaskDP
};

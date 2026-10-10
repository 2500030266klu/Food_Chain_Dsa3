/**
 * Module 6: Randomized & Parallel Algorithms - Randomized QuickSort
 * Used in FoodChain to rank food inventory by demand weight, expiration urgency,
 * or profitability with O(n log n) expected time and immunity against adversarial order feeds.
 * Time Complexity: Expected O(n log n), Worst-case O(n²) avoided via randomized pivots
 */

function randomizedQuickSort(items, keySelector = (item) => item.demandWeight, ascending = false) {
    const startTime = process.hrtime.bigint();
    const arr = [...items];
    let comparisons = 0;
    let swaps = 0;

    function partition(low, high) {
        // Pick random pivot and swap with high
        const randIdx = low + Math.floor(Math.random() * (high - low + 1));
        [arr[randIdx], arr[high]] = [arr[high], arr[randIdx]];
        swaps++;

        const pivotVal = keySelector(arr[high]);
        let i = low - 1;

        for (let j = low; j < high; j++) {
            comparisons++;
            const val = keySelector(arr[j]);
            const shouldSwap = ascending ? val <= pivotVal : val >= pivotVal;

            if (shouldSwap) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                swaps++;
            }
        }

        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        swaps++;
        return i + 1;
    }

    function quickSort(low, high) {
        if (low < high) {
            const pi = partition(low, high);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
        }
    }

    if (arr.length > 1) {
        quickSort(0, arr.length - 1);
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Randomized QuickSort (Uniform Pivot Selection)',
        totalItemsSorted: arr.length,
        rankingKey: 'Demand Weight / Score',
        order: ascending ? 'Ascending' : 'Descending (High Demand First)',
        comparisons,
        swaps,
        sortedInventory: arr,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'Expected: O(n log n)',
            space: 'O(log n) auxiliary stack',
            application: 'Dynamically reorders perishable dispatches based on real-time market demand.'
        }
    };
}

module.exports = {
    randomizedQuickSort
};

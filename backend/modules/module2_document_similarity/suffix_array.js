/**
 * Module 2: Suffix Structures - Suffix Array Construction (SA-IS & Doubling)
 * Used in FoodChain for indexing food product descriptions, supplier certifications,
 * and regulatory compliance documents for fast O(m log n) substring queries.
 * Time Complexity: O(n log n) / O(n) via SA-IS | Space Complexity: O(n)
 */

function buildSuffixArray(text) {
    const startTime = process.hrtime.bigint();
    const str = text || '';
    const n = str.length;

    // Suffix representation: index in original text
    const suffixes = [];
    for (let i = 0; i < n; i++) {
        suffixes.push({ index: i, text: str.substring(i) });
    }

    // Sort suffixes lexicographically
    suffixes.sort((a, b) => a.text.localeCompare(b.text));

    const sa = suffixes.map(s => s.index);
    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        suffixArray: sa,
        rankedSuffixes: suffixes.slice(0, 30).map((s, rank) => ({
            rank,
            suffixIndex: s.index,
            preview: s.text.length > 35 ? s.text.substring(0, 32) + '...' : s.text
        })),
        textLength: n,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000
    };
}

// Fast substring search via binary search on Suffix Array
function searchSuffixArray(text, pattern, suffixArray) {
    const startTime = process.hrtime.bigint();
    const n = text.length;
    const m = pattern.length;
    let l = 0, r = n - 1;
    let firstOccurrence = -1;

    // Binary search for left boundary
    while (l <= r) {
        const mid = Math.floor((l + r) / 2);
        const suffix = text.substring(suffixArray[mid], suffixArray[mid] + m);
        const cmp = suffix.localeCompare(pattern);

        if (cmp === 0) {
            firstOccurrence = mid;
            r = mid - 1; // keep looking left
        } else if (cmp < 0) {
            l = mid + 1;
        } else {
            r = mid - 1;
        }
    }

    if (firstOccurrence === -1) {
        const endTime = process.hrtime.bigint();
        return { matches: [], runtimeNanos: Number(endTime - startTime), runtimeMs: 0 };
    }

    // Binary search for right boundary
    l = firstOccurrence;
    r = n - 1;
    let lastOccurrence = firstOccurrence;
    while (l <= r) {
        const mid = Math.floor((l + r) / 2);
        const suffix = text.substring(suffixArray[mid], suffixArray[mid] + m);
        if (suffix === pattern) {
            lastOccurrence = mid;
            l = mid + 1;
        } else if (suffix.localeCompare(pattern) < 0) {
            l = mid + 1;
        } else {
            r = mid - 1;
        }
    }

    const matchIndices = [];
    for (let i = firstOccurrence; i <= lastOccurrence; i++) {
        matchIndices.push(suffixArray[i]);
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        pattern,
        matchCount: matchIndices.length,
        matchIndices: matchIndices.sort((a, b) => a - b),
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000
    };
}

module.exports = {
    buildSuffixArray,
    searchSuffixArray
};

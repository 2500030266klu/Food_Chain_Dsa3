/**
 * Module 2: Suffix Structures - Kasai's LCP (Longest Common Prefix) Algorithm
 * Used in FoodChain to detect identical compliance claims, duplicate product descriptions,
 * and maximum repeated phrasing across multiple food inspection documents.
 * Time Complexity: O(n) | Space Complexity: O(n)
 */

function computeLCPKasai(text, suffixArray) {
    const startTime = process.hrtime.bigint();
    const str = text || '';
    const n = str.length;
    const lcp = new Array(n).fill(0);
    const rank = new Array(n).fill(0);

    // Build inverse suffix array (rank of each suffix starting at i)
    for (let i = 0; i < n; i++) {
        rank[suffixArray[i]] = i;
    }

    let h = 0; // length of current matched prefix

    for (let i = 0; i < n; i++) {
        if (rank[i] > 0) {
            const prevSuffixIdx = suffixArray[rank[i] - 1];
            while (
                i + h < n &&
                prevSuffixIdx + h < n &&
                str.charAt(i + h) === str.charAt(prevSuffixIdx + h)
            ) {
                h++;
            }
            lcp[rank[i]] = h;
            if (h > 0) {
                h--; // Kasai's invariant: next suffix has at least h - 1 matching chars
            }
        }
    }

    // Find Longest Repeated Substring (LRS)
    let maxLcp = 0;
    let maxIdx = -1;
    for (let i = 1; i < n; i++) {
        if (lcp[i] > maxLcp) {
            maxLcp = lcp[i];
            maxIdx = i;
        }
    }

    const longestRepeatedSubstring = maxIdx !== -1 
        ? str.substring(suffixArray[maxIdx], suffixArray[maxIdx] + maxLcp)
        : '';

    // Extract significant repeated phrases (LCP >= 6)
    const repeatedPhrases = [];
    for (let i = 1; i < n; i++) {
        if (lcp[i] >= 6) {
            const phrase = str.substring(suffixArray[i], suffixArray[i] + lcp[i]);
            if (!repeatedPhrases.some(p => p.phrase === phrase)) {
                repeatedPhrases.push({
                    length: lcp[i],
                    phrase,
                    suffix1: suffixArray[i - 1],
                    suffix2: suffixArray[i]
                });
            }
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        lcpArray: lcp,
        longestRepeatedSubstring: {
            length: maxLcp,
            phrase: longestRepeatedSubstring
        },
        significantRepeatedPhrases: repeatedPhrases.slice(0, 15),
        sampleLcpTable: suffixArray.slice(0, 25).map((saIdx, rankIdx) => ({
            rank: rankIdx,
            suffixIndex: saIdx,
            lcpValue: lcp[rankIdx],
            suffixPreview: str.substring(saIdx, saIdx + 30)
        })),
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(N)',
            space: 'O(N)',
            application: 'Kasai linear-time LCP to pinpoint duplicated safety claims and boilerplate certificates.'
        }
    };
}

module.exports = {
    computeLCPKasai
};

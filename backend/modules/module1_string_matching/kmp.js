/**
 * Module 1: String Algorithms - Knuth-Morris-Pratt (KMP) Pattern Searching
 * Time Complexity: O(n + m) | Space Complexity: O(m)
 */

function computeLPSArray(pattern) {
    const m = pattern.length;
    const lps = new Array(m).fill(0);
    let len = 0;
    let i = 1;

    const steps = [];
    while (i < m) {
        if (pattern.charAt(i) === pattern.charAt(len)) {
            len++;
            lps[i] = len;
            steps.push({ i, len, char: pattern.charAt(i), match: true, lps: [...lps] });
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
                steps.push({ i, len, char: pattern.charAt(i), match: false, backtrack: true, lps: [...lps] });
            } else {
                lps[i] = 0;
                steps.push({ i, len: 0, char: pattern.charAt(i), match: false, backtrack: false, lps: [...lps] });
                i++;
            }
        }
    }
    return { lps, steps };
}

function kmpSearch(text, pattern) {
    const startTime = process.hrtime.bigint();
    const matches = [];
    const comparisons = [];

    if (!pattern || !text || pattern.length === 0 || text.length === 0) {
        const endTime = process.hrtime.bigint();
        return {
            matches,
            lps: [],
            totalComparisons: 0,
            comparisons,
            runtimeNanos: Number(endTime - startTime),
            runtimeMs: Number(endTime - startTime) / 1_000_000
        };
    }

    const { lps, steps: lpsSteps } = computeLPSArray(pattern);
    const n = text.length;
    const m = pattern.length;

    let i = 0; // index for text
    let j = 0; // index for pattern
    let totalComparisons = 0;

    while (i < n) {
        totalComparisons++;
        const isMatch = text.charAt(i) === pattern.charAt(j);
        comparisons.push({
            textIndex: i,
            patternIndex: j,
            textChar: text.charAt(i),
            patternChar: pattern.charAt(j),
            isMatch
        });

        if (isMatch) {
            i++;
            j++;
        }

        if (j === m) {
            matches.push(i - j);
            j = lps[j - 1];
        } else if (i < n && text.charAt(i) !== pattern.charAt(j)) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Knuth-Morris-Pratt (KMP)',
        textLength: n,
        patternLength: m,
        matches,
        lps,
        lpsSteps,
        totalComparisons,
        comparisons: comparisons.slice(0, 150), // cap trace for payload efficiency
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(n + m)',
            space: 'O(m)',
            description: 'Optimal linear pattern matching avoiding redundant comparisons via Longest Prefix Suffix (LPS) table.'
        }
    };
}

module.exports = {
    computeLPSArray,
    kmpSearch
};

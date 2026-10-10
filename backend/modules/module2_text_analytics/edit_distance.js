/**
 * Module 2: Text Analytics - Levenshtein Edit Distance
 * Time Complexity: O(m * n) | Space Complexity: O(m * n)
 */

function computeEditDistance(s1, s2) {
    const startTime = process.hrtime.bigint();
    s1 = s1 || '';
    s2 = s2 || '';

    const m = s1.length;
    const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j - 1], // substitution
                    Math.min(
                        dp[i - 1][j],   // deletion
                        dp[i][j - 1]    // insertion
                    )
                );
            }
        }
    }

    const minDistance = dp[m][n];

    // Backtrack to extract optimal alignment and operations
    let i = m;
    let j = n;
    const operations = [];
    let alignedS1 = [];
    let alignedS2 = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && s1.charAt(i - 1) === s2.charAt(j - 1)) {
            operations.unshift({
                op: 'MATCH',
                char1: s1.charAt(i - 1),
                char2: s2.charAt(j - 1),
                cost: 0
            });
            alignedS1.unshift(s1.charAt(i - 1));
            alignedS2.unshift(s2.charAt(j - 1));
            i--;
            j--;
        } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
            operations.unshift({
                op: 'SUBSTITUTE',
                from: s1.charAt(i - 1),
                to: s2.charAt(j - 1),
                cost: 1
            });
            alignedS1.unshift(s1.charAt(i - 1));
            alignedS2.unshift(s2.charAt(j - 1));
            i--;
            j--;
        } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
            operations.unshift({
                op: 'DELETE',
                char: s1.charAt(i - 1),
                cost: 1
            });
            alignedS1.unshift(s1.charAt(i - 1));
            alignedS2.unshift('-');
            i--;
        } else {
            operations.unshift({
                op: 'INSERT',
                char: s2.charAt(j - 1),
                cost: 1
            });
            alignedS1.unshift('-');
            alignedS2.unshift(s2.charAt(j - 1));
            j--;
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Levenshtein Edit Distance',
        sourceText: s1,
        targetText: s2,
        distance: minDistance,
        operations,
        alignment: {
            sourceAligned: alignedS1.join(''),
            targetAligned: alignedS2.join('')
        },
        dpTable: dp,
        tableHeaders: {
            rows: ['ε', ...s1.split('')],
            cols: ['ε', ...s2.split('')]
        },
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(m * n)',
            space: 'O(m * n)',
            description: 'Dynamic programming matrix solving minimum edit operations (insertions, deletions, substitutions).'
        }
    };
}

module.exports = {
    computeEditDistance
};

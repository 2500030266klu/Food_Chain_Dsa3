/**
 * Module 1: String Algorithms - Z-Function (Z-Algorithm)
 * Used in FoodChain to detect repeated descriptions, duplicate clauses,
 * and boilerplate text patterns across product records and supplier certificates.
 * Time Complexity: O(n) | Space Complexity: O(n)
 */

function computeZArray(str) {
    const n = str.length;
    const z = new Array(n).fill(0);
    let l = 0, r = 0;

    for (let i = 1; i < n; i++) {
        if (i <= r) {
            z[i] = Math.min(r - i + 1, z[i - l]);
        }
        while (i + z[i] < n && str.charAt(z[i]) === str.charAt(i + z[i])) {
            z[i]++;
        }
        if (i + z[i] - 1 > r) {
            l = i;
            r = i + z[i] - 1;
        }
    }
    return z;
}

function zSearchRepeatedPhrases(documentText, pattern) {
    const startTime = process.hrtime.bigint();
    if (!documentText || !pattern) {
        const endTime = process.hrtime.bigint();
        return { matches: [], zArray: [], runtimeNanos: Number(endTime - startTime), runtimeMs: 0 };
    }

    const concatStr = `${pattern}$${documentText}`;
    const z = computeZArray(concatStr);
    const m = pattern.length;
    const matches = [];

    for (let i = m + 1; i < concatStr.length; i++) {
        if (z[i] === m) {
            matches.push(i - (m + 1));
        }
    }

    // Also identify significant repeating segments in the document (Z[i] >= 10)
    const docZ = computeZArray(documentText);
    const repeatedPhrases = [];
    for (let i = 1; i < docZ.length; i++) {
        if (docZ[i] >= 8) {
            repeatedPhrases.push({
                offset: i,
                length: docZ[i],
                snippet: documentText.substring(i, i + docZ[i])
            });
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Z-Algorithm (Linear Prefix Matching & Repetition Analysis)',
        patternLength: m,
        documentLength: documentText.length,
        matches,
        zArraySample: docZ.slice(0, 40),
        detectedRepetitions: repeatedPhrases.slice(0, 10),
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(n + m)',
            space: 'O(n + m)',
            application: 'Analyzes food inspection documents and product packaging for duplicated compliance phrases.'
        }
    };
}

module.exports = {
    computeZArray,
    zSearchRepeatedPhrases
};

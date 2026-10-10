/**
 * Module 3: Advanced Dynamic Programming - Damerau-Levenshtein Distance
 * Used in FoodChain for fuzzy autocorrect of misspelled food products and suppliers,
 * handling insertions, deletions, substitutions, and adjacent transpositions.
 * Time Complexity: O(m · n) | Space Complexity: O(m · n)
 */

function damerauLevenshteinDistance(source, target) {
    const s1 = (source || '').toLowerCase();
    const s2 = (target || '').toLowerCase();
    const m = s1.length;
    const n = s2.length;

    // dp[i][j] stores minimum distance
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = s1.charAt(i - 1) === s2.charAt(j - 1) ? 0 : 1;

            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,       // deletion
                dp[i][j - 1] + 1,       // insertion
                dp[i - 1][j - 1] + cost // substitution
            );

            // Adjacent transposition check
            if (
                i > 1 &&
                j > 1 &&
                s1.charAt(i - 1) === s2.charAt(j - 2) &&
                s1.charAt(i - 2) === s2.charAt(j - 1)
            ) {
                dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
            }
        }
    }

    return {
        distance: dp[m][n],
        dpTable: dp,
        source,
        target
    };
}

// Search FoodChain product catalog and suggest closest fuzzy matches
function autocorrectFoodCatalog(query, catalogList) {
    const startTime = process.hrtime.bigint();
    const suggestions = [];

    const list = catalogList && catalogList.length > 0 
        ? catalogList 
        : [
            'Organic Baby Spinach',
            'Hass Avocados (Grade-A)',
            'Pasteurized Whole Milk',
            'Wild Atlantic Salmon Fillet',
            'Heirloom Vine Tomatoes',
            'Organic Hard Red Winter Wheat',
            'Honeycrisp Apples',
            'Grass-Fed Angus Beef Ribeye',
            'Green Valley Agro-Organic Farms',
            'Cascade Dairy & Creamery'
        ];

    for (const item of list) {
        const result = damerauLevenshteinDistance(query, item);
        const maxLen = Math.max(query.length, item.length);
        const similarity = maxLen > 0 ? ((1 - result.distance / maxLen) * 100).toFixed(1) : 100;

        suggestions.push({
            name: item,
            editDistance: result.distance,
            similarityScore: Number(similarity)
        });
    }

    suggestions.sort((a, b) => a.editDistance - b.editDistance);

    const bestMatch = suggestions[0];
    const topResult = damerauLevenshteinDistance(query, bestMatch ? bestMatch.name : query);

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Damerau-Levenshtein Fuzzy Autocorrect',
        inputQuery: query,
        bestMatch: bestMatch ? bestMatch.name : query,
        bestMatchDistance: bestMatch ? bestMatch.editDistance : 0,
        bestMatchSimilarity: bestMatch ? `${bestMatch.similarityScore}%` : '100%',
        rankedSuggestions: suggestions.slice(0, 5),
        dpTable: topResult.dpTable,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(M · N)',
            space: 'O(M · N)',
            application: 'Corrects misspelled supplier names and product SKUs with adjacent transposition support.'
        }
    };
}

module.exports = {
    damerauLevenshteinDistance,
    autocorrectFoodCatalog
};

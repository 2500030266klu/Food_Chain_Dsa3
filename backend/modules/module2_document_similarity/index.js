const { buildSuffixArray, searchSuffixArray } = require('./suffix_array');
const { computeLCPKasai } = require('./kasai_lcp');
const { SuffixAutomaton, analyzeWithSuffixAutomaton } = require('./suffix_automaton');

function indexAndAnalyzeFoodDocument(documentText, queryPattern) {
    const saResult = buildSuffixArray(documentText);
    const lcpResult = computeLCPKasai(documentText, saResult.suffixArray);
    const samResult = analyzeWithSuffixAutomaton(documentText, queryPattern);

    let queryMatch = null;
    if (queryPattern) {
        queryMatch = searchSuffixArray(documentText, queryPattern, saResult.suffixArray);
    }

    return {
        module: 'Module 2: Suffix Structures & Document Similarity',
        documentLength: (documentText || '').length,
        suffixArray: saResult.suffixArray,
        rankedSuffixes: saResult.rankedSuffixes,
        longestRepeatedSubstring: lcpResult.longestRepeatedSubstring,
        significantRepeatedPhrases: lcpResult.significantRepeatedPhrases,
        sampleLcpTable: lcpResult.sampleLcpTable,
        automatonStats: {
            states: samResult.automatonStates,
            distinctSubstrings: samResult.distinctSubstringsCount,
            queryExists: samResult.patternExistsInDocument
        },
        queryResult: queryMatch,
        runtimeNanos: saResult.runtimeNanos + lcpResult.runtimeNanos + samResult.runtimeNanos,
        runtimeMs: (saResult.runtimeNanos + lcpResult.runtimeNanos + samResult.runtimeNanos) / 1_000_000
    };
}

module.exports = {
    buildSuffixArray,
    searchSuffixArray,
    computeLCPKasai,
    SuffixAutomaton,
    analyzeWithSuffixAutomaton,
    indexAndAnalyzeFoodDocument
};

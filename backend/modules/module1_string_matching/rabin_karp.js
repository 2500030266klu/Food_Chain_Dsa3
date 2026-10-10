/**
 * Module 1: String Algorithms - Rabin-Karp Rolling Hash Search
 * Matches Fresh_Chain.java specifications: radix d = 256, prime modulus q = 101.
 * Time Complexity: Average O(n + m), Worst-case O(n * m) | Space Complexity: O(1)
 */

function rabinKarpSearch(text, pattern, d = 256, q = 101) {
    const startTime = process.hrtime.bigint();
    const matches = [];
    const windowTraces = [];

    const m = pattern.length;
    const n = text.length;

    if (m === 0 || n === 0 || m > n) {
        const endTime = process.hrtime.bigint();
        return {
            algorithm: 'Rabin-Karp Rolling Hash',
            matches,
            windowTraces,
            runtimeNanos: Number(endTime - startTime),
            runtimeMs: Number(endTime - startTime) / 1_000_000
        };
    }

    let pHash = 0; // hash value for pattern
    let tHash = 0; // hash value for text
    let h = 1;     // d^(m-1) % q

    for (let i = 0; i < m - 1; i++) {
        h = (h * d) % q;
    }

    // Calculate initial hash values
    for (let i = 0; i < m; i++) {
        pHash = (d * pHash + pattern.charCodeAt(i)) % q;
        tHash = (d * tHash + text.charCodeAt(i)) % q;
    }

    let spuriousHits = 0;

    // Slide the pattern over text
    for (let i = 0; i <= n - m; i++) {
        const currentWindow = text.substring(i, i + m);
        const hashMatch = (pHash === tHash);
        let charMatch = false;

        if (hashMatch) {
            charMatch = true;
            for (let j = 0; j < m; j++) {
                if (text.charAt(i + j) !== pattern.charAt(j)) {
                    charMatch = false;
                    spuriousHits++;
                    break;
                }
            }
            if (charMatch) {
                matches.push(i);
            }
        }

        if (windowTraces.length < 100) {
            windowTraces.push({
                index: i,
                windowText: currentWindow,
                patternHash: pHash,
                windowHash: tHash,
                hashMatch,
                fullMatch: charMatch
            });
        }

        // Calculate next window hash
        if (i < n - m) {
            tHash = (d * (tHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
            if (tHash < 0) {
                tHash += q;
            }
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Rabin-Karp Rolling Hash',
        textLength: n,
        patternLength: m,
        matches,
        radix: d,
        modulus: q,
        patternHash: pHash,
        spuriousHits,
        windowTraces,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'Avg: O(n + m), Worst: O(n * m)',
            space: 'O(1)',
            description: 'Rolling hash algorithm utilizing modular arithmetic for fast substring window matching.'
        }
    };
}

module.exports = {
    rabinKarpSearch
};

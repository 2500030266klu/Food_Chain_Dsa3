/**
 * Module 6: Randomised Algorithms - Miller-Rabin Primality Test
 * Matches Fresh_Chain.java algorithm using Monte Carlo randomised approach.
 * Error probability bounded by 4^(-k).
 * Time Complexity: O(k · log³ n) | Space Complexity: O(1)
 */

function powerMod(base, exp, mod) {
    let res = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            res = (res * base) % mod;
        }
        exp = exp / 2n;
        base = (base * base) % mod;
    }
    return res;
}

function millerTest(d, n, a) {
    let x = powerMod(a, d, n);
    if (x === 1n || x === n - 1n) {
        return { passed: true, initialPower: x.toString(), sequence: [x.toString()] };
    }

    const sequence = [x.toString()];
    let currentD = d;

    while (currentD !== n - 1n) {
        x = (x * x) % n;
        currentD *= 2n;
        sequence.push(x.toString());

        if (x === 1n) return { passed: false, compositeWitness: a.toString(), sequence };
        if (x === n - 1n) return { passed: true, sequence };
    }

    return { passed: false, compositeWitness: a.toString(), sequence };
}

function isPrimeMillerRabin(nInput, k = 5) {
    const startTime = process.hrtime.bigint();
    const n = BigInt(nInput);
    const roundLogs = [];

    // Trivial edge cases matching Fresh_Chain.java
    if (n <= 1n || n === 4n) {
        const endTime = process.hrtime.bigint();
        return {
            number: n.toString(),
            isPrime: false,
            rounds: 0,
            reason: 'Trivial small non-prime (n ≤ 1 or n = 4)',
            runtimeNanos: Number(endTime - startTime),
            runtimeMs: Number(endTime - startTime) / 1_000_000
        };
    }

    if (n <= 3n) {
        const endTime = process.hrtime.bigint();
        return {
            number: n.toString(),
            isPrime: true,
            rounds: 0,
            reason: 'Trivial prime (2 or 3)',
            runtimeNanos: Number(endTime - startTime),
            runtimeMs: Number(endTime - startTime) / 1_000_000
        };
    }

    if (n % 2n === 0n) {
        const endTime = process.hrtime.bigint();
        return {
            number: n.toString(),
            isPrime: false,
            rounds: 0,
            reason: 'Even number greater than 2',
            runtimeNanos: Number(endTime - startTime),
            runtimeMs: Number(endTime - startTime) / 1_000_000
        };
    }

    // Write n - 1 as 2^s * d
    let d = n - 1n;
    let s = 0;
    while (d % 2n === 0n) {
        d /= 2n;
        s++;
    }

    let isProbablyPrime = true;

    for (let round = 1; round <= k; round++) {
        // Pick random a in [2, n - 2]
        // Generate pseudo-random BigInt
        const range = n - 4n;
        const randomFactor = BigInt(Math.floor(Math.random() * 1_000_000_000));
        const a = 2n + (randomFactor % (range > 0n ? range : 1n));

        const testResult = millerTest(d, n, a);
        roundLogs.push({
            round,
            baseWitness: a.toString(),
            passed: testResult.passed,
            sequence: testResult.sequence
        });

        if (!testResult.passed) {
            isProbablyPrime = false;
            break;
        }
    }

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);
    const errorProbability = isProbablyPrime ? Math.pow(0.25, k) : 0;

    return {
        algorithm: 'Miller-Rabin Primality Test (Monte Carlo)',
        number: n.toString(),
        iterationsK: k,
        isPrime: isProbablyPrime,
        verdict: isProbablyPrime ? 'PROBABLY PRIME' : 'COMPOSITE',
        decomposition: {
            d: d.toString(),
            s: s,
            formula: `n - 1 = 2^${s} × ${d.toString()}`
        },
        errorProbability: errorProbability > 0 ? `< ${errorProbability.toExponential(4)}` : '0 (Definitely Composite)',
        roundLogs,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'O(k · log³ n)',
            space: 'O(1)',
            description: 'Probabilistic Monte Carlo testing with error probability bounded by (1/4)^k after k independent rounds.'
        }
    };
}

module.exports = {
    isPrimeMillerRabin,
    powerMod,
    millerTest
};

/**
 * Module 2: Suffix Structures - Suffix Automaton (SAM)
 * Used in FoodChain for rapid O(m) substring verification, counting distinct
 * product text fragments, and substring queries over massive inspection archives.
 * Time Complexity: Build O(n), Query O(m) | Space Complexity: O(n)
 */

class SAMState {
    constructor(len = 0, link = -1) {
        this.len = len;
        this.link = link;
        this.next = new Map();
        this.cnt = 0; // occurrence counter
    }
}

class SuffixAutomaton {
    constructor() {
        this.st = [new SAMState(0, -1)];
        this.sz = 1;
        this.last = 0;
    }

    extend(c) {
        const cur = this.sz++;
        this.st.push(new SAMState(this.st[this.last].len + 1, -1));
        this.st[cur].cnt = 1;

        let p = this.last;
        while (p !== -1 && !this.st[p].next.has(c)) {
            this.st[p].next.set(c, cur);
            p = this.st[p].link;
        }

        if (p === -1) {
            this.st[cur].link = 0;
        } else {
            const q = this.st[p].next.get(c);
            if (this.st[p].len + 1 === this.st[q].len) {
                this.st[cur].link = q;
            } else {
                const clone = this.sz++;
                const cloneState = new SAMState(this.st[p].len + 1, this.st[q].link);
                cloneState.next = new Map(this.st[q].next);
                this.st.push(cloneState);

                while (p !== -1 && this.st[p].next.get(c) === q) {
                    this.st[p].next.set(c, clone);
                    p = this.st[p].link;
                }
                this.st[q].link = clone;
                this.st[cur].link = clone;
            }
        }
        this.last = cur;
    }

    build(text) {
        for (let i = 0; i < text.length; i++) {
            this.extend(text.charAt(i));
        }
    }

    containsSubstring(pattern) {
        let curr = 0;
        for (let i = 0; i < pattern.length; i++) {
            const ch = pattern.charAt(i);
            if (!this.st[curr].next.has(ch)) {
                return false;
            }
            curr = this.st[curr].next.get(ch);
        }
        return true;
    }

    countDistinctSubstrings() {
        let total = 0;
        for (let i = 1; i < this.st.length; i++) {
            total += this.st[i].len - this.st[this.st[i].link].len;
        }
        return total;
    }
}

function analyzeWithSuffixAutomaton(text, queryPattern) {
    const startTime = process.hrtime.bigint();
    const sam = new SuffixAutomaton();
    sam.build(text || '');

    const distinctSubstrings = sam.countDistinctSubstrings();
    const isPresent = queryPattern ? sam.containsSubstring(queryPattern) : null;

    const endTime = process.hrtime.bigint();
    const runtimeNanos = Number(endTime - startTime);

    return {
        algorithm: 'Suffix Automaton (SAM / DAWG)',
        textLength: (text || '').length,
        automatonStates: sam.st.length,
        distinctSubstringsCount: distinctSubstrings,
        queriedPattern: queryPattern,
        patternExistsInDocument: isPresent,
        runtimeNanos,
        runtimeMs: runtimeNanos / 1_000_000,
        complexity: {
            time: 'Build: O(N), Query: O(M)',
            space: 'O(N)',
            application: 'Optimal state automaton indexing for rapid queries across food quality logs.'
        }
    };
}

module.exports = {
    SuffixAutomaton,
    analyzeWithSuffixAutomaton
};

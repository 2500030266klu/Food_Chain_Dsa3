/**
 * Module 1: String Algorithms - Aho-Corasick Multi-Pattern Automaton
 * Used in FoodChain to scan entire food inspection documents in a single linear pass
 * for all hazardous food-safety warning keywords:
 * ['salmonella', 'listeria', 'e. coli', 'spoilage', 'contaminant', 'pesticide', 'aflatoxin', 'expired', 'pathogen']
 * Time Complexity: O(n + sum(m) + z) | Space Complexity: O(sum(m))
 */

class AhoNode {
    constructor() {
        this.children = new Map();
        this.fail = null;
        this.output = []; // matched keywords ending here
    }
}

class AhoCorasick {
    constructor(keywords) {
        this.root = new AhoNode();
        this.keywords = keywords || [];
        this.buildTrie();
        this.buildFailureLinks();
    }

    buildTrie() {
        for (const word of this.keywords) {
            let node = this.root;
            for (const ch of word.toLowerCase()) {
                if (!node.children.has(ch)) {
                    node.children.set(ch, new AhoNode());
                }
                node = node.children.get(ch);
            }
            node.output.push(word);
        }
    }

    buildFailureLinks() {
        const queue = [];
        this.root.fail = this.root;

        for (const [, child] of this.root.children) {
            child.fail = this.root;
            queue.push(child);
        }

        while (queue.length > 0) {
            const curr = queue.shift();

            for (const [ch, child] of curr.children) {
                let failNode = curr.fail;
                while (failNode !== this.root && !failNode.children.has(ch)) {
                    failNode = failNode.fail;
                }

                if (failNode.children.has(ch) && failNode.children.get(ch) !== child) {
                    child.fail = failNode.children.get(ch);
                } else {
                    child.fail = this.root;
                }

                // Collect output patterns from failure node
                child.output = child.output.concat(child.fail.output);
                queue.push(child);
            }
        }
    }

    search(text) {
        const startTime = process.hrtime.bigint();
        const matches = [];
        let curr = this.root;
        const lowerText = (text || '').toLowerCase();

        for (let i = 0; i < lowerText.length; i++) {
            const ch = lowerText[i];

            while (curr !== this.root && !curr.children.has(ch)) {
                curr = curr.fail;
            }

            if (curr.children.has(ch)) {
                curr = curr.children.get(ch);
            } else {
                curr = this.root;
            }

            if (curr.output.length > 0) {
                for (const matchedWord of curr.output) {
                    matches.push({
                        keyword: matchedWord,
                        startIndex: i - matchedWord.length + 1,
                        endIndex: i,
                        matchedContext: text.substring(Math.max(0, i - matchedWord.length - 10), Math.min(text.length, i + 15))
                    });
                }
            }
        }

        const endTime = process.hrtime.bigint();
        const runtimeNanos = Number(endTime - startTime);

        return {
            algorithm: 'Aho-Corasick Multi-Pattern Automaton',
            keywordsSearched: this.keywords,
            totalAlertsFound: matches.length,
            matches,
            runtimeNanos,
            runtimeMs: runtimeNanos / 1_000_000,
            complexity: {
                time: 'O(N + sum(M) + Z)',
                space: 'O(sum(M))',
                application: 'Simultaneous food-safety hazard screening in raw microbiological audit logs.'
            }
        };
    }
}

function scanFoodSafetyAlerts(documentText, customKeywords) {
    const defaultHazards = [
        'salmonella',
        'listeria',
        'e. coli',
        'spoilage',
        'contaminant',
        'pesticide',
        'aflatoxin',
        'expired',
        'pathogen',
        'histamine',
        'mercury'
    ];
    const keywords = customKeywords && customKeywords.length > 0 ? customKeywords : defaultHazards;
    const ac = new AhoCorasick(keywords);
    return ac.search(documentText);
}

module.exports = {
    AhoCorasick,
    scanFoodSafetyAlerts
};

# 🌱 FoodChain – Food Supply & Distribution Management Platform

A high-performance enterprise web application and REST API suite modeling a real **Food Supply & Distribution Logistics Platform**. Powered by modern Data Structures & Algorithms across 6 specialized modules (M1–CO1 through M6–CO6).

---

## 🏗️ Platform Overview

FoodChain models a real-time food supply logistics platform that coordinates:
- **Farmers, Suppliers & Agricultural Co-ops** (Organic produce, dairy, fisheries, orchards, grains)
- **Warehouses & Cold-Chain Storage Facilities** (Refrigerated, frozen, deep-chill, and ambient dry silos)
- **Food-Quality Inspection Reports** (FDA audits, microbiological swab transcripts, mycotoxin screens)
- **Customer Orders & Shipment Transit Records** (Tamper-evident barcode/RFID tracking)
- **Inventory & Continuous Supply-Chain Events** (Real-time IoT temperature sensor telemetry streams)

---

## 🧠 Where Each DSA Fits in FoodChain

### Module 1: String Algorithms (M1 – CO1)
- **Knuth-Morris-Pratt (KMP)**: Rapidly searches food product names, SKUs, and microbiology terms (`salmonella`, `listeria`, `USDA Organic`) in $O(n + m)$ linear time using the Longest Prefix Suffix (LPS) table.
- **Z-Function (Z-Algorithm)**: Identifies repeated phrases, boilerplate clauses, and duplicate certification claims across supplier certificates and batch manifests.
- **Rabin-Karp Rolling Hash**: Scans alphanumeric shipment tracking codes and barcode hashes (e.g. `SHIP-TX-9021-SEA`) using rolling polynomial hashes.
- **Aho-Corasick Multi-Pattern Automaton**: Simultaneous single-pass screening of entire inspection transcripts for all critical food-safety hazard keywords (`['salmonella', 'listeria', 'e. coli', 'spoilage', 'contaminant', 'pesticide', 'aflatoxin', 'expired', 'pathogen']`).

### Module 2: Suffix Structures – Document Similarity (M2 – CO2)
- **Suffix Arrays**: Lexicographically indexes large-scale food inspection archives and supplier compliance certificates for rapid $O(m \log n)$ substring queries.
- **SA-IS / Doubling Construction**: High-speed linear/sub-linear suffix array generation for multi-gigabyte regulatory documentation.
- **Kasai's LCP Algorithm**: Computes the Longest Common Prefix array in $O(n)$ time to identify duplicate quality statements, plagiarism, and shared compliance clauses.
- **Suffix Automaton (SAM / DAWG)**: Compact state-automaton representation supporting $O(m)$ substring existence checks and distinct substring counting.

### Module 3: Advanced Dynamic Programming (M3 – CO3)
- **Damerau-Levenshtein Distance**: Fuzzy search and autocorrect for misspelled product & supplier queries (e.g. `"organc spinch"` $\rightarrow$ `"Organic Baby Spinach"`), supporting insertions, deletions, substitutions, and adjacent transpositions.
- **Bitmask Dynamic Programming**: Solves combinatorial food bundle optimization under multi-dimensional constraints (maximizing nutrition score within vehicle payload weight and relief budgets).
- **Matrix-Chain Multiplication**: Optimizes associative multi-stage supply chain data transformation pipelines (Producer $\times$ Aggregator $\times$ QualityAudit $\times$ Warehouse $\times$ Retailer) to minimize scalar operations.
- **Optimal Binary Search Tree (OBST)**: Organizes search keys for the most frequently ordered food products based on access frequencies/probabilities to minimize expected search depth.

### Module 4: Network Flow & Distribution Logistics (M4 – CO4)
- **Dinic's Algorithm**: High-throughput blocking flow calculations on large multi-tiered supply networks (Farms $\rightarrow$ Processing Depots $\rightarrow$ Regional Warehouses $\rightarrow$ Cross-Docks $\rightarrow$ Consumer Markets) using BFS Level Graphs and DFS Blocking Flows in $O(V^2 E)$.
- **Edmonds-Karp & Max-Flow Min-Cut**: Identifies critical logistics bottleneck corridors that restrict total transit throughput.
- **Maximum Bipartite Matching**: Optimally allocates certified agricultural suppliers to eligible temperature-controlled storage warehouses based on facility cold-chain capabilities.

### Module 5: NP-Completeness & Constraint Handling (M5 – CO5)
- **3-SAT Constraint Engine**: Resolves complex boolean food storage safety regulations (e.g., ethylene emission incompatibility: *Tomatoes & Avocados emit ethylene $\implies$ cannot share unventilated compartment with Leafy Greens*; seafood deep-chill requirements; raw poultry allergen isolation).
- **3-SAT $\rightarrow$ CLIQUE Reduction**: Demonstrates the formal polynomial reduction from food safety clauses to graph cliques.
- **CLIQUE $\rightarrow$ Independent Set $\rightarrow$ Vertex Cover (Conflict Analysis)**: 
  - **Maximum Independent Set**: Discovers the largest bundle of mutually compatible food products that can safely be co-stored together without spoilage.
  - **Minimum Vertex Cover**: Identifies the minimal set of conflicting items that must be moved into isolated negative-pressure vaults.
- **Vertex Cover 2-Approximation**: Identifies the minimal set of strategic inspection checkpoints required to monitor all transit corridors within a factor of 2 of the theoretical optimum.

### Module 6: Randomized & Parallel Algorithms (M6 – CO6)
- **Randomized QuickSort**: Ranks and sorts food inventory dynamically by demand weight, expiration countdown, or profitability with uniform pivot selection, avoiding worst-case quadratic behavior.
- **Reservoir Sampling**: Samples representative temperature readings from continuous, unbounded live IoT sensor telemetry streams with guaranteed uniform probability ($k / N$) without storing infinite sensor history.
- **Miller-Rabin Primality Testing**: Monte Carlo probabilistic test used for cryptographic batch verification and digital signatures of food lot tracking codes (error bound $< 4^{-k}$).
- **Blelloch Parallel Scan**: Work-efficient parallel prefix sum ($O(n)$ work, $O(\log n)$ span) computing cumulative 24-hour food inventory depletion curves.
- **Parallel Reduce & Brent's Theorem**: Aggregates enterprise logistics statistics (total tonnage, revenue, spoilage) and calculates multi-processor speedup bounds ($T_p \le W/p + S$) across parallel hardware.

---

## 📁 Folder Structure

```
DSA_3_Project/
├── backend/
│   ├── data/
│   │   └── foodChainData.js               <-- Realistic Suppliers, Warehouses, Products, Inspection Logs
│   ├── modules/
│   │   ├── module1_string_matching/       <-- KMP, Z-Algorithm, Rabin-Karp, Aho-Corasick
│   │   ├── module2_document_similarity/   <-- Suffix Array, Kasai LCP, Suffix Automaton
│   │   ├── module3_dynamic_programming/   <-- Damerau-Levenshtein, Bitmask DP, Matrix-Chain, OBST
│   │   ├── module4_network_flow/          <-- Dinic's Algorithm, Edmonds-Karp, Bipartite Matching
│   │   ├── module5_np_approximation/      <-- 3-SAT Solver, Conflict Graph, Vertex Cover 2-Approx
│   │   ├── module6_randomized_algo/       <-- Randomized QuickSort, Reservoir Sampling, Miller-Rabin, Blelloch Scan, Brent
│   │   └── index.js                       <-- Master Registry & Course Outcome Metadata
│   ├── routes/
│   │   └── api.js                         <-- REST API Endpoints (/api/...)
│   ├── server.js                          <-- Express Server (Port 5000)
│   └── package.json
│
├── frontend/                              <-- Organic Supply Chain Dashboard (Dark Emerald Theme)
│   ├── css/style.css                      <-- Hexagonal Supply Lattice & Glassmorphism Design
│   ├── js/api.js                          <-- Async REST API Client
│   ├── js/visualizers.js                  <-- SVG Network Graphs, OBST Trees, Conflict Visualizers
│   ├── js/app.js                          <-- UI Coordinator & Live Benchmark Suite
│   └── index.html                         <-- Responsive Dashboard with Live IoT Ticker
```

---

## 🚀 Running FoodChain

```powershell
cd backend
npm install
node server.js
```

Open your browser at:
- **Web Dashboard:** [http://localhost:5000](http://localhost:5000)
- **REST API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

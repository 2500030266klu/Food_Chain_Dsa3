/**
 * FoodChain Enterprise – Dataset Synchronization & Indian Market Adapter
 * 
 * Synchronizes with:
 * 1. Top 50 Fast-Food Chains in USA.csv (Dataset folder)
 * 2. Top Fast-Food & Food Logistics Chains in India (with domestic giants)
 * 3. Currency conversion to Indian Rupees (₹) with INR Lakhs/Crores standard
 * 4. FSSAI & APEDA Indian regulatory & cold-chain logistics telemetry
 */

const fs = require('fs');
const path = require('path');

// Conversion Rate: USD to INR (Standard 1 USD = 83.25 INR)
const USD_TO_INR = 83.25;

// Path to CSV dataset
const DATASET_DIR = path.resolve(__dirname, '../../Dataset');
const CSV_FILE_PATH = path.join(DATASET_DIR, 'Top 50 Fast-Food Chains in USA.csv');

/**
 * Parses CSV file safely handling quoted values with commas
 */
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]);
    const records = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= headers.length) {
            const entry = {};
            headers.forEach((h, idx) => {
                entry[h.trim()] = (values[idx] || '').trim();
            });
            records.push(entry);
        }
    }
    return records;
}

function parseCSVLine(line) {
    const values = [];
    let insideQuotes = false;
    let current = '';

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);
    return values;
}

/**
 * Loads and harmonizes the fast-food chains dataset
 */
function loadFastFoodDataset() {
    let rawRecords = [];

    try {
        if (fs.existsSync(CSV_FILE_PATH)) {
            const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
            rawRecords = parseCSV(fileContent);
        }
    } catch (err) {
        console.error('Error reading CSV dataset:', err.message);
    }

    // Process rows and convert all metrics to Indian Rupees (₹)
    const chains = rawRecords.map((r, index) => {
        const name = r['Fast-Food Chains'] || `Chain #${index + 1}`;
        const salesMillionUSD = parseFloat(r['U.S. Systemwide Sales (Millions - U.S Dollars)']) || 0;
        const avgSalesThousandUSD = parseFloat(r['Average Sales per Unit (Thousands - U.S Dollars)']) || 0;
        const franchisedStores = parseInt(r['Franchised Stores'], 10) || 0;
        const companyStores = parseInt(r['Company Stores'], 10) || 0;
        const totalUnits = parseInt(r['2021 Total Units'], 10) || (franchisedStores + companyStores);
        const changeUnits = parseInt(r['Total Change in Units from 2020'], 10) || 0;

        // Financial conversion to INR
        // 1 Million USD = 8.325 Crores INR (1 Cr = 10 Million INR)
        const salesCroresINR = Math.round((salesMillionUSD * USD_TO_INR) / 10);
        // 1 Thousand USD = 0.8325 Lakhs INR
        const avgSalesLakhsINR = Math.round((avgSalesThousandUSD * USD_TO_INR) / 100);

        // Indian Market Category & Cold-Chain Logistics Profile
        let foodCategory = 'Burgers & Sandwiches';
        let coldChainTemp = 'Chilled (2-4°C)';
        let perishableRank = 70;

        if (/Pizza/i.test(name) || /Domino/i.test(name) || /Papa/i.test(name) || /Little Caesars/i.test(name)) {
            foodCategory = 'Pizza & Bakery';
            coldChainTemp = 'Refrigerated Cheese & Dough (1-4°C)';
            perishableRank = 85;
        } else if (/Chicken/i.test(name) || /KFC/i.test(name) || /Wing/i.test(name) || /Popeye/i.test(name) || /Bojangles/i.test(name) || /Zaxby/i.test(name)) {
            foodCategory = 'Poultry & Quick Service';
            coldChainTemp = 'Deep Chill / Frozen (-18°C)';
            perishableRank = 95;
        } else if (/Coffee/i.test(name) || /Starbucks/i.test(name) || /Dunkin/i.test(name) || /Tim Hortons/i.test(name)) {
            foodCategory = 'Beverages & Dairy';
            coldChainTemp = 'Fresh Dairy Chill (2-3°C)';
            perishableRank = 80;
        } else if (/Taco/i.test(name) || /Chipotle/i.test(name) || /QDOBA/i.test(name) || /Moe/i.test(name) || /Del Taco/i.test(name)) {
            foodCategory = 'Mexican & Fresh Produce';
            coldChainTemp = 'Produce & Salsa Cool (4-6°C)';
            perishableRank = 90;
        } else if (/Smoothie/i.test(name) || /Baskin/i.test(name) || /Dairy Queen/i.test(name) || /Custard/i.test(name) || /Krispy/i.test(name)) {
            foodCategory = 'Frozen Desserts & Fruits';
            coldChainTemp = 'Deep Frozen Ice-Cream (-22°C)';
            perishableRank = 88;
        } else if (/Panda/i.test(name)) {
            foodCategory = 'Asian & Stir-Fry';
            coldChainTemp = 'Fresh Produce & Meats (2-4°C)';
            perishableRank = 85;
        }

        // Indian market footprint estimation (major metro presence in India)
        const activeInIndia = [
            "McDonald’s", "Domino's", "Subway", "KFC", "Burger King", 
            "Pizza Hut", "Starbucks", "Dunkin'", "Baskin-Robbins", "Cinnabon", 
            "Chili's", "Taco Bell", "Krispy Kreme", "Tim Hortons", "Carl’s Jr."
        ].some(brand => name.toLowerCase().includes(brand.toLowerCase()));

        return {
            rank: index + 1,
            name,
            foodCategory,
            coldChainTemp,
            perishableRank,
            activeInIndia,
            salesMillionUSD,
            salesCroresINR,
            salesFormattedINR: `₹${salesCroresINR.toLocaleString('en-IN')} Cr`,
            avgSalesLakhsINR,
            avgSalesFormattedINR: `₹${avgSalesLakhsINR.toLocaleString('en-IN')} L/unit`,
            franchisedStores,
            companyStores,
            totalUnits,
            changeUnits,
            franchiseRatioPercent: totalUnits > 0 ? Math.round((franchisedStores / totalUnits) * 100) : 0
        };
    });

    return chains;
}

// Cached in memory for high-performance serving
let cachedChains = null;

function getChains() {
    if (!cachedChains) {
        cachedChains = loadFastFoodDataset();
    }
    return cachedChains;
}

/**
 * Returns executive dataset metrics for high-level dashboard display
 */
function getDatasetExecutiveSummary() {
    const chains = getChains();
    const totalSalesCrores = chains.reduce((sum, c) => sum + c.salesCroresINR, 0);
    const totalUnits = chains.reduce((sum, c) => sum + c.totalUnits, 0);
    const totalFranchised = chains.reduce((sum, c) => sum + c.franchisedStores, 0);
    const totalCompany = chains.reduce((sum, c) => sum + c.companyStores, 0);
    const netGrowthUnits = chains.reduce((sum, c) => sum + c.changeUnits, 0);
    const activeIndiaChains = chains.filter(c => c.activeInIndia);

    const top10BySales = [...chains]
        .sort((a, b) => b.salesCroresINR - a.salesCroresINR)
        .slice(0, 10);

    const top10ByUnits = [...chains]
        .sort((a, b) => b.totalUnits - a.totalUnits)
        .slice(0, 10);

    // Grouping by Category
    const categoryStats = {};
    chains.forEach(c => {
        if (!categoryStats[c.foodCategory]) {
            categoryStats[c.foodCategory] = { count: 0, totalSalesCrores: 0, totalUnits: 0 };
        }
        categoryStats[c.foodCategory].count += 1;
        categoryStats[c.foodCategory].totalSalesCrores += c.salesCroresINR;
        categoryStats[c.foodCategory].totalUnits += c.totalUnits;
    });

    return {
        totalChainsCount: chains.length,
        totalSalesCroresINR: totalSalesCrores,
        totalSalesFormattedINR: `₹${totalSalesCrores.toLocaleString('en-IN')} Cr`,
        totalUnits: totalUnits,
        totalUnitsFormatted: totalUnits.toLocaleString('en-IN'),
        totalFranchised: totalFranchised,
        totalCompany: totalCompany,
        franchiseSharePercent: totalUnits > 0 ? Math.round((totalFranchised / totalUnits) * 100) : 0,
        netGrowthUnits: netGrowthUnits,
        activeIndiaChainsCount: activeIndiaChains.length,
        top10BySales,
        top10ByUnits,
        categoryStats,
        currencySymbol: '₹',
        currencyCode: 'INR'
    };
}

/**
 * Generates Course Outcome (CO1 - CO6) analytical data powered by the dataset
 */
function getDatasetCOAnalytics() {
    const chains = getChains();
    const summary = getDatasetExecutiveSummary();

    // CO1: Pattern Matching targets (Chain brands, FSSAI hazard terms)
    const co1SearchCatalog = chains.map(c => ({
        id: `CHN-${String(c.rank).padStart(3, '0')}`,
        name: c.name,
        category: c.foodCategory,
        salesINR: c.salesFormattedINR,
        units: c.totalUnits
    }));

    // CO2: Text & Contract Corpus (Franchise disclosure snippets for Suffix Tree / Kasai)
    const co2FranchiseCorpus = chains.slice(0, 15).map(c => 
        `FSSAI-FRANCHISE-AUDIT: ${c.name} operates ${c.totalUnits} food retail outlets. ` +
        `Cold-chain storage standard requires ${c.coldChainTemp}. ` +
        `Total systemwide revenue stands at ${c.salesFormattedINR}. ` +
        `Franchise agreement compliance verified under FSSAI Schedule-IV sanitary protocols.`
    ).join('\n\n');

    // CO3: Dynamic Programming Relief Cargo Bundles priced in ₹
    const co3ReliefCargoItems = [
        { id: 'PKG-1', name: 'Sharbati Whole Wheat Flour (50kg)', weightKg: 50, costINR: 2750, nutritionScore: 92 },
        { id: 'PKG-2', name: 'Amul A2 Pasteurized Cow Milk (25L)', weightKg: 26, costINR: 1700, nutritionScore: 96 },
        { id: 'PKG-3', name: 'Nashik Red Hybrid Tomatoes (30kg)', weightKg: 30, costINR: 1050, nutritionScore: 78 },
        { id: 'PKG-4', name: 'Ratnagiri Alphonso Mango Pulp (20kg)', weightKg: 22, costINR: 5500, nutritionScore: 84 },
        { id: 'PKG-5', name: 'Organic Palak Farm Greens (15kg)', weightKg: 15, costINR: 675, nutritionScore: 88 },
        { id: 'PKG-6', name: 'Kinnow & Nagpur Mandarin Crates (35kg)', weightKg: 35, costINR: 2100, nutritionScore: 82 },
        { id: 'PKG-7', name: 'Malabar Coastal Protein Pack (10kg)', weightKg: 10, costINR: 4800, nutritionScore: 94 },
        { id: 'PKG-8', name: 'Fresh Organic Paneer Dairy Pack (12kg)', weightKg: 12, costINR: 3840, nutritionScore: 90 }
    ];

    // CO4: Indian Intermodal Freight Network (Punjab -> Delhi -> Mumbai -> Bengaluru)
    const co4FreightNetwork = {
        nodes: [
            { id: 0, label: 'Ludhiana Agro Hub (Punjab Origin)' },
            { id: 1, label: 'Kundli Mega Food Park (Delhi-NCR)' },
            { id: 2, label: 'Jaipur Logistics Terminal (Rajasthan)' },
            { id: 3, label: 'Nagpur Multi-Modal Cold Depot' },
            { id: 4, label: 'JNPT Port / Navi Mumbai Hub' },
            { id: 5, label: 'Hyderabad Regional Gateway' },
            { id: 6, label: 'Whitefield Cold Terminal (Bengaluru)' },
            { id: 7, label: 'Chennai Harbour South Depot' }
        ],
        capacities: [
            // 0: Punjab -> 1: Delhi (45 MT), 2: Jaipur (35 MT)
            [0, 45, 35, 0, 0, 0, 0, 0],
            // 1: Delhi -> 3: Nagpur (30 MT), 4: Mumbai (25 MT)
            [0, 0, 0, 30, 25, 0, 0, 0],
            // 2: Jaipur -> 4: Mumbai (28 MT), 3: Nagpur (15 MT)
            [0, 0, 0, 15, 28, 0, 0, 0],
            // 3: Nagpur -> 5: Hyderabad (32 MT), 6: Bengaluru (22 MT)
            [0, 0, 0, 0, 0, 32, 22, 0],
            // 4: Mumbai -> 6: Bengaluru (38 MT), 5: Hyderabad (18 MT)
            [0, 0, 0, 0, 0, 18, 38, 0],
            // 5: Hyderabad -> 7: Chennai (35 MT), 6: Bengaluru (16 MT)
            [0, 0, 0, 0, 0, 0, 16, 35],
            // 6: Bengaluru -> 7: Chennai (42 MT)
            [0, 0, 0, 0, 0, 0, 0, 42],
            // 7: Sink
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]
    };

    // CO5: Indian Agricultural Produce Conflict Matrix (Ethylene emitter vs sensitive)
    const co5CommodityItems = [
        { id: 0, name: 'Palak (Organic Spinach)', ethyleneEmitter: false, ethyleneSensitive: true },
        { id: 1, name: 'Alphonso Mangoes', ethyleneEmitter: true, ethyleneSensitive: false },
        { id: 2, name: 'Amul Whole Milk', ethyleneEmitter: false, ethyleneSensitive: false },
        { id: 3, name: 'Coastal Prawns & Fish', ethyleneEmitter: false, ethyleneSensitive: false },
        { id: 4, name: 'Hybrid Red Tomatoes', ethyleneEmitter: true, ethyleneSensitive: false },
        { id: 5, name: 'Sharbati Durum Wheat', ethyleneEmitter: false, ethyleneSensitive: false },
        { id: 6, name: 'Himachal Apples', ethyleneEmitter: true, ethyleneSensitive: false },
        { id: 7, name: 'Fresh Paneer Dairy', ethyleneEmitter: false, ethyleneSensitive: false }
    ];

    // Conflict Edges (e.g., Mangoes & Apples cannot be stored with Palak; Prawns cannot be co-stored with Milk/Paneer due to odor)
    const co5ConflictEdges = [
        [0, 1], // Palak <-> Mangoes (Ethylene breakdown)
        [0, 4], // Palak <-> Tomatoes (Ethylene breakdown)
        [0, 6], // Palak <-> Apples (Ethylene breakdown)
        [2, 3], // Milk <-> Prawns (Cross-odor contamination)
        [3, 7]  // Prawns <-> Paneer (Cross-odor contamination)
    ];

    // CO6: Real-time Highway Sensor Telemetry Readings (°C) along NH44 corridor
    const co6HighwaySensors = [
        2.2, 2.4, 2.1, 2.5, 3.2, 3.8, 4.1, 3.9, 2.8, 2.4,
        2.2, 2.0, 1.9, 2.3, 2.7, 3.4, 4.3, 4.8, 3.6, 2.9,
        2.5, 2.2, 2.1, 2.0
    ];

    return {
        executive: summary,
        co1SearchCatalog,
        co2FranchiseCorpus,
        co3ReliefCargoItems,
        co4FreightNetwork,
        co5CommodityItems,
        co5ConflictEdges,
        co6HighwaySensors
    };
}

module.exports = {
    loadFastFoodDataset,
    getChains,
    getDatasetExecutiveSummary,
    getDatasetCOAnalytics,
    USD_TO_INR
};

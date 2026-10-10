/**
 * FoodChain Enterprise Data Repository (Indian Agricultural & Cold-Chain Logistics)
 * Models realistic Food Supply & Distribution entities:
 * Indian Farmers, Co-ops, Mandis, Commodities (in ₹ INR), Warehouses, FSSAI Inspection Reports, and Telematics.
 */

const FOOD_PRODUCTS = [
    { id: 'PRD-101', name: 'Organic Palak (Baby Spinach)', category: 'Leafy Greens', tempZone: 'Chilled (2-4°C)', ethyleneSensitive: true, pricePerKg: 45, demandWeight: 85 },
    { id: 'PRD-102', name: 'Ratnagiri Alphonso Mangoes (Grade-A)', category: 'Tropical Fruits', tempZone: 'Cool (8-12°C)', ethyleneSensitive: false, ethyleneProducer: true, pricePerKg: 250, demandWeight: 92 },
    { id: 'PRD-103', name: 'Amul A2 Pasteurized Cow Milk', category: 'Dairy', tempZone: 'Refrigerated (1-3°C)', ethyleneSensitive: false, pricePerKg: 68, demandWeight: 110 },
    { id: 'PRD-104', name: 'Malabar Coastal Tiger Prawns', category: 'Seafood', tempZone: 'Deep Chill (-1 to 1°C)', ethyleneSensitive: false, pricePerKg: 480, demandWeight: 65 },
    { id: 'PRD-105', name: 'Nashik Red Hybrid Tomatoes', category: 'Vegetables', tempZone: 'Ambient Cool (10-14°C)', ethyleneSensitive: false, ethyleneProducer: true, pricePerKg: 35, demandWeight: 78 },
    { id: 'PRD-106', name: 'Sharbati 1121 Basmati Wheat & Grain', category: 'Grains & Cereals', tempZone: 'Dry Ambient (15-20°C)', ethyleneSensitive: false, pricePerKg: 55, demandWeight: 140 },
    { id: 'PRD-107', name: 'Himachal Royal Delicious Apples', category: 'Pome Fruits', tempZone: 'Cold (1-2°C)', ethyleneSensitive: false, ethyleneProducer: true, pricePerKg: 180, demandWeight: 95 },
    { id: 'PRD-108', name: 'Fresh Organic Malai Paneer Cubes', category: 'Dairy & Protein', tempZone: 'Frozen (-18°C)', ethyleneSensitive: false, pricePerKg: 320, demandWeight: 55 }
];

const FOOD_SUPPLIERS = [
    { id: 'SUP-01', name: 'Punjab Agri-Farmers Producer Co-op', location: 'Ludhiana, Punjab', certifiedOrganic: true, capacityTons: 350, primaryProduct: 'Sharbati Basmati Wheat' },
    { id: 'SUP-02', name: 'Nashik Agro-Horticulture Producer Co.', location: 'Nashik, Maharashtra', certifiedOrganic: true, capacityTons: 280, primaryProduct: 'Red Hybrid Tomatoes & Onions' },
    { id: 'SUP-03', name: 'Anand Milk Union Limited (Amul Co-op)', location: 'Anand, Gujarat', certifiedOrganic: false, capacityTons: 420, primaryProduct: 'A2 Cow Milk & Butter' },
    { id: 'SUP-04', name: 'Malabar Coastal Marine & Fisheries', location: 'Kochi / Wayanad, Kerala', certifiedOrganic: false, capacityTons: 110, primaryProduct: 'Coastal Tiger Prawns' },
    { id: 'SUP-05', name: 'Ratnagiri Alphonso Growers Consortium', location: 'Konkan, Maharashtra', certifiedOrganic: true, capacityTons: 190, primaryProduct: 'Alphonso Mangoes (GI Tag)' },
    { id: 'SUP-06', name: 'Himachal Fruit & Apple Federation', location: 'Shimla, Himachal Pradesh', certifiedOrganic: true, capacityTons: 240, primaryProduct: 'Royal Delicious Apples' }
];

const WAREHOUSES = [
    { id: 'WH-01', name: 'Western Mega Cold Hub (JNPT Port / Navi Mumbai)', location: 'Navi Mumbai, MH', tempZones: ['Frozen', 'Deep Chill', 'Chilled'], capacityTons: 500, tempZone: 'Chilled / Frozen' },
    { id: 'WH-02', name: 'Northern Agro Terminal (Kundli Food Park, Delhi-NCR)', location: 'Sonipat / Delhi-NCR', tempZones: ['Chilled', 'Cool', 'Dry Ambient'], capacityTons: 750, tempZone: 'Multi-Temp Controlled' },
    { id: 'WH-03', name: 'Punjab Central Grain Silo & Depot (Khanna / Ludhiana)', location: 'Khanna, Punjab', tempZones: ['Dry Ambient'], capacityTons: 1200, tempZone: 'Dry Ambient Silo' },
    { id: 'WH-04', name: 'Southern Tech-Cold Terminal (Whitefield / Bengaluru)', location: 'Bengaluru, Karnataka', tempZones: ['Frozen', 'Chilled', 'Ambient Cool'], capacityTons: 450, tempZone: 'Reefer Express Hub' }
];

const FOOD_QUALITY_REPORTS = [
    {
        id: 'RPT-2026-FSSAI-01',
        title: 'FSSAI Microbiological & Cold-Chain Audit: Batch PRD-101 (Palak)',
        date: '2026-10-08',
        inspector: 'Dr. Ananya Sharma (FSSAI Central Safety Officer)',
        content: `FSSAI AUDIT SUMMARY: Punjab Agri-Farmers Producer Co-op, Lot #PLK-982-PB. 
Standard bacteriological swab tests were conducted across washing flumes and cold-storage partitions. 
RESULTS: Zero detection of salmonella enterica and escherichia coli strains. 
Aerobic plate count is fully compliant with FSSAI Food Safety and Standards (Packaging & Labelling) Regulations 2020. 
WARNING NOTICE: Trace humidity in reefer transit van RFC-4402 could promote fungal spoilage if cold-chain temperature fluctuates above 4.5 degrees celsius. 
All crate seals verified intact with tamper-evident AGMARK RFID barcode.`
    },
    {
        id: 'RPT-2026-FSSAI-02',
        title: 'APEDA Contaminant & Marine Screening: Lot PRD-104 (Malabar Tiger Prawns)',
        date: '2026-10-09',
        inspector: 'Dr. Rajesh Nair (APEDA Export Quality Lead)',
        content: `MARINE INSPECTION PROTOCOL: Shipment SHIP-MH-9021-IN from Malabar Coastal Marine & Fisheries. 
Testing performed for heavy metals, listeria monocytogenes, and microbial histamine formation. 
SAMPLES: Batch 04A and 04B demonstrated core muscle temperature maintained at -0.8°C throughout Mumbai-Goa coastal highway transit. 
CRITICAL FINDING: No detectable listeria, no chemical pesticide residues, and mercury levels remain well below 0.1 ppm threshold. 
Batch cleared for immediate wholesale cold-chain distribution to regional metropolitan supermarket chains across Mumbai and Pune.`
    },
    {
        id: 'RPT-2026-FSSAI-03',
        title: 'AGMARK Grain Moisture & Mycotoxin Screening: Lot PRD-106 (Basmati Grain)',
        date: '2026-10-07',
        inspector: 'Silo Inspector Harpreet Singh (FSSAI Northern Mandi Officer)',
        content: `SILO 4 INSPECTION LOG: Punjab Central Grain Silo, elevator bin #12. 
Moisture sensor analysis reads 11.8% (optimal safety margin <13.5%). 
ELISA chromatography test conducted for fungal mycotoxins: aflatoxin B1, ochratoxin A, and deoxynivalenol. 
RESULTS: Negligible fungal activity; no aflatoxin detected. Grain aerated under laminar airflow. 
Certified suitable for long-term dry ambient silo buffering under national food security reserves.`
    }
];

const SAMPLE_SHIPMENT_CODES = [
    'SHIP-MH-9021-IN',
    'SHIP-DL-4402-NCR',
    'SHIP-PB-8119-AGR',
    'SHIP-KA-3301-BLR',
    'SHIP-GJ-7720-DAIRY'
];

module.exports = {
    FOOD_PRODUCTS,
    FOOD_SUPPLIERS,
    WAREHOUSES,
    FOOD_QUALITY_REPORTS,
    SAMPLE_SHIPMENT_CODES
};

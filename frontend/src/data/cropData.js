/**
 * Comprehensive crop database — shared between the Encyclopedia and the
 * Crop Rotation prediction dropdown on the Dashboard.
 *
 * Fields:
 *   id        – stable unique key
 *   name      – display name
 *   type      – category (used for filter chips)
 *   icon      – emoji
 *   tip       – "Field Intelligence" advisory
 *   risk      – Low | Medium | High
 *   season    – planting/growing window
 *   water     – Low | Medium | High  (water requirement)
 *   duration  – approx days to harvest
 *   npk       – rough fertiliser ratio hint
 */

export const CROP_DATABASE = [
  // ── CEREALS ─────────────────────────────────────────────────────────────────
  { id: 'rice',       name: 'Paddy (Rice)',    type: 'Cereal',   icon: '🌾', risk: 'Medium', season: 'Jun–Sep',    water: 'High',   duration: 120,
    tip: 'Switch to SRI (System of Rice Intensification) during drought to cut water use by 40%.',
    npk: '20-10-10' },

  { id: 'wheat',      name: 'Wheat',           type: 'Cereal',   icon: '🌾', risk: 'Low',    season: 'Nov–Apr',    water: 'Medium', duration: 130,
    tip: 'Apply split nitrogen doses — 50% at sowing, 25% at tillering, 25% at heading.',
    npk: '20-15-15' },

  { id: 'maize',      name: 'Maize (Corn)',    type: 'Cereal',   icon: '🌽', risk: 'Low',    season: 'Jun–Oct',    water: 'Medium', duration: 90,
    tip: 'Intercrop with beans to improve soil nitrogen and double land productivity.',
    npk: '25-12-12' },

  { id: 'sorghum',    name: 'Sorghum',         type: 'Cereal',   icon: '🌾', risk: 'Low',    season: 'Jun–Nov',    water: 'Low',    duration: 90,
    tip: 'Highly drought-tolerant. Preferred rotation crop after groundnut for nitrogen balance.',
    npk: '15-10-10' },

  { id: 'bajra',      name: 'Pearl Millet (Bajra)', type: 'Cereal', icon: '🌾', risk: 'Low', season: 'Jul–Oct',   water: 'Low',    duration: 80,
    tip: 'Performs well on sandy soils. Ideal cover crop to prevent monsoon erosion.',
    npk: '12-8-8' },

  { id: 'ragi',       name: 'Finger Millet (Ragi)', type: 'Cereal', icon: '🌾', risk: 'Low', season: 'Jun–Sep',   water: 'Low',    duration: 100,
    tip: 'Rich in calcium. Rotate after legumes — it thrives on residual nitrogen.',
    npk: '10-8-10' },

  { id: 'barley',     name: 'Barley',          type: 'Cereal',   icon: '🌾', risk: 'Low',    season: 'Oct–Mar',    water: 'Low',    duration: 110,
    tip: 'Good for cool, dry conditions. Excellent green manure if ploughed under.',
    npk: '18-12-8' },

  { id: 'oats',       name: 'Oats',            type: 'Cereal',   icon: '🌾', risk: 'Low',    season: 'Oct–Feb',    water: 'Medium', duration: 100,
    tip: 'Grow as winter crop or fodder. Suppresses weeds naturally through dense canopy.',
    npk: '15-10-8' },

  // ── VEGETABLES ────────────────────────────────────────────────────────────
  { id: 'tomato',     name: 'Tomato',          type: 'Vegetable', icon: '🍅', risk: 'Medium', season: 'Nov–Feb',   water: 'High',   duration: 90,
    tip: 'Stake plants at 30 cm height. Remove suckers weekly to focus energy on fruit.',
    npk: '10-20-20' },

  { id: 'potato',     name: 'Potato',          type: 'Vegetable', icon: '🥔', risk: 'Medium', season: 'Oct–Jan',   water: 'Medium', duration: 90,
    tip: 'Hill up soil every 2 weeks to prevent green tubers. Rotate away from Solanums each year.',
    npk: '10-20-30' },

  { id: 'onion',      name: 'Onion',           type: 'Vegetable', icon: '🧅', risk: 'Medium', season: 'Nov–Feb',   water: 'Medium', duration: 120,
    tip: 'Stop irrigation 2 weeks before harvest to improve storage quality.',
    npk: '8-16-24' },

  { id: 'garlic',     name: 'Garlic',          type: 'Vegetable', icon: '🧄', risk: 'Low',    season: 'Oct–Feb',   water: 'Low',    duration: 130,
    tip: 'Plant cloves 5 cm deep, pointed end up. Natural pest repellent for companion planting.',
    npk: '8-14-20' },

  { id: 'brinjal',    name: 'Brinjal (Eggplant)', type: 'Vegetable', icon: '🍆', risk: 'Medium', season: 'Year-round', water: 'Medium', duration: 75,
    tip: 'Apply neem oil spray every 10 days to combat shoot borer — largest yield thief.',
    npk: '10-15-15' },

  { id: 'bittergourd',name: 'Bitter Gourd',    type: 'Vegetable', icon: '🥒', risk: 'Low',    season: 'Feb–May',   water: 'Medium', duration: 60,
    tip: 'Provide trellis support from day one. Harvest when skin is still firm and green.',
    npk: '8-12-14' },

  { id: 'ladyfinger', name: 'Okra (Lady\'s Finger)', type: 'Vegetable', icon: '🥬', risk: 'Low', season: 'Apr–Jul', water: 'Medium', duration: 55,
    tip: 'Harvest every 2 days once pods appear — delays cause rapid fibre toughening.',
    npk: '10-10-15' },

  { id: 'cabbage',    name: 'Cabbage',         type: 'Vegetable', icon: '🥬', risk: 'Low',    season: 'Sep–Jan',   water: 'High',   duration: 90,
    tip: 'Scatter wood ash around base to deter slugs and add calcium to the soil.',
    npk: '12-16-12' },

  { id: 'cauliflower',name: 'Cauliflower',     type: 'Vegetable', icon: '🥦', risk: 'Low',    season: 'Sep–Jan',   water: 'High',   duration: 85,
    tip: 'Blanch the head by tying outer leaves over it when curds reach 3 cm in diameter.',
    npk: '15-18-12' },

  { id: 'carrot',     name: 'Carrot',          type: 'Vegetable', icon: '🥕', risk: 'Low',    season: 'Oct–Feb',   water: 'Medium', duration: 75,
    tip: 'Deep, loose, stone-free soil is critical. Rocky soils produce forked, unsaleable roots.',
    npk: '8-12-20' },

  { id: 'radish',     name: 'Radish',          type: 'Vegetable', icon: '🌱', risk: 'Low',    season: 'Oct–Jan',   water: 'Medium', duration: 30,
    tip: 'Fastest crop to break a production gap. Great companion for carrot and cabbage beds.',
    npk: '6-10-12' },

  { id: 'spinach',    name: 'Spinach',         type: 'Vegetable', icon: '🥬', risk: 'Low',    season: 'Nov–Feb',   water: 'High',   duration: 45,
    tip: 'Bolts in long-day heat. Sow in shallow succession every 2 weeks for continuous harvest.',
    npk: '15-10-8' },

  { id: 'cucumber',   name: 'Cucumber',        type: 'Vegetable', icon: '🥒', risk: 'Low',    season: 'Feb–Apr',   water: 'High',   duration: 55,
    tip: 'Vertical growing on a trellis can triple yield per square metre over ground-spread vines.',
    npk: '10-15-20' },

  { id: 'pumpkin',    name: 'Pumpkin',         type: 'Vegetable', icon: '🎃', risk: 'Low',    season: 'Jan–Apr',   water: 'Medium', duration: 90,
    tip: 'Each vine needs 3–4 m² of space. Hand-pollinate in the morning for higher fruit set.',
    npk: '8-12-14' },

  { id: 'sweetpotato',name: 'Sweet Potato',    type: 'Vegetable', icon: '🍠', risk: 'Low',    season: 'May–Sep',   water: 'Low',    duration: 90,
    tip: 'Vines form a living mulch, suppressing weeds. Excellent after paddy in wet-to-dry rotation.',
    npk: '6-8-20' },

  // ── FRUITS ────────────────────────────────────────────────────────────────
  { id: 'banana',     name: 'Banana',          type: 'Fruit',    icon: '🍌', risk: 'Medium', season: 'Year-round', water: 'High',   duration: 300,
    tip: 'Prop mature plants with bamboo poles before high monsoon winds. Remove dead leaves weekly.',
    npk: '15-5-40' },

  { id: 'mango',      name: 'Mango',           type: 'Fruit',    icon: '🥭', risk: 'Low',    season: 'Mar–Jun',    water: 'Medium', duration: 365,
    tip: 'Withhold irrigation for 2 months before flowering to trigger bud formation.',
    npk: '10-10-10' },

  { id: 'papaya',     name: 'Papaya',          type: 'Fruit',    icon: '🍈', risk: 'Medium', season: 'Year-round', water: 'Medium', duration: 210,
    tip: 'Infected plants cannot recover — remove and burn at first sign of leaf curl virus.',
    npk: '12-10-16' },

  { id: 'guava',      name: 'Guava',           type: 'Fruit',    icon: '🍐', risk: 'Low',    season: 'Jul–Sep',    water: 'Medium', duration: 180,
    tip: 'Prune 30% of canopy after each harvest to stimulate fresh fruiting shoots.',
    npk: '8-8-12' },

  { id: 'pineapple',  name: 'Pineapple',       type: 'Fruit',    icon: '🍍', risk: 'Medium', season: 'Year-round', water: 'Low',    duration: 540,
    tip: 'Use ethephon spray to synchronise harvest. Plant crown slips for propagation.',
    npk: '10-10-20' },

  { id: 'watermelon', name: 'Watermelon',      type: 'Fruit',    icon: '🍉', risk: 'Low',    season: 'Dec–Mar',    water: 'High',   duration: 70,
    tip: 'Reduce irrigation 7 days before harvest to concentrate sugars. Thump test for hollow sound.',
    npk: '10-15-20' },

  { id: 'grapes',     name: 'Grapes',          type: 'Fruit',    icon: '🍇', risk: 'High',   season: 'Dec–Mar',    water: 'Medium', duration: 180,
    tip: 'Trellis wire must be set before planting. Prune to 2-bud spurs every January.',
    npk: '10-10-15' },

  { id: 'strawberry', name: 'Strawberry',      type: 'Fruit',    icon: '🍓', risk: 'Medium', season: 'Oct–Feb',    water: 'High',   duration: 90,
    tip: 'Mulch beds with straw to keep berries clean and slug-free. Rotate fields every 3 years.',
    npk: '10-14-18' },

  { id: 'lemon',      name: 'Lemon / Lime',    type: 'Fruit',    icon: '🍋', risk: 'Low',    season: 'Year-round', water: 'Medium', duration: 365,
    tip: 'Feed with citrus-formulated fertiliser in March and August for best fruit set.',
    npk: '12-8-10' },

  // ── LEGUMES ───────────────────────────────────────────────────────────────
  { id: 'cowpea',     name: 'Cowpea',          type: 'Legume',   icon: '🫘', risk: 'Low',    season: 'Nov–Feb',    water: 'Low',    duration: 65,
    tip: 'Fixes 60–120 kg N/ha per season. Rotate before any heavy cereal crop.',
    npk: '0-20-20' },

  { id: 'soybean',    name: 'Soybean',         type: 'Legume',   icon: '🫘', risk: 'Low',    season: 'Jun–Oct',    water: 'Medium', duration: 100,
    tip: 'Inoculate seed with Rhizobium before sowing — cuts fertiliser costs by 50%.',
    npk: '0-18-18' },

  { id: 'groundnut',  name: 'Groundnut (Peanut)', type: 'Legume', icon: '🥜', risk: 'Low',  season: 'Jun–Nov',    water: 'Medium', duration: 110,
    tip: 'Peg formation needs calcium — side-dress with gypsum at 200 kg/ha after flowering.',
    npk: '0-15-25' },

  { id: 'chickpea',   name: 'Chickpea (Gram)', type: 'Legume',   icon: '🫘', risk: 'Low',    season: 'Oct–Mar',    water: 'Low',    duration: 95,
    tip: 'Cold-tolerant. Avoid waterlogging — plant on ridges in heavy clay soils.',
    npk: '0-16-20' },

  { id: 'lentil',     name: 'Lentil (Dal)',     type: 'Legume',   icon: '🫘', risk: 'Low',    season: 'Oct–Mar',    water: 'Low',    duration: 110,
    tip: 'Shallow-rooted. Excellent on medium soils after wheat harvest on residual moisture.',
    npk: '0-14-18' },

  { id: 'greengram',  name: 'Green Gram (Moong)', type: 'Legume', icon: '🫘', risk: 'Low',  season: 'Feb–May',    water: 'Low',    duration: 65,
    tip: 'Fast-maturing short-duration crop perfect for fitting into rice–rice rotation gaps.',
    npk: '0-12-16' },

  { id: 'blackgram',  name: 'Black Gram (Urad)', type: 'Legume', icon: '🫘', risk: 'Low',   season: 'Apr–Jul',    water: 'Low',    duration: 70,
    tip: 'Tolerates waterlogging better than other pulses. Good choice post-rice in humid areas.',
    npk: '0-12-16' },

  // ── SPICES ────────────────────────────────────────────────────────────────
  { id: 'blackpepper',name: 'Black Pepper',    type: 'Spice',    icon: '🌿', risk: 'Low',    season: 'Jul–Feb',    water: 'High',   duration: 365,
    tip: 'Apply organic mulch every 10 days to retain soil moisture. Support vines on live standards.',
    npk: '10-10-20' },

  { id: 'cardamom',   name: 'Cardamom',        type: 'Spice',    icon: '🌱', risk: 'High',   season: 'Aug–Nov',    water: 'High',   duration: 365,
    tip: 'Thrives under shade. Plant under silver oak or arecanut. Requires high humidity.',
    npk: '10-10-20' },

  { id: 'turmeric',   name: 'Turmeric',        type: 'Spice',    icon: '🌿', risk: 'Low',    season: 'Apr–Jan',    water: 'Medium', duration: 275,
    tip: 'Cure rhizomes in hot water (50°C, 1 hour) before drying to fix colour and prevent mould.',
    npk: '10-15-15' },

  { id: 'ginger',     name: 'Ginger',          type: 'Spice',    icon: '🫚', risk: 'Medium', season: 'Apr–Dec',    water: 'Medium', duration: 250,
    tip: 'Shade netting at 50% reduces crop failure from heat stress during summer months.',
    npk: '10-12-12' },

  { id: 'chilli',     name: 'Chilli (Hot Pepper)', type: 'Spice', icon: '🌶️', risk: 'Medium', season: 'Nov–Mar',  water: 'Medium', duration: 75,
    tip: 'Foliar spray with 0.5% zinc sulphate prevents blossom drop in hot, dry spells.',
    npk: '10-15-15' },

  { id: 'coriander',  name: 'Coriander (Dhania)', type: 'Spice', icon: '🌿', risk: 'Low',   season: 'Oct–Jan',    water: 'Medium', duration: 45,
    tip: 'Thrives in cool weather. Crush seeds before sowing to break dormancy.',
    npk: '8-10-8' },

  { id: 'fenugreek',  name: 'Fenugreek (Methi)', type: 'Spice', icon: '🌿', risk: 'Low',    season: 'Oct–Jan',    water: 'Low',    duration: 45,
    tip: 'Dual-purpose: harvest leaves for greens or let mature for seeds. Nitrogen fixer.',
    npk: '0-10-10' },

  { id: 'cumin',      name: 'Cumin (Jeera)',    type: 'Spice',    icon: '🌿', risk: 'Medium', season: 'Nov–Feb',   water: 'Low',    duration: 75,
    tip: 'Sensitive to wilt diseases. Crop rotation with cereals at least every 2 years is essential.',
    npk: '8-10-10' },

  // ── CASH CROPS ────────────────────────────────────────────────────────────
  { id: 'rubber',     name: 'Rubber',          type: 'Cash Crop', icon: '🌳', risk: 'Low',   season: 'Year-round', water: 'High',   duration: 1825,
    tip: 'Ensure proper drainage trenches before monsoon season. Tap only at 45° angle.',
    npk: '10-10-10' },

  { id: 'cotton',     name: 'Cotton',          type: 'Cash Crop', icon: '☁️', risk: 'High',  season: 'May–Dec',    water: 'Medium', duration: 165,
    tip: 'Follow BT-cotton IPM protocol. Boll weevil resistance forming — diversify insecticides.',
    npk: '20-15-15' },

  { id: 'sugarcane',  name: 'Sugarcane',       type: 'Cash Crop', icon: '🎋', risk: 'Medium', season: 'Jan–Apr',   water: 'High',   duration: 365,
    tip: 'Trash mulching after harvest retains 80 L/m² of irrigation. Follow with a legume ratoon.',
    npk: '25-12-15' },

  { id: 'tobacco',    name: 'Tobacco',         type: 'Cash Crop', icon: '🌿', risk: 'High',  season: 'Nov–Apr',    water: 'Medium', duration: 80,
    tip: 'Top plants at 8–10 leaf stage to divert energy to leaves. Heavy nitrogen feeder.',
    npk: '20-10-20' },

  { id: 'jute',       name: 'Jute',            type: 'Cash Crop', icon: '🌿', risk: 'Low',   season: 'Apr–Oct',    water: 'High',   duration: 120,
    tip: 'Retting quality determines fibre grade. Use clear, running water for best extraction.',
    npk: '10-8-10' },

  // ── OILSEEDS ──────────────────────────────────────────────────────────────
  { id: 'mustard',    name: 'Mustard (Canola)', type: 'Oilseed', icon: '🌻', risk: 'Low',    season: 'Sep–Feb',    water: 'Low',    duration: 90,
    tip: 'Excellent break crop in cereal rotations. Deep taproot scavenges subsoil N.',
    npk: '15-12-10' },

  { id: 'sunflower',  name: 'Sunflower',       type: 'Oilseed',  icon: '🌻', risk: 'Low',    season: 'Jan–Apr',    water: 'Medium', duration: 90,
    tip: 'Drought-tolerant deep roots. Face row ends toward midday sun for uniform pollination.',
    npk: '12-12-15' },

  { id: 'sesame',     name: 'Sesame (Til)',     type: 'Oilseed',  icon: '🌿', risk: 'Low',    season: 'Jun–Sep',    water: 'Low',    duration: 80,
    tip: 'One of the most drought-tolerant oilseeds. Harvest before pods shatter at full maturity.',
    npk: '8-10-8' },

  { id: 'castor',     name: 'Castor',          type: 'Oilseed',  icon: '🌿', risk: 'Low',    season: 'Jun–Mar',    water: 'Low',    duration: 240,
    tip: 'Intercrop with groundnut at 1:5 ratio to maximise returns on dryland farms.',
    npk: '10-12-10' },

  { id: 'linseed',    name: 'Linseed (Flax)',  type: 'Oilseed',  icon: '🌱', risk: 'Low',    season: 'Oct–Mar',    water: 'Low',    duration: 115,
    tip: 'Good after paddy on residual moisture. Fibre and oil dual-use variety maximises income.',
    npk: '8-10-8' },

  // ── TREE CROPS ────────────────────────────────────────────────────────────
  { id: 'coconut',    name: 'Coconut',         type: 'Tree Crop', icon: '🥥', risk: 'Low',   season: 'Year-round', water: 'High',   duration: 1825,
    tip: 'Intercropping with banana can increase farm income by 30%. Essential to add micronutrients annually.',
    npk: '10-10-20' },

  { id: 'arecanut',   name: 'Arecanut (Betel Palm)', type: 'Tree Crop', icon: '🌴', risk: 'Medium', season: 'Year-round', water: 'High', duration: 1825,
    tip: 'YCF (Yellow Leaf Disease) is untreatable — maintain strict nursery hygiene.',
    npk: '8-8-15' },

  { id: 'cashew',     name: 'Cashew',          type: 'Tree Crop', icon: '🌰', risk: 'Low',   season: 'Feb–May',    water: 'Low',    duration: 1460,
    tip: 'Prune top 30% of canopy after harvest to open tree to light and control powdery mildew.',
    npk: '10-8-12' },

  { id: 'teak',       name: 'Teak (Timber)',   type: 'Tree Crop', icon: '🌳', risk: 'Low',   season: 'Year-round', water: 'Medium', duration: 3650,
    tip: 'Plant at 2×2 m spacing then thin progressively. 20-year rotation ideal for premium timber.',
    npk: '10-6-8' },

  // ── FODDER / COVER CROPS ─────────────────────────────────────────────────
  { id: 'napiergrass',name: 'Napier Grass',    type: 'Fodder',   icon: '🌿', risk: 'Low',    season: 'Year-round', water: 'Medium', duration: 90,
    tip: 'Cut at 45 cm height every 45 days. Intercrop with legumes to improve protein content.',
    npk: '15-5-10' },

  { id: 'sunsanhemp', name: 'Sunn Hemp',       type: 'Fodder',   icon: '🌿', risk: 'Low',    season: 'Jun–Oct',    water: 'Low',    duration: 60,
    tip: 'One of the best green manure crops. Plough in at 50% flowering stage for max nitrogen.',
    npk: '0-8-8' },

  { id: 'dhaincha',   name: 'Dhaincha (Sesbania)', type: 'Fodder', icon: '🌿', risk: 'Low', season: 'Jun–Sep',    water: 'Medium', duration: 55,
    tip: 'Tolerates waterlogging. Incorporate into paddy fields 20 days before transplanting.',
    npk: '0-10-10' },

  // ── FLOWERS / HORTICULTURE ────────────────────────────────────────────────
  { id: 'jasmine',    name: 'Jasmine',         type: 'Flower',   icon: '🌸', risk: 'Low',    season: 'Year-round', water: 'Medium', duration: 180,
    tip: 'Prune after each flush. Night jasmine commands 30% price premium — time harvest at dawn.',
    npk: '8-8-10' },

  { id: 'marigold',   name: 'Marigold',        type: 'Flower',   icon: '🌼', risk: 'Low',    season: 'Sep–Feb',    water: 'Medium', duration: 90,
    tip: 'Natural nematode repellent. Plant as border crop to protect vegetables.',
    npk: '8-10-10' },

  { id: 'rose',       name: 'Rose',            type: 'Flower',   icon: '🌹', risk: 'Medium', season: 'Year-round', water: 'High',   duration: 180,
    tip: 'Prune 1/3 of stem after each bloom cycle. Apply potassium sulfate to deepen colour.',
    npk: '10-12-14' },

  { id: 'chrysanthemum', name: 'Chrysanthemum', type: 'Flower', icon: '🌼', risk: 'Low',    season: 'Aug–Dec',    water: 'Medium', duration: 120,
    tip: 'Photoperiod sensitive — manipulate with black cloth cover to control flowering timing.',
    npk: '10-12-12' },
];

export default CROP_DATABASE;

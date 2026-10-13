// Fictional home plans and illustrative prices in USD, not live listings or quotes.
// Home photos are stored in client/public/images/homes; option assets are still pending.
const homeData = [
  { id: 1, name: "The Maple Cottage", description: "A 1,450-square-foot single-story cottage with 3 bedrooms, 2 bathrooms, an open kitchen, and a covered front porch.", price: 285000, image: "/images/homes/maple-cottage.jpg" },
  { id: 2, name: "The Willow Ranch", description: "A 1,850-square-foot ranch with 3 bedrooms, 2 bathrooms, a split-bedroom layout, a walk-in pantry, and an attached two-car garage.", price: 349000, image: "/images/homes/willow-ranch.jpg" },
  { id: 3, name: "The Oakwood Craftsman", description: "A 2,250-square-foot Craftsman with 4 bedrooms, 2.5 bathrooms, a main-floor study, and a spacious front porch.", price: 425000, image: "/images/homes/oakwood-craftsman.jpg" },
  { id: 4, name: "The Cedar Farmhouse", description: "A 2,600-square-foot modern farmhouse with 4 bedrooms, 3 bathrooms, a large kitchen island, a mudroom, and a two-car garage.", price: 489000, image: "/images/homes/cedar-farmhouse.jpg" },
  { id: 5, name: "The Birch Townhome", description: "A 1,700-square-foot two-story townhome with 3 bedrooms, 2.5 bathrooms, an upstairs laundry room, and a private rear patio.", price: 315000, image: "/images/homes/birch-townhome.jpg" },
  { id: 6, name: "The Aspen Contemporary", description: "A 2,350-square-foot contemporary home with 3 bedrooms, 2.5 bathrooms, oversized windows, a flexible loft, and an attached two-car garage.", price: 465000, image: "/images/homes/aspen-contemporary.jpg" },
  { id: 7, name: "The Magnolia Colonial", description: "A 2,950-square-foot Colonial with 5 bedrooms, 3.5 bathrooms, a formal dining room, a full unfinished basement, and a two-car garage.", price: 565000, image: "/images/homes/magnolia-colonial.jpg" },
  { id: 8, name: "The Cypress Bungalow", description: "A 1,250-square-foot bungalow with 2 bedrooms, 2 bathrooms, a step-free entry, wide interior doorways, and a sheltered rear porch.", price: 259000, image: "/images/homes/cypress-bungalow.jpg" },
  { id: 9, name: "The Redwood Retreat", description: "A 2,100-square-foot woodland-inspired home with 3 bedrooms, 2 bathrooms, a vaulted great room, a walkout basement, and an attached two-car garage.", price: 439000, image: "/images/homes/redwood-retreat.jpg" },
  { id: 10, name: "The Sycamore Estate", description: "A 3,800-square-foot estate home with 5 bedrooms, 4.5 bathrooms, a main-floor guest suite, a full unfinished basement, and a three-car garage.", price: 785000, image: "/images/homes/sycamore-estate.jpg" },
];

// Each category is a single-choice feature. Prices are upgrades over the base plan.
// preview values are SVG fill colors or renderer variants, never executable CSS/code.
const optionsData = [
  { id: 1, name: "Warm White Siding", description: "Classic warm-white fiber-cement siding.", category: "Siding", price: 0, image: "/images/options/white-siding.jpg", preview: { target: "siding", color: "#F3EEE4", variant: "lap" } },
  { id: 2, name: "Sage Green Siding", description: "Factory-finished sage-green fiber-cement siding.", category: "Siding", price: 3500, image: "/images/options/sage-siding.jpg", preview: { target: "siding", color: "#879A7A", variant: "lap" } },
  { id: 3, name: "Coastal Blue Siding", description: "Deep blue fiber-cement siding with a durable painted finish.", category: "Siding", price: 4200, image: "/images/options/blue-siding.jpg", preview: { target: "siding", color: "#426580", variant: "lap" } },
  { id: 4, name: "Cedar-Style Siding", description: "Wood-look composite siding in a natural cedar finish.", category: "Siding", price: 12500, image: "/images/options/cedar-siding.jpg", preview: { target: "siding", color: "#AA754B", variant: "wood" } },
  { id: 5, name: "Charcoal Shingle Roof", description: "Architectural asphalt shingles in charcoal gray.", category: "Roof", price: 0, image: "/images/options/charcoal-roof.jpg", preview: { target: "roof", color: "#3D4148", variant: "shingle" } },
  { id: 6, name: "Weathered Brown Shingle Roof", description: "Architectural asphalt shingles in a warm weathered-brown finish.", category: "Roof", price: 1800, image: "/images/options/brown-roof.jpg", preview: { target: "roof", color: "#705B49", variant: "shingle" } },
  { id: 7, name: "Graphite Metal Roof", description: "Standing-seam metal roofing in graphite with matching flashing.", category: "Roof", price: 18500, image: "/images/options/graphite-metal-roof.jpg", preview: { target: "roof", color: "#50585C", variant: "standing-seam" } },
  { id: 8, name: "Terracotta Metal Roof", description: "Standing-seam metal roofing with a terracotta-colored factory finish.", category: "Roof", price: 19500, image: "/images/options/terracotta-roof.jpg", preview: { target: "roof", color: "#B65D42", variant: "standing-seam" } },
  { id: 9, name: "White Front Door", description: "Insulated fiberglass entry door in a clean white finish.", category: "Front Door", price: 0, image: "/images/options/white-door.jpg", preview: { target: "frontDoor", color: "#FAF8F2", variant: "panel" } },
  { id: 10, name: "Walnut Front Door", description: "Wood-grain fiberglass entry door with a rich walnut finish.", category: "Front Door", price: 2200, image: "/images/options/walnut-door.jpg", preview: { target: "frontDoor", color: "#67432B", variant: "wood" } },
  { id: 11, name: "Red Front Door", description: "Insulated fiberglass entry door with a bold red factory finish.", category: "Front Door", price: 850, image: "/images/options/red-door.jpg", preview: { target: "frontDoor", color: "#A53532", variant: "panel" } },
  { id: 12, name: "Black Glass Front Door", description: "Black fiberglass entry door with a narrow privacy-glass insert.", category: "Front Door", price: 3200, image: "/images/options/black-glass-door.jpg", preview: { target: "frontDoor", color: "#24282C", variant: "glass-insert" } },
  { id: 13, name: "White Window Frames", description: "Standard insulated windows with white exterior frames.", category: "Window Frames", price: 0, image: "/images/options/white-windows.jpg", preview: { target: "windowFrames", color: "#F7F5F0", variant: "standard" } },
  { id: 14, name: "Black Window Frames", description: "Upgrade all exterior window frames to a matte black finish.", category: "Window Frames", price: 6500, image: "/images/options/black-windows.jpg", preview: { target: "windowFrames", color: "#25292D", variant: "standard" } },
  { id: 15, name: "Bronze Window Frames", description: "Upgrade all exterior window frames to an architectural bronze finish.", category: "Window Frames", price: 7200, image: "/images/options/bronze-windows.jpg", preview: { target: "windowFrames", color: "#79634C", variant: "standard" } },
  { id: 16, name: "Black Gridded Windows", description: "Black exterior frames with divided-light grids for a traditional look.", category: "Window Frames", price: 8900, image: "/images/options/gridded-windows.jpg", preview: { target: "windowFrames", color: "#25292D", variant: "gridded" } },
  { id: 17, name: "Foundation Planting Beds", description: "Standard mulched foundation beds with low-maintenance shrubs.", category: "Landscaping", price: 0, image: "/images/options/foundation-beds.jpg", preview: { target: "landscaping", color: "#567547", variant: "shrubs" } },
  { id: 18, name: "Flower Garden", description: "Add colorful perennial flower beds beside the front walkway.", category: "Landscaping", price: 2800, image: "/images/options/flower-garden.jpg", preview: { target: "landscaping", color: "#C7658C", variant: "flowers" } },
  { id: 19, name: "Native Meadow Garden", description: "Replace front lawn areas with regionally appropriate native grasses and flowering plants.", category: "Landscaping", price: 4500, image: "/images/options/native-garden.jpg", preview: { target: "landscaping", color: "#A2A65D", variant: "meadow" } },
  { id: 20, name: "Formal Garden", description: "Add symmetrical clipped hedges and a pair of ornamental trees along the entry path.", category: "Landscaping", price: 8200, image: "/images/options/formal-garden.jpg", preview: { target: "landscaping", color: "#355D3E", variant: "formal" } },
];

// All plans include the first (zero-cost) choice in each category.
// Townhome exterior rules limit siding, roofing, windows, and garden choices.
const availableOptionsByHome = {
  1: [1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19],
  2: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  3: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20],
  4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  5: [1, 2, 5, 6, 9, 10, 11, 12, 13, 14, 17, 18],
  6: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19],
  7: [1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20],
  8: [1, 2, 3, 4, 5, 6, 9, 10, 11, 13, 14, 15, 17, 18, 19],
  9: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19],
  10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
};

const homeOptionsData = Object.entries(availableOptionsByHome).flatMap(
  ([homeId, optionIds]) => optionIds.map((optionId) => ({
    home_id: Number(homeId),
    option_id: optionId,
  })),
);

export { homeData, optionsData, homeOptionsData };

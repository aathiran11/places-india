// Full list of India's states and union territories (Phase 1 scope: nationwide).
// Districts/cities are only pre-populated for a handful of states as a demo —
// full district-level data collection happens in Phase 3 (Data Pipeline).

export const states = [
  { name: "Andhra Pradesh", code: "AP", type: "state", capital: "Amaravati" },
  { name: "Arunachal Pradesh", code: "AR", type: "state", capital: "Itanagar" },
  { name: "Assam", code: "AS", type: "state", capital: "Dispur" },
  { name: "Bihar", code: "BR", type: "state", capital: "Patna" },
  { name: "Chhattisgarh", code: "CG", type: "state", capital: "Raipur" },
  { name: "Goa", code: "GA", type: "state", capital: "Panaji" },
  { name: "Gujarat", code: "GJ", type: "state", capital: "Gandhinagar" },
  { name: "Haryana", code: "HR", type: "state", capital: "Chandigarh" },
  { name: "Himachal Pradesh", code: "HP", type: "state", capital: "Shimla" },
  { name: "Jharkhand", code: "JH", type: "state", capital: "Ranchi" },
  { name: "Karnataka", code: "KA", type: "state", capital: "Bengaluru" },
  { name: "Kerala", code: "KL", type: "state", capital: "Thiruvananthapuram" },
  { name: "Madhya Pradesh", code: "MP", type: "state", capital: "Bhopal" },
  { name: "Maharashtra", code: "MH", type: "state", capital: "Mumbai" },
  { name: "Manipur", code: "MN", type: "state", capital: "Imphal" },
  { name: "Meghalaya", code: "ML", type: "state", capital: "Shillong" },
  { name: "Mizoram", code: "MZ", type: "state", capital: "Aizawl" },
  { name: "Nagaland", code: "NL", type: "state", capital: "Kohima" },
  { name: "Odisha", code: "OD", type: "state", capital: "Bhubaneswar" },
  { name: "Punjab", code: "PB", type: "state", capital: "Chandigarh" },
  { name: "Rajasthan", code: "RJ", type: "state", capital: "Jaipur" },
  { name: "Sikkim", code: "SK", type: "state", capital: "Gangtok" },
  { name: "Tamil Nadu", code: "TN", type: "state", capital: "Chennai" },
  { name: "Telangana", code: "TG", type: "state", capital: "Hyderabad" },
  { name: "Tripura", code: "TR", type: "state", capital: "Agartala" },
  { name: "Uttar Pradesh", code: "UP", type: "state", capital: "Lucknow" },
  { name: "Uttarakhand", code: "UK", type: "state", capital: "Dehradun" },
  { name: "West Bengal", code: "WB", type: "state", capital: "Kolkata" },
  { name: "Andaman and Nicobar Islands", code: "AN", type: "union_territory", capital: "Port Blair" },
  { name: "Chandigarh", code: "CH", type: "union_territory", capital: "Chandigarh" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DN", type: "union_territory", capital: "Daman" },
  { name: "Delhi", code: "DL", type: "union_territory", capital: "New Delhi" },
  { name: "Jammu and Kashmir", code: "JK", type: "union_territory", capital: "Srinagar" },
  { name: "Ladakh", code: "LA", type: "union_territory", capital: "Leh" },
  { name: "Lakshadweep", code: "LD", type: "union_territory", capital: "Kavaratti" },
  { name: "Puducherry", code: "PY", type: "union_territory", capital: "Puducherry" },
];

// Demo districts/cities to make browse + search + place-profile work end-to-end.
// Keyed by state name.
export const demoDistricts = {
  "Tamil Nadu": [
    {
      name: "Coimbatore",
      headquarters: "Coimbatore",
      cities: [
        { name: "Coimbatore", type: "city", population: 1601000 },
        { name: "Pollachi", type: "town", population: 89000 },
      ],
      villages: [{ name: "Madukkarai", population: 15000 }],
    },
    {
      name: "Chennai",
      headquarters: "Chennai",
      cities: [{ name: "Chennai", type: "city", population: 7090000 }],
      villages: [],
    },
    {
      name: "Madurai",
      headquarters: "Madurai",
      cities: [{ name: "Madurai", type: "city", population: 1466000 }],
      villages: [{ name: "Thiruparankundram", population: 22000 }],
    },
    {
      name: "Dindigul",
      headquarters: "Dindigul",
      cities: [
        { name: "Dindigul", type: "city", population: 207000 },
        { name: "Palani", type: "town", population: 71000 },
      ],
      villages: [],
    },
  ],
  Karnataka: [
    {
      name: "Bengaluru Urban",
      headquarters: "Bengaluru",
      cities: [{ name: "Bengaluru", type: "city", population: 8443000 }],
      villages: [],
    },
    {
      name: "Mysuru",
      headquarters: "Mysuru",
      cities: [{ name: "Mysuru", type: "city", population: 920000 }],
      villages: [{ name: "Naguvanahalli", population: 8500 }],
    },
  ],
  Maharashtra: [
    {
      name: "Mumbai City",
      headquarters: "Mumbai",
      cities: [{ name: "Mumbai", type: "city", population: 12442000 }],
      villages: [],
    },
    {
      name: "Pune",
      headquarters: "Pune",
      cities: [{ name: "Pune", type: "city", population: 3124000 }],
      villages: [],
    },
  ],
  Delhi: [
    {
      name: "New Delhi",
      headquarters: "New Delhi",
      cities: [{ name: "New Delhi", type: "city", population: 249998 }],
      villages: [],
    },
  ],
};

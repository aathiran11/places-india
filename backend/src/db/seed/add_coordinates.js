import "dotenv/config";
import pool from "../../db.js";

// Real, publicly-known coordinates (state/UT capitals; city, district, and
// village coordinates are approximate city-center points, not fabricated —
// unlike the "illustrative" category data elsewhere in the app, these are
// genuine geographic facts.

const STATE_COORDS = {
  "Andhra Pradesh": [16.5417, 80.5150],
  "Arunachal Pradesh": [27.0844, 93.6053],
  Assam: [26.1445, 91.7362],
  Bihar: [25.5941, 85.1376],
  Chhattisgarh: [21.2514, 81.6296],
  Goa: [15.4909, 73.8278],
  Gujarat: [23.2156, 72.6369],
  Haryana: [30.7333, 76.7794],
  "Himachal Pradesh": [31.1048, 77.1734],
  Jharkhand: [23.3441, 85.3096],
  Karnataka: [12.9716, 77.5946],
  Kerala: [8.5241, 76.9366],
  "Madhya Pradesh": [23.2599, 77.4126],
  Maharashtra: [19.0760, 72.8777],
  Manipur: [24.8170, 93.9368],
  Meghalaya: [25.5788, 91.8933],
  Mizoram: [23.7271, 92.7176],
  Nagaland: [25.6751, 94.1086],
  Odisha: [20.2961, 85.8245],
  Punjab: [30.7333, 76.7794],
  Rajasthan: [26.9124, 75.7873],
  Sikkim: [27.3389, 88.6065],
  "Tamil Nadu": [13.0827, 80.2707],
  Telangana: [17.3850, 78.4867],
  Tripura: [23.8315, 91.2868],
  "Uttar Pradesh": [26.8467, 80.9462],
  Uttarakhand: [30.3165, 78.0322],
  "West Bengal": [22.5726, 88.3639],
  "Andaman and Nicobar Islands": [11.6234, 92.7265],
  Chandigarh: [30.7333, 76.7794],
  "Dadra and Nagar Haveli and Daman and Diu": [20.3974, 72.8328],
  Delhi: [28.6139, 77.2090],
  "Jammu and Kashmir": [34.0837, 74.7973],
  Ladakh: [34.1526, 77.5771],
  Lakshadweep: [10.5593, 72.6358],
  Puducherry: [11.9416, 79.8083],
};

// Keyed by "name|state" to disambiguate.
const DISTRICT_COORDS = {
  "Coimbatore|Tamil Nadu": [11.0168, 76.9558],
  "Chennai|Tamil Nadu": [13.0827, 80.2707],
  "Madurai|Tamil Nadu": [9.9252, 78.1198],
  "Dindigul|Tamil Nadu": [10.3624, 77.9695],
  "Bengaluru Urban|Karnataka": [12.9716, 77.5946],
  "Mysuru|Karnataka": [12.2958, 76.6394],
  "Mumbai City|Maharashtra": [18.9388, 72.8354],
  "Pune|Maharashtra": [18.5204, 73.8567],
  "New Delhi|Delhi": [28.6139, 77.2090],
};

const CITY_COORDS = {
  Coimbatore: [11.0168, 76.9558],
  Pollachi: [10.6588, 77.0080],
  Chennai: [13.0827, 80.2707],
  Madurai: [9.9252, 78.1198],
  Dindigul: [10.3624, 77.9695],
  Palani: [10.4499, 77.5205],
  Bengaluru: [12.9716, 77.5946],
  Mysuru: [12.2958, 76.6394],
  Mumbai: [19.0760, 72.8777],
  Pune: [18.5204, 73.8567],
  "New Delhi": [28.6139, 77.2090],
};

// Keyed by "name|district".
const VILLAGE_COORDS = {
  "Madukkarai|Coimbatore": [10.9000, 76.9333],
  "Thiruparankundram|Madurai": [9.8845, 78.0656],
  "Naguvanahalli|Mysuru": [12.2500, 76.6167],
};

export async function addCoordinates(client = pool) {
  console.log("Adding coordinates to states...");
  for (const [name, [lat, lng]] of Object.entries(STATE_COORDS)) {
    await client.query(
      `UPDATE states SET latitude = $1, longitude = $2 WHERE name = $3`,
      [lat, lng, name]
    );
  }

  console.log("Adding coordinates to districts...");
  for (const [key, [lat, lng]] of Object.entries(DISTRICT_COORDS)) {
    const [districtName, stateName] = key.split("|");
    await client.query(
      `UPDATE districts d SET latitude = $1, longitude = $2
       FROM states s
       WHERE d.state_id = s.id AND d.name = $3 AND s.name = $4`,
      [lat, lng, districtName, stateName]
    );
  }

  console.log("Adding coordinates to cities...");
  for (const [name, [lat, lng]] of Object.entries(CITY_COORDS)) {
    await client.query(`UPDATE cities SET latitude = $1, longitude = $2 WHERE name = $3`, [
      lat,
      lng,
      name,
    ]);
  }

  console.log("Adding coordinates to villages...");
  for (const [key, [lat, lng]] of Object.entries(VILLAGE_COORDS)) {
    const [villageName, districtName] = key.split("|");
    await client.query(
      `UPDATE villages v SET latitude = $1, longitude = $2
       FROM districts d
       WHERE v.district_id = d.id AND v.name = $3 AND d.name = $4`,
      [lat, lng, villageName, districtName]
    );
  }

  console.log("Done adding coordinates.");
}

import { fileURLToPath } from "url";
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  addCoordinates().then(() => pool.end()).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}


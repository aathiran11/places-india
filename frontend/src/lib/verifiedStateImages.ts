// Real, specific, verified-license photos per state — sourced from Wikimedia
// Commons (Creative Commons licensed; attribution included as required by
// license terms). Only a few states are covered so far. Extending this to
// the remaining states (and eventually districts) means repeating the same
// verify-then-link process per place — not something to fake at scale.
export interface VerifiedStateImage {
  url: string;
  credit: string;
}

export const VERIFIED_STATE_IMAGES: Record<string, VerifiedStateImage> = {
  "Tamil Nadu": {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Meenakshi%20Amman%20Temple%2C%20Madurai.JPG",
    credit: "Meenakshi Amman Temple, Madurai — Wikimedia Commons, CC BY-SA 3.0",
  },
  Rajasthan: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Hawa%20Mahal%2C%20Jaipur%2C%20Rajasthan.JPG",
    credit: "Hawa Mahal, Jaipur — Wikimedia Commons, CC BY-SA 3.0",
  },
  Kerala: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Kerala%20backwaters%2C%20Lagoon%2C%20India.jpg",
    credit: "Kerala Backwaters — Vyacheslav Argenberg, Wikimedia Commons, CC BY 4.0",
  },
  Telangana: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Charminar%20Hyderabad%201.jpg",
    credit: "Charminar, Hyderabad — Didier Tais, Wikimedia Commons, CC BY-SA 3.0",
  },
  Maharashtra: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Gateway%20of%20India.jpg",
    credit: "Gateway of India, Mumbai — Wikimedia Commons, CC BY-SA 4.0",
  },
  Gujarat: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Rani%20Ki%20Vav%20(Patan%2CGujarat).JPG",
    credit: "Rani ki Vav, Patan — Wikimedia Commons, CC BY-SA 3.0",
  },
  "Uttar Pradesh": {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Taj%20Mahal%2C%20Agra%2C%20India%20edit2.jpg",
    credit: "Taj Mahal, Agra — Yann Forget, Wikimedia Commons, CC BY-SA 4.0",
  },
  Karnataka: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Mysore%20Palace.JPG",
    credit: "Mysore Palace — Jainakshaya, Wikimedia Commons, CC BY-SA 3.0",
  },
  Punjab: {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Golden%20Temple%2C%20Amritsar.JPG",
    credit: "Golden Temple, Amritsar — Wikimedia Commons, CC BY-SA 3.0",
  },
  "West Bengal": {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Victoria%20Memorial-Kolkata%2C%20West%20Bengal%2C%20India.JPG",
    credit: "Victoria Memorial, Kolkata — Wikimedia Commons, CC BY-SA 3.0",
  },
};

import { useState } from "react";
import { slugifyStateName } from "../lib/stateThemes";

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/**
 * Renders a real photo for a state's hero banner, IF the user has added one
 * to /public/images/states/{slug}.{jpg|jpeg|png|webp}. Tries each extension
 * in turn; if none exist, renders nothing and the illustrated SVG motif
 * underneath (already in the DOM) remains visible on its own.
 *
 * We don't hardcode or fetch photos from the web here — see
 * public/images/states/README.md for where to legally source free images
 * (Wikimedia Commons) and how to name the file.
 */
export default function StatePhotoBackground({ stateName }: { stateName: string }) {
  const slug = slugifyStateName(stateName);
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed || extIndex >= EXTENSIONS.length) return null;

  return (
    <img
      src={`/images/states/${slug}.${EXTENSIONS[extIndex]}`}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      onError={() => {
        if (extIndex + 1 < EXTENSIONS.length) {
          setExtIndex(extIndex + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

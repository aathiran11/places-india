// Original SVG vector art evoking Indian temple architecture and traditional
// kolam/rangoli line patterns. Hand-coded (not photographs), so it's
// copyright-safe and renders instantly with zero image requests.

export function GopuramSkyline({ color = "#C99A3B", className = "" }: { color?: string; className?: string }) {
  // A stylised skyline of tiered temple towers (gopurams), silhouette style —
  // evokes South/East Indian temple architecture without depicting any
  // specific, real, identifiable monument.
  return (
    <svg
      viewBox="0 0 1200 160"
      className={className}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={color}>
        {[80, 340, 620, 900].map((x, i) => (
          <g key={i} transform={`translate(${x},0)`}>
            <rect x="30" y="120" width="70" height="40" />
            <rect x="38" y="95" width="54" height="28" />
            <rect x="45" y="72" width="40" height="26" />
            <rect x="51" y="52" width="28" height="23" />
            <rect x="57" y="34" width="16" height="20" />
            <polygon points="65,10 78,34 52,34" />
            <circle cx="65" cy="6" r="4" />
          </g>
        ))}
        <rect x="0" y="150" width="1200" height="10" />
      </g>
    </svg>
  );
}

export function MountainSkyline({ color = "#C99A3B", className = "" }: { color?: string; className?: string }) {
  // Jagged Himalayan peaks with small prayer-flag triangles on the ridgeline.
  return (
    <svg viewBox="0 0 1200 160" className={className} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <g fill={color}>
        <polygon points="0,160 120,40 220,110 320,20 460,120 560,60 680,140 820,50 950,130 1080,70 1200,150 1200,160 0,160" />
        {[220, 460, 680, 950].map((x, i) => (
          <g key={i}>
            <line x1={x} y1={110} x2={x} y2={90} stroke={color} strokeWidth="2" />
            <polygon points={`${x},90 ${x + 14},96 ${x},102`} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function BeachSkyline({ color = "#C99A3B", className = "" }: { color?: string; className?: string }) {
  // Coconut palms along a gentle coastline wave — coastal/backwater states.
  function Palm({ x }: { x: number }) {
    return (
      <g transform={`translate(${x},0)`}>
        <path d="M0,150 Q4,100 2,60" stroke={color} strokeWidth="4" fill="none" />
        <g transform="translate(2,60)" fill={color}>
          <path d="M0,0 Q-30,-10 -46,6 Q-24,4 0,0 Z" />
          <path d="M0,0 Q30,-10 46,6 Q24,4 0,0 Z" />
          <path d="M0,0 Q-22,-24 -30,-44 Q-10,-24 0,0 Z" />
          <path d="M0,0 Q22,-24 30,-44 Q10,-24 0,0 Z" />
          <path d="M0,0 Q-4,-30 0,-48 Q4,-30 0,0 Z" />
        </g>
      </g>
    );
  }
  return (
    <svg viewBox="0 0 1200 160" className={className} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0,140 Q150,120 300,140 T600,140 T900,140 T1200,140 L1200,160 L0,160 Z"
        fill={color}
        opacity="0.5"
      />
      {[100, 320, 560, 800, 1040].map((x, i) => (
        <Palm key={i} x={x} />
      ))}
    </svg>
  );
}

export function FortSkyline({ color = "#C99A3B", className = "" }: { color?: string; className?: string }) {
  // Castellated fort ramparts with a domed watchtower — desert/hill-fort states.
  return (
    <svg viewBox="0 0 1200 160" className={className} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <g fill={color}>
        <rect x="0" y="130" width="1200" height="30" />
        {Array.from({ length: 30 }).map((_, i) => (
          <rect key={i} x={i * 40} y="110" width="20" height="20" />
        ))}
        {[180, 600, 1020].map((x, i) => (
          <g key={i} transform={`translate(${x},0)`}>
            <rect x="0" y="70" width="60" height="60" />
            <path d="M0,70 Q30,30 60,70 Z" />
            <rect x="26" y="14" width="8" height="20" />
            <circle cx="30" cy="10" r="5" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function MonasterySkyline({ color = "#C99A3B", className = "" }: { color?: string; className?: string }) {
  // Buddhist stupa domes with spires and a prayer-flag line — Himalayan/Buddhist states.
  return (
    <svg viewBox="0 0 1200 160" className={className} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="30" x2="1200" y2="30" stroke={color} strokeWidth="2" strokeDasharray="2 10" />
      <g fill={color}>
        {[150, 450, 750, 1050].map((x, i) => (
          <g key={i} transform={`translate(${x},0)`}>
            <rect x="-40" y="130" width="80" height="30" />
            <path d="M-34,130 Q0,60 34,130 Z" />
            <rect x="-4" y="30" width="8" height="30" />
            <polygon points="0,10 8,30 -8,30" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function TribalSkyline({ color = "#C99A3B", className = "" }: { color?: string; className?: string }) {
  // Conical thatched huts and a totem — forest/tribal-heritage states.
  return (
    <svg viewBox="0 0 1200 160" className={className} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <g fill={color}>
        <rect x="0" y="150" width="1200" height="10" />
        {[120, 420, 780, 1080].map((x, i) => (
          <g key={i} transform={`translate(${x},0)`}>
            <polygon points="-50,150 50,150 0,70" />
            <rect x="-14" y="130" width="28" height="20" fill="#F3E7D3" opacity="0.4" />
          </g>
        ))}
        {[270, 600, 930].map((x, i) => (
          <g key={i} transform={`translate(${x},0)`}>
            <rect x="-4" y="60" width="8" height="90" />
            <circle cx="0" cy="50" r="10" />
            <circle cx="0" cy="30" r="7" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function CitySkyline({ color = "#C99A3B", className = "" }: { color?: string; className?: string }) {
  // Clean rectilinear modern skyline — for planned/modern-identity UTs.
  return (
    <svg viewBox="0 0 1200 160" className={className} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <g fill={color}>
        {[
          [40, 60], [140, 100], [230, 45], [330, 130], [430, 70], [540, 110],
          [650, 50], [750, 95], [860, 130], [960, 60], [1060, 105], [1150, 40],
        ].map(([x, h], i) => (
          <rect key={i} x={x} y={160 - h} width="60" height={h} />
        ))}
      </g>
    </svg>
  );
}

export function DancerSilhouette({ color = "#C99A3B", className = "" }: { color?: string; className?: string }) {
  // A stylised classical-dance pictogram: bent-knee (araimandi) stance, one
  // arm raised in a mudra, the other extended, a flared skirt hem, and small
  // jewelry-dot accents at the wrists/ankles/crown. Deliberately abstract and
  // iconographic — not a depiction of any real person — used to represent
  // classical dance heritage (Bharatanatyam, Odissi, Kathak, Manipuri, etc.).
  return (
    <svg viewBox="0 0 200 320" className={className} xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        {/* standing leg */}
        <path d="M96,150 L74,220 L66,270" />
        {/* bent raised leg, foot tucked near standing knee */}
        <path d="M96,150 L142,168 L104,206" />
        {/* torso */}
        <path d="M100,72 L96,150" />
        {/* raised arm with mudra */}
        <path d="M92,86 L52,64 L34,26" />
        {/* extended arm */}
        <path d="M106,90 L152,100 L182,84" />
      </g>

      {/* head + crown accent */}
      <circle cx="100" cy="52" r="17" fill={color} />
      <polygon points="100,22 108,34 92,34" fill={color} />

      {/* flared skirt hem, signature dance-costume silhouette */}
      <path
        d="M96,150 C60,168 40,204 44,244 C64,222 82,206 100,196 C118,206 132,224 148,240 C154,202 132,168 96,150 Z"
        fill={color}
        opacity="0.85"
      />

      {/* jewelry dot accents */}
      <g fill={color}>
        <circle cx="34" cy="26" r="6" />
        <circle cx="182" cy="84" r="6" />
        <circle cx="104" cy="206" r="6" />
        <circle cx="66" cy="270" r="6" />
      </g>
    </svg>
  );
}


export function KolamPattern({
  color = "#C99A3B",
  opacity = 0.12,
  className = "",
}: {
  color?: string;
  opacity?: number;
  className?: string;
}) {
  // A repeating dot-and-loop kolam/rangoli motif, tiled as a background.
  const id = "kolam-tile";
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
      <defs>
        <pattern id={id} width="60" height="60" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="1.5">
            <circle cx="30" cy="30" r="18" />
            <circle cx="30" cy="30" r="4" fill={color} stroke="none" />
            <circle cx="0" cy="0" r="3" fill={color} stroke="none" />
            <circle cx="60" cy="0" r="3" fill={color} stroke="none" />
            <circle cx="0" cy="60" r="3" fill={color} stroke="none" />
            <circle cx="60" cy="60" r="3" fill={color} stroke="none" />
            <path d="M12,30 Q30,12 48,30 Q30,48 12,30 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export function PeacockDivider({ color = "#0F6E67", className = "" }: { color?: string; className?: string }) {
  // A simplified peacock-feather-eye repeating divider line.
  return (
    <svg viewBox="0 0 400 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke={color} strokeWidth="1.5">
        <line x1="0" y1="12" x2="400" y2="12" strokeOpacity="0.35" />
        {[20, 70, 120, 170, 220, 270, 320, 370].map((x, i) => (
          <g key={i} transform={`translate(${x},12)`}>
            <ellipse rx="7" ry="10" />
            <circle r="2.5" fill={color} stroke="none" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function DiyaIcon({ color = "#C99A3B", className = "" }: { color?: string; className?: string }) {
  // A small oil-lamp (diya) glyph, used as a brand emblem.
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 20c0 5 5.5 8 12 8s12-3 12-8c0-2-2-3-2-3H6s-2 1-2 3Z"
        fill={color}
      />
      <path
        d="M16 4c-2 3-3 5-3 7a3 3 0 0 0 6 0c0-2-1-4-3-7Z"
        fill="#E8862B"
      />
    </svg>
  );
}

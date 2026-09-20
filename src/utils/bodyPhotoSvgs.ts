// ===============================================================
// 4-SIDE BODY PHOTO PROGRESS SVG SILHOUETTES (OFFLINE SEED DATA)
// ===============================================================

export function getSeedBodyPhotoSvg(
  side: 'front' | 'back' | 'left' | 'right',
  stage: 'before' | 'after'
): string {
  const isBefore = stage === 'before';
  const label = isBefore ? 'BEFORE (Day 1 - 78.5 kg)' : 'AFTER (Day 80 - 72.8 kg)';
  const badgeColor = isBefore ? '#e06f28' : '#059669';
  const accentColor = isBefore ? '#f59e0b' : '#10b981';
  const bodyColor = isBefore ? '#94a3b8' : '#38bdf8';
  const cutColor = isBefore ? '#64748b' : '#0284c7';
  const bgGradStart = isBefore ? '#1e293b' : '#0f172a';
  const bgGradEnd = isBefore ? '#0f172a' : '#064e3b';

  let sideHindi = 'सामने का दृश्य (Front)';
  if (side === 'back') sideHindi = 'पीछे का दृश्य (Back)';
  if (side === 'left') sideHindi = 'बाईं तरफ (Left Side)';
  if (side === 'right') sideHindi = 'दाईं तरफ (Right Side)';

  // Detailed SVG representation for each angle
  let bodyShapes = '';

  if (side === 'front') {
    if (isBefore) {
      // Softer waist, smaller chest/arms
      bodyShapes = `
        <!-- Head & Neck -->
        <circle cx="150" cy="55" r="22" fill="${bodyColor}" />
        <rect x="142" y="77" width="16" height="15" fill="${bodyColor}" />
        <!-- Shoulders & Torso -->
        <path d="M110 95 Q150 88 190 95 L195 180 Q150 195 105 180 Z" fill="${bodyColor}" />
        <!-- Softer Chest & Midsection -->
        <ellipse cx="132" cy="120" rx="16" ry="12" fill="${cutColor}" opacity="0.5" />
        <ellipse cx="168" cy="120" rx="16" ry="12" fill="${cutColor}" opacity="0.5" />
        <path d="M125 145 Q150 160 175 145 Q150 175 125 145 Z" fill="${cutColor}" opacity="0.4" />
        <!-- Arms -->
        <path d="M110 95 L90 160 L85 220 L95 220 L105 160 Z" fill="${bodyColor}" />
        <path d="M190 95 L210 160 L215 220 L205 220 L195 160 Z" fill="${bodyColor}" />
        <!-- Legs -->
        <path d="M115 185 L118 290 L108 360 L128 360 L142 285 L145 188 Z" fill="${bodyColor}" />
        <path d="M185 185 L182 290 L192 360 L172 360 L158 285 L155 188 Z" fill="${bodyColor}" />
      `;
    } else {
      // V-Taper, Defined Abs, Broad Shoulders, Muscular Quads
      bodyShapes = `
        <!-- Head & Neck -->
        <circle cx="150" cy="55" r="22" fill="${bodyColor}" />
        <rect x="141" y="77" width="18" height="15" fill="${bodyColor}" />
        <!-- Shoulders (Wider) & Torso (Tapered Waist) -->
        <path d="M98 92 Q150 84 202 92 L185 180 Q150 188 115 180 Z" fill="${bodyColor}" />
        <!-- Defined Pecs -->
        <path d="M118 112 Q146 112 147 132 Q118 135 118 112 Z" fill="${cutColor}" />
        <path d="M182 112 Q154 112 153 132 Q182 135 182 112 Z" fill="${cutColor}" />
        <!-- 6-Pack Abs Lines -->
        <rect x="141" y="137" width="8" height="9" rx="2" fill="${cutColor}" />
        <rect x="151" y="137" width="8" height="9" rx="2" fill="${cutColor}" />
        <rect x="141" y="149" width="8" height="9" rx="2" fill="${cutColor}" />
        <rect x="151" y="149" width="8" height="9" rx="2" fill="${cutColor}" />
        <rect x="141" y="161" width="8" height="9" rx="2" fill="${cutColor}" />
        <rect x="151" y="161" width="8" height="9" rx="2" fill="${cutColor}" />
        <!-- Biceps & Forearms (Pumped) -->
        <path d="M98 92 L78 145 Q72 175 80 220 L94 220 L96 160 Q106 140 108 110 Z" fill="${bodyColor}" />
        <path d="M202 92 L222 145 Q228 175 220 220 L206 220 L204 160 Q194 140 192 110 Z" fill="${bodyColor}" />
        <!-- Muscular Quads -->
        <path d="M115 185 Q105 235 116 290 L108 360 L128 360 L144 285 L146 188 Z" fill="${bodyColor}" />
        <path d="M185 185 Q195 235 184 290 L192 360 L172 360 L156 285 L154 188 Z" fill="${bodyColor}" />
        <!-- Quad Separation -->
        <path d="M125 210 Q122 250 128 275" stroke="${cutColor}" stroke-width="2.5" fill="none" />
        <path d="M175 210 Q178 250 172 275" stroke="${cutColor}" stroke-width="2.5" fill="none" />
      `;
    }
  } else if (side === 'back') {
    if (isBefore) {
      bodyShapes = `
        <!-- Head -->
        <circle cx="150" cy="55" r="22" fill="${bodyColor}" />
        <rect x="142" y="77" width="16" height="15" fill="${bodyColor}" />
        <!-- Back Flat -->
        <path d="M112 95 Q150 90 188 95 L192 180 Q150 190 108 180 Z" fill="${bodyColor}" />
        <!-- Arms -->
        <path d="M112 95 L90 160 L85 220 L95 220 L105 160 Z" fill="${bodyColor}" />
        <path d="M188 95 L210 160 L215 220 L205 220 L195 160 Z" fill="${bodyColor}" />
        <!-- Legs & Glutes -->
        <path d="M112 182 L116 290 L108 360 L128 360 L144 285 L146 186 Z" fill="${bodyColor}" />
        <path d="M188 182 L184 290 L192 360 L172 360 L156 285 L154 186 Z" fill="${bodyColor}" />
      `;
    } else {
      // V-Taper Lat Spread & Rhomboids
      bodyShapes = `
        <!-- Head -->
        <circle cx="150" cy="55" r="22" fill="${bodyColor}" />
        <rect x="140" y="77" width="20" height="15" fill="${bodyColor}" />
        <!-- Lat Wings (V-Taper) -->
        <path d="M96 92 Q150 82 204 92 L182 178 Q150 184 118 178 Z" fill="${bodyColor}" />
        <!-- Trapezius & Spine Line -->
        <path d="M138 92 L150 120 L162 92 Z" fill="${cutColor}" />
        <line x1="150" y1="120" x2="150" y2="175" stroke="${cutColor}" stroke-width="2" />
        <!-- Lat Spread Lines -->
        <path d="M125 110 Q145 135 125 165" stroke="${cutColor}" stroke-width="2.5" fill="none" />
        <path d="M175 110 Q155 135 175 165" stroke="${cutColor}" stroke-width="2.5" fill="none" />
        <!-- Shoulders & Rear Delts -->
        <path d="M96 92 L76 145 Q70 175 80 220 L94 220 L96 160 Q106 140 108 110 Z" fill="${bodyColor}" />
        <path d="M204 92 L224 145 Q230 175 220 220 L206 220 L204 160 Q194 140 192 110 Z" fill="${bodyColor}" />
        <!-- Hamstrings & Calves -->
        <path d="M118 182 Q108 235 116 290 L108 360 L128 360 L144 285 L146 186 Z" fill="${bodyColor}" />
        <path d="M182 182 Q192 235 184 290 L192 360 L172 360 L156 285 L154 186 Z" fill="${bodyColor}" />
      `;
    }
  } else if (side === 'left') {
    // Left Side Profile
    if (isBefore) {
      bodyShapes = `
        <!-- Head Profile -->
        <circle cx="145" cy="55" r="22" fill="${bodyColor}" />
        <rect x="140" y="77" width="15" height="15" fill="${bodyColor}" />
        <!-- Torso with prominent belly -->
        <path d="M130 92 Q160 92 165 115 Q178 150 155 185 L125 185 Q115 140 130 92 Z" fill="${bodyColor}" />
        <!-- Soft arm -->
        <path d="M138 95 L142 165 L144 220 L130 220 L126 165 Z" fill="${bodyColor}" opacity="0.9" />
        <!-- Legs -->
        <path d="M130 185 Q145 235 140 290 L148 360 L122 360 L118 285 Z" fill="${bodyColor}" />
      `;
    } else {
      // Flat tight core, chest out, posture straight
      bodyShapes = `
        <!-- Head Profile -->
        <circle cx="145" cy="55" r="22" fill="${bodyColor}" />
        <rect x="140" y="77" width="16" height="15" fill="${bodyColor}" />
        <!-- Torso: Chest High, Flat Abdomen -->
        <path d="M130 90 Q168 95 170 120 Q160 148 148 180 L122 180 Q112 135 130 90 Z" fill="${bodyColor}" />
        <!-- Arm: Triceps & Shoulder Cap Cut -->
        <path d="M136 92 Q156 120 152 160 L148 220 L132 220 L128 160 Q122 120 136 92 Z" fill="${bodyColor}" />
        <path d="M138 105 Q148 125 136 142" stroke="${cutColor}" stroke-width="2.5" fill="none" />
        <!-- Straight Legs & Defined Calves -->
        <path d="M125 180 Q148 230 140 290 L146 360 L120 360 L116 285 Z" fill="${bodyColor}" />
        <path d="M136 210 Q144 250 138 275" stroke="${cutColor}" stroke-width="2.5" fill="none" />
      `;
    }
  } else {
    // Right Side Profile
    if (isBefore) {
      bodyShapes = `
        <!-- Head Profile -->
        <circle cx="155" cy="55" r="22" fill="${bodyColor}" />
        <rect x="145" y="77" width="15" height="15" fill="${bodyColor}" />
        <!-- Torso with belly forward -->
        <path d="M170 92 Q140 92 135 115 Q122 150 145 185 L175 185 Q185 140 170 92 Z" fill="${bodyColor}" />
        <!-- Soft arm -->
        <path d="M162 95 L158 165 L156 220 L170 220 L174 165 Z" fill="${bodyColor}" opacity="0.9" />
        <!-- Legs -->
        <path d="M170 185 Q155 235 160 290 L152 360 L178 360 L182 285 Z" fill="${bodyColor}" />
      `;
    } else {
      // Athletic cut right profile
      bodyShapes = `
        <!-- Head Profile -->
        <circle cx="155" cy="55" r="22" fill="${bodyColor}" />
        <rect x="144" y="77" width="16" height="15" fill="${bodyColor}" />
        <!-- Torso: Chest High, Flat Abdomen -->
        <path d="M170 90 Q132 95 130 120 Q140 148 152 180 L178 180 Q188 135 170 90 Z" fill="${bodyColor}" />
        <!-- Arm: Triceps & Shoulder Cap Cut -->
        <path d="M164 92 Q144 120 148 160 L152 220 L168 220 L172 160 Q178 120 164 92 Z" fill="${bodyColor}" />
        <path d="M162 105 Q152 125 164 142" stroke="${cutColor}" stroke-width="2.5" fill="none" />
        <!-- Straight Legs & Defined Calves -->
        <path d="M175 180 Q152 230 160 290 L154 360 L180 360 L184 285 Z" fill="${bodyColor}" />
        <path d="M164 210 Q156 250 162 275" stroke="${cutColor}" stroke-width="2.5" fill="none" />
      `;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="300" height="420">
    <defs>
      <linearGradient id="bgGrad_${side}_${stage}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bgGradStart}" />
        <stop offset="100%" stop-color="${bgGradEnd}" />
      </linearGradient>
      <pattern id="grid_${side}_${stage}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.7" opacity="0.35" />
      </pattern>
    </defs>
    <!-- Background Canvas -->
    <rect width="300" height="420" rx="16" fill="url(#bgGrad_${side}_${stage})" />
    <rect width="300" height="420" rx="16" fill="url(#grid_${side}_${stage})" />
    
    <!-- Measurement Scale Height Marker (Left) -->
    <line x1="25" y1="35" x2="25" y2="375" stroke="#475569" stroke-width="1.5" stroke-dasharray="4 4" />
    <text x="32" y="55" fill="#64748b" font-family="monospace" font-size="9" font-weight="bold">175 cm</text>
    <text x="32" y="125" fill="#64748b" font-family="monospace" font-size="9" font-weight="bold">Chest</text>
    <text x="32" y="180" fill="#64748b" font-family="monospace" font-size="9" font-weight="bold">Waist</text>
    <text x="32" y="270" fill="#64748b" font-family="monospace" font-size="9" font-weight="bold">Thighs</text>

    <!-- Floor Line -->
    <ellipse cx="150" cy="365" rx="90" ry="12" fill="#000000" opacity="0.4" />
    
    <!-- Body Silhouette -->
    ${bodyShapes}

    <!-- Header Badge -->
    <rect x="12" y="12" width="276" height="26" rx="6" fill="#0b1329" opacity="0.85" />
    <circle cx="24" cy="25" r="4" fill="${accentColor}" />
    <text x="34" y="29" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="bold">${sideHindi}</text>
    <text x="280" y="28" fill="${accentColor}" font-family="monospace" font-size="10" font-weight="bold" text-anchor="end">${stage.toUpperCase()}</text>

    <!-- Bottom Tag & Metrics -->
    <rect x="12" y="380" width="276" height="28" rx="8" fill="${badgeColor}" />
    <text x="150" y="398" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">${label}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

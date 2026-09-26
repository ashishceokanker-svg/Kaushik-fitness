/**
 * Kaushik Fitness - High-Performance Animated Vector Avatars
 * Automatically assigned when a member or trainer has not uploaded a personal photo.
 * Generates smooth, self-contained SVG animations (rotating neon halo & subtle athletic breathing).
 */

export const MALE_ATHLETE_ANIMATED_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#083344" />
    </linearGradient>
    <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f6d5b8" />
      <stop offset="100%" stop-color="#dfa882" />
    </linearGradient>
    <linearGradient id="tankGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0f766e" />
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base -->
  <circle cx="60" cy="60" r="58" fill="url(#bgGrad)" stroke="#334155" stroke-width="1.5" />

  <!-- Animated Rotating Neon Fitness Ring -->
  <circle cx="60" cy="60" r="54" fill="none" stroke="url(#neonCyan)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="70 30" filter="url(#neonGlow)">
    <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="6s" repeatCount="indefinite" />
  </circle>

  <!-- Athletic Character Group with Breathing Animation -->
  <g>
    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-1.5; 0,0" dur="3s" repeatCount="indefinite" />

    <!-- Trapezius & Muscular Shoulders / Body -->
    <path d="M22 116 C 24 92, 38 82, 60 82 C 82 82, 96 92, 98 116 Z" fill="url(#skinGrad)" />
    <!-- Athletic Sleeveless Compression Tank -->
    <path d="M34 116 C 35 98, 44 91, 60 91 C 76 91, 85 98, 86 116 Z" fill="url(#tankGrad)" stroke="#0369a1" stroke-width="1" />
    <!-- Chest / Sternum Definition -->
    <line x1="60" y1="92" x2="60" y2="106" stroke="#075985" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />

    <!-- Neck with Muscle Contour -->
    <rect x="52" y="66" width="16" height="20" rx="3" fill="url(#skinGrad)" />
    <path d="M54 70 C 56 76, 56 80, 52 86" stroke="#c48a66" stroke-width="1.2" fill="none" stroke-linecap="round" />
    <path d="M66 70 C 64 76, 64 80, 68 86" stroke="#c48a66" stroke-width="1.2" fill="none" stroke-linecap="round" />

    <!-- Head & Strong Jawline -->
    <path d="M42 45 C 42 30, 78 30, 78 45 C 78 58, 69 68, 60 68 C 51 68, 42 58, 42 45 Z" fill="url(#skinGrad)" />

    <!-- Athletic Haircut -->
    <path d="M41 42 C 40 28, 52 22, 60 22 C 68 22, 80 28, 79 42 C 75 36, 68 34, 60 34 C 52 34, 45 36, 41 42 Z" fill="#1e293b" />

    <!-- Headband with Pulsing LED Logo -->
    <path d="M41.5 38 C 50 36, 70 36, 78.5 38 L 79 43 C 70 41, 50 41, 41 43 Z" fill="#0284c7" />
    <polygon points="59,38.5 61.5,38.5 60.5,40.5 62,40.5 58.5,43 59.5,41 58,41" fill="#facc15">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
    </polygon>

    <!-- Eyes (Focused Expression) -->
    <ellipse cx="51" cy="49" rx="3" ry="2" fill="#0f172a" />
    <ellipse cx="69" cy="49" rx="3" ry="2" fill="#0f172a" />
    <!-- Confident Eyebrows -->
    <path d="M47 45 L 55 46" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round" />
    <path d="M73 45 L 65 46" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round" />

    <!-- Nose & Confident Smile -->
    <path d="M60 48 L 60 54 L 62 55" stroke="#c48a66" stroke-width="1.2" stroke-linecap="round" fill="none" />
    <path d="M54 60 C 56 63, 64 63, 66 60" stroke="#99583b" stroke-width="1.5" stroke-linecap="round" fill="none" />
  </g>

  <!-- Glowing Dumbbell Badge at Bottom Right -->
  <g transform="translate(82, 82)">
    <circle cx="16" cy="16" r="14" fill="#0f172a" stroke="#06b6d4" stroke-width="1.5" filter="url(#neonGlow)">
      <animate attributeName="stroke" values="#06b6d4;#10b981;#06b6d4" dur="3s" repeatCount="indefinite" />
    </circle>
    <!-- Mini Dumbbell -->
    <rect x="7" y="14.5" width="18" height="3" rx="1.5" fill="#e2e8f0" />
    <rect x="8" y="10" width="3.5" height="12" rx="1.5" fill="#38bdf8" />
    <rect x="20.5" y="10" width="3.5" height="12" rx="1.5" fill="#38bdf8" />
  </g>
</svg>
`)}`;

export const FEMALE_ATHLETE_ANIMATED_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="fBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#180b2b" />
      <stop offset="50%" stop-color="#2d124d" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="neonPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899" />
      <stop offset="50%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="fSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fde2cf" />
      <stop offset="100%" stop-color="#eebb9a" />
    </linearGradient>
    <linearGradient id="fTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d946ef" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <filter id="fNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base -->
  <circle cx="60" cy="60" r="58" fill="url(#fBgGrad)" stroke="#471b69" stroke-width="1.5" />

  <!-- Animated Rotating Neon Halo -->
  <circle cx="60" cy="60" r="54" fill="none" stroke="url(#neonPink)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="70 30" filter="url(#fNeonGlow)">
    <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="6s" repeatCount="indefinite" />
  </circle>

  <!-- Athletic Character Group with Breathing Animation -->
  <g>
    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-1.5; 0,0" dur="3s" repeatCount="indefinite" />

    <!-- Athletic Ponytail Flowing Behind -->
    <path d="M72 32 C 86 28, 96 42, 94 62 C 92 50, 84 42, 74 38 Z" fill="#3b1d11">
      <animateTransform attributeName="transform" type="rotate" values="0 72 32; 3 72 32; 0 72 32" dur="3s" repeatCount="indefinite" />
    </path>

    <!-- Athletic Neck & Shoulders -->
    <path d="M26 116 C 28 94, 40 84, 60 84 C 80 84, 92 94, 94 116 Z" fill="url(#fSkinGrad)" />
    <!-- Racerback Sports Tank Top -->
    <path d="M36 116 C 37 101, 46 93, 60 93 C 74 93, 83 101, 84 116 Z" fill="url(#fTopGrad)" stroke="#be185d" stroke-width="1" />
    <path d="M50 93 L 53 116" stroke="#9d174d" stroke-width="1" opacity="0.6" />
    <path d="M70 93 L 67 116" stroke="#9d174d" stroke-width="1" opacity="0.6" />

    <!-- Slender Athletic Neck -->
    <rect x="53" y="67" width="14" height="20" rx="3" fill="url(#fSkinGrad)" />

    <!-- Feminine Athletic Head Shape -->
    <path d="M43 45 C 43 30, 77 30, 77 45 C 77 58, 68 67, 60 67 C 52 67, 43 58, 43 45 Z" fill="url(#fSkinGrad)" />

    <!-- Sleek High Ponytail Hair with Bangs -->
    <path d="M41 42 C 40 28, 52 20, 60 20 C 69 20, 78 28, 78 40 C 74 35, 68 33, 60 33 C 51 33, 44 35, 41 42 Z" fill="#3b1d11" />
    <!-- Hair Tie / Scrunchie -->
    <ellipse cx="73" cy="30" rx="4" ry="5" fill="#f43f5e" />

    <!-- Athletic Headband with Glow -->
    <path d="M42 36 C 50 34, 70 34, 78 36 L 78.5 41 C 70 39, 50 39, 41.5 41 Z" fill="#ec4899" />

    <!-- Eyes (Bright Athletic Expression) -->
    <ellipse cx="51" cy="48" rx="2.8" ry="2.2" fill="#1e1b4b" />
    <ellipse cx="69" cy="48" rx="2.8" ry="2.2" fill="#1e1b4b" />
    <circle cx="52" cy="47.2" r="0.9" fill="#ffffff" />
    <circle cx="70" cy="47.2" r="0.9" fill="#ffffff" />

    <!-- Elegant Eyelashes & Brows -->
    <path d="M46 44 Q 51 43 56 45" stroke="#3b1d11" stroke-width="1.3" stroke-linecap="round" fill="none" />
    <path d="M74 44 Q 69 43 64 45" stroke="#3b1d11" stroke-width="1.3" stroke-linecap="round" fill="none" />

    <!-- Nose & Gentle Confident Smile -->
    <path d="M60 48 L 60 53 L 61.5 54" stroke="#d59a76" stroke-width="1.1" stroke-linecap="round" fill="none" />
    <path d="M54 58 C 56 61.5, 64 61.5, 66 58" stroke="#be123c" stroke-width="1.5" stroke-linecap="round" fill="none" />
  </g>

  <!-- Glowing Fitness Star Badge at Bottom Right -->
  <g transform="translate(82, 82)">
    <circle cx="16" cy="16" r="14" fill="#180b2b" stroke="#ec4899" stroke-width="1.5" filter="url(#fNeonGlow)">
      <animate attributeName="stroke" values="#ec4899;#a855f7;#ec4899" dur="3s" repeatCount="indefinite" />
    </circle>
    <!-- Lightning / Fitness Sparkle -->
    <polygon points="16,8 18.5,13.5 24,14 20,18 21,24 16,21 11,24 12,18 8,14 13.5,13.5" fill="#facc15">
      <animate attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite" />
    </polygon>
  </g>
</svg>
`)}`;

/**
 * Returns animated athlete SVG avatar if gender is known, defaulting to Male.
 */
export function getDefaultAnimatedAvatar(gender?: string | null, name?: string | null): string {
  const g = (gender || '').trim().toLowerCase();
  if (
    g === 'female' ||
    g === 'f' ||
    g === 'महिला' ||
    g === 'स्त्री' ||
    g === 'woman' ||
    g === 'girl'
  ) {
    return FEMALE_ATHLETE_ANIMATED_AVATAR;
  }
  if (
    g === 'male' ||
    g === 'm' ||
    g === 'पुरुष' ||
    g === 'man' ||
    g === 'boy'
  ) {
    return MALE_ATHLETE_ANIMATED_AVATAR;
  }
  // If gender is unspecified, check common female names or honorifics
  const n = (name || '').trim().toLowerCase();
  const femalePatterns = [
    'priya', 'pooja', 'neha', 'anjali', 'shreya', 'divya', 'sunita', 'kavita',
    'mrs', 'ms', 'miss', 'rani', 'devi', 'kumari', 'rekha', 'geeta', 'seema',
    'anita', 'meena', 'arti', 'sonia', 'nisha', 'sneha', 'swati', 'sapna',
    'mona', 'preeti', 'ritu', 'tanu', 'shikha', 'mamta', 'rashmi', 'pallavi',
    'poonam', 'komal', 'jyoti', 'simran', 'payal', 'khushi', 'pinky'
  ];
  if (femalePatterns.some((p) => n.includes(p))) {
    return FEMALE_ATHLETE_ANIMATED_AVATAR;
  }
  return MALE_ATHLETE_ANIMATED_AVATAR;
}

/**
 * Resolves avatar with fallback to the high-performance animated avatar.
 * Stock placeholder photos (Unsplash demo images) are filtered out so that
 * the appropriate Male or Female animated athlete avatar is always displayed.
 */
export function getEffectiveAvatar(avatarUrl?: string | null, gender?: string | null, name?: string | null): string {
  if (
    avatarUrl &&
    typeof avatarUrl === 'string' &&
    avatarUrl.trim().length > 10 &&
    !avatarUrl.includes('images.unsplash.com') &&
    !avatarUrl.includes('placeholder')
  ) {
    return avatarUrl;
  }
  return getDefaultAnimatedAvatar(gender, name);
}

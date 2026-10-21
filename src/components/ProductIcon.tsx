import type { ReactNode } from "react";
import type { Ingredient } from "../types";

type IconKey =
  | "produce"
  | "avocado"
  | "leafy"
  | "pepper"
  | "carrot"
  | "tomato"
  | "cucumber"
  | "garlic"
  | "citrus"
  | "onion"
  | "cabbage"
  | "grain"
  | "rice"
  | "pasta"
  | "tortilla"
  | "can"
  | "jar"
  | "beans"
  | "nutbutter"
  | "dairy"
  | "cheese"
  | "meat"
  | "turkey"
  | "tofu"
  | "frozen"
  | "paper"
  | "toilet"
  | "towel"
  | "trash"
  | "tissue"
  | "cleaning"
  | "personal"
  | "baby"
  | "pet"
  | "generic";

function matchIcon(ingredient: Ingredient): IconKey {
  const text = `${ingredient.kind || ""} ${ingredient.category} ${ingredient.name}`.toLowerCase();

  if (/avocado/.test(text)) return "avocado";
  if (/spinach|lettuce|kale|arugula|greens/.test(text)) return "leafy";
  if (/pepper|bell pepper/.test(text)) return "pepper";
  if (/carrot/.test(text)) return "carrot";
  if (/tomato/.test(text)) return "tomato";
  if (/cucumber/.test(text)) return "cucumber";
  if (/garlic/.test(text)) return "garlic";
  if (/lemon|lime|orange|citrus/.test(text)) return "citrus";
  if (/onion|shallot/.test(text)) return "onion";
  if (/cabbage|coleslaw/.test(text)) return "cabbage";

  if (/tortilla|wrap/.test(text)) return "tortilla";
  if (/rice noodle|noodle|pasta|spaghetti|macaroni/.test(text)) return "pasta";
  if (/rice|quinoa|oat|grain/.test(text)) return "rice";
  if (/bakery|bread|bagel|bun/.test(text)) return "grain";

  if (/peanut butter|almond butter|nut butter/.test(text)) return "nutbutter";
  if (/bean|chickpea|lentil/.test(text)) return "beans";
  if (/salsa|marinara|sauce|paste|jam|honey|oil|vinegar/.test(text)) return "jar";
  if (/can|canned|coconut milk|broth|stock/.test(text)) return "can";
  if (/canned|dry goods|pantry/.test(text)) return "can";

  if (/cheese|feta|parmesan|cheddar|mozzarella/.test(text)) return "cheese";
  if (/dairy|milk|yogurt|egg|butter|cream/.test(text)) return "dairy";

  if (/tofu|tempeh/.test(text)) return "tofu";
  if (/turkey|chicken|beef|pork|meat|seafood|fish|salmon/.test(text)) return "meat";

  if (/frozen|edamame|ice cream/.test(text)) return "frozen";

  if (/toilet paper|toilet/.test(text)) return "toilet";
  if (/paper towel/.test(text)) return "towel";
  if (/tissue|facial/.test(text)) return "tissue";
  if (/trash bag|garbage/.test(text)) return "trash";
  if (/paper goods|paper/.test(text)) return "paper";
  if (/clean|soap|detergent|sponge|dishwasher|laundry/.test(text)) return "cleaning";
  if (/personal-care|toothpaste|shampoo|deodorant|razor|body wash/.test(text)) return "personal";
  if (/baby|diaper/.test(text)) return "baby";
  if (/pet|dog|cat|litter/.test(text)) return "pet";

  if (/produce|fruit|vegetable|salad/.test(text)) return "produce";
  if (/bakery|grain/.test(text)) return "grain";
  if (/meat/.test(text)) return "meat";
  if (/dairy/.test(text)) return "dairy";
  if (/frozen/.test(text)) return "frozen";

  return "generic";
}

const COLORS: Record<IconKey, { bg: string; fg: string; accent: string }> = {
  produce: { bg: "#e8f3e4", fg: "#3d6b45", accent: "#6aa36f" },
  avocado: { bg: "#e7f2df", fg: "#3a6b32", accent: "#8fbf4a" },
  leafy: { bg: "#e6f4ea", fg: "#2f6b3c", accent: "#5aad6a" },
  pepper: { bg: "#fdeee6", fg: "#b45a2e", accent: "#e07a45" },
  carrot: { bg: "#fff1e4", fg: "#c46a20", accent: "#ef8b35" },
  tomato: { bg: "#fdeceb", fg: "#b53b35", accent: "#e35a52" },
  cucumber: { bg: "#e7f5ea", fg: "#2f6b3c", accent: "#6bbb72" },
  garlic: { bg: "#f4f1e8", fg: "#6e6548", accent: "#c4b48a" },
  citrus: { bg: "#fff7df", fg: "#b58512", accent: "#f0c23a" },
  onion: { bg: "#f6efe8", fg: "#8a5a3a", accent: "#c48a5a" },
  cabbage: { bg: "#e9f3e6", fg: "#3d6b3f", accent: "#7fbf72" },
  grain: { bg: "#f6f0e2", fg: "#7a5c28", accent: "#c9a45a" },
  rice: { bg: "#f4f1e6", fg: "#6d5c38", accent: "#c2b07a" },
  pasta: { bg: "#faf0dc", fg: "#9a6b20", accent: "#e0b04a" },
  tortilla: { bg: "#f7efdf", fg: "#8a6230", accent: "#d4a85a" },
  can: { bg: "#ebeff2", fg: "#4a5c68", accent: "#7a93a3" },
  jar: { bg: "#f3ebe4", fg: "#7a4e32", accent: "#c48455" },
  beans: { bg: "#efe8df", fg: "#6b4a2e", accent: "#a87848" },
  nutbutter: { bg: "#f6ebd8", fg: "#8a5a22", accent: "#d4a04a" },
  dairy: { bg: "#eef4f8", fg: "#3d5f78", accent: "#7aa0bf" },
  cheese: { bg: "#fff6df", fg: "#b07a18", accent: "#f0c14a" },
  meat: { bg: "#fcecea", fg: "#9a3d3d", accent: "#d46a6a" },
  turkey: { bg: "#fcecea", fg: "#9a3d3d", accent: "#d46a6a" },
  tofu: { bg: "#f2f0e8", fg: "#6a6550", accent: "#b8b090" },
  frozen: { bg: "#e8f3f8", fg: "#3a6f8a", accent: "#6ab0d0" },
  paper: { bg: "#f0f2ef", fg: "#5a6558", accent: "#9aa694" },
  toilet: { bg: "#eef1ef", fg: "#5a6558", accent: "#a8b2aa" },
  towel: { bg: "#eef2f0", fg: "#4f6558", accent: "#8fa898" },
  trash: { bg: "#ecefee", fg: "#4a554e", accent: "#7a8a80" },
  tissue: { bg: "#f2f4f2", fg: "#5a6558", accent: "#a0aaa2" },
  cleaning: { bg: "#e8f2f5", fg: "#2f6a7a", accent: "#5aacc0" },
  personal: { bg: "#f3eef6", fg: "#6a4a7a", accent: "#a07ab8" },
  baby: { bg: "#f6eef2", fg: "#8a4a62", accent: "#d08aa8" },
  pet: { bg: "#f3eee6", fg: "#6a5038", accent: "#b08a5a" },
  generic: { bg: "#eef1ea", fg: "#4a5c48", accent: "#8aa080" }
};

function SvgShell({ bg, children, label }: { bg: string; children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 48 52" width="100%" height="100%" role="img" aria-label={label} focusable="false">
      <rect width="48" height="52" rx="11" fill={bg} />
      {children}
    </svg>
  );
}

function IconGlyph({ kind, fg, accent }: { kind: IconKey; fg: string; accent: string }) {
  switch (kind) {
    case "avocado":
      return (<><ellipse cx="24" cy="28" rx="11" ry="14" fill={accent} /><ellipse cx="24" cy="30" rx="5" ry="6.5" fill="#5a3d1a" opacity="0.85" /><circle cx="24" cy="29" r="2.2" fill="#c4a35a" /></>);
    case "leafy":
      return (<><path d="M24 14c8 4 12 12 10 20-6-2-10-6-10-12 0 6-4 10-10 12  -2-8 2-16 10-20z" fill={accent} /><path d="M24 18v18" stroke={fg} strokeWidth="1.6" strokeLinecap="round" /></>);
    case "pepper":
      return (<><path d="M18 22c0-4 3-7 6-7s6 3 6 7c2 1 4 4 4 8 0 6-4 10-10 10s-10-4-10-10c0-4 2-7 4-8z" fill={accent} /><path d="M22 15c1-3 3-4 4-4 1 2 1 4 0 5" stroke={fg} strokeWidth="1.8" fill="none" strokeLinecap="round" /></>);
    case "carrot":
      return (<><path d="M24 20l8 20c0 0-3 4-8 4s-8-4-8-4l8-20z" fill={accent} /><path d="M20 16c2 2 4 3 4 3s2-1 4-3c-1 3-2 5-4 6-2-1-3-3-4-6z" fill={fg} /></>);
    case "tomato":
      return (<><circle cx="24" cy="28" r="12" fill={accent} /><path d="M18 18c2 2 4 3 6 3s4-1 6-3c-2 1-4 2-6 2s-4-1-6-2z" fill={fg} /><circle cx="20" cy="26" r="1.6" fill="#fff" opacity="0.35" /></>);
    case "cucumber":
      return (<><rect x="14" y="16" width="20" height="24" rx="10" fill={accent} /><circle cx="20" cy="24" r="1.4" fill="#fff" opacity="0.45" /><circle cx="28" cy="30" r="1.4" fill="#fff" opacity="0.45" /><circle cx="22" cy="34" r="1.2" fill="#fff" opacity="0.4" /></>);
    case "garlic":
      return (<><path d="M24 16c6 2 10 8 10 14 0 6-4 10-10 10s-10-4-10-10c0-6 4-12 10-14z" fill={accent} /><path d="M24 16v8M18 28c2 1 4 2 6 2s4-1 6-2" stroke={fg} strokeWidth="1.4" fill="none" strokeLinecap="round" /></>);
    case "citrus":
      return (<><circle cx="24" cy="27" r="12" fill={accent} /><circle cx="24" cy="27" r="7" fill="none" stroke={fg} strokeWidth="1.2" opacity="0.35" /><path d="M24 15v24M14 27h20" stroke={fg} strokeWidth="1.2" opacity="0.35" /></>);
    case "onion":
      return (<><ellipse cx="24" cy="30" rx="11" ry="12" fill={accent} /><path d="M24 18c0-4 2-6 0-8" stroke={fg} strokeWidth="1.6" fill="none" strokeLinecap="round" /><path d="M16 30c3 2 6 3 8 3s5-1 8-3" stroke={fg} strokeWidth="1.2" fill="none" opacity="0.45" /></>);
    case "cabbage":
      return (<><circle cx="24" cy="28" r="13" fill={accent} /><circle cx="24" cy="28" r="8" fill={fg} opacity="0.2" /><path d="M18 24c2 2 4 3 6 3s4-1 6-3M18 30c2 2 4 3 6 3s4-1 6-3" stroke={fg} strokeWidth="1.3" fill="none" opacity="0.55" /></>);
    case "produce":
      return (<><circle cx="18" cy="30" r="7" fill={accent} /><circle cx="30" cy="28" r="8" fill={fg} opacity="0.85" /><path d="M30 18c2 3 2 6 0 8" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" /></>);
    case "rice":
    case "grain":
      return (<><ellipse cx="24" cy="34" rx="12" ry="6" fill={accent} /><path d="M14 34c0-10 4-18 10-20 6 2 10 10 10 20" fill={fg} opacity="0.9" /><path d="M20 22c1 3 2 6 2 10M28 22c-1 3-2 6-2 10" stroke="#fff" strokeWidth="1.2" opacity="0.35" /></>);
    case "pasta":
      return (<><path d="M14 22c4-4 8-4 12 0s8 4 12 0" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M14 30c4-4 8-4 12 0s8 4 12 0" stroke={fg} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" /><path d="M14 38c4-4 8-4 12 0s8 4 12 0" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" /></>);
    case "tortilla":
      return (<><circle cx="24" cy="28" r="13" fill={accent} /><circle cx="24" cy="28" r="9" fill="none" stroke={fg} strokeWidth="1.2" opacity="0.3" /><circle cx="20" cy="25" r="1.2" fill={fg} opacity="0.35" /><circle cx="28" cy="30" r="1.2" fill={fg} opacity="0.35" /></>);
    case "can":
      return (<><rect x="15" y="16" width="18" height="24" rx="3" fill={accent} /><rect x="15" y="16" width="18" height="6" rx="3" fill={fg} opacity="0.35" /><rect x="15" y="34" width="18" height="6" rx="3" fill={fg} opacity="0.25" /><rect x="19" y="24" width="10" height="6" rx="1.5" fill="#fff" opacity="0.5" /></>);
    case "jar":
      return (<><rect x="17" y="14" width="14" height="5" rx="1.5" fill={fg} /><path d="M16 19h16l1 4v16c0 2-2 4-5 4h-8c-3 0-5-2-5-4V23l1-4z" fill={accent} /><rect x="20" y="26" width="8" height="8" rx="1.5" fill="#fff" opacity="0.4" /></>);
    case "beans":
      return (<><ellipse cx="18" cy="28" rx="6" ry="9" fill={accent} transform="rotate(-20 18 28)" /><ellipse cx="30" cy="30" rx="6" ry="9" fill={fg} transform="rotate(18 30 30)" opacity="0.9" /><ellipse cx="24" cy="22" rx="5" ry="7" fill={accent} opacity="0.75" /></>);
    case "nutbutter":
      return (<><rect x="16" y="14" width="16" height="6" rx="2" fill={fg} /><path d="M15 20h18v18c0 2-2 4-5 4h-8c-3 0-5-2-5-4V20z" fill={accent} /><circle cx="24" cy="30" r="5" fill="#fff" opacity="0.35" /></>);
    case "dairy":
      return (<><path d="M18 16h12l3 6v18c0 2-2 4-5 4h-8c-3 0-5-2-5-4V22l3-6z" fill={accent} /><rect x="20" y="14" width="8" height="4" rx="1" fill={fg} /><rect x="20" y="26" width="8" height="8" rx="1.5" fill="#fff" opacity="0.45" /></>);
    case "cheese":
      return (<><path d="M12 32l12-14 12 14v6c0 2-2 4-4 4H16c-2 0-4-2-4-4v-6z" fill={accent} /><circle cx="22" cy="32" r="2" fill={fg} opacity="0.35" /><circle cx="30" cy="34" r="1.6" fill={fg} opacity="0.3" /><circle cx="20" cy="38" r="1.4" fill={fg} opacity="0.25" /></>);
    case "meat":
    case "turkey":
      return (<><ellipse cx="24" cy="30" rx="13" ry="10" fill={accent} /><ellipse cx="24" cy="28" rx="7" ry="5" fill={fg} opacity="0.25" /><path d="M14 26c2-6 6-10 10-10" stroke={fg} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" /></>);
    case "tofu":
      return (<><rect x="14" y="18" width="20" height="20" rx="3" fill={accent} /><path d="M14 28h20M24 18v20" stroke={fg} strokeWidth="1.3" opacity="0.35" /></>);
    case "frozen":
      return (<><path d="M24 14v24M14 24h20" stroke={accent} strokeWidth="2.2" strokeLinecap="round" /><path d="M17 17l14 14M31 17L17 31" stroke={fg} strokeWidth="2" strokeLinecap="round" opacity="0.7" /><circle cx="24" cy="26" r="3" fill={accent} /></>);
    case "toilet":
    case "towel":
    case "tissue":
    case "paper":
      return (<><rect x="14" y="14" width="20" height="26" rx="3" fill={accent} /><rect x="18" y="18" width="12" height="3" rx="1.2" fill={fg} opacity="0.35" /><rect x="18" y="24" width="12" height="3" rx="1.2" fill={fg} opacity="0.28" /><rect x="18" y="30" width="9" height="3" rx="1.2" fill={fg} opacity="0.22" /></>);
    case "trash":
      return (<><path d="M16 20h16l-1.5 20h-13L16 20z" fill={accent} /><rect x="14" y="16" width="20" height="5" rx="1.5" fill={fg} /><path d="M21 16V14h6v2" stroke={fg} strokeWidth="1.6" fill="none" /><path d="M21 26v8M27 26v8" stroke="#fff" strokeWidth="1.5" opacity="0.45" strokeLinecap="round" /></>);
    case "cleaning":
      return (<><rect x="20" y="14" width="8" height="12" rx="2" fill={fg} /><path d="M16 26h16l-1 14H17l-1-14z" fill={accent} /><circle cx="24" cy="34" r="3" fill="#fff" opacity="0.4" /></>);
    case "personal":
      return (<><rect x="20" y="12" width="8" height="10" rx="2" fill={fg} /><path d="M17 22h14v18c0 2-2 4-4 4h-6c-2 0-4-2-4-4V22z" fill={accent} /></>);
    case "baby":
      return (<><circle cx="24" cy="22" r="8" fill={accent} /><ellipse cx="24" cy="38" rx="11" ry="8" fill={fg} opacity="0.7" /></>);
    case "pet":
      return (<><circle cx="24" cy="30" r="9" fill={accent} /><circle cx="15" cy="22" r="4" fill={fg} opacity="0.8" /><circle cx="33" cy="22" r="4" fill={fg} opacity="0.8" /><circle cx="12" cy="30" r="3.2" fill={fg} opacity="0.65" /><circle cx="36" cy="30" r="3.2" fill={fg} opacity="0.65" /></>);
    default:
      return (<><rect x="14" y="16" width="20" height="24" rx="4" fill={accent} /><path d="M20 26h8M20 31h6" stroke={fg} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" /></>);
  }
}

export default function ProductIcon({ ingredient }: { ingredient: Ingredient }) {
  const kind = matchIcon(ingredient);
  const colors = COLORS[kind];
  return (
    <SvgShell bg={colors.bg} label={ingredient.name}>
      <IconGlyph kind={kind} fg={colors.fg} accent={colors.accent} />
    </SvgShell>
  );
}

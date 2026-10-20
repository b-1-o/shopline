export type Diet = "all" | "vegetarian" | "vegan" | "dairy-free" | "high-protein";
export type ShoppingMode = "store" | "pickup" | "delivery";
export type ViewName = "planner" | "recipes" | "list" | "shops";

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  price: number;
  packSize: number;
  unit: string;
  packageLabel: string;
  pantry?: boolean;
}

export interface RecipeIngredient {
  ingredientId: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  minutes: number;
  servings: number;
  tags: string[];
  dietTags: Diet[];
  ingredients: RecipeIngredient[];
  steps: string[];
  accent: string;
  calories: number;
}

export interface Preferences {
  zip: string;
  budget: number;
  days: 3 | 5 | 7;
  servings: number;
  diet: Diet;
  mode: ShoppingMode;
}

export interface CartLine {
  ingredient: Ingredient;
  amountNeeded: number;
  amountUnit: string;
  packages: number;
  quantity: number;
  cost: number;
  checked: boolean;
}

export interface LiveOffer {
  query: string;
  name: string;
  brand?: string;
  price: number;
  promoPrice?: number | null;
  size?: string;
  productId?: string;
  source: string;
  url?: string;
}

export interface AccountProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export type SessionIdentity =
  | { mode: "anonymous"; id: string }
  | { mode: "account"; id: string; profile: AccountProfile };
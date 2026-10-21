export type Diet = "all" | "vegetarian" | "vegan" | "dairy-free" | "high-protein" | "pescatarian" | "keto";
export type ShoppingMode = "store" | "pickup" | "delivery";
// Include legacy views used by current App.tsx + new UI views
export type ViewName =
  | "home"
  | "wizard"
  | "plan"
  | "list"
  | "budget"
  | "profile"
  | "example"
  | "planner"
  | "recipes"
  | "shops";
export type ProductGroup = "food" | "paper" | "cleaning" | "personal-care" | "baby-pet";
export type ProfileMode = "remember" | "ask";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type Department =
  | "Produce"
  | "Meat & Seafood"
  | "Dairy & Eggs"
  | "Bakery"
  | "Pantry"
  | "Frozen"
  | "Beverages"
  | "Other";

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  price: number;
  packSize: number;
  unit: string;
  packageLabel: string;
  pantry?: boolean;
  kind?: ProductGroup;
  searchTerm?: string;
  householdFor?: "kids" | "pets";
}

export interface QuizAnswers {
  zip: string;
  budget: number;
  days: 3 | 5 | 7;
  servings: number;
  diet: Diet;
  mode: ShoppingMode;
  groups: ProductGroup[];
  allergies: string[];
  alreadyHave: string[];
  hasKids: boolean;
  hasPets: boolean;
  profileMode: ProfileMode;
  meals?: MealType[];
  maxCookMinutes?: number;
  excludedProducts?: string[];
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
  protein?: number;
  fat?: number;
  carbs?: number;
  mealType?: MealType;
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
  department?: Department;
  isPantry?: boolean;
  isManual?: boolean;
}

export interface LiveOffer {
  query: string;
  name: string;
  brand?: string;
  price: number;
  promoPrice?: number | null;
  size?: string;
  productId?: string;
  imageUrl?: string;
  source: string;
  url?: string;
}

export interface StorePoint {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export interface StoreAssignment {
  ingredientId: string;
  query: string;
  name: string;
  brand?: string;
  price: number;
  promoPrice?: number | null;
  size?: string;
  productId?: string;
  imageUrl?: string;
  source: string;
  store: StorePoint;
}

export interface StoreStop extends StorePoint {
  items: string[];
  subtotal: number;
  itemCount: number;
  liveItemCount: number;
  estimatedItemCount: number;
}

export interface RouteSummary {
  coordinates: Array<[number, number]>;
  distanceMeters: number;
  durationSeconds: number;
  source: string;
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

export interface PlanState {
  recipeIds: string[];
  answers: QuizAnswers;
  createdAt: string;
  name?: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

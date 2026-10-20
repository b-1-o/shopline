import type {
  CartLine, Diet, Ingredient, ProductGroup, QuizAnswers, Recipe, StoreAssignment, StoreStop
} from "../types";

export function matchesDiet(recipe: Recipe, diet: Diet): boolean {
  return diet === "all" || recipe.dietTags.includes(diet);
}

const ALLERGEN_INGREDIENTS: Record<string, string[]> = {
  dairy: ["feta", "parmesan", "greek-yogurt"],
  eggs: ["eggs"],
  gluten: ["pasta", "tortillas", "noodles", "soy-sauce"],
  peanuts: ["peanut-butter"],
  soy: ["soy-sauce", "tofu", "edamame"],
  sesame: ["sesame-oil"]
};

export function matchesAllergies(recipe: Recipe, allergies: string[]): boolean {
  const blocked = new Set(allergies.flatMap((allergy) => ALLERGEN_INGREDIENTS[allergy] || []));
  return !recipe.ingredients.some((ingredient) => blocked.has(ingredient.ingredientId));
}

export function buildBasket(
  recipes: Recipe[],
  ingredients: Ingredient[],
  servings: number,
  quantityOverrides: Record<string, number> = {},
  checkedItems: Record<string, boolean> = {},
  extraQuantities: Record<string, number> = {}
): CartLine[] {
  const ingredientById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const needed: Record<string, number> = {};
  const units: Record<string, string> = {};

  recipes.forEach((recipe) => {
    const multiplier = servings / recipe.servings;
    recipe.ingredients.forEach((row) => {
      const ingredient = ingredientById.get(row.ingredientId);
      if (!ingredient || ingredient.pantry) return;
      needed[row.ingredientId] = (needed[row.ingredientId] || 0) + row.amount * multiplier;
      units[row.ingredientId] = row.unit;
    });
  });

  Object.entries(extraQuantities).forEach(([id, packages]) => {
    const ingredient = ingredientById.get(id);
    if (!ingredient || packages <= 0 || ingredient.kind === undefined || ingredient.kind === "food") return;
    needed[id] = Math.max(1, Math.min(99, packages));
    units[id] = "pack";
  });

  return Object.keys(needed)
    .map((id) => {
      const ingredient = ingredientById.get(id);
      if (!ingredient) return null;
      const packages = Math.max(1, Math.ceil(needed[id] / ingredient.packSize));
      const quantity = Math.max(0, Math.min(99, quantityOverrides[id] ?? packages));
      return {
        ingredient,
        amountNeeded: needed[id],
        amountUnit: units[id] || ingredient.unit,
        packages,
        quantity,
        cost: quantity * ingredient.price,
        checked: Boolean(checkedItems[id])
      } satisfies CartLine;
    })
    .filter((line): line is CartLine => line !== null)
    .sort((a, b) => a.ingredient.category.localeCompare(b.ingredient.category) || a.ingredient.name.localeCompare(b.ingredient.name));
}

export function buildHouseholdQuantities(items: Ingredient[], answers: QuizAnswers): Record<string, number> {
  const selected = new Set<ProductGroup>(answers.groups);
  const alreadyHave = new Set(answers.alreadyHave);
  const extras: Record<string, number> = {};

  items.forEach((item) => {
    const group = item.kind || "food";
    if (group === "food" || !selected.has(group) || alreadyHave.has(item.id)) return;
    if (item.householdFor === "kids" && !answers.hasKids) return;
    if (item.householdFor === "pets" && !answers.hasPets) return;

    let cycleDays = 14;
    if (group === "personal-care") cycleDays = 30;
    if (item.id === "tissues" || item.id === "sponges" || item.id === "dish-soap") cycleDays = 21;
    if (item.id === "paper-towels" || item.id === "trash-bags" || item.id === "toilet-paper") cycleDays = 14;
    if (item.id === "diapers" || item.id === "baby-wipes") cycleDays = 10;
    if (item.id === "dog-food" || item.id === "cat-litter") cycleDays = 14;

    const personFactor = item.householdFor === "pets" ? 1 : Math.max(1, answers.servings / 2);
    extras[item.id] = Math.max(1, Math.min(12, Math.ceil((answers.days / cycleDays) * personFactor)));
  });
  return extras;
}

export function estimateRecipeCost(recipe: Recipe, ingredients: Ingredient[], servings: number): number {
  const ingredientById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
  return recipe.ingredients.reduce((sum, row) => {
    const ingredient = ingredientById.get(row.ingredientId);
    if (!ingredient || ingredient.pantry) return sum;
    const packages = Math.max(1, Math.ceil(row.amount * servings / recipe.servings / ingredient.packSize));
    return sum + packages * ingredient.price;
  }, 0);
}

export function buildPlan(
  recipes: Recipe[],
  ingredients: Ingredient[],
  days: number,
  servings: number,
  diet: Diet,
  budget: number,
  allergies: string[] = []
): string[] {
  const eligible = recipes.filter((recipe) => matchesDiet(recipe, diet) && matchesAllergies(recipe, allergies));
  const candidates = (eligible.length ? eligible : recipes.filter((recipe) => matchesAllergies(recipe, allergies))).slice();
  const selected: Recipe[] = [];
  const remaining = candidates.slice();

  while (selected.length < days && candidates.length > 0) {
    const options = remaining.length ? remaining : candidates;
    const currentCost = buildBasket(selected, ingredients, servings).reduce((sum, line) => sum + line.cost, 0);
    const ranked = options.map((recipe) => {
      const projected = buildBasket([...selected, recipe], ingredients, servings).reduce((sum, line) => sum + line.cost, 0);
      const incremental = projected - currentCost;
      return { recipe, projected, incremental, overBudget: projected > budget };
    }).sort((a, b) => Number(a.overBudget) - Number(b.overBudget) || a.incremental - b.incremental || a.recipe.minutes - b.recipe.minutes);

    const chosen = ranked[0].recipe;
    selected.push(chosen);
    const index = remaining.findIndex((recipe) => recipe.id === chosen.id);
    if (index >= 0) remaining.splice(index, 1);
  }

  return selected.map((recipe) => recipe.id);
}

export function optimizeStoreStops(
  lines: CartLine[],
  assignments: Record<string, StoreAssignment>,
  origin?: { latitude: number; longitude: number } | null
): StoreStop[] {
  const grouped = new Map<string, StoreStop>();
  lines.filter((line) => line.quantity > 0).forEach((line) => {
    const assignment = assignments[line.ingredient.id];
    if (!assignment) return;
    const store = assignment.store;
    const stop = grouped.get(store.id) || {
      ...store,
      items: [],
      subtotal: 0,
      itemCount: 0
    };
    stop.items.push(line.ingredient.name);
    stop.itemCount += line.quantity;
    stop.subtotal += line.quantity * (assignment.promoPrice && assignment.promoPrice > 0 ? assignment.promoPrice : assignment.price);
    grouped.set(store.id, stop);
  });

  const remaining = Array.from(grouped.values());
  if (remaining.length < 2) return remaining;

  const distance = (a: { latitude?: number; longitude?: number }, b: { latitude?: number; longitude?: number }) => {
    if (typeof a.latitude !== "number" || typeof a.longitude !== "number" || typeof b.latitude !== "number" || typeof b.longitude !== "number") return Number.POSITIVE_INFINITY;
    const radians = (value: number) => value * Math.PI / 180;
    const latDelta = radians(b.latitude - a.latitude);
    const lonDelta = radians(b.longitude - a.longitude);
    const h = Math.sin(latDelta / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(lonDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  };

  const firstPoint = origin
    ? { latitude: origin.latitude, longitude: origin.longitude }
    : {
        latitude: remaining.reduce((sum, stop) => sum + (stop.latitude || 0), 0) / remaining.length,
        longitude: remaining.reduce((sum, stop) => sum + (stop.longitude || 0), 0) / remaining.length
      };
  const ordered: StoreStop[] = [];
  let current = firstPoint;
  while (remaining.length) {
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    remaining.forEach((stop, index) => {
      const d = distance(current, stop);
      if (d < closestDistance) {
        closestDistance = d;
        closestIndex = index;
      }
    });
    const [chosen] = remaining.splice(closestIndex, 1);
    ordered.push(chosen);
    current = chosen;
  }
  return ordered;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
}

export function buildShoppingText(
  lines: CartLine[],
  zip: string,
  budget: number,
  assignments: Record<string, StoreAssignment> = {}
): string {
  const active = lines.filter((line) => line.quantity > 0);
  const total = active.reduce((sum, line) => {
    const offer = assignments[line.ingredient.id];
    const price = offer ? (offer.promoPrice && offer.promoPrice > 0 ? offer.promoPrice : offer.price) : line.ingredient.price;
    return sum + line.quantity * price;
  }, 0);
  const grouped = new Map<string, CartLine[]>();
  active.forEach((line) => {
    const list = grouped.get(line.ingredient.category) || [];
    list.push(line);
    grouped.set(line.ingredient.category, list);
  });
  const output = [
    "SHOPLINE · HOUSEHOLD SHOPPING LIST",
    "ZIP: " + (zip || "not provided"),
    "Current total for matched items + estimates for unmatched items: " + formatCurrency(total),
    "Budget: " + formatCurrency(budget),
    "",
    "Retailer prices are live only where a matched store offer is shown. Other prices are indicative estimates.",
    ""
  ];
  grouped.forEach((items, category) => {
    output.push(category.toUpperCase());
    items.forEach((line) => {
      const offer = assignments[line.ingredient.id];
      const price = offer ? (offer.promoPrice && offer.promoPrice > 0 ? offer.promoPrice : offer.price) : line.ingredient.price;
      const store = offer ? " · " + offer.store.name : " · store not matched";
      output.push("[ ] " + line.quantity + " × " + line.ingredient.name + " (" + line.ingredient.packageLabel + ") — " + formatCurrency(line.quantity * price) + store);
    });
    output.push("");
  });
  return output.join("\n");
}
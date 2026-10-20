import type { CartLine, Diet, Ingredient, Recipe } from "../types";

export function matchesDiet(recipe: Recipe, diet: Diet): boolean {
  if (diet === "all") return true;
  return recipe.dietTags.includes(diet);
}

export function buildBasket(
  recipes: Recipe[],
  ingredients: Ingredient[],
  servings: number,
  quantityOverrides: Record<string, number> = {},
  checkedItems: Record<string, boolean> = {}
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
  budget: number
): string[] {
  const eligible = recipes.filter((recipe) => matchesDiet(recipe, diet));
  const candidates = (eligible.length ? eligible : recipes).slice();
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
}

export function buildShoppingText(lines: CartLine[], zip: string, budget: number): string {
  const active = lines.filter((line) => line.quantity > 0);
  const total = active.reduce((sum, line) => sum + line.cost, 0);
  const grouped = new Map<string, CartLine[]>();
  active.forEach((line) => {
    const list = grouped.get(line.ingredient.category) || [];
    list.push(line);
    grouped.set(line.ingredient.category, list);
  });
  const output = [
    "SHOPLINE · GROCERY LIST",
    "ZIP: " + zip,
    "Estimated total: " + formatCurrency(total),
    "Budget: " + formatCurrency(budget),
    "",
    "Prices are indicative estimates, not store-confirmed offers.",
    ""
  ];
  grouped.forEach((items, category) => {
    output.push(category.toUpperCase());
    items.forEach((line) => output.push("[ ] " + line.quantity + " × " + line.ingredient.name + " (" + line.ingredient.packageLabel + ") — " + formatCurrency(line.cost)));
    output.push("");
  });
  return output.join("\n");
}
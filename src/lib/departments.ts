import type { Department, Ingredient } from "../types";

const CATEGORY_TO_DEPT: Record<string, Department> = {
  Produce: "Produce",
  "Meat & alternatives": "Meat & Seafood",
  "Dairy & eggs": "Dairy & Eggs",
  "Bakery & grains": "Bakery",
  "Canned & dry goods": "Pantry",
  "Pantry staples": "Pantry",
  Frozen: "Frozen",
  Beverages: "Beverages",
};

export const DEPARTMENT_ORDER: Department[] = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Other",
];

export function getDepartment(ingredient: Ingredient): Department {
  return CATEGORY_TO_DEPT[ingredient.category] || "Other";
}

export function groupByDepartment<T extends { ingredient: Ingredient }>(
  items: T[]
): { dept: Department; items: T[] }[] {
  const map = new Map<Department, T[]>();
  for (const dept of DEPARTMENT_ORDER) map.set(dept, []);
  for (const item of items) {
    const dept = getDepartment(item.ingredient);
    const list = map.get(dept) || map.get("Other")!;
    list.push(item);
  }
  return DEPARTMENT_ORDER.map((dept) => ({
    dept,
    items: map.get(dept) || [],
  })).filter((g) => g.items.length > 0);
}

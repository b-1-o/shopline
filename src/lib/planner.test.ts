import { describe, expect, it } from "vitest";
import { INGREDIENTS, RECIPES } from "../data";
import { buildBasket, buildPlan, matchesDiet } from "./planner";

describe("Shopline planning", () => {
  it("filters recipes by a selected diet", () => {
    const tacos = RECIPES.find((recipe) => recipe.id === "black-bean-tacos")!;
    expect(matchesDiet(tacos, "vegan")).toBe(true);
    expect(matchesDiet(tacos, "high-protein")).toBe(false);
  });

  it("combines ingredients across meals and leaves pantry staples out of the cart", () => {
    const recipes = RECIPES.filter((recipe) => ["lemon-chicken", "turkey-skillet"].includes(recipe.id));
    const lines = buildBasket(recipes, INGREDIENTS, 2);
    expect(lines.filter((line) => line.ingredient.id === "rice")).toHaveLength(1);
    expect(lines.some((line) => line.ingredient.pantry)).toBe(false);
  });

  it("applies a user quantity override without allowing negative quantities", () => {
    const recipe = RECIPES.find((item) => item.id === "black-bean-tacos")!;
    const lines = buildBasket([recipe], INGREDIENTS, 2, { "black-beans": 0 });
    expect(lines.find((line) => line.ingredient.id === "black-beans")?.quantity).toBe(0);
  });

  it("builds the requested number of meals and respects dietary filtering", () => {
    const plan = buildPlan(RECIPES, INGREDIENTS, 4, 2, "vegan", 200);
    expect(plan).toHaveLength(4);
    expect(plan.every((id) => matchesDiet(RECIPES.find((recipe) => recipe.id === id)!, "vegan"))).toBe(true);
  });
});
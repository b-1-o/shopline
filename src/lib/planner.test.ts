import { describe, expect, it } from "vitest";
import { HOUSEHOLD_ITEMS, INGREDIENTS, RECIPES } from "../data";
import { buildBasket, buildHouseholdQuantities, buildPlan, matchesAllergies, matchesDiet, optimizeStoreStops } from "./planner";
import { DEFAULT_QUIZ_ANSWERS } from "./storage";
import type { QuizAnswers, StoreAssignment } from "../types";

describe("Shopline planning", () => {
  it("filters recipes by a selected diet", () => {
    const tacos = RECIPES.find((recipe) => recipe.id === "black-bean-tacos")!;
    expect(matchesDiet(tacos, "vegan")).toBe(true);
    expect(matchesDiet(tacos, "high-protein")).toBe(false);
  });

  it("combines ingredients across meals and leaves pantry staples out of the cart", () => {
    const recipes = RECIPES.filter((recipe) => ["lentil-curry", "turkey-skillet"].includes(recipe.id));
    const lines = buildBasket(recipes, INGREDIENTS, 2);
    expect(lines.filter((line) => line.ingredient.id === "rice")).toHaveLength(1);
    expect(lines.find((line) => line.ingredient.id === "rice")?.amountNeeded).toBe(12);
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
  it("adds selected household essentials while excluding items already owned", () => {
    const answers: QuizAnswers = {
      ...DEFAULT_QUIZ_ANSWERS,
      zip: "90210",
      budget: 350,
      groups: ["food", "paper", "personal-care"],
      alreadyHave: ["razors"],
      hasKids: false,
      hasPets: false
    };
    const extras = buildHouseholdQuantities(HOUSEHOLD_ITEMS, answers);
    expect(extras["toilet-paper"]).toBeGreaterThan(0);
    expect(extras["shampoo"]).toBeGreaterThan(0);
    expect(extras["razors"]).toBeUndefined();
    expect(extras["dish-soap"]).toBeUndefined();

    const lines = buildBasket([], HOUSEHOLD_ITEMS, answers.servings, {}, {}, extras);
    expect(lines.some((line) => line.ingredient.id === "toilet-paper")).toBe(true);
    expect(lines.some((line) => line.ingredient.id === "razors")).toBe(false);
  });

  it("filters a recipe suggestion when a selected allergen is present", () => {
    const peanutNoodles = RECIPES.find((recipe) => recipe.id === "peanut-noodles")!;
    const blackBeanTacos = RECIPES.find((recipe) => recipe.id === "black-bean-tacos")!;
    expect(matchesAllergies(peanutNoodles, ["peanuts"])).toBe(false);
    expect(matchesAllergies(blackBeanTacos, ["peanuts"])).toBe(true);
  });

  it("groups product assignments into store stops", () => {
    const sampleLines = buildBasket(
      [RECIPES.find((recipe) => recipe.id === "black-bean-tacos")!],
      INGREDIENTS,
      2
    ).slice(0, 2);
    const storeA = { id: "store-a", name: "Kroger A", address: "1 Main St", latitude: 34.1, longitude: -118.2 };
    const storeB = { id: "store-b", name: "Kroger B", address: "2 Main St", latitude: 34.2, longitude: -118.3 };
    const assignments = Object.fromEntries(sampleLines.map((line, index) => [line.ingredient.id, {
      ingredientId: line.ingredient.id,
      query: line.ingredient.name,
      name: line.ingredient.name,
      price: line.ingredient.price,
      source: "Kroger",
      store: index === 0 ? storeA : storeB
    }])) as Record<string, StoreAssignment>;
    const stops = optimizeStoreStops(sampleLines, assignments);
    expect(stops).toHaveLength(2);
    expect(stops.reduce((sum, stop) => sum + stop.itemCount, 0)).toBe(sampleLines.length);
  });

});
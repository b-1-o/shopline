import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine, ArrowRight, Check, CheckCircle2, Clock3, Info, MapPin,
  Minus, Plus, Search, ShoppingBasket, ShoppingCart, Store, Users, Wallet, X,
  Moon, Sun, Trash2, RefreshCw, ShieldCheck, ArrowUpRight
} from "lucide-react";
import { HOUSEHOLD_ITEMS, INGREDIENTS, RECIPES } from "./data";
import { buildBasket, buildHouseholdQuantities, buildPlan, buildShoppingText, buildStorePlanAssignments, estimateRecipeCost, formatCurrency, matchesAllergies, matchesDiet, optimizeStoreStops } from "./lib/planner";
import { DEFAULT_PREFERENCES, DEFAULT_QUIZ_ANSWERS, getAnonymousSessionId, readStored, writeStored } from "./lib/storage";
import type { CartLine, Diet, Preferences, QuizAnswers, Recipe, ShoppingMode, StoreAssignment, StorePoint, StoreStop, ViewName } from "./types";
import ShoppingQuiz from "./components/ShoppingQuiz";
import ProductIcon from "./components/ProductIcon";
import { CartRow } from "./components/AppHelpers";

const RouteMap = lazy(() => import("./components/RouteMap"));
const ALL_INGREDIENTS = [...INGREDIENTS, ...HOUSEHOLD_ITEMS];

const DIET_OPTIONS: Array<{ value: Diet; label: string }> = [
  { value: "all", label: "Everything" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "dairy-free", label: "Dairy-free" },
  { value: "high-protein", label: "High protein" }
];

function readInitialPlan(): string[] {
  const saved = readStored<string[]>("meal-plan", []);
  return saved.filter((id) => RECIPES.some((recipe) => recipe.id === id));
}

function readInitialPreferences(): Preferences {
  const saved = readStored<Preferences>("preferences", DEFAULT_PREFERENCES);
  return {
    ...DEFAULT_PREFERENCES,
    ...saved,
    zip: saved.zip === "91605" ? "" : (saved.zip || ""),
    budget: Math.max(25, Math.min(2000, Number(saved.budget) || DEFAULT_PREFERENCES.budget))
  };
}

function readInitialQuiz(): QuizAnswers {
  const savedProfile = readStored<QuizAnswers | null>("household-profile", null);
  const saved = savedProfile || readStored<QuizAnswers>("last-quiz", DEFAULT_QUIZ_ANSWERS);
  return {
    ...DEFAULT_QUIZ_ANSWERS,
    ...saved,
    zip: saved.zip === "91605" ? "" : (saved.zip || ""),
    budget: Math.max(25, Math.min(2000, Number(saved.budget) || DEFAULT_QUIZ_ANSWERS.budget)),
    groups: saved.groups?.length ? saved.groups : ["food", "paper", "cleaning", "personal-care"],
    allergies: saved.allergies || [],
    alreadyHave: saved.alreadyHave || []
  };
}

export default function App() {
  const [preferences, setPreferences] = useState<Preferences>(readInitialPreferences);
  const [selectedIds, setSelectedIds] = useState<string[]>(readInitialPlan);
  const [quantityOverrides, setQuantityOverrides] = useState<Record<string, number>>(() => readStored("quantities", {}));
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => readStored("checked", {}));
  const [extraQuantities, setExtraQuantities] = useState<Record<string, number>>(() => readStored("extra-quantities", {}));
  const [householdProfile, setHouseholdProfile] = useState<QuizAnswers | null>(() => readStored<QuizAnswers | null>("household-profile", null));
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>(readInitialQuiz);
  const [quizOpen, setQuizOpen] = useState(() => readStored<QuizAnswers | null>("household-profile", null) === null);
  const [sharedLocation, setSharedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeView, setActiveView] = useState<ViewName>("planner");
  const [theme, setTheme] = useState<"dark" | "light">(() => readStored<"dark" | "light">("theme", "dark"));
  const [notice, setNotice] = useState("");
  const [liveConfigured, setLiveConfigured] = useState(false);
  const [checkingOffers, setCheckingOffers] = useState(false);
  const [liveAssignments, setLiveAssignments] = useState<Record<string, StoreAssignment>>({});
  const [liveSearchComplete, setLiveSearchComplete] = useState(false);
  const [storeLocations, setStoreLocations] = useState<StorePoint[]>([]);
  const [searchCenter, setSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);

  const selectedRecipes = useMemo(
    () => selectedIds.map((id) => RECIPES.find((recipe) => recipe.id === id)).filter((recipe): recipe is Recipe => Boolean(recipe)),
    [selectedIds]
  );
  const basketItems = useMemo(
    () => buildBasket(selectedRecipes, ALL_INGREDIENTS, preferences.servings, quantityOverrides, checkedItems, extraQuantities),
    [selectedIds, preferences.servings, quantityOverrides, checkedItems, extraQuantities]
  );
  const activeItems = basketItems.filter((item) => item.quantity > 0);
  const basketTotal = basketItems.reduce((sum, item) => {
    const assignment = liveAssignments[item.ingredient.id];
    const unitPrice = assignment ? (assignment.promoPrice && assignment.promoPrice > 0 ? assignment.promoPrice : assignment.price) : item.ingredient.price;
    return sum + item.quantity * unitPrice;
  }, 0);
  const checkedCount = basketItems.filter((item) => item.checked).length;
  const remainingBudget = preferences.budget - basketTotal;
  const progress = Math.min(100, (basketTotal / Math.max(1, preferences.budget)) * 100);
  const eligibleRecipes = RECIPES.filter((recipe) => matchesDiet(recipe, preferences.diet) && matchesAllergies(recipe, quizAnswers.allergies));
  const storePlanAssignments = useMemo(
    () => buildStorePlanAssignments(basketItems, liveAssignments, storeLocations),
    [basketItems, liveAssignments, storeLocations]
  );

  useEffect(() => {
    writeStored("preferences", preferences);
    writeStored("meal-plan", selectedIds);
    writeStored("quantities", quantityOverrides);
    writeStored("checked", checkedItems);
    writeStored("extra-quantities", extraQuantities);
    writeStored("theme", theme);
  }, [preferences, selectedIds, quantityOverrides, checkedItems, extraQuantities, theme]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    let active = true;
    fetch("/api/prices?action=status")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active) setLiveConfigured(Boolean(data?.configured)); })
      .catch(() => { if (active) setLiveConfigured(false); });
    return () => { active = false; };
  }, []);

  const applyQuizAnswers = (answers: QuizAnswers, coordinates: { latitude: number; longitude: number } | null) => {
    const extras = buildHouseholdQuantities(HOUSEHOLD_ITEMS, answers);
    const essentialsEstimate = Object.entries(extras).reduce((sum, [id, quantity]) => {
      const item = HOUSEHOLD_ITEMS.find((candidate) => candidate.id === id);
      return sum + (item?.price || 0) * quantity;
    }, 0);
    const foodBudget = Math.max(25, answers.budget - essentialsEstimate);
    const ids = buildPlan(RECIPES, INGREDIENTS, answers.days, answers.servings, answers.diet, foodBudget, answers.allergies);
    setPreferences({ zip: answers.zip, budget: answers.budget, days: answers.days, servings: answers.servings, diet: answers.diet, mode: answers.mode });
    setQuizAnswers(answers);
    setSelectedIds(ids);
    setExtraQuantities(extras);
    setQuantityOverrides({});
    setCheckedItems({});
    setLiveAssignments({});
    setLiveSearchComplete(false);
    setStoreLocations([]);
    setSearchCenter(null);
    setSharedLocation(coordinates);
    setHouseholdProfile(answers.profileMode === "remember" ? answers : null);
    writeStored("household-profile", answers.profileMode === "remember" ? answers : null);
    writeStored("last-quiz", answers);
    setQuizOpen(false);
    setActiveView("list");
    setNotice("Your shopping list is ready.");
  };

  const toggleRecipe = (recipe: Recipe) => {
    if (selectedIds.includes(recipe.id)) {
      setSelectedIds((current) => current.filter((id) => id !== recipe.id));
      setNotice("Meal removed.");
      return;
    }
    if (selectedIds.length >= preferences.days) {
      setNotice("Your plan is full.");
      return;
    }
    setSelectedIds((current) => [...current, recipe.id]);
    setNotice("Meal added.");
  };

  const changeQuantity = (line: CartLine, delta: number) => {
    setQuantityOverrides((current) => {
      const currentQuantity = current[line.ingredient.id] ?? line.packages;
      return { ...current, [line.ingredient.id]: Math.max(0, Math.min(99, currentQuantity + delta)) };
    });
  };

  const toggleChecked = (line: CartLine) => {
    setCheckedItems((current) => ({ ...current, [line.ingredient.id]: !current[line.ingredient.id] }));
  };

  const downloadList = () => {
    const text = buildShoppingText(basketItems, preferences.zip, preferences.budget, liveAssignments);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "shopline-grocery-list.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice("List downloaded.");
  };

  const categories = Array.from(new Set(basketItems.map((line) => line.ingredient.category)));

  return (
    <div className="app-shell" data-theme={theme}>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setActiveView("planner")}>
          <span className="brand-mark">S</span>
          <span className="brand-word">Shop<span>line</span></span>
        </button>
        <nav className="main-nav">
          <button className={"nav-link" + (activeView === "planner" ? " active" : "")} type="button" onClick={() => setActiveView("planner")}>Planner</button>
          <button className={"nav-link" + (activeView === "list" ? " active" : "")} type="button" onClick={() => setActiveView("list")}>
            List {basketItems.length > 0 && <span className="nav-count">{basketItems.length}</span>}
          </button>
          <button className={"nav-link" + (activeView === "recipes" ? " active" : "")} type="button" onClick={() => setActiveView("recipes")}>Recipes</button>
        </nav>
        <div className="topbar-actions">
          <button className="text-button" type="button" onClick={() => setTheme((t) => t === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="page-wrap">
        {activeView === "planner" && (
          <section className="welcome-row">
            <div className="welcome-copy">
              <span className="eyebrow">BUDGET-AWARE MEAL PLANNING</span>
              <h1>Good food,<br /><span>planned well.</span></h1>
              <p>Set your budget, household size and preferences. Get a meal plan and a store-ready shopping list with package estimates.</p>
              <div className="welcome-assurances">
                <span><ShieldCheck size={14} /> Budget tracking</span>
                <span><ShoppingBasket size={14} /> Store-ready list</span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button className="secondary-button" type="button" onClick={() => setQuizOpen(true)} style={{ background: "var(--green)", color: "#fff", borderColor: "var(--green)" }}>
                  Build my list <ArrowRight size={15} />
                </button>
                {basketItems.length > 0 && (
                  <button className="secondary-button" type="button" onClick={() => setActiveView("list")}>
                    Open list ({basketItems.length})
                  </button>
                )}
              </div>
            </div>
            <div className="planner-controls">
              <div className="controls-heading">
                <div>
                  <span className="section-kicker">QUICK ADJUST <span className="kicker-line" /></span>
                  <h2>Your plan settings</h2>
                </div>
              </div>
              <div className="control-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="control-field">
                  <span className="field-label">BUDGET</span>
                  <strong className="budget-value">{formatCurrency(preferences.budget)}</strong>
                  <input className="budget-slider" type="range" min={25} max={400} step={5} value={preferences.budget}
                    onChange={(e) => setPreferences((p) => ({ ...p, budget: Number(e.target.value) }))} />
                </div>
                <div className="control-field">
                  <span className="field-label">SERVINGS</span>
                  <div className="stepper serving-stepper">
                    <button type="button" onClick={() => setPreferences((p) => ({ ...p, servings: Math.max(1, p.servings - 1) }))}><Minus size={14} /></button>
                    <span><strong>{preferences.servings}</strong><small>people</small></span>
                    <button type="button" onClick={() => setPreferences((p) => ({ ...p, servings: Math.min(12, p.servings + 1) }))}><Plus size={14} /></button>
                  </div>
                </div>
              </div>
              <div className="diet-options">
                {DIET_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" className={"diet-chip" + (preferences.diet === opt.value ? " selected" : "")}
                    onClick={() => setPreferences((p) => ({ ...p, diet: opt.value }))}>{opt.label}</button>
                ))}
              </div>
            </div>
          </section>
        )}

        {(activeView === "planner" || activeView === "recipes") && (
          <section style={{ marginTop: 28 }}>
            <div className="section-topline">
              <div>
                <span className="section-kicker">MEALS <span className="kicker-line" /></span>
                <h2>Add meals to your plan <span className="soft-count">{selectedIds.length}</span></h2>
              </div>
            </div>
            <div className="recipe-grid">
              {eligibleRecipes.map((recipe) => {
                const selected = selectedIds.includes(recipe.id);
                const estimated = estimateRecipeCost(recipe, INGREDIENTS, preferences.servings);
                return (
                  <article className="recipe-card" key={recipe.id}>
                    <button className="recipe-photo" type="button">
                      <img src={recipe.image} alt={recipe.title} loading="lazy" />
                      <span className={"photo-label " + recipe.accent}>{recipe.tags[0]}</span>
                      <span className="photo-time"><Clock3 size={13} /> {recipe.minutes} min</span>
                    </button>
                    <div className="recipe-card-body">
                      <div className="recipe-name-row">
                        <button className="recipe-title-button" type="button">{recipe.title}</button>
                        <span className="recipe-estimate">{formatCurrency(estimated)}<small> est.</small></span>
                      </div>
                      <p className="recipe-description">{recipe.description}</p>
                      <div className="recipe-card-footer">
                        <span className="recipe-meta"><Users size={14} /> {preferences.servings} servings</span>
                        <button className={"add-meal-button" + (selected ? " added" : "")} type="button" onClick={() => toggleRecipe(recipe)}>
                          {selected ? <><Check size={15} /> In plan</> : <><Plus size={15} /> Add meal</>}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeView === "list" && (
          <section style={{ marginTop: 12 }}>
            <div className="section-topline">
              <div>
                <span className="section-kicker">YOUR LIST <span className="kicker-line" /></span>
                <h2>Shopping list <span className="soft-count">{basketItems.length}</span></h2>
                <p className="section-description">Everything grouped into one list, with package estimates.</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="clear-list-button" type="button" onClick={() => { setSelectedIds([]); setExtraQuantities({}); setQuantityOverrides({}); setCheckedItems({}); }} disabled={!basketItems.length}>
                  <Trash2 size={14} /> Empty basket
                </button>
                <button className="secondary-button" type="button" onClick={downloadList} disabled={!basketItems.length}>
                  <ArrowDownToLine size={16} /> Download list
                </button>
              </div>
            </div>

            <div className="list-summary-card" style={{ marginBottom: 18 }}>
              <div className="list-summary-top">
                <div>
                  <span className="field-label">ESTIMATED CHECKOUT TOTAL</span>
                  <strong>{formatCurrency(basketTotal)}</strong>
                </div>
                <div className="list-summary-budget">
                  <span>Budget</span>
                  <strong>{formatCurrency(preferences.budget)}</strong>
                </div>
              </div>
              <div className="progress-track" style={{ height: 6, borderRadius: 99, background: "#e8ebe3", margin: "12px 0" }}>
                <div style={{ width: progress + "%", height: "100%", borderRadius: 99, background: remainingBudget >= 0 ? "#4d7856" : "#c45c3e" }} />
              </div>
              <div className="list-summary-bottom">
                <span>{checkedCount} of {basketItems.length} items checked</span>
                <button type="button" onClick={() => setCheckedItems({})}>Clear checkmarks <RefreshCw size={12} /></button>
              </div>
            </div>

            <div className="detailed-list">
              {categories.map((category) => {
                const lines = basketItems.filter((line) => line.ingredient.category === category);
                return (
                  <section className="grocery-category" key={category}>
                    <div className="category-heading">
                      <h3>{category}</h3>
                      <span>{lines.length} {lines.length === 1 ? "item" : "items"}</span>
                    </div>
                    {lines.map((line) => (
                      <CartRow
                        key={line.ingredient.id}
                        line={line}
                        onToggle={() => toggleChecked(line)}
                        onQuantity={(delta) => changeQuantity(line, delta)}
                        detailed
                        assignment={liveAssignments[line.ingredient.id]}
                        suggestedStore={storePlanAssignments[line.ingredient.id]?.store}
                        liveChecked={liveSearchComplete && liveConfigured}
                      />
                    ))}
                  </section>
                );
              })}
              {!basketItems.length && (
                <div className="empty-state">
                  <ShoppingBasket size={25} />
                  <h3>No ingredients yet</h3>
                  <p>Add a meal or run the planner to create your shopping list.</p>
                  <button className="secondary-button" type="button" onClick={() => setQuizOpen(true)}>Build my list</button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {quizOpen && (
        <ShoppingQuiz
          initial={quizAnswers}
          onClose={() => setQuizOpen(false)}
          onComplete={applyQuizAnswers}
        />
      )}

      {notice && <div className="notice">{notice}</div>}
    </div>
  );
}

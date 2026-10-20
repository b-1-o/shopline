import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check,
  CheckCircle2, ChefHat, Clock3, CookingPot, Heart, Info, Leaf, ListChecks, MapPin, MapPinned, Minus, Plus, Search,
  ShoppingBag, ShoppingBasket, ShoppingCart, SlidersHorizontal, Sparkles,
  Sprout, Store, Truck, Users, Wallet, X, Moon, Sun, MapPinCheck, Trash2, RefreshCw, ShieldCheck
} from "lucide-react";
import { HOUSEHOLD_ITEMS, INGREDIENTS, RECIPES } from "./data";
import { buildBasket, buildHouseholdQuantities, buildPlan, buildShoppingText, estimateRecipeCost, formatCurrency, matchesAllergies, matchesDiet, optimizeStoreStops } from "./lib/planner";
import { DEFAULT_PREFERENCES, DEFAULT_QUIZ_ANSWERS, getAnonymousSessionId, readStored, writeStored } from "./lib/storage";
import type { CartLine, Diet, Ingredient, LiveOffer, Preferences, QuizAnswers, Recipe, ShoppingMode, StoreAssignment, StorePoint, StoreStop, ViewName } from "./types";
import ShoppingQuiz from "./components/ShoppingQuiz";

const RouteMap = lazy(() => import("./components/RouteMap"));
const ALL_INGREDIENTS = [...INGREDIENTS, ...HOUSEHOLD_ITEMS];

const DIET_OPTIONS: Array<{ value: Diet; label: string; icon: string }> = [
  { value: "all", label: "Everything", icon: "✳" },
  { value: "vegetarian", label: "Vegetarian", icon: "◌" },
  { value: "vegan", label: "Vegan", icon: "✿" },
  { value: "dairy-free", label: "Dairy-free", icon: "○" },
  { value: "high-protein", label: "High protein", icon: "↗" }
];
const MODE_OPTIONS: Array<{ value: ShoppingMode; label: string; sub: string }> = [
  { value: "store", label: "In store", sub: "I'll shop myself" },
  { value: "pickup", label: "Pickup", sub: "Collect an order" },
  { value: "delivery", label: "Delivery", sub: "Bring it to me" }
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
    // 91605 was the old demo ZIP default, not a user-entered location.
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

function RecipeCard({
  recipe,
  selected,
  servings,
  onToggle,
  onDetails,
  compact = false
}: {
  recipe: Recipe;
  selected: boolean;
  servings: number;
  onToggle: () => void;
  onDetails: () => void;
  compact?: boolean;
}) {
  const estimated = estimateRecipeCost(recipe, INGREDIENTS, servings);
  return (
    <article className={"recipe-card" + (compact ? " recipe-card-compact" : "")}>
      <button className="recipe-photo" type="button" onClick={onDetails} aria-label={"View " + recipe.title}>
        <img src={recipe.image} alt={recipe.title} loading="lazy" />
        <span className={"photo-label " + recipe.accent}>{recipe.tags[0]}</span>
        <span className="photo-time"><Clock3 size={13} /> {recipe.minutes} min</span>
        <span className="photo-open"><ArrowUpRight size={16} /></span>
      </button>
      <div className="recipe-card-body">
        <div className="recipe-name-row">
          <button className="recipe-title-button" type="button" onClick={onDetails}>{recipe.title}</button>
          <span className="recipe-estimate">{formatCurrency(estimated)}<small> est.</small></span>
        </div>
        <p className="recipe-description">{recipe.description}</p>
        <div className="recipe-card-footer">
          <span className="recipe-meta"><Users size={14} /> {servings} servings</span>
          <button className={"add-meal-button" + (selected ? " added" : "")} type="button" onClick={onToggle}>
            {selected ? <><Check size={15} /> In plan</> : <><Plus size={15} /> Add meal</>}
          </button>
        </div>
      </div>
    </article>
  );
}

function quantityText(amount: number, unit: string): string {
  const rounded = Math.round(amount * 10) / 10;
  return String(rounded) + " " + unit;
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
  const [viewLeaving, setViewLeaving] = useState(false);
  const viewTimer = useRef<number | undefined>(undefined);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [notice, setNotice] = useState("");
  const [liveConfigured, setLiveConfigured] = useState(false);
  const [checkingOffers, setCheckingOffers] = useState(false);
  const [liveAssignments, setLiveAssignments] = useState<Record<string, StoreAssignment>>({});
  const [liveSearchComplete, setLiveSearchComplete] = useState(false);
  const [storeLocations, setStoreLocations] = useState<StorePoint[]>([]);
  const [searchCenter, setSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [offerCheckedAt, setOfferCheckedAt] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const anonymousSessionId = useMemo(() => getAnonymousSessionId(), []);

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
  const visibleRecipes = activeView === "recipes" ? eligibleRecipes : selectedRecipes;
  const currencyPerMeal = selectedRecipes.length ? basketTotal / selectedRecipes.length : 0;
  const routeStops = useMemo(
    () => optimizeStoreStops(basketItems, liveAssignments, sharedLocation || searchCenter),
    [basketItems, liveAssignments, sharedLocation, searchCenter]
  );
  const unmatchedItems = activeItems.filter((line) => !liveAssignments[line.ingredient.id]);

  useEffect(() => {
    writeStored("preferences", preferences);
    writeStored("meal-plan", selectedIds);
    writeStored("quantities", quantityOverrides);
    writeStored("checked", checkedItems);
    writeStored("extra-quantities", extraQuantities);
  }, [preferences, selectedIds, quantityOverrides, checkedItems, extraQuantities]);

  useEffect(() => {
    writeStored("theme", theme);
  }, [theme]);

  useEffect(() => () => {
    if (viewTimer.current !== undefined) window.clearTimeout(viewTimer.current);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/prices?action=status")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active) setLiveConfigured(Boolean(data?.configured)); })
      .catch(() => { if (active) setLiveConfigured(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const navigateTo = (view: ViewName) => {
    if (view === activeView && !viewLeaving) return;
    if (viewTimer.current !== undefined) window.clearTimeout(viewTimer.current);
    setViewLeaving(true);
    viewTimer.current = window.setTimeout(() => {
      setActiveView(view);
      setViewLeaving(false);
      viewTimer.current = undefined;
    }, 150);
  };

  const setPreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setQuizAnswers((current) => ({ ...current, [key]: value }));
    if (key === "zip") {
      setLiveAssignments({});
      setLiveSearchComplete(false);
      setStoreLocations([]);
      setSearchCenter(null);
      setSharedLocation(null);
    }
  };

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
    setOfferCheckedAt("");
    setSharedLocation(coordinates);
    setHouseholdProfile(answers.profileMode === "remember" ? answers : null);
    writeStored("household-profile", answers.profileMode === "remember" ? answers : null);
    writeStored("last-quiz", answers);
    setQuizOpen(false);
    setMobileCartOpen(false);
    navigateTo("list");
    setNotice(answers.profileMode === "remember" ? "Household profile saved on this device. Your list is ready." : "Your one-time shopping brief is ready.");
  };

  const startPlan = () => {
    if (householdProfile?.profileMode === "remember") {
      applyQuizAnswers(householdProfile, sharedLocation);
      return;
    }
    setQuizAnswers((current) => ({ ...current, profileMode: "ask" }));
    setQuizOpen(true);
  };

  const openQuiz = () => {
    setQuizAnswers(householdProfile || quizAnswers);
    setQuizOpen(true);
  };

  const clearLiveMatches = () => {
    setLiveAssignments({});
    setLiveSearchComplete(false);
    setStoreLocations([]);
    setSearchCenter(null);
    setOfferCheckedAt("");
  };

  const toggleRecipe = (recipe: Recipe) => {
    const existingIndex = selectedIds.indexOf(recipe.id);
    if (existingIndex >= 0) {
      setSelectedIds((current) => current.filter((id, index) => !(id === recipe.id && index === existingIndex)));
      clearLiveMatches();
      setNotice("Meal removed. Your grocery list is updated.");
      return;
    }
    if (selectedIds.length >= preferences.days) {
      setNotice("Your plan is full. Remove a meal or choose a longer plan first.");
      return;
    }
    setSelectedIds((current) => [...current, recipe.id]);
    clearLiveMatches();
    setNotice("Meal added. Your grocery list is updated.");
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
    setNotice("Your grocery list is ready to use offline.");
  };

  const copyList = async () => {
    const text = buildShoppingText(basketItems, preferences.zip, preferences.budget, liveAssignments);
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Shopping list copied to your clipboard.");
    } catch {
      downloadList();
    }
  };

  const checkLiveOffers = async () => {
    if (!/^\d{5}$/.test(preferences.zip.trim())) {
      setQuizOpen(true);
      setNotice("Add a ZIP code or share your location before searching nearby stores.");
      return;
    }
    const requestedItems = activeItems.map((line) => ({
      id: line.ingredient.id,
      term: line.ingredient.searchTerm || line.ingredient.name
    }));
    setCheckingOffers(true);
    setLiveSearchComplete(false);
    setLiveAssignments({});
    setNotice("");

    try {
      const placesQuery = new URLSearchParams({ zip: preferences.zip.trim() });
      if (sharedLocation) {
        placesQuery.set("lat", String(sharedLocation.latitude));
        placesQuery.set("lon", String(sharedLocation.longitude));
      }
      const placesPromise = fetch("/api/places?" + placesQuery.toString())
        .then(async (response) => {
          const data = await response.json() as {
            places?: StorePoint[];
            center?: { latitude: number; longitude: number } | null;
            message?: string;
          };
          if (!response.ok) throw new Error(data.message || "Nearby store search failed.");
          return data;
        })
        .catch(() => ({ places: [] as StorePoint[], center: null, message: "Nearby stores could not be loaded right now." }));

      type PriceResultData = {
        error?: string; message?: string; retrievedAt?: string;
        assignments?: StoreAssignment[]; stores?: StorePoint[];
      };
      type PriceResult = { ok: boolean; data: PriceResultData } | null;
      const pricesPromise: Promise<PriceResult> = liveConfigured && requestedItems.length
        ? (() => {
            const query = new URLSearchParams({ action: "shop", zip: preferences.zip.trim(), items: JSON.stringify(requestedItems) });
            return fetch("/api/prices?" + query.toString())
              .then(async (response) => ({ ok: response.ok, data: await response.json() as PriceResultData }))
              .catch(() => ({ ok: false, data: { error: "Live prices are temporarily unavailable." } }));
          })()
        : Promise.resolve(null);

      const [placesResult, priceResult] = await Promise.all([placesPromise, pricesPromise]);
      const places = placesResult.places || [];
      setSearchCenter(placesResult.center || null);
      const priceData = priceResult?.ok ? priceResult.data : null;
      const assignments = priceData?.assignments || [];
      const nextAssignments = Object.fromEntries(assignments.map((item) => [item.ingredientId, item]));
      setLiveAssignments(nextAssignments);

      const combinedStores = [...(priceData?.stores || []), ...places];
      const uniqueStores = Array.from(new Map(combinedStores.map((store) => [store.id, store])).values())
        .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY));
      setStoreLocations(uniqueStores);
      setOfferCheckedAt(priceData?.retrievedAt || new Date().toISOString());
      setLiveSearchComplete(true);

      if (requestedItems.length && liveConfigured && priceResult && !priceResult.ok) {
        setNotice((places.length ? places.length + " nearby stores found. " : "") +
          (priceResult.data.error || "Live prices could not be loaded; your list and map are still available."));
      } else if (requestedItems.length && liveConfigured) {
        const matched = Object.keys(nextAssignments).length;
        setNotice((places.length ? places.length + " nearby places found. " : "") +
          (matched
            ? (priceData?.message || ("Matched " + matched + " of " + requestedItems.length + " items to current Kroger offers."))
            : (priceData?.message || "Nearby stores loaded. No live product prices matched; unmatched items keep planning estimates.")));
      } else {
        setNotice(places.length
          ? places.length + " nearby shopping locations found. Location search is separate from live prices."
          : (placesResult.message || "No nearby shopping locations were returned. Try another ZIP code or share your location."));
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not search nearby stores right now.");
      setLiveSearchComplete(false);
    } finally {
      setCheckingOffers(false);
    }
  };
  const openNearby = () => {
    navigateTo("shops");
    void checkLiveOffers();
  };
  const openDeliveryOptions = () => {
    setPreference("mode", preferences.mode === "pickup" ? "pickup" : "delivery");
    navigateTo("shops");
    void checkLiveOffers();
  };
  const compareProducts = () => {
    navigateTo("shops");
    void checkLiveOffers();
  };

  const clearBasket = () => {
    setSelectedIds([]);
    setExtraQuantities({});
    setQuantityOverrides({});
    setCheckedItems({});
    clearLiveMatches();
    setClearConfirmOpen(false);
    setMobileCartOpen(false);
    setNotice("Your entire shopping basket has been cleared.");
  };


  return (
    <div className="app-shell" data-theme={theme}>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => navigateTo("planner")} aria-label="Shopline home">
          <span className="brand-mark"><ShoppingBasket size={21} strokeWidth={2.3} /></span>
          <span className="brand-word">shopline<span>.</span></span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={activeView === "planner" ? "nav-link active" : "nav-link"} onClick={() => navigateTo("planner")} type="button"><Sparkles size={14} /> Plan</button>
          <button className={activeView === "recipes" ? "nav-link active" : "nav-link"} onClick={() => navigateTo("recipes")} type="button"><ChefHat size={14} /> Recipes</button>
          <button className={activeView === "list" ? "nav-link active" : "nav-link"} onClick={() => navigateTo("list")} type="button"><ShoppingBasket size={14} /> Grocery list <span className="nav-count">{activeItems.length}</span></button>
          <button className={activeView === "shops" ? "nav-link active" : "nav-link"} onClick={() => navigateTo("shops")} type="button"><MapPinCheck size={14} /> Nearby</button>
        </nav>
        <div className="topbar-actions">
          <button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label={"Switch to " + (theme === "dark" ? "light" : "dark") + " theme"} title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <span className="beta-pill"><span className="status-dot" /> BETA</span>
          <button className="cart-mobile-button" type="button" onClick={() => setMobileCartOpen(true)} aria-label="Open shopping basket">
            <ShoppingCart size={19} /><span>{activeItems.length}</span>
          </button>
          <div className="anonymous-chip" title="No account needed">
            <span className="anon-avatar"><Sprout size={16} /></span>
            <span>{householdProfile ? "Household saved" : "Guest planner"}</span>
          </div>
        </div>
      </header>

      <main className="page-wrap">
        {activeView === "planner" && <>
        <section className="welcome-row">
          <div className="welcome-copy">
            <div className="eyebrow"><Sparkles size={14} /> A LITTLE MORE THOUGHTFUL, A LOT LESS SPENT</div>
            <h1>Good food.<br /><span>Better planned.</span></h1>
            <p>Build a week of meals around your budget, find the ingredients in one list, and choose how you want to shop.</p>
            <div className="welcome-assurances">
              <span><CheckCircle2 size={15} /> No sign-up</span>
              <span><CheckCircle2 size={15} /> Budget-first</span>
              <span><CheckCircle2 size={15} /> Your list, your choice</span>
            </div>
          </div>
          <div className="welcome-visual">
            <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=88" alt="A fresh, colorful bowl of food" />
            <div className="visual-shade" />
            <div className="visual-caption">
              <span className="visual-caption-kicker">A better kind of routine</span>
              <strong>Make room for<br />the good stuff.</strong>
              <span className="visual-caption-note"><Sprout size={15} /> Simple plans. Less waste.</span>
            </div>
            <div className="visual-sticker"><Leaf size={15} /> Fresh ideas, fair estimates</div>
          </div>
        </section>

        <section className="household-summary-card" aria-labelledby="household-summary-title">
          <div className="household-summary-top">
            <span className="household-summary-icon"><Sparkles size={19}/></span>
            <span className="household-summary-kicker">YOUR SHOPPING BRIEF</span>
            {householdProfile ? <span className="saved-profile-label"><ShieldCheck size={13}/> SAVED ON THIS DEVICE</span> : <span className="quick-profile-label">ONE-TIME OR GUEST SHOP</span>}
          </div>
          <h2 id="household-summary-title">Everything your household needs.</h2>
          <p>First set the context, then Shopline builds one consolidated list for food, home basics and personal care — with recipe ideas when they help.</p>
          <div className="household-summary-pills">
            <span><Users size={14}/> {preferences.servings} {preferences.servings === 1 ? "person" : "people"}</span>
            <span><Clock3 size={14}/> {preferences.days}-day plan</span>
            <span><Wallet size={14}/> {formatCurrency(preferences.budget)} budget</span>
            <span><MapPin size={14}/> {preferences.zip || "ZIP not set"}</span>
            <span><ShoppingBasket size={14}/> {quizAnswers.groups.length} shopping categories</span>
          </div>
          <div className="household-summary-actions">
            <button className="primary-button" type="button" onClick={startPlan}><Sparkles size={16}/> Build my shopping list <ArrowRight size={16}/></button>
            <button className="secondary-button" type="button" onClick={openQuiz}><SlidersHorizontal size={15}/> {householdProfile ? "Adjust for guests" : "Take the shopping quiz"}</button>
          </div>
          <div className="household-summary-foot"><ShieldCheck size={14}/><span>{householdProfile ? "Your household preferences are remembered in this browser." : "The quiz runs before each new search. You can save a household locally or keep it one-time for guests."} Account syncing will be added after beta.</span></div>
        </section>

        </>}

        {activeView === "planner" && <section className="insight-strip" aria-label="Your plan summary">
          <div className="insight-main">
            <span className="insight-icon"><ShoppingBasket size={19} /></span>
            <span><small>ESTIMATED GROCERY TOTAL</small><strong>{formatCurrency(basketTotal)}</strong></span>
            <span className={"budget-status " + (remainingBudget >= 0 ? "under" : "over")}>{remainingBudget >= 0 ? <Check size={13} /> : <Info size={13} />}{remainingBudget >= 0 ? formatCurrency(remainingBudget) + " under budget" : formatCurrency(Math.abs(remainingBudget)) + " over budget"}</span>
          </div>
          <div className="insight-divider" />
          <div className="insight-item"><span className="tiny-insight-icon"><ChefHat size={17} /></span><span><small>DINNER IDEAS</small><strong>{selectedRecipes.length} <em>/ {preferences.days} days</em></strong></span></div>
          <div className="insight-divider" />
          <div className="insight-item"><span className="tiny-insight-icon coin"><Wallet size={17} /></span><span><small>EST. PER MEAL</small><strong>{formatCurrency(currencyPerMeal)}</strong></span></div>
          <div className="insight-divider insight-divider-last" />
          <div className="estimate-mark"><span className="estimate-mark-dot" /><span><strong>Indicative estimates</strong><small>Not store-confirmed</small></span><Info size={14} /></div>
        </section>}

        {activeView !== "planner" && <ViewIntro view={activeView} budget={preferences.budget} zip={preferences.zip} itemCount={activeItems.length} onDownload={downloadList} onDietChange={(diet) => setPreference("diet", diet)} selectedDiet={preferences.diet} />}

        <div className={"content-grid" + (activeView === "list" || activeView === "shops" ? " content-grid-wide" : "")}>
          <div key={activeView} className={"main-column view-stage " + (viewLeaving ? "view-leaving" : "view-entering")}>
            {activeView === "planner" && (
              <>
                <div className="section-topline">
                  <div>
                    <div className="section-kicker">A GOOD WEEK STARTS HERE <span className="kicker-line" /></div>
                    <h2>Your dinner plan <span className="soft-count">{selectedRecipes.length}</span></h2>
                    <p className="section-description">A little variety, a lot less last-minute guessing.</p>
                  </div>
                  <button className="secondary-button" type="button" onClick={() => navigateTo("recipes")}><Search size={16} /> Explore recipes <ArrowRight size={15} /></button>
                </div>
                {selectedRecipes.length > 0 ? (
                  <div className="recipe-grid">
                    {selectedRecipes.map((recipe, index) => (
                      <div className="planned-meal" key={recipe.id + "-" + index}>
                        <div className="day-marker"><span>{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][index % 7]}</span><strong>{String(index + 1).padStart(2, "0")}</strong></div>
                        <RecipeCard recipe={recipe} selected={true} servings={preferences.servings} onToggle={() => toggleRecipe(recipe)} onDetails={() => setDetailRecipe(recipe)} compact />
                      </div>
                    ))}
                    {selectedRecipes.length < preferences.days && (
                      <button type="button" className="add-day-card" onClick={() => navigateTo("recipes")}>
                        <span className="add-day-icon"><Plus size={22} /></span>
                        <strong>Make room for one more</strong>
                        <span>Browse recipes to fill your plan</span>
                        <span className="add-day-link">Find a recipe <ArrowRight size={14} /></span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="empty-state"><span><CookingPot size={25} /></span><h3>Your plan is a blank page.</h3><p>Build a plan from your preferences or add a meal from Discover recipes.</p><button className="primary-button" type="button" onClick={startPlan}>Build a meal plan <ArrowRight size={16} /></button></div>
                )}

                <section className="store-discovery">
                  <div className="store-discovery-copy">
                    <span className="store-icon"><MapPinned size={20} /></span>
                    <div><span className="section-kicker">FROM LIST TO REAL LIFE</span><h3>Now, where should you shop?</h3><p>Explore stores or shopping options around ZIP {preferences.zip || "your area"}. The retailer confirms its own prices, stock and fees.</p></div>
                  </div>
                  <div className="store-link-row">
                    <button type="button" className="store-link-card" onClick={openNearby}><span className="store-link-icon"><Store size={17} /></span><span><strong>Nearby stores</strong><small>Search and route in Shopline</small></span><ArrowRight size={15} /></button>
                    <button type="button" className="store-link-card" onClick={openDeliveryOptions}><span className="store-link-icon delivery"><Truck size={17} /></span><span><strong>{preferences.mode === "pickup" ? "Pickup options" : "Delivery planning"}</strong><small>Manage shopping mode here</small></span><ArrowRight size={15} /></button>
                  </div>
                </section>
              </>
            )}

            {activeView === "recipes" && (
              <>
                <div className="section-topline">
                  <div><div className="section-kicker">FRESH IDEAS, NOT MORE WORK <span className="kicker-line" /></div><h2>Discover recipes <span className="soft-count">{eligibleRecipes.length}</span></h2><p className="section-description">Filter by your preference, then add meals to your plan.</p></div>
                  <button className="secondary-button" type="button" onClick={() => navigateTo("planner")}><ArrowLeft size={15} /> Back to plan</button>
                </div>
                <div className="recipe-filter-note"><Leaf size={15} /><span>Showing <strong>{DIET_OPTIONS.find((item) => item.value === preferences.diet)?.label.toLowerCase()}</strong> ideas</span><button type="button" onClick={() => setPreference("diet", "all")}>Clear filter <X size={13} /></button></div>
                <div className="recipe-grid recipe-discovery-grid">
                  {visibleRecipes.map((recipe, index) => (
                    <div className="discovery-recipe-wrap" key={recipe.id}>
                      <span className="discovery-index">{String(index + 1).padStart(2, "0")}</span>
                      <RecipeCard recipe={recipe} selected={selectedIds.includes(recipe.id)} servings={preferences.servings} onToggle={() => toggleRecipe(recipe)} onDetails={() => setDetailRecipe(recipe)} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeView === "list" && (
              <>
                <div className="section-topline">
                  <div><div className="section-kicker">READY WHEN YOU ARE <span className="kicker-line" /></div><h2>Your shopping list <span className="soft-count">{activeItems.length}</span></h2><p className="section-description">Everything grouped into one list, with package estimates.</p></div>
                  <div className="shopping-list-heading-actions">
                    <button className="clear-list-button" type="button" onClick={() => setClearConfirmOpen(true)} disabled={basketItems.length === 0}><Trash2 size={14}/> Empty basket</button>
                    <button className="secondary-button" type="button" onClick={downloadList} disabled={basketItems.length === 0}><ArrowDownToLine size={16} /> Download list</button>
                  </div>
                </div>
                <div className="list-summary-card">
                  <div className="list-summary-top"><div><span className="field-label">ESTIMATED CHECKOUT TOTAL</span><strong>{formatCurrency(basketTotal)}</strong></div><div className="list-summary-budget"><span>Budget</span><strong>{formatCurrency(preferences.budget)}</strong></div></div>
                  <div className="budget-track"><span style={{ width: progress + "%" }} className={remainingBudget < 0 ? "track-over" : ""} /></div>
                  <div className="list-summary-bottom"><span>{checkedCount} of {basketItems.length} items checked</span><button type="button" onClick={() => setCheckedItems({})}>Clear checkmarks <RotateIcon /></button></div>
                </div>
                <div className="detailed-list">
                  {Array.from(new Set(basketItems.map((line) => line.ingredient.category))).map((category) => {
                    const lines = basketItems.filter((line) => line.ingredient.category === category);
                    return <section className="grocery-category" key={category}>
                      <div className="category-heading"><h3>{category}</h3><span>{lines.length} {lines.length === 1 ? "item" : "items"}</span></div>
                      {lines.map((line) => <CartRow key={line.ingredient.id} line={line} onToggle={() => toggleChecked(line)} onQuantity={(delta) => changeQuantity(line, delta)} detailed assignment={liveAssignments[line.ingredient.id]} liveChecked={liveSearchComplete && liveConfigured} />)}
                    </section>;
                  })}
                  {!basketItems.length && <div className="empty-state"><ShoppingBasket size={25} /><h3>No ingredients yet</h3><p>Add a meal to create your shopping list.</p></div>}
                </div>
                <section className="live-prices-card">
                  <div className="live-icon"><Search size={19} /></div>
                  <div className="live-copy"><h3>{liveConfigured ? "Match products to nearby stores" : "Find nearby stores"}</h3><p>{liveConfigured ? "Search nearby shops, compare current Kroger product prices where available, and group matched items by store." : "Store locations and the interactive map work independently from live prices. Product prices stay labelled as estimates until a retailer returns a match."}</p></div>
                  <button className="secondary-button" type="button" disabled={checkingOffers} onClick={checkLiveOffers}>{checkingOffers ? "Searching…" : "Find stores & prices"} <ArrowRight size={15} /></button>
                </section>
                {liveSearchComplete && <div className="matching-summary-strip"><CheckCircle2 size={15}/><span>{Object.keys(liveAssignments).length} of {activeItems.length} items matched to store prices. {unmatchedItems.length ? unmatchedItems.length + " still use estimates." : "All active items have a store match."}</span><button type="button" onClick={openNearby}>View route <ArrowRight size={14}/></button></div>}
                <ShoppingDestinations mode={preferences.mode} zip={preferences.zip} onNearby={openNearby} onDelivery={openDeliveryOptions} onCompare={compareProducts} />
              </>
            )}

             {activeView === "shops" && (
              <section className="shopping-results-page">
                <div className="shopping-results-header">
                  <div><span className="section-kicker">LOCAL SHOPPING, WITHOUT THE TAB CHAOS <span className="kicker-line"/></span><h2>{preferences.mode === "store" ? "Find it. Price it. Route it." : preferences.mode === "pickup" ? "Compare it. Collect it." : "Build your online shop."}</h2><p className="section-description">Nearby shopping locations, current product matches, and grouped stops in one workspace.</p></div>
                  <button className="secondary-button" type="button" disabled={checkingOffers} onClick={checkLiveOffers}>{checkingOffers ? <><RefreshCw size={14} className="spin-icon"/> Updating…</> : <><RefreshCw size={14}/> Refresh prices</>}</button>
                </div>
                <div className="shop-status-strip">
                  <span className={"shop-status-dot" + (liveSearchComplete ? " complete" : "")}/>
                  <span><strong>{preferences.zip || "Location required"}</strong><small>{offerCheckedAt ? "Last checked " + new Date(offerCheckedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Your ZIP is used only when you search for nearby stores."}</small></span>
                  <span className="shop-status-total"><small>ESTIMATED / MATCHED TOTAL</small><strong>{formatCurrency(basketTotal)}</strong></span>
                </div>

                {preferences.mode !== "store" && (
                  <div className="fulfillment-mode-notice">
                    <span><Truck size={16}/></span>
                    <div><strong>{preferences.mode === "pickup" ? "Pickup planning mode" : "Delivery planning mode"}</strong><small>Shopline can match products and organize your list, but retailer checkout, pickup-slot availability, delivery coverage and service fees are not connected in this beta. We will not invent those details.</small></div>
                  </div>
                )}

                {!liveSearchComplete && (
                  <div className="store-search-empty">
                    <span className="store-search-empty-icon"><MapPinned size={27}/></span>
                    <h3>Let’s find your best shopping stops.</h3>
                    <p>Shopline will search nearby stores, find matching products where the provider returns them, and group the basket into store stops. It won’t pretend unmatched prices are live.</p>
                    <button className="primary-button" type="button" disabled={checkingOffers} onClick={checkLiveOffers}>{checkingOffers ? "Searching nearby stores…" : "Find nearby stores & prices"} <ArrowRight size={15}/></button>
                    {!liveConfigured && <span className="shop-empty-footnote">Retailer API credentials are not connected in this deployment.</span>}
                  </div>
                )}

                {liveSearchComplete && (routeStops.length > 0 || storeLocations.some((store) => typeof store.latitude === "number" && typeof store.longitude === "number")) && (
                  <>
                    {preferences.mode === "store" ? (
                      <Suspense fallback={<div className="route-map-skeleton"><span className="mini-spinner"/> Loading interactive map…</div>}>
                        <RouteMap stops={routeStops} nearby={storeLocations} origin={sharedLocation || searchCenter} originKind={sharedLocation ? "precise" : searchCenter ? "approximate" : undefined} theme={theme} routeEnabled={preferences.mode === "store"}/>
                      </Suspense>
                    ) : (
                      <Suspense fallback={<div className="route-map-skeleton"><span className="mini-spinner"/> Loading interactive map…</div>}>
                        <RouteMap stops={routeStops} nearby={storeLocations} origin={sharedLocation || searchCenter} originKind={sharedLocation ? "precise" : searchCenter ? "approximate" : undefined} theme={theme} routeEnabled={false}/>
                      </Suspense>
                    )}
                    {routeStops.length > 0 && <div className="route-stops-section">
                      <div className="route-stops-heading"><div><span className="section-kicker">YOUR STOP-BY-STOP PLAN <span className="kicker-line"/></span><h3>One route, grouped baskets.</h3></div><span>{routeStops.length} {routeStops.length === 1 ? "stop" : "stops"}</span></div>
                      <div className="route-stop-list">
                        {routeStops.map((stop, index) => (
                          <article className="route-stop-card" key={stop.id}>
                            <div className="route-stop-number">{String(index + 1).padStart(2, "0")}</div>
                            <div className="route-stop-main">
                              <div className="route-stop-title"><div><h4>{stop.name}</h4><p>{stop.address || "Address not provided by the store API"}</p></div><strong>{formatCurrency(stop.subtotal)}</strong></div>
                              <div className="route-stop-items">{stop.items.map((item) => <span key={item}>{item}</span>)}</div>
                              <div className="route-stop-foot"><span><ShoppingBasket size={13}/> {stop.itemCount} packages matched</span><span><CheckCircle2 size={13}/> Product match returned by Kroger</span></div>
                            </div>
                          </article>
                        ))}
                      </div>
                      <p className="route-disclaimer"><Info size={14}/> Stops are grouped around matched Kroger products and ordered by a distance-efficient estimate. Store stock, final price, taxes and delivery fees must still be confirmed by the retailer.</p>
                    </div>}
                  </>
                )}

                {liveSearchComplete && liveConfigured && unmatchedItems.length > 0 && (
                  <section className="unmatched-products">
                    <div><span className="unmatched-icon"><Info size={16}/></span><span><strong>{unmatchedItems.length} items without a live store match</strong><small>Kept in your basket at indicative planning prices; they are not silently removed.</small></span></div>
                    <div className="unmatched-product-list">{unmatchedItems.map((line) => <span key={line.ingredient.id}>{line.ingredient.name}</span>)}</div>
                  </section>
                )}

                {liveSearchComplete && storeLocations.length === 0 && (
                  <div className="store-search-empty store-search-empty-compact"><span className="store-search-empty-icon"><MapPinned size={24}/></span><h3>No stores found for this search</h3><p>Try another ZIP code or share your current location. Your list remains available and can still be edited or exported.</p><button className="secondary-button" type="button" onClick={openQuiz}><MapPin size={14}/> Change shopping area</button></div>
                )}

                {liveSearchComplete && storeLocations.length > 0 && (
                  <section className="nearby-location-list">
                    <div className="route-stops-heading"><div><span className="section-kicker">AROUND YOUR ZIP <span className="kicker-line"/></span><h3>Nearby Kroger locations</h3></div><span>{storeLocations.length} found</span></div>
                    <div className="nearby-location-grid">{storeLocations.map((store) => <article className="nearby-location-card" key={store.id}><span className="nearby-location-icon"><Store size={17}/></span><span><strong>{store.name}</strong><small>{store.address || "Address unavailable"}</small></span>{routeStops.some((stop) => stop.id === store.id) ? <span className="location-status matched">On route</span> : <span className="location-status">Nearby</span>}</article>)}</div>
                  </section>
                )}

                <ShoppingDestinations mode={preferences.mode} zip={preferences.zip} onNearby={openNearby} onDelivery={openDeliveryOptions} onCompare={compareProducts}/>
              </section>
            )}
          </div>

          <aside className={"basket-column" + ((activeView === "list" || activeView === "shops" ? " basket-column-hidden" : "") + (mobileCartOpen ? " mobile-cart-open" : ""))}>
            <div className="basket-panel">
              <div className="basket-heading">
                <div><div className="basket-overline"><span className="basket-pulse" /> YOUR GROCERY LIST</div><h2>The basket <span>{activeItems.length}</span></h2></div>
                {basketItems.length > 0 && <button className="clear-basket-trigger" type="button" onClick={() => setClearConfirmOpen(true)} aria-label="Clear the entire basket" title="Clear entire basket"><Trash2 size={15}/></button>}
                <button className="basket-close-mobile" type="button" aria-label="Close basket" onClick={() => setMobileCartOpen(false)}><X size={18} /></button>
                <span className="basket-heading-icon"><ShoppingBasket size={19} /></span>
              </div>

              <div className="basket-budget-block">
                <div className="basket-total-line"><span>Estimated total</span><strong>{formatCurrency(basketTotal)}</strong></div>
                <div className="budget-track"><span style={{ width: progress + "%" }} className={remainingBudget < 0 ? "track-over" : ""} /></div>
                <div className="budget-captions"><span>{formatCurrency(basketTotal)} planned</span><span>{formatCurrency(preferences.budget)} budget</span></div>
                <div className={"budget-left-note " + (remainingBudget < 0 ? "negative" : "")}>{remainingBudget >= 0 ? <><CheckCircle2 size={14} /> {formatCurrency(remainingBudget)} left to spend</> : <><Info size={14} /> {formatCurrency(Math.abs(remainingBudget))} above your budget</>}</div>
              </div>

              <div className="basket-list-heading"><span>INGREDIENTS</span><button type="button" onClick={() => navigateTo("list")}>Full list <ArrowRight size={13} /></button></div>

              {basketItems.length > 0 ? (
                <div className="quick-cart-list">
                  {basketItems.map((line) => <CartRow key={line.ingredient.id} line={line} onToggle={() => toggleChecked(line)} onQuantity={(delta) => changeQuantity(line, delta)} assignment={liveAssignments[line.ingredient.id]} liveChecked={liveSearchComplete} />)}
                </div>
              ) : (
                <div className="quick-cart-empty"><ShoppingBasket size={24} /><p>Add meals to see ingredients here.</p></div>
              )}

              <div className="basket-actions">
                <button className="primary-button basket-primary" type="button" onClick={downloadList}><ArrowDownToLine size={16} /> Download shopping list</button>
                <button className="basket-copy-button" type="button" onClick={copyList}><ListChecks size={16} /> Copy list to clipboard</button>
              </div>
              <div className="basket-footnote"><Info size={14} /><span>Prices are planning estimates, not a checkout quote. Retail prices and fees may differ.</span></div>
            </div>

            <div className="basket-mini-help">
              <div className="mini-help-icon"><Sprout size={17} /></div>
              <div><strong>A little less waste.</strong><p>Quantities combine ingredients across your selected meals.</p></div>
            </div>
          </aside>
        </div>

        <footer className="site-footer">
          <div className="footer-brand"><span className="brand-mark"><ShoppingBasket size={17} /></span><strong>shopline<span>.</span></strong></div>
          <p>Better meals. Thoughtful spending. One list.</p>
          <span className="footer-disclaimer">BETA · Sample prices are estimates · No account required</span>
          <span className="footer-session" title="Stored locally in this browser">LOCAL SESSION <span>{anonymousSessionId.slice(0, 6).toUpperCase()}</span></span>
        </footer>
      </main>

      {detailRecipe && <RecipeModal recipe={detailRecipe} servings={preferences.servings} onClose={() => setDetailRecipe(null)} onAdd={() => { toggleRecipe(detailRecipe); setDetailRecipe(null); }} selected={selectedIds.includes(detailRecipe.id)} />}
      {quizOpen && <ShoppingQuiz initial={quizAnswers} onClose={() => setQuizOpen(false)} onComplete={applyQuizAnswers}/>}
      {clearConfirmOpen && (
        <div className="clear-confirm-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setClearConfirmOpen(false); }}>
          <section className="clear-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="clear-confirm-title">
            <span className="clear-confirm-icon"><Trash2 size={22}/></span>
            <h2 id="clear-confirm-title">Empty the entire basket?</h2>
            <p>This removes all selected meals, household essentials, quantities and store matches. Your saved household preferences will stay.</p>
            <div className="clear-confirm-actions"><button className="secondary-button" type="button" onClick={() => setClearConfirmOpen(false)}>Keep my list</button><button className="danger-button" type="button" onClick={clearBasket}><Trash2 size={14}/> Empty basket</button></div>
          </section>
        </div>
      )}
      {mobileCartOpen && <button className="mobile-cart-scrim" type="button" onClick={() => setMobileCartOpen(false)} aria-label="Close shopping basket overlay" />}
      {notice && <div className="toast" role="status"><CheckCircle2 size={17} /><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button></div>}
    </div>
  );
}

function ViewIntro({
  view,
  budget,
  zip,
  itemCount,
  onDownload,
  onDietChange,
  selectedDiet
}: {
  view: ViewName;
  budget: number;
  zip: string;
  itemCount: number;
  onDownload: () => void;
  onDietChange: (diet: Diet) => void;
  selectedDiet: Diet;
}) {
  if (view === "recipes") {
    return (
      <section className="view-intro recipes-intro">
        <div className="view-intro-copy">
          <span className="eyebrow"><Sparkles size={14} /> THE SHOPLINE RECIPE EDIT</span>
          <h1>Something good<br /><em>is cooking.</em></h1>
          <p>Recipes with a plan behind them. Pick your mood, add a meal, and let the basket do the math.</p>
        </div>
        <div className="view-intro-art recipe-intro-art">
          <span className="intro-orbit orbit-one" /><span className="intro-orbit orbit-two" />
          <span className="intro-art-badge"><ChefHat size={15} /> GOOD FOOD, NO GUESSWORK</span>
          <strong>Find your<br />next favorite.</strong>
          <span className="intro-art-bottom"><Leaf size={15} /> Thoughtful meals for real life</span>
        </div>
        <div className="intro-filters">
          <span className="field-label"><SlidersHorizontal size={15} /> COOK TO YOUR PREFERENCES</span>
          <div className="diet-options" role="group" aria-label="Recipe dietary filter">
            {DIET_OPTIONS.map((option) => (
              <button type="button" key={option.value} className={selectedDiet === option.value ? "diet-chip selected" : "diet-chip"} onClick={() => onDietChange(option.value)}>
                <span className="diet-icon">{option.icon}</span>{option.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (view === "list") {
    return (
      <section className="view-intro list-intro">
        <div className="view-intro-copy">
          <span className="eyebrow"><ShoppingBasket size={14} /> YOUR LIST, BEAUTIFULLY SORTED</span>
          <h1>Everything you need.<br /><em>Nothing extra.</em></h1>
          <p>Your ingredients, grouped and counted. Check things off as you shop and keep an eye on the total.</p>
        </div>
        <div className="intro-stat-card">
          <span className="intro-stat-icon"><ListChecks size={20} /></span>
          <span className="intro-stat-label">ITEMS ON YOUR LIST</span>
          <strong>{itemCount}</strong>
          <span className="intro-stat-foot"><Wallet size={14} /> Budget set to {formatCurrency(budget)}</span>
          <button className="intro-download-button" type="button" onClick={onDownload}><ArrowDownToLine size={15} /> Download list</button>
        </div>
      </section>
    );
  }
  return (
    <section className="view-intro shops-intro">
      <div className="view-intro-copy">
        <span className="eyebrow"><MapPinCheck size={14} /> YOUR NEXT SHOPPING STOP</span>
        <h1>Closer to home.<br /><em>Better prepared.</em></h1>
        <p>Explore stores, delivery and pickup options around your ZIP code, then take your organized list with you.</p>
      </div>
      <div className="intro-location-card">
        <span className="intro-location-mark"><MapPinCheck size={21} /></span>
        <span className="intro-stat-label">YOUR SHOPPING AREA</span>
        <strong>{zip || "Add ZIP code"}</strong>
        <span className="intro-location-meta">Local search area · United States</span>
      </div>
    </section>
  );
}


const GENERIC_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&q=80";

function productFallbackImage(ingredient: Ingredient): string {
  const text = (ingredient.kind || "") + " " + ingredient.category + " " + ingredient.name;
  if (/paper|toilet|towel|tissue|trash bag/i.test(text)) return "https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&w=240&q=80";
  if (/clean|soap|detergent|sponge|dishwasher|laundry/i.test(text)) return "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=240&q=80";
  if (/personal-care|toothpaste|toothbrush|razor|shampoo|deodorant|body wash|period/i.test(text)) return "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=240&q=80";
  if (/baby|pet|diaper|dog|cat|litter/i.test(text)) return "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=240&q=80";
  if (/meat|chicken|turkey|beef|pork|fish|seafood/i.test(text)) return "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=240&q=80";
  if (/dairy|milk|cheese|yogurt|egg|feta|butter/i.test(text)) return "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=240&q=80";
  if (/fruit|produce|vegetable|salad|tomato|spinach|cucumber|carrot|broccoli/i.test(text)) return GENERIC_PRODUCT_IMAGE;
  return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=240&q=80";
}

function CartRow({
  line,
  onToggle,
  onQuantity,
  detailed = false,
  assignment,
  liveChecked = false
}: {
  line: CartLine;
  onToggle: () => void;
  onQuantity: (delta: number) => void;
  detailed?: boolean;
  assignment?: StoreAssignment;
  liveChecked?: boolean;
}) {
  const liveUnitPrice = assignment ? (assignment.promoPrice && assignment.promoPrice > 0 ? assignment.promoPrice : assignment.price) : line.ingredient.price;
  const rowCost = line.quantity * liveUnitPrice;
  return (
    <div className={"cart-row" + (line.checked ? " checked" : "") + (detailed ? " detailed-row" : "")}>
      <button className="cart-check" type="button" aria-label={(line.checked ? "Uncheck " : "Check ") + line.ingredient.name} onClick={onToggle}>
        {line.checked && <Check size={13} />}
      </button>
      <div className="cart-product-thumb">
        <img src={assignment?.imageUrl || productFallbackImage(line.ingredient)} alt="" loading="lazy" onError={(event) => { const image = event.currentTarget; if (image.dataset.fallback !== "true") { image.dataset.fallback = "true"; image.src = GENERIC_PRODUCT_IMAGE; } }} />
      </div>
      <div className="cart-row-copy">
        <strong>{line.ingredient.name}</strong>
        <span>{line.ingredient.packageLabel}{detailed ? " · needs " + quantityText(line.amountNeeded, line.amountUnit) : ""}</span>
        <span className={"cart-store-label" + (assignment ? " matched" : liveChecked ? " unmatched" : "")}>
          {assignment
            ? <><Store size={11}/><span>{assignment.store.name}{assignment.size ? " · " + assignment.size : ""}</span></>
            : liveChecked
              ? <><Info size={11}/><span>No nearby match · estimate</span></>
              : <><MapPin size={11}/><span>Store pending price check</span></>}
        </span>
      </div>
      <div className="cart-row-end">
        <strong className="cart-row-price">{formatCurrency(rowCost)}</strong>
        {assignment?.promoPrice && assignment.promoPrice > 0 && <span className="cart-promo-note">promo</span>}
        <div className="qty-stepper">
          <button type="button" aria-label={"Remove one " + line.ingredient.name} onClick={() => onQuantity(-1)} disabled={line.quantity <= 0}><Minus size={12} /></button>
          <span>{line.quantity}</span>
          <button type="button" aria-label={"Add one " + line.ingredient.name} onClick={() => onQuantity(1)} disabled={line.quantity >= 99}><Plus size={12} /></button>
        </div>
      </div>
    </div>
  );
}

function OffersPanel({ offers, location, checkedAt }: { offers: LiveOffer[]; location: string; checkedAt: string }) {
  return (
    <section className="offers-panel">
      <div className="offers-heading"><div><span className="live-badge"><span /> LIVE LOOKUP</span><h3>{location || "Kroger product results"}</h3><p>Prices returned by the provider; basket estimates are unchanged.</p></div><BadgeCheck size={21} /></div>
      <div className="offer-list">
        {offers.map((offer, index) => <div className="offer-row" key={offer.productId || offer.query + "-" + index}><div><strong>{offer.name}</strong><span>{offer.brand ? offer.brand + " · " : ""}{offer.size || offer.query}</span></div><div className="offer-price">{offer.promoPrice ? <><strong>{formatCurrency(offer.promoPrice)}</strong><del>{formatCurrency(offer.price)}</del></> : <strong>{formatCurrency(offer.price)}</strong>}</div></div>)}
      </div>
      <div className="offer-time"><CheckCircle2 size={13} /> Checked {new Date(checkedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}. Confirm the final price and availability in the retailer's store.</div>
    </section>
  );
}

function ShoppingDestinations({
  mode,
  zip,
  onNearby,
  onDelivery,
  onCompare
}: {
  mode: ShoppingMode;
  zip: string;
  onNearby: () => void;
  onDelivery: () => void;
  onCompare: () => void;
}) {
  return (
    <section className="destinations-section">
      <div className="section-kicker">TAKE THE NEXT STEP <span className="kicker-line" /></div>
      <h2>From plan to pantry.</h2>
      <p className="section-description">Find stores, compare product matches and organize stops here — without losing your list in another tab.</p>
      <div className="destination-grid">
        <button type="button" onClick={onNearby} className="destination-card">
          <span className="destination-icon green"><MapPinned size={19} /></span>
          <span><strong>Shop nearby</strong><small>{zip ? "Stores near " + zip : "Add a ZIP or share location"}</small></span>
          <ArrowRight size={16} />
        </button>
        <button type="button" onClick={onDelivery} className="destination-card">
          <span className="destination-icon orange">{mode === "pickup" ? <MapPinned size={19}/> : <Truck size={19}/>}</span>
          <span><strong>{mode === "pickup" ? "Plan a pickup" : mode === "delivery" ? "Delivery planning" : "Pickup & delivery"}</strong><small>Choose a shopping mode</small></span>
          <ArrowRight size={16} />
        </button>
        <button type="button" onClick={onCompare} className="destination-card">
          <span className="destination-icon green"><Search size={19} /></span>
          <span><strong>Compare products</strong><small>Match items to nearby stores</small></span>
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

function RecipeModal({ recipe, servings, onClose, onAdd, selected }: { recipe: Recipe; servings: number; onClose: () => void; onAdd: () => void; selected: boolean }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title">
        <button type="button" className="modal-close" aria-label="Close recipe details" onClick={onClose}><X size={19} /></button>
        <div className="modal-photo"><img src={recipe.image} alt="" /><span className="modal-photo-chip"><Clock3 size={13} /> {recipe.minutes} min</span></div>
        <div className="modal-content">
          <span className="section-kicker">THE RECIPE CARD <span className="kicker-line" /></span>
          <h2 id="recipe-modal-title">{recipe.title}</h2>
          <p className="modal-description">{recipe.description}</p>
          <div className="modal-stats"><span><Users size={15} /> {servings} servings</span><span><CookingPot size={15} /> {recipe.calories} cal / serving est.</span><span><Wallet size={15} /> {formatCurrency(estimateRecipeCost(recipe, INGREDIENTS, servings))} grocery estimate</span></div>
          <div className="modal-columns">
            <div><h3>What you'll need</h3><ul className="modal-ingredients">{recipe.ingredients.map((row) => {
              const ingredient = INGREDIENTS.find((item) => item.id === row.ingredientId);
              return <li key={row.ingredientId}><span>{ingredient?.name || row.ingredientId}</span><strong>{quantityText(row.amount * servings / recipe.servings, row.unit)}</strong></li>;
            })}</ul></div>
            <div><h3>Let's make it</h3><ol className="modal-steps">{recipe.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></div>
          </div>
          <div className="modal-bottom"><span><Info size={14} /> Recipe and pricing estimates may need your own pantry items.</span><button className={selected ? "secondary-button" : "primary-button"} type="button" onClick={onAdd}>{selected ? <><X size={15} /> Remove from plan</> : <><Plus size={16} /> Add to meal plan</>}</button></div>
        </div>
      </section>
    </div>
  );
}

function RotateIcon() {
  return <span className="rotate-symbol">↺</span>;
}
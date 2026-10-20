import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check,
  CheckCircle2, ChefHat, ChevronDown, Clock3, CookingPot, ExternalLink,
  Heart, Info, Leaf, ListChecks, MapPin, MapPinned, Minus, Plus, Search,
  ShoppingBag, ShoppingBasket, ShoppingCart, SlidersHorizontal, Sparkles,
  Sprout, Store, Truck, Users, Wallet, X
} from "lucide-react";
import { INGREDIENTS, RECIPES } from "./data";
import { buildBasket, buildPlan, buildShoppingText, estimateRecipeCost, formatCurrency, matchesDiet } from "./lib/planner";
import { DEFAULT_PREFERENCES, getAnonymousSessionId, readStored, writeStored } from "./lib/storage";
import type { CartLine, Diet, LiveOffer, Preferences, Recipe, ShoppingMode, ViewName } from "./types";

const STARTER_PLAN = ["chickpea-bowls", "black-bean-tacos", "lemon-chicken", "peanut-noodles", "tomato-pasta"];
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
  const saved = readStored<string[]>("meal-plan", STARTER_PLAN);
  return saved.filter((id) => RECIPES.some((recipe) => recipe.id === id));
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
  const [preferences, setPreferences] = useState<Preferences>(() => readStored("preferences", DEFAULT_PREFERENCES));
  const [selectedIds, setSelectedIds] = useState<string[]>(readInitialPlan);
  const [quantityOverrides, setQuantityOverrides] = useState<Record<string, number>>(() => readStored("quantities", {}));
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => readStored("checked", {}));
  const [activeView, setActiveView] = useState<ViewName>("planner");
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [notice, setNotice] = useState("");
  const [liveConfigured, setLiveConfigured] = useState(false);
  const [checkingOffers, setCheckingOffers] = useState(false);
  const [offers, setOffers] = useState<LiveOffer[]>([]);
  const [offerLocation, setOfferLocation] = useState("");
  const [offerCheckedAt, setOfferCheckedAt] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const anonymousSessionId = useMemo(() => getAnonymousSessionId(), []);

  const selectedRecipes = useMemo(
    () => selectedIds.map((id) => RECIPES.find((recipe) => recipe.id === id)).filter((recipe): recipe is Recipe => Boolean(recipe)),
    [selectedIds]
  );
  const basketItems = useMemo(
    () => buildBasket(selectedRecipes, INGREDIENTS, preferences.servings, quantityOverrides, checkedItems),
    [selectedIds, preferences.servings, quantityOverrides, checkedItems]
  );
  const basketTotal = basketItems.reduce((sum, item) => sum + item.cost, 0);
  const activeItems = basketItems.filter((item) => item.quantity > 0);
  const checkedCount = basketItems.filter((item) => item.checked).length;
  const remainingBudget = preferences.budget - basketTotal;
  const progress = Math.min(100, (basketTotal / Math.max(1, preferences.budget)) * 100);
  const eligibleRecipes = RECIPES.filter((recipe) => matchesDiet(recipe, preferences.diet));
  const visibleRecipes = activeView === "recipes" ? eligibleRecipes : selectedRecipes;
  const currencyPerMeal = selectedRecipes.length ? basketTotal / selectedRecipes.length : 0;

  useEffect(() => {
    writeStored("preferences", preferences);
    writeStored("meal-plan", selectedIds);
    writeStored("quantities", quantityOverrides);
    writeStored("checked", checkedItems);
  }, [preferences, selectedIds, quantityOverrides, checkedItems]);

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

  const setPreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    if (key === "zip") {
      setOffers([]);
    }
  };

  const generatePlan = () => {
    if (!/^\d{5}$/.test(preferences.zip.trim())) {
      setNotice("Enter a 5-digit ZIP code to tailor shopping options.");
      return;
    }
    const ids = buildPlan(RECIPES, INGREDIENTS, preferences.days, preferences.servings, preferences.diet, preferences.budget);
    setSelectedIds(ids);
    setQuantityOverrides({});
    setCheckedItems({});
    setOffers([]);
    setActiveView("planner");
    setNotice("Your plan is refreshed around your preferences.");
  };

  const toggleRecipe = (recipe: Recipe) => {
    const existingIndex = selectedIds.indexOf(recipe.id);
    if (existingIndex >= 0) {
      setSelectedIds((current) => current.filter((id, index) => !(id === recipe.id && index === existingIndex)));
      setNotice("Meal removed. Your grocery list is updated.");
      return;
    }
    if (selectedIds.length >= preferences.days) {
      setNotice("Your plan is full. Remove a meal or choose a longer plan first.");
      return;
    }
    setSelectedIds((current) => [...current, recipe.id]);
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
    const text = buildShoppingText(basketItems, preferences.zip, preferences.budget);
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
    const text = buildShoppingText(basketItems, preferences.zip, preferences.budget);
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Shopping list copied to your clipboard.");
    } catch {
      downloadList();
    }
  };

  const checkLiveOffers = async () => {
    if (!liveConfigured) {
      setNotice("Live prices are not connected yet. See the setup notes in the repository README.");
      return;
    }
    if (!/^\d{5}$/.test(preferences.zip.trim())) {
      setNotice("Enter a valid 5-digit ZIP code first.");
      return;
    }
    const terms = activeItems.slice(0, 10).map((line) => line.ingredient.name);
    if (!terms.length) {
      setNotice("Add at least one meal before checking offers.");
      return;
    }
    setCheckingOffers(true);
    setOffers([]);
    try {
      const response = await fetch("/api/prices?zip=" + encodeURIComponent(preferences.zip.trim()) + "&terms=" + encodeURIComponent(terms.join(",")));
      const data = await response.json() as {
        error?: string;
        message?: string;
        location?: { name?: string; address?: string } | null;
        retrievedAt?: string;
        items?: LiveOffer[];
      };
      if (!response.ok) throw new Error(data.error || "Live price check failed.");
      setOffers(data.items || []);
      setOfferLocation(data.location?.name || "");
      setOfferCheckedAt(data.retrievedAt || new Date().toISOString());
      setNotice(data.items?.length ? "Live Kroger product prices were retrieved." : (data.message || "No matching priced products were found."));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not check live prices right now.");
    } finally {
      setCheckingOffers(false);
    }
  };

  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("grocery stores near " + preferences.zip);
  const deliveryUrl = "https://www.google.com/search?q=" + encodeURIComponent("grocery " + (preferences.mode === "pickup" ? "pickup" : "delivery") + " near " + preferences.zip);
  const shoppingUrl = "https://www.google.com/search?tbm=shop&q=" + encodeURIComponent(activeItems.slice(0, 5).map((line) => line.ingredient.name).join(" "));

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setActiveView("planner")} aria-label="Shopline home">
          <span className="brand-mark"><ShoppingBasket size={21} strokeWidth={2.3} /></span>
          <span className="brand-word">shopline<span>.</span></span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={activeView === "planner" ? "nav-link active" : "nav-link"} onClick={() => setActiveView("planner")} type="button">Meal planner</button>
          <button className={activeView === "recipes" ? "nav-link active" : "nav-link"} onClick={() => setActiveView("recipes")} type="button">Discover recipes</button>
          <button className={activeView === "list" ? "nav-link active" : "nav-link"} onClick={() => setActiveView("list")} type="button">Shopping list <span className="nav-count">{activeItems.length}</span></button>
        </nav>
        <div className="topbar-actions">
          <span className="beta-pill"><span className="status-dot" /> BETA</span>
          <button className="cart-mobile-button" type="button" onClick={() => setMobileCartOpen(true)} aria-label="Open shopping basket">
            <ShoppingCart size={19} /><span>{activeItems.length}</span>
          </button>
          <div className="anonymous-chip" title="No account needed">
            <span className="anon-avatar"><Sprout size={16} /></span>
            <span>Guest planner</span>
          </div>
        </div>
      </header>

      <main className="page-wrap">
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

        <section className="planner-controls" aria-labelledby="planner-controls-title">
          <div className="controls-heading">
            <div>
              <div className="section-kicker">MAKE IT YOURS <span className="kicker-line" /></div>
              <h2 id="planner-controls-title">Your plan, your way</h2>
              <p>Tell us what works for your table this week.</p>
            </div>
            <button className="text-button refresh-button" type="button" onClick={generatePlan}><Sparkles size={15} /> Build my plan <ArrowRight size={15} /></button>
          </div>

          <div className="control-grid">
            <label className="control-field location-field">
              <span className="field-label"><MapPin size={15} /> SHOPPING LOCATION</span>
              <span className="zip-input-wrap">
                <input value={preferences.zip} inputMode="numeric" maxLength={5} aria-label="ZIP code" onChange={(event) => setPreference("zip", event.target.value.replace(/\D/g, "").slice(0, 5))} />
                <span className="location-label">ZIP code</span>
                <MapPinned size={17} />
              </span>
              <span className="field-hint">Used to find nearby shopping options</span>
            </label>

            <div className="control-field budget-field">
              <div className="field-label-row">
                <span className="field-label"><Wallet size={15} /> TOTAL BUDGET</span>
                <strong className="budget-value">{formatCurrency(preferences.budget)}</strong>
              </div>
              <input className="budget-slider" type="range" min="25" max="200" step="5" value={preferences.budget} onChange={(event) => setPreference("budget", Number(event.target.value))} aria-label="Grocery budget" style={{ "--range-progress": ((preferences.budget - 25) / 175 * 100) + "%" } as CSSProperties} />
              <div className="range-caption"><span>$25</span><span>$200+</span></div>
              <span className="field-hint">For the whole shopping basket</span>
            </div>

            <div className="control-field duration-field">
              <span className="field-label"><Clock3 size={15} /> PLAN LENGTH</span>
              <div className="segmented duration-segmented" role="group" aria-label="Plan length">
                {([3, 5, 7] as const).map((days) => (
                  <button type="button" key={days} onClick={() => setPreference("days", days)} className={preferences.days === days ? "selected" : ""}>
                    <strong>{days}</strong><span>{"days"}</span>
                  </button>
                ))}
              </div>
              <span className="field-hint">One dinner idea per day</span>
            </div>

            <div className="control-field servings-field">
              <span className="field-label"><Users size={15} /> AT THE TABLE</span>
              <div className="stepper serving-stepper">
                <button type="button" aria-label="Decrease servings" disabled={preferences.servings <= 1} onClick={() => setPreference("servings", Math.max(1, preferences.servings - 1))}><Minus size={15} /></button>
                <span><strong>{preferences.servings}</strong><small>{preferences.servings === 1 ? "person" : "people"}</small></span>
                <button type="button" aria-label="Increase servings" disabled={preferences.servings >= 8} onClick={() => setPreference("servings", Math.min(8, preferences.servings + 1))}><Plus size={15} /></button>
              </div>
              <span className="field-hint">Adjust ingredient quantities</span>
            </div>
          </div>

          <div className="controls-bottom">
            <div className="diet-chooser">
              <span className="field-label"><SlidersHorizontal size={15} /> FOOD PREFERENCES</span>
              <div className="diet-options" role="group" aria-label="Dietary preference">
                {DIET_OPTIONS.map((option) => (
                  <button type="button" key={option.value} className={preferences.diet === option.value ? "diet-chip selected" : "diet-chip"} onClick={() => setPreference("diet", option.value)}>
                    <span className="diet-icon">{option.icon}</span>{option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="shopping-mode">
              <span className="field-label">HOW DO YOU WANT TO SHOP?</span>
              <div className="mode-options" role="group" aria-label="Shopping preference">
                {MODE_OPTIONS.map((option) => (
                  <button className={preferences.mode === option.value ? "mode-option selected" : "mode-option"} key={option.value} type="button" onClick={() => setPreference("mode", option.value)}>
                    <span className="mode-icon">{option.value === "store" ? <Store size={17} /> : option.value === "pickup" ? <ShoppingBag size={17} /> : <Truck size={17} />}</span>
                    <span><strong>{option.label}</strong><small>{option.sub}</small></span>
                    {preferences.mode === option.value && <CheckCircle2 size={15} className="mode-check" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="insight-strip" aria-label="Your plan summary">
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
        </section>

        <div className="content-grid">
          <div className="main-column">
            {activeView === "planner" && (
              <>
                <div className="section-topline">
                  <div>
                    <div className="section-kicker">A GOOD WEEK STARTS HERE <span className="kicker-line" /></div>
                    <h2>Your dinner plan <span className="soft-count">{selectedRecipes.length}</span></h2>
                    <p className="section-description">A little variety, a lot less last-minute guessing.</p>
                  </div>
                  <button className="secondary-button" type="button" onClick={() => setActiveView("recipes")}><Search size={16} /> Explore recipes <ArrowRight size={15} /></button>
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
                      <button type="button" className="add-day-card" onClick={() => setActiveView("recipes")}>
                        <span className="add-day-icon"><Plus size={22} /></span>
                        <strong>Make room for one more</strong>
                        <span>Browse recipes to fill your plan</span>
                        <span className="add-day-link">Find a recipe <ArrowRight size={14} /></span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="empty-state"><span><CookingPot size={25} /></span><h3>Your plan is a blank page.</h3><p>Build a plan from your preferences or add a meal from Discover recipes.</p><button className="primary-button" type="button" onClick={generatePlan}>Build a meal plan <ArrowRight size={16} /></button></div>
                )}

                <section className="store-discovery">
                  <div className="store-discovery-copy">
                    <span className="store-icon"><MapPinned size={20} /></span>
                    <div><span className="section-kicker">FROM LIST TO REAL LIFE</span><h3>Now, where should you shop?</h3><p>Explore stores or shopping options around ZIP {preferences.zip || "your area"}. The retailer confirms its own prices, stock and fees.</p></div>
                  </div>
                  <div className="store-link-row">
                    <a className="store-link-card" href={mapsUrl} target="_blank" rel="noreferrer"><span className="store-link-icon"><Store size={17} /></span><span><strong>Nearby stores</strong><small>Map & locations</small></span><ArrowUpRight size={15} /></a>
                    <a className="store-link-card" href={deliveryUrl} target="_blank" rel="noreferrer"><span className="store-link-icon delivery"><Truck size={17} /></span><span><strong>{preferences.mode === "pickup" ? "Pickup options" : "Delivery options"}</strong><small>Compare providers</small></span><ArrowUpRight size={15} /></a>
                  </div>
                </section>
              </>
            )}

            {activeView === "recipes" && (
              <>
                <div className="section-topline">
                  <div><div className="section-kicker">FRESH IDEAS, NOT MORE WORK <span className="kicker-line" /></div><h2>Discover recipes <span className="soft-count">{eligibleRecipes.length}</span></h2><p className="section-description">Filter by your preference, then add meals to your plan.</p></div>
                  <button className="secondary-button" type="button" onClick={() => setActiveView("planner")}><ArrowLeft size={15} /> Back to plan</button>
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
                  <button className="secondary-button" type="button" onClick={downloadList}><ArrowDownToLine size={16} /> Download list</button>
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
                      {lines.map((line) => <CartRow key={line.ingredient.id} line={line} onToggle={() => toggleChecked(line)} onQuantity={(delta) => changeQuantity(line, delta)} detailed />)}
                    </section>;
                  })}
                  {!basketItems.length && <div className="empty-state"><ShoppingBasket size={25} /><h3>No ingredients yet</h3><p>Add a meal to create your shopping list.</p></div>}
                </div>
                <section className="live-prices-card">
                  <div className="live-icon"><Search size={19} /></div>
                  <div className="live-copy"><h3>{liveConfigured ? "Check current Kroger prices" : "Want store-confirmed prices?"}</h3><p>{liveConfigured ? "Search products at a nearby Kroger location for this ZIP code. Product prices are shown separately from the basket estimate." : "Live product lookups are prepared, but a retailer API key must be configured on the deployment. This demo will not guess current prices."}</p></div>
                  <button className="secondary-button" type="button" disabled={!liveConfigured || checkingOffers} onClick={checkLiveOffers}>{checkingOffers ? "Checking…" : liveConfigured ? "Check live prices" : "Not connected"} <ArrowRight size={15} /></button>
                </section>
                {offers.length > 0 && <OffersPanel offers={offers} location={offerLocation} checkedAt={offerCheckedAt} />}
                <ShoppingDestinations mode={preferences.mode} zip={preferences.zip} mapsUrl={mapsUrl} deliveryUrl={deliveryUrl} shoppingUrl={shoppingUrl} />
              </>
            )}
          </div>

          <aside className={"basket-column" + (mobileCartOpen ? " mobile-cart-open" : "")}>
            <div className="basket-panel">
              <div className="basket-heading">
                <div><div className="basket-overline"><span className="basket-pulse" /> YOUR GROCERY LIST</div><h2>The basket <span>{activeItems.length}</span></h2></div>
                <button className="basket-close-mobile" type="button" aria-label="Close basket" onClick={() => setMobileCartOpen(false)}><X size={18} /></button>
                <span className="basket-heading-icon"><ShoppingBasket size={19} /></span>
              </div>

              <div className="basket-budget-block">
                <div className="basket-total-line"><span>Estimated total</span><strong>{formatCurrency(basketTotal)}</strong></div>
                <div className="budget-track"><span style={{ width: progress + "%" }} className={remainingBudget < 0 ? "track-over" : ""} /></div>
                <div className="budget-captions"><span>{formatCurrency(basketTotal)} planned</span><span>{formatCurrency(preferences.budget)} budget</span></div>
                <div className={"budget-left-note " + (remainingBudget < 0 ? "negative" : "")}>{remainingBudget >= 0 ? <><CheckCircle2 size={14} /> {formatCurrency(remainingBudget)} left to spend</> : <><Info size={14} /> {formatCurrency(Math.abs(remainingBudget))} above your budget</>}</div>
              </div>

              <div className="basket-list-heading"><span>INGREDIENTS</span><button type="button" onClick={() => setActiveView("list")}>Full list <ArrowRight size={13} /></button></div>

              {basketItems.length > 0 ? (
                <div className="quick-cart-list">
                  {basketItems.map((line) => <CartRow key={line.ingredient.id} line={line} onToggle={() => toggleChecked(line)} onQuantity={(delta) => changeQuantity(line, delta)} />)}
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
      {mobileCartOpen && <button className="mobile-cart-scrim" type="button" onClick={() => setMobileCartOpen(false)} aria-label="Close shopping basket overlay" />}
      {notice && <div className="toast" role="status"><CheckCircle2 size={17} /><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button></div>}
    </div>
  );
}

function CartRow({
  line,
  onToggle,
  onQuantity,
  detailed = false
}: {
  line: CartLine;
  onToggle: () => void;
  onQuantity: (delta: number) => void;
  detailed?: boolean;
}) {
  return (
    <div className={"cart-row" + (line.checked ? " checked" : "") + (detailed ? " detailed-row" : "")}>
      <button className="cart-check" type="button" aria-label={(line.checked ? "Uncheck " : "Check ") + line.ingredient.name} onClick={onToggle}>
        {line.checked && <Check size={13} />}
      </button>
      <div className="cart-row-copy"><strong>{line.ingredient.name}</strong><span>{line.ingredient.packageLabel}{detailed ? " · needs " + quantityText(line.amountNeeded, line.amountUnit) : ""}</span></div>
      <div className="cart-row-end">
        <strong className="cart-row-price">{formatCurrency(line.cost)}</strong>
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

function ShoppingDestinations({ mode, zip, mapsUrl, deliveryUrl, shoppingUrl }: { mode: ShoppingMode; zip: string; mapsUrl: string; deliveryUrl: string; shoppingUrl: string }) {
  return (
    <section className="destinations-section">
      <div className="section-kicker">TAKE THE NEXT STEP <span className="kicker-line" /></div>
      <h2>From plan to pantry.</h2>
      <p className="section-description">Use your list to compare options. Retailers confirm final prices, stock and service fees.</p>
      <div className="destination-grid">
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="destination-card"><span className="destination-icon green"><MapPinned size={19} /></span><span><strong>Shop nearby</strong><small>Grocery stores near {zip}</small></span><ArrowUpRight size={16} /></a>
        <a href={deliveryUrl} target="_blank" rel="noreferrer" className="destination-card"><span className="destination-icon orange"><Truck size={19} /></span><span><strong>{mode === "pickup" ? "Find pickup" : "Order online"}</strong><small>Explore services by ZIP</small></span><ArrowUpRight size={16} /></a>
        <a href={shoppingUrl} target="_blank" rel="noreferrer" className="destination-card"><span className="destination-icon lavender"><Search size={19} /></span><span><strong>Compare products</strong><small>Open shopping search</small></span><ArrowUpRight size={16} /></a>
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
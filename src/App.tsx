import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check,
  CheckCircle2, ChefHat, Clock3, CookingPot, Heart, Info, Leaf, ListChecks, MapPin, MapPinned, Minus, Plus, Search,
  ShoppingBag, ShoppingBasket, ShoppingCart, SlidersHorizontal, Sparkles,
  Sprout, Store, Truck, Users, Wallet, X, Moon, Sun, MapPinCheck, Trash2, RefreshCw, ShieldCheck
} from "lucide-react";
import { HOUSEHOLD_ITEMS, INGREDIENTS, RECIPES } from "./data";
import { buildBasket, buildHouseholdQuantities, buildPlan, buildShoppingText, buildStorePlanAssignments, estimateRecipeCost, formatCurrency, matchesAllergies, matchesDiet, optimizeStoreStops } from "./lib/planner";
import { DEFAULT_PREFERENCES, DEFAULT_QUIZ_ANSWERS, getAnonymousSessionId, readStored, writeStored } from "./lib/storage";
import type { CartLine, Diet, Ingredient, LiveOffer, Preferences, QuizAnswers, Recipe, ShoppingMode, StoreAssignment, StorePoint, StoreStop, ViewName } from "./types";
import ShoppingQuiz from "./components/ShoppingQuiz";
import ProductIcon from "./components/ProductIcon";

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

function quantityText(amount: number, unit: string): string {
  const rounded = Math.round(amount * 10) / 10;
  return String(rounded) + " " + unit;
}

function CartRow({
  line, onToggle, onQuantity, detailed = false, assignment, suggestedStore, liveChecked = false
}: {
  line: CartLine; onToggle: () => void; onQuantity: (delta: number) => void; detailed?: boolean;
  assignment?: StoreAssignment; suggestedStore?: StorePoint; liveChecked?: boolean;
}) {
  const liveUnitPrice = assignment ? (assignment.promoPrice && assignment.promoPrice > 0 ? assignment.promoPrice : assignment.price) : line.ingredient.price;
  const rowCost = line.quantity * liveUnitPrice;
  return (
    <div className={"cart-row" + (line.checked ? " checked" : "") + (detailed ? " detailed-row" : "")}>
      <button className="cart-check" type="button" aria-label={(line.checked ? "Uncheck " : "Check ") + line.ingredient.name} onClick={onToggle}>
        {line.checked && <Check size={13} />}
      </button>
      <div className="cart-product-thumb">
        {assignment?.imageUrl ? (
          <img src={assignment.imageUrl} alt="" loading="lazy" onError={(event) => {
            const image = event.currentTarget;
            image.style.display = "none";
            const fallback = image.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = "block";
          }} />
        ) : null}
        <span className="cart-product-icon" style={assignment?.imageUrl ? { display: "none" } : undefined}>
          <ProductIcon ingredient={line.ingredient} />
        </span>
      </div>
      <div className="cart-row-copy">
        <strong>{line.ingredient.name}</strong>
        <span>{line.ingredient.packageLabel}{detailed ? " · needs " + quantityText(line.amountNeeded, line.amountUnit) : ""}</span>
        <span className={"cart-store-label" + (assignment ? " matched" : liveChecked ? " unmatched" : "")}>
          {assignment
            ? <><Store size={11}/><span>{assignment.store.name}{assignment.size ? " · " + assignment.size : ""} · live price</span></>
            : suggestedStore
              ? <><MapPin size={11}/><span>{suggestedStore.name} · {liveChecked ? "no live match" : "estimate only"}</span></>
              : liveChecked
                ? <><Info size={11}/><span>No nearby match · estimate</span></>
                : <><MapPin size={11}/><span>Store pending search</span></>}
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

export { CartRow, quantityText, ALL_INGREDIENTS, DIET_OPTIONS, MODE_OPTIONS, readInitialPlan, readInitialPreferences, readInitialQuiz, RouteMap };

export default function App() {
  return <AppFull />;
}

// Load full app implementation
import AppFull from "./AppFull";

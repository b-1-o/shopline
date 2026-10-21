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

// Temporary minimal shell while full App is restored from parts
export default function App() {
  return (
    <div className="app-shell" data-theme="light">
      <div className="page-wrap" style={{ padding: 40 }}>
        <h1 style={{ fontFamily: "Manrope, sans-serif" }}>Shopline</h1>
        <p>Restoring full app… refresh in a moment.</p>
      </div>
    </div>
  );
}

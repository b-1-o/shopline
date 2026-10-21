import type { CSSProperties } from "react";
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check,
  CheckCircle2, ChefHat, Clock3, CookingPot, Heart, Info, Leaf, ListChecks, MapPin, MapPinned, Minus, Plus, Search,
  ShoppingBag, ShoppingBasket, ShoppingCart, SlidersHorizontal, Sparkles,
  Sprout, Store, Truck, Users, Wallet, X, Moon, Sun, MapPinCheck, Trash2, RefreshCw, ShieldCheck
} from "lucide-react";
import type { CartLine, Ingredient, LiveOffer, Recipe, StoreAssignment, StorePoint, StoreStop, ViewName, ShoppingMode, Diet } from "../types";
import ProductIcon from "./ProductIcon";
import { formatCurrency } from "../lib/planner";

function quantityText(amount: number, unit: string): string {
  const rounded = Math.round(amount * 10) / 10;
  return String(rounded) + " " + unit;
}

export function CartRow({
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

export function RotateIcon() {
  return <RefreshCw size={12} />;
}

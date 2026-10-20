import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Heart, MapPin,
  MapPinned, Minus, Plus, ShieldCheck, Sparkles, Store, Truck, Users, Wallet, X
} from "lucide-react";
import { HOUSEHOLD_ITEMS } from "../data";
import type { Diet, ProductGroup, ProfileMode, QuizAnswers, ShoppingMode } from "../types";
import { formatCurrency } from "../lib/planner";

type Coordinates = { latitude: number; longitude: number };
type Props = {
  initial: QuizAnswers;
  onClose: () => void;
  onComplete: (answers: QuizAnswers, coordinates: Coordinates | null) => void;
};

const DIETS: Array<{ value: Diet; label: string; description: string }> = [
  { value: "all", label: "No restrictions", description: "A little bit of everything" },
  { value: "vegetarian", label: "Vegetarian", description: "No meat or fish" },
  { value: "vegan", label: "Vegan", description: "Fully plant-based meals" },
  { value: "dairy-free", label: "Dairy-free", description: "Avoid dairy in recipes" },
  { value: "high-protein", label: "High protein", description: "Prioritize protein-rich meals" }
];
const GROUPS: Array<{ value: ProductGroup; label: string; description: string; glyph: string }> = [
  { value: "food", label: "Food & pantry", description: "Meals, snacks and kitchen basics", glyph: "01" },
  { value: "paper", label: "Paper goods", description: "Toilet paper, towels, tissues, trash bags", glyph: "02" },
  { value: "cleaning", label: "Cleaning & laundry", description: "Dish soap, detergent, sprays, sponges", glyph: "03" },
  { value: "personal-care", label: "Personal care", description: "Toothpaste, shampoo, razors and more", glyph: "04" },
  { value: "baby-pet", label: "Baby & pet supplies", description: "Only include the things relevant to your home", glyph: "05" }
];
const ALLERGIES = [
  { id: "dairy", label: "Dairy" },
  { id: "eggs", label: "Eggs" },
  { id: "gluten", label: "Wheat / gluten" },
  { id: "peanuts", label: "Peanuts" },
  { id: "soy", label: "Soy" },
  { id: "sesame", label: "Sesame" }
];
const MODES: Array<{ value: ShoppingMode; label: string; hint: string }> = [
  { value: "store", label: "Shop in person", hint: "Build an efficient store route" },
  { value: "pickup", label: "Pickup", hint: "Prepare a collection list" },
  { value: "delivery", label: "Delivery", hint: "Plan for online delivery options" }
];

export default function ShoppingQuiz({ initial, onClose, onComplete }: Props) {
  const [draft, setDraft] = useState<QuizAnswers>(() => ({ ...initial, groups: [...initial.groups], allergies: [...initial.allergies], alreadyHave: [...initial.alreadyHave] }));
  const [step, setStep] = useState(0);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [zipError, setZipError] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const visibleHouseholdItems = useMemo(() => HOUSEHOLD_ITEMS.filter((item) => {
    const group = item.kind || "food";
    return draft.groups.includes(group) &&
      (item.householdFor !== "kids" || draft.hasKids) &&
      (item.householdFor !== "pets" || draft.hasPets);
  }), [draft.groups, draft.hasKids, draft.hasPets]);

  const update = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key === "zip") {
      setCoords(null);
      setLocationMessage("");
      setZipError("");
    }
  };

  const toggleGroup = (group: ProductGroup) => {
    if (group === "food") return;
    setDraft((current) => {
      const has = current.groups.includes(group);
      return { ...current, groups: has ? current.groups.filter((item) => item !== group) : [...current.groups, group] };
    });
  };

  const toggleValue = (key: "allergies" | "alreadyHave", value: string) => {
    setDraft((current) => {
      const existing = current[key];
      return { ...current, [key]: existing.includes(value) ? existing.filter((item) => item !== value) : [...existing, value] };
    });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location access isn't supported by this browser. Enter your ZIP code instead.");
      return;
    }
    setLocationBusy(true);
    setLocationMessage("Waiting for your permission…");
    navigator.geolocation.getCurrentPosition(async (position) => {
      const current = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCoords(current);
      setLocationMessage("Location received. Finding your ZIP code…");
      try {
        const url = new URL("https://nominatim.openstreetmap.org/reverse");
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("lat", String(current.latitude));
        url.searchParams.set("lon", String(current.longitude));
        url.searchParams.set("zoom", "10");
        const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Reverse lookup failed");
        const data = await response.json() as { address?: { postcode?: string } };
        const postalCode = data.address?.postcode?.match(/\b\d{5}\b/)?.[0];
        if (postalCode) {
          setDraft((previous) => ({ ...previous, zip: postalCode }));
          setZipError("");
          setLocationMessage("ZIP code found. Your precise coordinates will only be kept for this session.");
        } else {
          setLocationMessage("Location received, but a ZIP code wasn't returned. Enter your ZIP manually to continue.");
        }
      } catch {
        setLocationMessage("Location received, but ZIP lookup failed. Enter your ZIP code manually to continue.");
      } finally {
        setLocationBusy(false);
      }
    }, (error) => {
      setLocationBusy(false);
      setLocationMessage(error.code === error.PERMISSION_DENIED
        ? "Location permission was declined. Enter your ZIP code manually."
        : "We couldn't read your location. Enter your ZIP code manually.");
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 });
  };

  const complete = () => {
    const zip = draft.zip.trim();
    if (!/^\d{5}$/.test(zip)) {
      setZipError("Enter a valid 5-digit ZIP code or use your location.");
      setStep(3);
      return;
    }
    onComplete({ ...draft, zip, budget: Math.max(25, Math.min(2000, draft.budget)) }, coords);
  };

  const next = () => {
    if (step === 3) {
      complete();
      return;
    }
    setStep((current) => Math.min(3, current + 1));
  };

  return (
    <div className="quiz-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="shopping-quiz" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
        <div className="quiz-side-panel">
          <button type="button" className="quiz-brand" onClick={onClose} aria-label="Close shopping quiz">
            <span className="brand-mark"><span className="quiz-brand-glyph">S</span></span>
            <span>shopline<span>.</span></span>
          </button>
          <div className="quiz-side-copy">
            <span className="quiz-kicker"><Sparkles size={13} /> A MORE PERSONAL SHOP</span>
            <h2>Good plans start<br/>with <em>your real life.</em></h2>
            <p>We’ll build one practical shopping list from your meals, household basics and budget — not just a page of recipes.</p>
          </div>
          <div className="quiz-step-list">
            {[
              { title: "Household & budget", sub: "People, period, spend" },
              { title: "Food preferences", sub: "Diet and ingredients to avoid" },
              { title: "Home essentials", sub: "Paper, care and cleaning" },
              { title: "Location & routine", sub: "Where and how you shop" }
            ].map((item, index) => (
              <div className={"quiz-step-item" + (index === step ? " active" : "") + (index < step ? " complete" : "")} key={item.title}>
                <span className="quiz-step-number">{index < step ? <Check size={14}/> : String(index + 1).padStart(2, "0")}</span>
                <span><strong>{item.title}</strong><small>{item.sub}</small></span>
              </div>
            ))}
          </div>
          <div className="quiz-side-note"><ShieldCheck size={15}/><span>No account required. Your saved household stays in this browser during beta.</span></div>
        </div>

        <div className="quiz-main">
          <div className="quiz-topline">
            <div><span className="quiz-main-kicker">SHOPPING BRIEF · {String(step + 1).padStart(2, "0")} / 04</span><div className="quiz-progress"><span style={{ width: ((step + 1) / 4 * 100) + "%" }}/></div></div>
            <button type="button" className="quiz-close" onClick={onClose} aria-label="Close quiz"><X size={18}/></button>
          </div>

          {step === 0 && (
            <div className="quiz-step-content" key="step-household">
              <span className="quiz-section-overline">FIRST, THE BIG PICTURE</span>
              <h1 id="quiz-title">Who are we shopping for?</h1>
              <p className="quiz-lead">Set the basics. We’ll size quantities to your household and the days you’re planning for.</p>
              <div className="quiz-field-block">
                <div className="quiz-label-row"><span className="quiz-label"><Heart size={15}/> PEOPLE AT HOME</span><span className="quiz-hint">Adults, children or guests</span></div>
                <div className="quiz-counter">
                  <div><strong>{draft.servings}</strong><span>{draft.servings === 1 ? "person" : "people"}</span></div>
                  <div className="quiz-counter-actions">
                    <button type="button" aria-label="Fewer people" disabled={draft.servings <= 1} onClick={() => update("servings", Math.max(1, draft.servings - 1))}><Minus size={16}/></button>
                    <button type="button" aria-label="More people" disabled={draft.servings >= 12} onClick={() => update("servings", Math.min(12, draft.servings + 1))}><Plus size={16}/></button>
                  </div>
                </div>
              </div>
              <div className="quiz-field-block">
                <div className="quiz-label-row"><span className="quiz-label"><Clock3 size={15}/> HOW FAR AHEAD?</span><span className="quiz-hint">Dinner ideas + essentials</span></div>
                <div className="quiz-option-row">
                  {([3, 5, 7] as const).map((days) => <button type="button" key={days} className={"quiz-choice-card" + (draft.days === days ? " selected" : "")} onClick={() => update("days", days)}>
                    <strong>{days}</strong><span>{days === 3 ? "A few days" : days === 5 ? "Work week" : "Full week"}</span>{draft.days === days && <CheckCircle2 size={15}/>}
                  </button>)}
                </div>
              </div>
              <div className="quiz-field-block">
                <div className="quiz-label-row"><span className="quiz-label"><Wallet size={15}/> TOTAL SHOPPING BUDGET</span><strong className="quiz-budget-number">{formatCurrency(draft.budget)}</strong></div>
                <input className="quiz-budget-range" type="range" min="25" max="2000" step="25" value={draft.budget} onChange={(event) => update("budget", Number(event.target.value))} style={{ "--range-progress": ((draft.budget - 25) / 1975 * 100) + "%" } as CSSProperties} aria-label="Total household shopping budget"/>
                <div className="quiz-budget-row"><span>$25</span><label className="quiz-budget-input"><span>$</span><input aria-label="Enter exact budget" type="number" min="25" max="2000" step="25" value={draft.budget} onChange={(event) => update("budget", Math.max(25, Math.min(2000, Number(event.target.value) || 25)))}/></label><span>$2,000+</span></div>
                <p className="quiz-helper">This budget includes groceries and the extra household categories you select next.</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="quiz-step-content" key="step-food">
              <span className="quiz-section-overline">MAKE THE LIST FIT YOU</span>
              <h1 id="quiz-title">What works at your table?</h1>
              <p className="quiz-lead">Choose a general food preference and flag ingredients you need to avoid. We’ll filter recipe suggestions accordingly.</p>
              <div className="quiz-field-block">
                <span className="quiz-label">HOW DO YOU EAT?</span>
                <div className="quiz-diet-grid">
                  {DIETS.map((diet) => <button type="button" key={diet.value} className={"quiz-diet-card" + (draft.diet === diet.value ? " selected" : "")} onClick={() => update("diet", diet.value)}>
                    <span className="quiz-diet-check">{draft.diet === diet.value ? <Check size={13}/> : null}</span><strong>{diet.label}</strong><small>{diet.description}</small>
                  </button>)}
                </div>
              </div>
              <div className="quiz-field-block">
                <div className="quiz-label-row"><span className="quiz-label">INGREDIENTS TO AVOID</span><span className="quiz-hint">You can select more than one</span></div>
                <div className="quiz-chip-group">
                  {ALLERGIES.map((allergy) => <button type="button" key={allergy.id} className={"quiz-chip" + (draft.allergies.includes(allergy.id) ? " selected" : "")} onClick={() => toggleValue("allergies", allergy.id)}>
                    {draft.allergies.includes(allergy.id) ? <Check size={13}/> : <Plus size={13}/>} {allergy.label}
                  </button>)}
                </div>
                <p className="quiz-helper">These filters apply to Shopline’s recipe suggestions, not to medical advice. Always verify ingredient labels on the product.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="quiz-step-content" key="step-essentials">
              <span className="quiz-section-overline">MORE THAN JUST DINNER</span>
              <h1 id="quiz-title">What does your home need?</h1>
              <p className="quiz-lead">Add the everyday things that are easy to forget. Items you already have can be excluded from the list.</p>
              <div className="quiz-group-grid">
                {GROUPS.map((group) => {
                  const selected = draft.groups.includes(group.value);
                  const locked = group.value === "food";
                  const inactiveBabyPet = group.value === "baby-pet" && !draft.hasKids && !draft.hasPets;
                  return <button type="button" key={group.value} disabled={inactiveBabyPet} className={"quiz-group-card" + (selected ? " selected" : "")} onClick={() => toggleGroup(group.value)}>
                    <span className="quiz-group-number">{group.glyph}</span><span className="quiz-group-copy"><strong>{group.label}</strong><small>{inactiveBabyPet ? "Enable kids or pets below first" : group.description}</small></span>
                    <span className="quiz-group-check">{selected ? <Check size={15}/> : <Plus size={15}/>}</span>
                    {locked && <span className="quiz-required-pill">Included</span>}
                  </button>;
                })}
              </div>
              <div className="quiz-household-toggles">
                <label className={"quiz-toggle-card" + (draft.hasKids ? " selected" : "")}><input type="checkbox" checked={draft.hasKids} onChange={(event) => update("hasKids", event.target.checked)}/><span><strong>Small children / baby</strong><small>Show nappies and wipes</small></span></label>
                <label className={"quiz-toggle-card" + (draft.hasPets ? " selected" : "")}><input type="checkbox" checked={draft.hasPets} onChange={(event) => update("hasPets", event.target.checked)}/><span><strong>Pets at home</strong><small>Show pet food and litter</small></span></label>
              </div>
              {visibleHouseholdItems.length > 0 && (
                <details className="quiz-already-have">
                  <summary><span>I already have some of these</span><span>{draft.alreadyHave.length} excluded <ArrowRight size={14}/></span></summary>
                  <p>Tick things you don’t need to buy this time.</p>
                  <div className="quiz-pantry-grid">
                    {visibleHouseholdItems.map((item) => <label key={item.id} className="quiz-pantry-item"><input type="checkbox" checked={draft.alreadyHave.includes(item.id)} onChange={() => toggleValue("alreadyHave", item.id)}/><span>{item.name}</span></label>)}
                  </div>
                </details>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="quiz-step-content" key="step-location">
              <span className="quiz-section-overline">LET’S MAKE IT ACTIONABLE</span>
              <h1 id="quiz-title">Where do you want to shop?</h1>
              <p className="quiz-lead">Your ZIP helps us find nearby Kroger locations and compare current product prices. You’re in control of location sharing.</p>
              <div className="quiz-field-block">
                <span className="quiz-label"><MapPin size={15}/> SHOPPING AREA</span>
                <div className={"quiz-zip-row" + (zipError ? " invalid" : "")}>
                  <MapPinned size={18}/>
                  <input autoComplete="postal-code" inputMode="numeric" maxLength={5} value={draft.zip} placeholder="Enter 5-digit ZIP code" onChange={(event) => update("zip", event.target.value.replace(/\D/g, "").slice(0, 5))} aria-label="Shopping ZIP code"/>
                  <button type="button" className="quiz-location-button" onClick={useMyLocation} disabled={locationBusy}>{locationBusy ? <span className="mini-spinner"/> : <MapPin size={14}/>} {locationBusy ? "Finding…" : "Use my location"}</button>
                </div>
                {zipError && <p className="quiz-error">{zipError}</p>}
                {locationMessage && <p className={"quiz-location-message" + (coords ? " success" : "")}>{locationMessage}</p>}
                <p className="quiz-helper">Your browser will ask permission. Precise coordinates are held only for this session; they are not saved to the household profile.</p>
              </div>
              <div className="quiz-field-block">
                <span className="quiz-label">HOW WOULD YOU LIKE TO SHOP?</span>
                <div className="quiz-mode-grid">
                  {MODES.map((mode) => <button type="button" key={mode.value} className={"quiz-mode-card" + (draft.mode === mode.value ? " selected" : "")} onClick={() => update("mode", mode.value)}>
                    <span className="quiz-mode-icon">{mode.value === "store" ? <Store size={18}/> : mode.value === "pickup" ? <MapPinned size={18}/> : <Truck size={18}/>}</span><strong>{mode.label}</strong><small>{mode.hint}</small>{draft.mode === mode.value && <CheckCircle2 size={15} className="quiz-mode-check"/>}
                  </button>)}
                </div>
              </div>
              <div className="quiz-field-block">
                <span className="quiz-label">HOW SHOULD WE REMEMBER THIS?</span>
                <div className="quiz-memory-grid">
                  <button type="button" className={"quiz-memory-card" + (draft.profileMode === "remember" ? " selected" : "")} onClick={() => update("profileMode", "remember" as ProfileMode)}>
                    <span className="quiz-memory-icon"><Heart size={17}/></span><span><strong>Remember my household</strong><small>Save preferences on this device for the next regular shop.</small></span>{draft.profileMode === "remember" && <CheckCircle2 size={16}/>}
                  </button>
                  <button type="button" className={"quiz-memory-card" + (draft.profileMode === "ask" ? " selected" : "")} onClick={() => update("profileMode", "ask" as ProfileMode)}>
                    <span className="quiz-memory-icon"><Users size={17}/></span><span><strong>Ask me every time</strong><small>Best for guests, changing plans or a different household.</small></span>{draft.profileMode === "ask" && <CheckCircle2 size={16}/>}
                  </button>
                </div>
                <p className="quiz-helper">Account sync is not enabled in this beta. Remembering your household saves it locally in this browser only.</p>
              </div>
            </div>
          )}

          <div className="quiz-footer">
            <button className="quiz-back-button" type="button" onClick={() => step === 0 ? onClose() : setStep((current) => current - 1)}><ArrowLeft size={15}/> {step === 0 ? "Not now" : "Back"}</button>
            <div className="quiz-footer-right"><span>{step + 1} of 4</span><button className="primary-button quiz-next-button" type="button" onClick={next}>{step === 3 ? "Build my shopping list" : "Continue"} <ArrowRight size={16}/></button></div>
          </div>
        </div>
      </section>
    </div>
  );
}
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const HIST =
  "https://raw.githubusercontent.com/b-1-o/shopline/bafcb236ec5a9b077c7b69b7adf5331818f51f6a/src/App.tsx";

const res = await fetch(HIST);
if (!res.ok) {
  throw new Error("Failed to fetch historical App.tsx: " + res.status);
}
let text = await res.text();

// Wire ProductIcon SVG thumbs instead of Unsplash fallbacks
if (!text.includes("ProductIcon")) {
  text = text.replace(
    'import ShoppingQuiz from "./components/ShoppingQuiz";',
    'import ShoppingQuiz from "./components/ShoppingQuiz";\nimport ProductIcon from "./components/ProductIcon";'
  );
}

const oldThumb = `      <div className="cart-product-thumb">
        <img src={assignment?.imageUrl || productFallbackImage(line.ingredient)} alt="" loading="lazy" onError={(event) => { const image = event.currentTarget; if (image.dataset.fallback !== "true") { image.dataset.fallback = "true"; image.src = GENERIC_PRODUCT_IMAGE; } }} />
      </div>`;

const newThumb = `      <div className="cart-product-thumb">
        {assignment?.imageUrl ? (
          <img
            src={assignment.imageUrl}
            alt=""
            loading="lazy"
            onError={(event) => {
              const image = event.currentTarget;
              image.style.display = "none";
              const fallback = image.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "block";
            }}
          />
        ) : null}
        <span className="cart-product-icon" style={assignment?.imageUrl ? { display: "none" } : undefined}>
          <ProductIcon ingredient={line.ingredient} />
        </span>
      </div>`;

if (text.includes(oldThumb)) {
  text = text.replace(oldThumb, newThumb);
} else {
  console.warn("cart-product-thumb block not found — ProductIcon may not be wired");
}

// Drop Unsplash fallback helpers if present
text = text.replace(
  /const GENERIC_PRODUCT_IMAGE = "https:\/\/images\.unsplash\.com[^" ]+";\n\nfunction productFallbackImage\(ingredient: Ingredient\): string \{[\s\S]*?\n\}\n\n/,
  ""
);

// Shopline UX refresh: address-first store discovery and fast recipe search.
const replaceRequired = (before, after, label) => { if (!text.includes(before)) throw new Error("Shopline patch target missing: " + label); text = text.replace(before, after); };
const mapRender = /\{preferences\.mode === "store" \? \([\s\S]*?<RouteMap[\s\S]*?<\/Suspense>\s*\)\s*:\s*\([\s\S]*?<RouteMap[\s\S]*?<\/Suspense>\s*\)\}\s*/;
const addressPanel = "<section className=\"store-address-panel\" aria-label=\"Nearby store addresses\">\n  <div className=\"store-address-panel-head\">\n    <span className=\"store-address-panel-icon\"><Store size={20}/></span>\n    <div>\n      <span className=\"section-kicker\">YOUR SHOPPING STOPS <span className=\"kicker-line\"/></span>\n      <h3>Addresses first. No map required.</h3>\n      <p>Store addresses stay visible without waiting for map tiles. Tap Directions when you are ready to leave.</p>\n    </div>\n  </div>\n  <div className=\"store-address-quicklist\">\n    {(routeStops.length ? routeStops : storeLocations).slice(0, 3).map((store, index) => (\n      <a className=\"store-address-quickitem\" key={store.id} href={\"https://www.google.com/maps/dir/?api=1&destination=\" + encodeURIComponent((store.address || store.name) + (preferences.zip ? \" \" + preferences.zip : \"\"))} target=\"_blank\" rel=\"noopener noreferrer\">\n        <span className=\"store-address-order\">{String(index + 1).padStart(2, \"0\")}</span>\n        <span className=\"store-address-text\"><strong>{store.name}</strong><small>{store.address || \"Address unavailable\"}{typeof store.distance === \"number\" ? \" · \" + store.distance.toFixed(1) + \" mi away\" : \"\"}</small></span>\n        <span className=\"store-address-directions\">Directions <ArrowUpRight size={13}/></span>\n      </a>\n    ))}\n  </div>\n</section>";
if (!mapRender.test(text)) throw new Error("Shopline patch target missing: interactive map block");
text = text.replace(mapRender, addressPanel);
text = text.replace('import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";', 'import { useEffect, useMemo, useRef, useState } from "react";');
text = text.replace('const RouteMap = lazy(() => import("./components/RouteMap"));\n', "");
replaceRequired('const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);', 'const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);\n  const [recipeQuery, setRecipeQuery] = useState("");', "recipe search state");
replaceRequired('const visibleRecipes = activeView === "recipes" ? eligibleRecipes : selectedRecipes;', 'const visibleRecipes = activeView === "recipes" ? eligibleRecipes.filter((recipe) => { const query = recipeQuery.trim().toLowerCase(); if (!query) return true; return recipe.title.toLowerCase().includes(query) || recipe.description.toLowerCase().includes(query) || recipe.tags.some((tag) => tag.toLowerCase().includes(query)) || recipe.ingredients.some((row) => INGREDIENTS.find((ingredient) => ingredient.id === row.ingredientId)?.name.toLowerCase().includes(query)); }) : selectedRecipes;', "recipe filter");
replaceRequired('<div className="recipe-filter-note"><Leaf size={15} /><span>Showing <strong>{DIET_OPTIONS.find((item) => item.value === preferences.diet)?.label.toLowerCase()}</strong> ideas</span><button type="button" onClick={() => setPreference("diet", "all")}>Clear filter <X size={13} /></button></div>', '<div className="recipe-filter-note"><Leaf size={15} /><span>Showing <strong>{DIET_OPTIONS.find((item) => item.value === preferences.diet)?.label.toLowerCase()}</strong> ideas</span><button type="button" onClick={() => setPreference("diet", "all")}>Clear filter <X size={13} /></button></div>\n                RECIPE_SEARCH_BAR_PLACEHOLDER', "recipe search field");
text = text.replace("RECIPE_SEARCH_BAR_PLACEHOLDER", "<div className=\"recipe-search-row\">\n  <label className=\"recipe-search-field\">\n    <Search size={18} aria-hidden=\"true\"/>\n    <input type=\"search\" value={recipeQuery} onChange={(event) => setRecipeQuery(event.target.value)} placeholder=\"Search recipes or ingredients…\" aria-label=\"Search recipes and ingredients\"/>\n    {recipeQuery && <button type=\"button\" onClick={() => setRecipeQuery(\"\")} aria-label=\"Clear recipe search\"><X size={15}/></button>}\n  </label>\n  <span className=\"recipe-result-count\"><strong>{visibleRecipes.length}</strong> recipes</span>\n</div>");
replaceRequired('<h2>Discover recipes <span className="soft-count">{eligibleRecipes.length}</span></h2>', '<h2>Discover recipes <span className="soft-count">{visibleRecipes.length}</span></h2>', "recipe result count");
replaceRequired("                <div className=\"recipe-grid recipe-discovery-grid\">\n                  {visibleRecipes.map((recipe, index) => (\n                    <div className=\"discovery-recipe-wrap\" key={recipe.id}>\n                      <span className=\"discovery-index\">{String(index + 1).padStart(2, \"0\")}</span>\n                      <RecipeCard recipe={recipe} selected={selectedIds.includes(recipe.id)} servings={preferences.servings} onToggle={() => toggleRecipe(recipe)} onDetails={() => setDetailRecipe(recipe)} />\n                    </div>\n                  ))}\n                </div>", "                <div className=\"recipe-grid recipe-discovery-grid\">\n                  {visibleRecipes.map((recipe, index) => (\n                    <div className=\"discovery-recipe-wrap\" key={recipe.id}>\n                      <span className=\"discovery-index\">{String(index + 1).padStart(2, \"0\")}</span>\n                      <RecipeCard recipe={recipe} selected={selectedIds.includes(recipe.id)} servings={preferences.servings} onToggle={() => toggleRecipe(recipe)} onDetails={() => setDetailRecipe(recipe)} />\n                    </div>\n                  ))}\n                </div>\n                {visibleRecipes.length === 0 && <div className=\"empty-state recipe-empty-state\"><span><ChefHat size={25}/></span><h3>No recipes found</h3><p>Try a different recipe name or ingredient.</p><button className=\"secondary-button\" type=\"button\" onClick={() => setRecipeQuery(\"\")}>Clear search</button></div>}", "recipe empty state");
replaceRequired('const [quizOpen, setQuizOpen] = useState(() => readStored<QuizAnswers | null>("household-profile", null) === null);', 'const [quizOpen, setQuizOpen] = useState(false);', "quick start without blocking modal");
replaceRequired('            <button className="secondary-button" type="button" onClick={openQuiz}><SlidersHorizontal size={15}/> {householdProfile ? "Adjust for guests" : "Take the shopping quiz"}</button>', '<button className="secondary-button quick-list-button" type="button" onClick={() => applyQuizAnswers(quizAnswers, sharedLocation)}><CheckCircle2 size={15}/> Quick list · use current settings</button>\n            <button className="secondary-button" type="button" onClick={openQuiz}><SlidersHorizontal size={15}/> {householdProfile ? "Adjust for guests" : "Take the shopping quiz"}</button>', "instant shopping list button");
text = text.replace('{liveSearchComplete && (routeStops.length > 0 || storeLocations.some((store) => typeof store.latitude === "number" && typeof store.longitude === "number")) && (', '{liveSearchComplete && (routeStops.length > 0 || storeLocations.length > 0) && (');
replaceRequired('<div className="route-stop-title"><div><h4>{stop.name}</h4><p>{stop.address || "Address not provided by the store API"}</p></div><strong>{formatCurrency(stop.subtotal)}</strong></div>', '<div className="route-stop-title"><div><h4>{stop.name}</h4><p>{stop.address || "Address not provided by the store API"}</p><a className="store-directions-link" href={"https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent((stop.address || stop.name) + (preferences.zip ? " " + preferences.zip : ""))} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={13}/> Directions</a></div><strong>{formatCurrency(stop.subtotal)}</strong></div>', "route stop directions");
replaceRequired('<div className="nearby-location-grid">{storeLocations.map((store) => <article className="nearby-location-card" key={store.id}><span className="nearby-location-icon"><Store size={17}/></span><span><strong>{store.name}</strong><small>{store.address || "Address unavailable"}{typeof store.distance === "number" ? " · " + store.distance.toFixed(1) + " mi away" : ""}</small></span>{routeStops.some((stop) => stop.id === store.id) ? <span className="location-status matched">On route</span> : <span className="location-status">Nearby</span>}</article>)}</div>', '<div className="nearby-location-grid">{storeLocations.map((store) => <article className="nearby-location-card" key={store.id}><span className="nearby-location-icon"><Store size={17}/></span><span><strong>{store.name}</strong><small>{store.address || "Address unavailable"}{typeof store.distance === "number" ? " · " + store.distance.toFixed(1) + " mi away" : ""}</small><a className="store-directions-link" href={"https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent((store.address || store.name) + (preferences.zip ? " " + preferences.zip : ""))} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={12}/> Directions</a></span>{routeStops.some((stop) => stop.id === store.id) ? <span className="location-status matched">On route</span> : <span className="location-status">Nearby</span>}</article>)}</div>', "nearby address directions");
text = text.replace("Nearby shopping locations", "Store addresses near you");
text = text.replace("Other items are assigned to a nearby mapped shop for planning only", "Other items are assigned to a nearby store for planning only");
text = text.replace("your list and map are still available.", "your shopping list is still available.");



writeFileSync(join(root, "src/AppFull.tsx"), text);
console.log("restored AppFull.tsx", text.length, "bytes (full shops/routes/location + SVG icons)");

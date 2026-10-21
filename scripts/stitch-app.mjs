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

writeFileSync(join(root, "src/AppFull.tsx"), text);
console.log("restored AppFull.tsx", text.length, "bytes (full shops/routes/location + SVG icons)");

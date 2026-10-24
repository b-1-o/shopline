import type { Ingredient, Recipe } from "./types";

export const INGREDIENTS: Ingredient[] = [
  { id: "chickpeas", name: "Chickpeas", category: "Canned & dry goods", price: 1.19, packSize: 1, unit: "can", packageLabel: "15 oz can" },
  { id: "feta", name: "Feta cheese", category: "Dairy & eggs", price: 3.49, packSize: 6, unit: "oz", packageLabel: "6 oz pack" },
  { id: "cucumber", name: "Cucumber", category: "Produce", price: 0.99, packSize: 1, unit: "each", packageLabel: "1 cucumber" },
  { id: "tomatoes", name: "Cherry tomatoes", category: "Produce", price: 2.99, packSize: 10, unit: "oz", packageLabel: "10 oz pack" },
  { id: "lemon", name: "Lemon", category: "Produce", price: 0.69, packSize: 1, unit: "each", packageLabel: "1 lemon" },
  { id: "quinoa", name: "Quinoa", category: "Canned & dry goods", price: 4.49, packSize: 12, unit: "oz", packageLabel: "12 oz bag" },
  { id: "black-beans", name: "Black beans", category: "Canned & dry goods", price: 1.09, packSize: 1, unit: "can", packageLabel: "15 oz can" },
  { id: "tortillas", name: "Corn tortillas", category: "Bakery & grains", price: 2.49, packSize: 10, unit: "each", packageLabel: "10-count pack" },
  { id: "avocado", name: "Avocado", category: "Produce", price: 1.49, packSize: 1, unit: "each", packageLabel: "1 avocado" },
  { id: "salsa", name: "Salsa", category: "Canned & dry goods", price: 2.79, packSize: 16, unit: "oz", packageLabel: "16 oz jar" },
  { id: "chicken", name: "Chicken breast", category: "Meat & alternatives", price: 6.99, packSize: 1, unit: "lb", packageLabel: "approx. 1 lb" },
  { id: "broccoli", name: "Broccoli", category: "Produce", price: 2.29, packSize: 1, unit: "head", packageLabel: "1 head" },
  { id: "potatoes", name: "Baby potatoes", category: "Produce", price: 3.49, packSize: 24, unit: "oz", packageLabel: "1.5 lb bag" },
  { id: "noodles", name: "Rice noodles", category: "Bakery & grains", price: 3.49, packSize: 8, unit: "oz", packageLabel: "8 oz pack" },
  { id: "peanut-butter", name: "Peanut butter", category: "Canned & dry goods", price: 2.79, packSize: 16, unit: "oz", packageLabel: "16 oz jar" },
  { id: "carrots", name: "Carrots", category: "Produce", price: 1.49, packSize: 16, unit: "oz", packageLabel: "1 lb bag" },
  { id: "cabbage", name: "Shredded cabbage", category: "Produce", price: 2.49, packSize: 10, unit: "oz", packageLabel: "10 oz bag" },
  { id: "pasta", name: "Pasta", category: "Bakery & grains", price: 1.79, packSize: 16, unit: "oz", packageLabel: "16 oz box" },
  { id: "marinara", name: "Marinara sauce", category: "Canned & dry goods", price: 2.49, packSize: 24, unit: "oz", packageLabel: "24 oz jar" },
  { id: "parmesan", name: "Parmesan", category: "Dairy & eggs", price: 3.99, packSize: 5, unit: "oz", packageLabel: "5 oz tub" },
  { id: "lentils", name: "Red lentils", category: "Canned & dry goods", price: 2.49, packSize: 16, unit: "oz", packageLabel: "1 lb bag" },
  { id: "coconut-milk", name: "Coconut milk", category: "Canned & dry goods", price: 2.19, packSize: 13.5, unit: "oz", packageLabel: "13.5 oz can" },
  { id: "curry-paste", name: "Curry paste", category: "Canned & dry goods", price: 3.49, packSize: 4, unit: "oz", packageLabel: "4 oz jar" },
  { id: "rice", name: "Long-grain rice", category: "Bakery & grains", price: 3.49, packSize: 32, unit: "oz", packageLabel: "2 lb bag" },
  { id: "eggs", name: "Eggs", category: "Dairy & eggs", price: 4.29, packSize: 12, unit: "each", packageLabel: "12-count carton" },
  { id: "peas", name: "Frozen peas", category: "Frozen", price: 1.79, packSize: 12, unit: "oz", packageLabel: "12 oz bag" },
  { id: "spinach", name: "Baby spinach", category: "Produce", price: 2.49, packSize: 5, unit: "oz", packageLabel: "5 oz bag" },
  { id: "ground-turkey", name: "Ground turkey", category: "Meat & alternatives", price: 5.49, packSize: 1, unit: "lb", packageLabel: "1 lb pack" },
  { id: "onion", name: "Yellow onion", category: "Produce", price: 0.89, packSize: 1, unit: "each", packageLabel: "1 onion" },
  { id: "bell-pepper", name: "Bell pepper", category: "Produce", price: 1.29, packSize: 1, unit: "each", packageLabel: "1 pepper" },
  { id: "tofu", name: "Firm tofu", category: "Meat & alternatives", price: 2.49, packSize: 14, unit: "oz", packageLabel: "14 oz block" },
  { id: "edamame", name: "Shelled edamame", category: "Frozen", price: 2.99, packSize: 12, unit: "oz", packageLabel: "12 oz bag" },
  { id: "greek-yogurt", name: "Greek yogurt", category: "Dairy & eggs", price: 4.49, packSize: 32, unit: "oz", packageLabel: "32 oz tub" },
  { id: "garlic", name: "Garlic", category: "Produce", price: 0.69, packSize: 1, unit: "head", packageLabel: "1 bulb" },
  { id: "olive-oil", name: "Olive oil", category: "Pantry staples", price: 0, packSize: 1, unit: "bottle", packageLabel: "pantry staple", pantry: true },
  { id: "soy-sauce", name: "Soy sauce", category: "Pantry staples", price: 0, packSize: 1, unit: "bottle", packageLabel: "pantry staple", pantry: true },
  { id: "sesame-oil", name: "Sesame oil", category: "Pantry staples", price: 0, packSize: 1, unit: "bottle", packageLabel: "pantry staple", pantry: true },
  { id: "vinegar", name: "Rice vinegar", category: "Pantry staples", price: 0, packSize: 1, unit: "bottle", packageLabel: "pantry staple", pantry: true },
  { id: "spices", name: "Salt, pepper & spices", category: "Pantry staples", price: 0, packSize: 1, unit: "set", packageLabel: "pantry staple", pantry: true }
];

export const RECIPES: Recipe[] = [
  {
    id: "chickpea-bowls", title: "Herby chickpea & feta bowls",
    description: "Bright lemon, crunchy cucumber and creamy feta over fluffy quinoa.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82",
    minutes: 20, servings: 2, tags: ["Fresh", "No-fuss"], dietTags: ["vegetarian", "high-protein"], accent: "sage", calories: 465,
    ingredients: [
      { ingredientId: "chickpeas", amount: 1, unit: "can" }, { ingredientId: "feta", amount: 3, unit: "oz" },
      { ingredientId: "cucumber", amount: 1, unit: "each" }, { ingredientId: "tomatoes", amount: 5, unit: "oz" },
      { ingredientId: "lemon", amount: 1, unit: "each" }, { ingredientId: "quinoa", amount: 4, unit: "oz" },
      { ingredientId: "olive-oil", amount: 0.1, unit: "bottle" }, { ingredientId: "spices", amount: 1, unit: "set" }
    ],
    steps: ["Rinse the quinoa and simmer until fluffy, then leave covered for five minutes.", "Drain the chickpeas and toss with lemon zest, lemon juice, olive oil and spices.", "Dice the cucumber and halve the tomatoes. Fold into the warm quinoa.", "Finish with crumbled feta, fresh lemon and black pepper."]
  },
  {
    id: "black-bean-tacos", title: "Smoky black bean tacos",
    description: "Crispy-edged beans, salsa, avocado and warm corn tortillas.",
    image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=82",
    minutes: 18, servings: 2, tags: ["Budget hero", "Vegetarian"], dietTags: ["vegan", "vegetarian", "dairy-free"], accent: "peach", calories: 410,
    ingredients: [
      { ingredientId: "black-beans", amount: 2, unit: "can" }, { ingredientId: "tortillas", amount: 6, unit: "each" },
      { ingredientId: "avocado", amount: 1, unit: "each" }, { ingredientId: "salsa", amount: 4, unit: "oz" },
      { ingredientId: "onion", amount: 0.5, unit: "each" }, { ingredientId: "spices", amount: 1, unit: "set" },
      { ingredientId: "olive-oil", amount: 0.05, unit: "bottle" }
    ],
    steps: ["Warm a little oil in a skillet and soften the sliced onion.", "Add drained black beans and spices; cook until the edges are lightly crisp.", "Char the tortillas in a dry pan for 20–30 seconds per side.", "Fill with beans, salsa and sliced avocado. Add lime or hot sauce if you have it."]
  },
  {
    id: "lemon-chicken", title: "Sheet-pan lemon chicken",
    description: "Golden chicken and tender broccoli roast together for easy cleanup.",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=82",
    minutes: 35, servings: 2, tags: ["One pan", "High protein"], dietTags: ["high-protein", "dairy-free"], accent: "gold", calories: 520,
    ingredients: [
      { ingredientId: "chicken", amount: 1, unit: "lb" }, { ingredientId: "broccoli", amount: 1, unit: "head" },
      { ingredientId: "potatoes", amount: 16, unit: "oz" }, { ingredientId: "lemon", amount: 1, unit: "each" },
      { ingredientId: "garlic", amount: 1, unit: "head" }, { ingredientId: "olive-oil", amount: 0.1, unit: "bottle" },
      { ingredientId: "spices", amount: 1, unit: "set" }
    ],
    steps: ["Heat the oven to 425°F (220°C). Cut potatoes into small chunks.", "Toss potatoes and broccoli with oil, minced garlic, lemon zest and seasoning.", "Add seasoned chicken to the pan and roast until cooked through, about 22–28 minutes.", "Squeeze lemon over everything and rest the chicken briefly before serving."]
  },
  {
    id: "peanut-noodles", title: "Peanut noodle crunch bowls",
    description: "Cold rice noodles, crunchy veg and a tangy peanut dressing.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=82",
    minutes: 20, servings: 2, tags: ["Meal-prep friendly", "Plant-based"], dietTags: ["vegan", "vegetarian", "dairy-free"], accent: "sage", calories: 490,
    ingredients: [
      { ingredientId: "noodles", amount: 6, unit: "oz" }, { ingredientId: "peanut-butter", amount: 2, unit: "oz" },
      { ingredientId: "carrots", amount: 6, unit: "oz" }, { ingredientId: "cabbage", amount: 5, unit: "oz" },
      { ingredientId: "soy-sauce", amount: 0.05, unit: "bottle" }, { ingredientId: "sesame-oil", amount: 0.02, unit: "bottle" },
      { ingredientId: "vinegar", amount: 0.02, unit: "bottle" }
    ],
    steps: ["Cook noodles following the package directions, then rinse under cool water.", "Whisk peanut butter with soy sauce, rice vinegar, sesame oil and warm water.", "Slice the carrots thinly and toss with the shredded cabbage.", "Mix noodles and vegetables with dressing. Add water a spoon at a time to loosen."]
  },
  {
    id: "tomato-pasta", title: "Tomato basil pasta",
    description: "A weeknight classic with rich tomato sauce and a little parmesan.",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=82",
    minutes: 22, servings: 2, tags: ["Comfort food", "Quick"], dietTags: ["vegetarian"], accent: "peach", calories: 505,
    ingredients: [
      { ingredientId: "pasta", amount: 7, unit: "oz" }, { ingredientId: "marinara", amount: 12, unit: "oz" },
      { ingredientId: "parmesan", amount: 1.5, unit: "oz" }, { ingredientId: "spinach", amount: 2, unit: "oz" },
      { ingredientId: "garlic", amount: 0.5, unit: "head" }, { ingredientId: "olive-oil", amount: 0.05, unit: "bottle" }
    ],
    steps: ["Boil salted water and cook pasta until just al dente; reserve a mug of pasta water.", "Warm olive oil and minced garlic in a pan, then pour in the marinara.", "Fold in spinach until wilted. Add pasta and a splash of pasta water.", "Serve with grated parmesan and black pepper."]
  },
  {
    id: "lentil-curry", title: "Golden coconut lentil curry",
    description: "A comforting, one-pot curry with red lentils and creamy coconut milk.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=82",
    minutes: 30, servings: 2, tags: ["One pot", "Freezer friendly"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "gold", calories: 475,
    ingredients: [
      { ingredientId: "lentils", amount: 6, unit: "oz" }, { ingredientId: "coconut-milk", amount: 13.5, unit: "oz" },
      { ingredientId: "curry-paste", amount: 1, unit: "oz" }, { ingredientId: "onion", amount: 1, unit: "each" },
      { ingredientId: "rice", amount: 6, unit: "oz" }, { ingredientId: "spinach", amount: 2, unit: "oz" },
      { ingredientId: "garlic", amount: 0.5, unit: "head" }
    ],
    steps: ["Rinse lentils. Cook rice according to the package directions.", "Soften chopped onion and garlic in a pot, then stir in curry paste.", "Add lentils, coconut milk and 1 cup water. Simmer for 18–22 minutes, stirring occasionally.", "Fold in spinach. Add a splash of water if needed and serve over rice."]
  },
  {
    id: "egg-fried-rice", title: "Veggie egg fried rice",
    description: "A fast, flexible bowl that turns rice, eggs and freezer staples into dinner.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=82",
    minutes: 15, servings: 2, tags: ["15 minutes", "Pantry-friendly"], dietTags: ["vegetarian", "dairy-free"], accent: "sage", calories: 430,
    ingredients: [
      { ingredientId: "rice", amount: 8, unit: "oz" }, { ingredientId: "eggs", amount: 3, unit: "each" },
      { ingredientId: "peas", amount: 6, unit: "oz" }, { ingredientId: "carrots", amount: 5, unit: "oz" },
      { ingredientId: "soy-sauce", amount: 0.05, unit: "bottle" }, { ingredientId: "sesame-oil", amount: 0.02, unit: "bottle" },
      { ingredientId: "onion", amount: 0.5, unit: "each" }
    ],
    steps: ["For best texture use chilled leftover rice, or cook rice and spread it to steam-dry.", "Scramble eggs in a hot pan, then transfer to a plate.", "Stir-fry onion, carrots and peas until tender. Add rice and let it crisp in spots.", "Return eggs to the pan, season with soy sauce and sesame oil, and toss well."]
  },
  {
    id: "turkey-skillet", title: "Turkey & spinach skillet",
    description: "Savory turkey, peppers and spinach in a simple tomato pan sauce.",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=82",
    minutes: 25, servings: 2, tags: ["High protein", "One pan"], dietTags: ["high-protein", "dairy-free"], accent: "peach", calories: 485,
    ingredients: [
      { ingredientId: "ground-turkey", amount: 1, unit: "lb" }, { ingredientId: "spinach", amount: 3, unit: "oz" },
      { ingredientId: "bell-pepper", amount: 1, unit: "each" }, { ingredientId: "onion", amount: 1, unit: "each" },
      { ingredientId: "marinara", amount: 8, unit: "oz" }, { ingredientId: "rice", amount: 6, unit: "oz" },
      { ingredientId: "spices", amount: 1, unit: "set" }
    ],
    steps: ["Start rice cooking in a saucepan.", "Brown the turkey in a skillet, breaking it up as it cooks.", "Add diced onion and bell pepper. Cook until softened, then stir in marinara.", "Simmer for five minutes, fold in spinach until wilted and serve over rice."]
  },
  {
    id: "tofu-grain-bowl", title: "Ginger tofu grain bowls",
    description: "Crisp tofu, warm rice and edamame with a quick savory dressing.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82",
    minutes: 28, servings: 2, tags: ["Plant protein", "Meal-prep friendly"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "sage", calories: 500,
    ingredients: [
      { ingredientId: "tofu", amount: 14, unit: "oz" }, { ingredientId: "edamame", amount: 6, unit: "oz" },
      { ingredientId: "rice", amount: 6, unit: "oz" }, { ingredientId: "carrots", amount: 4, unit: "oz" },
      { ingredientId: "soy-sauce", amount: 0.05, unit: "bottle" }, { ingredientId: "sesame-oil", amount: 0.02, unit: "bottle" },
      { ingredientId: "garlic", amount: 0.5, unit: "head" }
    ],
    steps: ["Cook rice. Press tofu dry and cut into cubes.", "Sear tofu in a hot non-stick skillet until golden on most sides.", "Heat edamame and slice carrots into ribbons. Mix soy sauce, sesame oil and minced garlic.", "Build bowls with rice, tofu, edamame and carrots; drizzle with dressing."]
  }
];


type ExtraRecipeSeed = Omit<Recipe, "image" | "servings">;

const EXTRA_RECIPE_IMAGES = [
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=82"
];

// A wider local-first recipe collection: no recipe API or account is required.
const EXTRA_RECIPE_SEEDS: ExtraRecipeSeed[] = [
  {
    id: "greek-chickpea-salad", title: "Greek chickpea salad",
    description: "Chickpeas, cucumber, tomatoes and lemon with a little salty feta.",
    minutes: 12, tags: ["No-cook", "Fresh"], dietTags: ["vegetarian", "high-protein"], accent: "sage", calories: 390, mealType: "lunch",
    ingredients: [{ ingredientId: "chickpeas", amount: 1, unit: "can" }, { ingredientId: "cucumber", amount: 1, unit: "each" }, { ingredientId: "tomatoes", amount: 5, unit: "oz" }, { ingredientId: "feta", amount: 2, unit: "oz" }, { ingredientId: "lemon", amount: 1, unit: "each" }],
    steps: ["Drain and rinse the chickpeas, then add them to a large bowl.", "Dice the cucumber and halve the tomatoes.", "Toss everything with lemon juice, olive oil and black pepper.", "Finish with crumbled feta and serve chilled or at room temperature."]
  },
  {
    id: "chicken-broccoli-rice", title: "Chicken, broccoli & rice skillet",
    description: "A reliable high-protein dinner with garlic, lemon and everyday staples.",
    minutes: 28, tags: ["One pan", "High protein"], dietTags: ["high-protein", "dairy-free"], accent: "gold", calories: 515,
    ingredients: [{ ingredientId: "chicken", amount: 1, unit: "lb" }, { ingredientId: "broccoli", amount: 1, unit: "head" }, { ingredientId: "rice", amount: 6, unit: "oz" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }, { ingredientId: "lemon", amount: 1, unit: "each" }],
    steps: ["Start the rice according to the package instructions.", "Cut chicken into bite-size pieces and season with salt, pepper and garlic.", "Sear chicken in a skillet, add broccoli and a splash of water, then cover until tender.", "Squeeze lemon over the pan and serve over rice."]
  },
  {
    id: "black-bean-burrito-bowls", title: "Black bean burrito bowls",
    description: "A budget-friendly bowl with salsa, avocado and warm rice.",
    minutes: 18, tags: ["Budget hero", "Plant-based"], dietTags: ["vegan", "vegetarian", "dairy-free"], accent: "peach", calories: 445,
    ingredients: [{ ingredientId: "black-beans", amount: 2, unit: "can" }, { ingredientId: "rice", amount: 6, unit: "oz" }, { ingredientId: "salsa", amount: 4, unit: "oz" }, { ingredientId: "avocado", amount: 1, unit: "each" }, { ingredientId: "bell-pepper", amount: 1, unit: "each" }],
    steps: ["Cook the rice and fluff with a fork.", "Sauté sliced bell pepper until softened.", "Warm the drained black beans with a spoonful of salsa and spices.", "Build bowls with rice, beans, peppers, salsa and sliced avocado."]
  },
  {
    id: "spinach-egg-potato-hash", title: "Spinach, egg & potato hash",
    description: "Crispy potatoes and wilted greens topped with softly cooked eggs.",
    minutes: 25, tags: ["Breakfast", "One pan"], dietTags: ["vegetarian", "high-protein", "dairy-free"], accent: "gold", calories: 420, mealType: "breakfast",
    ingredients: [{ ingredientId: "potatoes", amount: 12, unit: "oz" }, { ingredientId: "eggs", amount: 3, unit: "each" }, { ingredientId: "spinach", amount: 3, unit: "oz" }, { ingredientId: "onion", amount: 0.5, unit: "each" }, { ingredientId: "spices", amount: 1, unit: "set" }],
    steps: ["Dice the potatoes small so they cook quickly.", "Pan-fry potatoes and onion with a little oil until golden and tender.", "Fold in spinach until just wilted.", "Make small spaces in the hash, add eggs, cover and cook until set."]
  },
  {
    id: "tomato-lentil-stew", title: "Tomato & red lentil stew",
    description: "A warming pot of lentils, tomato, carrot and garlic that keeps well.",
    minutes: 30, tags: ["One pot", "Freezer friendly"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "peach", calories: 370,
    ingredients: [{ ingredientId: "lentils", amount: 6, unit: "oz" }, { ingredientId: "marinara", amount: 8, unit: "oz" }, { ingredientId: "carrots", amount: 6, unit: "oz" }, { ingredientId: "onion", amount: 1, unit: "each" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }],
    steps: ["Dice onion and carrots, then soften them in a pot with a little oil.", "Stir in garlic, lentils, marinara and two cups of water.", "Simmer gently for 20–25 minutes, stirring occasionally, until lentils are tender.", "Season to taste and add water for a looser stew."]
  },
  {
    id: "creamy-spinach-pasta", title: "Creamy spinach tomato pasta",
    description: "Silky tomato sauce, greens and parmesan without complicated prep.",
    minutes: 22, tags: ["Comfort food", "Quick"], dietTags: ["vegetarian"], accent: "peach", calories: 480,
    ingredients: [{ ingredientId: "pasta", amount: 7, unit: "oz" }, { ingredientId: "marinara", amount: 10, unit: "oz" }, { ingredientId: "spinach", amount: 3, unit: "oz" }, { ingredientId: "parmesan", amount: 1.5, unit: "oz" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }],
    steps: ["Boil pasta until al dente and reserve a little cooking water.", "Warm minced garlic in olive oil, then add marinara and a splash of pasta water.", "Fold spinach into the sauce until wilted.", "Toss with pasta and finish with parmesan."]
  },
  {
    id: "coconut-chickpea-curry", title: "Coconut chickpea curry",
    description: "Creamy coconut, chickpeas and greens over a bowl of rice.",
    minutes: 25, tags: ["One pot", "Plant-based"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "gold", calories: 465,
    ingredients: [{ ingredientId: "chickpeas", amount: 1, unit: "can" }, { ingredientId: "coconut-milk", amount: 6, unit: "oz" }, { ingredientId: "curry-paste", amount: 1, unit: "oz" }, { ingredientId: "spinach", amount: 3, unit: "oz" }, { ingredientId: "rice", amount: 6, unit: "oz" }],
    steps: ["Put rice on to cook.", "Warm curry paste in a pot for 30 seconds, stirring so it does not catch.", "Add drained chickpeas, coconut milk and a splash of water; simmer for 12–15 minutes.", "Stir in spinach and serve over rice."]
  },
  {
    id: "sesame-tofu-noodles", title: "Sesame tofu noodle bowls",
    description: "Golden tofu with chewy noodles and crunchy cabbage-carrot slaw.",
    minutes: 25, tags: ["Plant protein", "Meal-prep friendly"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "sage", calories: 490,
    ingredients: [{ ingredientId: "tofu", amount: 7, unit: "oz" }, { ingredientId: "noodles", amount: 6, unit: "oz" }, { ingredientId: "cabbage", amount: 5, unit: "oz" }, { ingredientId: "carrots", amount: 4, unit: "oz" }, { ingredientId: "soy-sauce", amount: 0.05, unit: "bottle" }],
    steps: ["Cook noodles as directed, then drain.", "Pat tofu dry, cube it and sear in a hot pan until golden.", "Mix soy sauce, rice vinegar, sesame oil and a spoonful of warm water.", "Toss noodles with shredded cabbage, carrot, tofu and the dressing."]
  },
  {
    id: "roasted-potato-yogurt-bowls", title: "Roasted potato & yogurt bowls",
    description: "Crispy potatoes, cool lemon yogurt and a handful of fresh greens.",
    minutes: 30, tags: ["Budget friendly", "Vegetarian"], dietTags: ["vegetarian", "high-protein"], accent: "sage", calories: 400,
    ingredients: [{ ingredientId: "potatoes", amount: 16, unit: "oz" }, { ingredientId: "greek-yogurt", amount: 4, unit: "oz" }, { ingredientId: "spinach", amount: 2, unit: "oz" }, { ingredientId: "lemon", amount: 1, unit: "each" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }],
    steps: ["Heat the oven to 425°F (220°C) and cut potatoes into bite-size pieces.", "Toss with oil, garlic and seasoning, then roast until crisp and tender.", "Mix Greek yogurt with lemon juice, salt and black pepper.", "Serve potatoes over spinach with the lemon yogurt spooned on top."]
  },
  {
    id: "turkey-pepper-rice", title: "Turkey & pepper rice bowls",
    description: "Ground turkey, sweet peppers and tomato sauce over simple rice.",
    minutes: 25, tags: ["High protein", "One pan"], dietTags: ["high-protein", "dairy-free"], accent: "peach", calories: 500,
    ingredients: [{ ingredientId: "ground-turkey", amount: 1, unit: "lb" }, { ingredientId: "bell-pepper", amount: 1, unit: "each" }, { ingredientId: "rice", amount: 6, unit: "oz" }, { ingredientId: "marinara", amount: 6, unit: "oz" }, { ingredientId: "onion", amount: 0.5, unit: "each" }],
    steps: ["Cook rice in a covered saucepan.", "Brown ground turkey in a skillet, breaking it into small pieces.", "Add sliced pepper and onion; cook until softened.", "Stir in marinara, simmer for five minutes and serve with rice."]
  },
  {
    id: "quinoa-chickpea-bowls", title: "Lemon quinoa & chickpea bowls",
    description: "Fresh cucumber, lemony chickpeas and fluffy quinoa make an easy lunch.",
    minutes: 20, tags: ["Fresh", "Meal-prep friendly"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "sage", calories: 430, mealType: "lunch",
    ingredients: [{ ingredientId: "quinoa", amount: 4, unit: "oz" }, { ingredientId: "chickpeas", amount: 1, unit: "can" }, { ingredientId: "cucumber", amount: 1, unit: "each" }, { ingredientId: "spinach", amount: 2, unit: "oz" }, { ingredientId: "lemon", amount: 1, unit: "each" }],
    steps: ["Simmer quinoa in water until tender and fluffy.", "Drain and rinse chickpeas.", "Chop cucumber and fold it through the quinoa with spinach and chickpeas.", "Dress with lemon juice, olive oil and black pepper."]
  },
  {
    id: "peanut-cabbage-noodles", title: "Crunchy peanut cabbage noodles",
    description: "A tangy peanut dressing coats noodles, carrots and crisp cabbage.",
    minutes: 18, tags: ["Quick", "Plant-based"], dietTags: ["vegan", "vegetarian", "dairy-free"], accent: "gold", calories: 455,
    ingredients: [{ ingredientId: "noodles", amount: 6, unit: "oz" }, { ingredientId: "peanut-butter", amount: 2, unit: "oz" }, { ingredientId: "cabbage", amount: 5, unit: "oz" }, { ingredientId: "carrots", amount: 5, unit: "oz" }, { ingredientId: "vinegar", amount: 0.03, unit: "bottle" }],
    steps: ["Cook noodles, then rinse briefly under cool water.", "Whisk peanut butter with soy sauce, rice vinegar and warm water.", "Shred cabbage and cut carrots into thin matchsticks.", "Toss vegetables and noodles with dressing; loosen with another splash of water if needed."]
  },
  {
    id: "loaded-salsa-potatoes", title: "Loaded salsa baked potatoes",
    description: "Soft potatoes topped with smoky black beans, salsa and avocado.",
    minutes: 35, tags: ["Budget hero", "Hands-off"], dietTags: ["vegan", "vegetarian", "dairy-free"], accent: "peach", calories: 440,
    ingredients: [{ ingredientId: "potatoes", amount: 16, unit: "oz" }, { ingredientId: "black-beans", amount: 1, unit: "can" }, { ingredientId: "salsa", amount: 3, unit: "oz" }, { ingredientId: "avocado", amount: 1, unit: "each" }, { ingredientId: "onion", amount: 0.5, unit: "each" }],
    steps: ["Bake or microwave potatoes until soft in the middle.", "Warm drained black beans with salsa and a pinch of spices.", "Split the potatoes and gently fluff the centers with a fork.", "Top with the bean mixture, diced onion and avocado."]
  },
  {
    id: "tofu-edamame-rice", title: "Tofu & edamame rice bowls",
    description: "A simple plant-protein bowl with broccoli and a savory sesame glaze.",
    minutes: 25, tags: ["High protein", "Plant-based"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "sage", calories: 490,
    ingredients: [{ ingredientId: "tofu", amount: 7, unit: "oz" }, { ingredientId: "edamame", amount: 6, unit: "oz" }, { ingredientId: "rice", amount: 6, unit: "oz" }, { ingredientId: "broccoli", amount: 1, unit: "head" }, { ingredientId: "soy-sauce", amount: 0.05, unit: "bottle" }],
    steps: ["Cook rice and steam or boil edamame until tender.", "Cube tofu and sear until golden on two or three sides.", "Steam broccoli until bright green with a little bite.", "Build bowls and season with soy sauce, sesame oil and a squeeze of lemon."]
  },
  {
    id: "egg-spinach-fried-rice", title: "Egg & spinach fried rice",
    description: "A quick wok-style dinner made from rice, eggs and freezer peas.",
    minutes: 15, tags: ["15 minutes", "Pantry-friendly"], dietTags: ["vegetarian", "dairy-free"], accent: "gold", calories: 420,
    ingredients: [{ ingredientId: "rice", amount: 8, unit: "oz" }, { ingredientId: "eggs", amount: 3, unit: "each" }, { ingredientId: "spinach", amount: 2, unit: "oz" }, { ingredientId: "peas", amount: 5, unit: "oz" }, { ingredientId: "soy-sauce", amount: 0.05, unit: "bottle" }],
    steps: ["Use chilled leftover rice, or spread freshly cooked rice so it can steam-dry.", "Scramble eggs in a hot pan and set aside.", "Stir-fry peas and spinach, then add rice and let it crisp in spots.", "Return eggs to the pan, season with soy sauce and toss together."]
  },
  {
    id: "tomato-lentil-pasta", title: "Tomato lentil pasta",
    description: "A hearty pasta sauce with red lentils stirred straight into the pot.",
    minutes: 28, tags: ["High fiber", "One pot"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "peach", calories: 495,
    ingredients: [{ ingredientId: "pasta", amount: 6, unit: "oz" }, { ingredientId: "lentils", amount: 4, unit: "oz" }, { ingredientId: "marinara", amount: 8, unit: "oz" }, { ingredientId: "onion", amount: 0.5, unit: "each" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }],
    steps: ["Soften diced onion and minced garlic in a saucepan.", "Add lentils, marinara and water; simmer until lentils are nearly tender.", "Cook pasta separately and reserve a cup of pasta water.", "Stir pasta into the sauce, adding pasta water a little at a time to coat."]
  },
  {
    id: "chicken-salsa-tacos", title: "Chicken salsa tacos",
    description: "Seasoned chicken, warm tortillas, bright salsa and creamy avocado.",
    minutes: 22, tags: ["Quick", "High protein"], dietTags: ["high-protein", "dairy-free"], accent: "peach", calories: 480,
    ingredients: [{ ingredientId: "chicken", amount: 1, unit: "lb" }, { ingredientId: "tortillas", amount: 6, unit: "each" }, { ingredientId: "salsa", amount: 4, unit: "oz" }, { ingredientId: "avocado", amount: 1, unit: "each" }, { ingredientId: "onion", amount: 0.5, unit: "each" }],
    steps: ["Slice chicken into thin strips and season with spices.", "Sear chicken in a hot skillet until fully cooked.", "Warm tortillas in a dry pan.", "Fill tortillas with chicken, salsa, thin onion and avocado."]
  },
  {
    id: "black-bean-pepper-quesadillas", title: "Black bean & pepper quesadillas",
    description: "Crisp tortillas stuffed with beans, peppers and salsa for dipping.",
    minutes: 18, tags: ["Budget hero", "Crispy"], dietTags: ["vegan", "vegetarian", "dairy-free"], accent: "gold", calories: 430,
    ingredients: [{ ingredientId: "tortillas", amount: 4, unit: "each" }, { ingredientId: "black-beans", amount: 1, unit: "can" }, { ingredientId: "bell-pepper", amount: 1, unit: "each" }, { ingredientId: "onion", amount: 0.5, unit: "each" }, { ingredientId: "salsa", amount: 3, unit: "oz" }],
    steps: ["Sauté sliced pepper and onion until soft.", "Roughly mash the drained beans with a pinch of spices.", "Spread beans and vegetables over half of each tortilla and fold closed.", "Toast in a dry skillet until crisp and serve with salsa."]
  },
  {
    id: "cucumber-yogurt-chickpea-wraps", title: "Cucumber yogurt chickpea wraps",
    description: "Cool lemon yogurt, chickpeas and crunchy cucumber tucked into tortillas.",
    minutes: 14, tags: ["No-cook", "Lunch"], dietTags: ["vegetarian", "high-protein"], accent: "sage", calories: 410, mealType: "lunch",
    ingredients: [{ ingredientId: "chickpeas", amount: 1, unit: "can" }, { ingredientId: "cucumber", amount: 1, unit: "each" }, { ingredientId: "greek-yogurt", amount: 4, unit: "oz" }, { ingredientId: "tortillas", amount: 4, unit: "each" }, { ingredientId: "lemon", amount: 1, unit: "each" }],
    steps: ["Drain and rinse the chickpeas.", "Stir yogurt with lemon juice, salt, pepper and minced garlic if desired.", "Dice cucumber and gently crush half the chickpeas for texture.", "Fill tortillas with chickpeas, cucumber and yogurt sauce."]
  },
  {
    id: "egg-potato-breakfast-tacos", title: "Egg & potato breakfast tacos",
    description: "Golden breakfast potatoes, scrambled eggs and a spoon of salsa.",
    minutes: 20, tags: ["Breakfast", "Quick"], dietTags: ["vegetarian", "high-protein", "dairy-free"], accent: "gold", calories: 395, mealType: "breakfast",
    ingredients: [{ ingredientId: "eggs", amount: 4, unit: "each" }, { ingredientId: "potatoes", amount: 10, unit: "oz" }, { ingredientId: "tortillas", amount: 4, unit: "each" }, { ingredientId: "salsa", amount: 3, unit: "oz" }],
    steps: ["Dice potatoes into small cubes and pan-fry until tender and browned.", "Beat eggs with salt and pepper.", "Scramble eggs in the same pan and fold in the cooked potatoes.", "Serve in warm tortillas with salsa."]
  },
  {
    id: "garlic-broccoli-pasta", title: "Garlic broccoli pasta",
    description: "A comforting bowl with tender broccoli, parmesan and lots of garlic.",
    minutes: 20, tags: ["Quick", "Vegetarian"], dietTags: ["vegetarian"], accent: "sage", calories: 465,
    ingredients: [{ ingredientId: "pasta", amount: 7, unit: "oz" }, { ingredientId: "broccoli", amount: 1, unit: "head" }, { ingredientId: "parmesan", amount: 1.5, unit: "oz" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }, { ingredientId: "olive-oil", amount: 0.05, unit: "bottle" }],
    steps: ["Boil pasta and add chopped broccoli for the final three minutes.", "Warm sliced garlic gently in olive oil until fragrant.", "Drain pasta and broccoli, saving a little cooking water.", "Toss everything with parmesan, black pepper and enough cooking water to gloss."]
  },
  {
    id: "tomato-quinoa-skillet", title: "Tomato quinoa skillet",
    description: "Quinoa, chickpeas and spinach simmer together for an easy plant-based meal.",
    minutes: 24, tags: ["One pan", "Plant-based"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "peach", calories: 420,
    ingredients: [{ ingredientId: "quinoa", amount: 4, unit: "oz" }, { ingredientId: "tomatoes", amount: 5, unit: "oz" }, { ingredientId: "chickpeas", amount: 1, unit: "can" }, { ingredientId: "spinach", amount: 3, unit: "oz" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }],
    steps: ["Rinse quinoa and mince the garlic.", "Warm garlic in a pot, then add tomatoes, chickpeas, quinoa and water.", "Cover and simmer until quinoa is tender, adding a splash of water if needed.", "Fold in spinach, season and let stand for two minutes before serving."]
  },
  {
    id: "peanut-carrot-rice-bowls", title: "Peanut carrot & edamame bowls",
    description: "Rice topped with sweet carrots, edamame and a quick peanut drizzle.",
    minutes: 20, tags: ["Plant protein", "Meal-prep friendly"], dietTags: ["vegan", "vegetarian", "dairy-free"], accent: "gold", calories: 470,
    ingredients: [{ ingredientId: "rice", amount: 6, unit: "oz" }, { ingredientId: "carrots", amount: 5, unit: "oz" }, { ingredientId: "edamame", amount: 5, unit: "oz" }, { ingredientId: "peanut-butter", amount: 1.5, unit: "oz" }, { ingredientId: "soy-sauce", amount: 0.05, unit: "bottle" }],
    steps: ["Cook rice and heat the edamame.", "Cut carrots into thin ribbons or matchsticks.", "Whisk peanut butter with soy sauce and warm water until pourable.", "Serve rice topped with carrots and edamame, then drizzle with sauce."]
  },
  {
    id: "coconut-curried-eggs", title: "Coconut curry eggs & spinach",
    description: "Soft eggs simmered in gently spiced coconut sauce with greens.",
    minutes: 22, tags: ["One pan", "High protein"], dietTags: ["vegetarian", "dairy-free", "high-protein"], accent: "gold", calories: 430,
    ingredients: [{ ingredientId: "eggs", amount: 4, unit: "each" }, { ingredientId: "coconut-milk", amount: 5, unit: "oz" }, { ingredientId: "curry-paste", amount: 0.5, unit: "oz" }, { ingredientId: "rice", amount: 6, unit: "oz" }, { ingredientId: "spinach", amount: 3, unit: "oz" }],
    steps: ["Start rice cooking.", "Warm curry paste in a skillet, then stir in coconut milk and a splash of water.", "Crack eggs into the sauce, cover and simmer until whites are set.", "Fold spinach into the sauce and serve with rice."]
  },
  {
    id: "spicy-tomato-chickpeas", title: "Spicy tomato chickpeas",
    description: "Chickpeas simmered in a robust tomato sauce with greens and garlic.",
    minutes: 18, tags: ["Quick", "One pan"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "peach", calories: 360,
    ingredients: [{ ingredientId: "chickpeas", amount: 1, unit: "can" }, { ingredientId: "marinara", amount: 8, unit: "oz" }, { ingredientId: "spinach", amount: 3, unit: "oz" }, { ingredientId: "bell-pepper", amount: 1, unit: "each" }, { ingredientId: "onion", amount: 0.5, unit: "each" }],
    steps: ["Soften diced onion and pepper in a skillet.", "Add drained chickpeas, marinara, spices and a splash of water.", "Simmer for 8–10 minutes so the flavors mingle.", "Fold in spinach and serve alone or over rice."]
  },
  {
    id: "turkey-marinara-pasta", title: "Turkey marinara pasta",
    description: "Lean turkey and spinach turn a pantry pasta into a filling dinner.",
    minutes: 25, tags: ["High protein", "Family friendly"], dietTags: ["high-protein"], accent: "peach", calories: 520,
    ingredients: [{ ingredientId: "ground-turkey", amount: 1, unit: "lb" }, { ingredientId: "pasta", amount: 7, unit: "oz" }, { ingredientId: "marinara", amount: 8, unit: "oz" }, { ingredientId: "spinach", amount: 2, unit: "oz" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }],
    steps: ["Cook pasta according to the package and reserve a cup of the water.", "Brown turkey in a skillet, breaking it into small pieces.", "Add garlic and marinara, then simmer until the turkey is cooked through.", "Fold in spinach and pasta, loosening the sauce with pasta water."]
  },
  {
    id: "sesame-cabbage-tofu-stirfry", title: "Sesame cabbage tofu stir-fry",
    description: "Golden tofu with quickly softened cabbage and carrots over rice.",
    minutes: 23, tags: ["Quick", "Plant protein"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "sage", calories: 455,
    ingredients: [{ ingredientId: "tofu", amount: 7, unit: "oz" }, { ingredientId: "cabbage", amount: 5, unit: "oz" }, { ingredientId: "carrots", amount: 4, unit: "oz" }, { ingredientId: "rice", amount: 6, unit: "oz" }, { ingredientId: "soy-sauce", amount: 0.05, unit: "bottle" }],
    steps: ["Cook rice and set aside.", "Sear cubed tofu in a hot pan until golden.", "Add sliced cabbage and carrots and stir-fry until just tender.", "Season with soy sauce, sesame oil and a little rice vinegar; serve over rice."]
  },
  {
    id: "lemon-garlic-chicken-tray", title: "Lemon garlic chicken tray",
    description: "Chicken and potatoes roast with broccoli on one easy-to-clean tray.",
    minutes: 38, tags: ["One pan", "High protein"], dietTags: ["high-protein", "dairy-free"], accent: "gold", calories: 530,
    ingredients: [{ ingredientId: "chicken", amount: 1, unit: "lb" }, { ingredientId: "potatoes", amount: 16, unit: "oz" }, { ingredientId: "broccoli", amount: 1, unit: "head" }, { ingredientId: "lemon", amount: 1, unit: "each" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }],
    steps: ["Heat the oven to 425°F (220°C) and cut potatoes into small pieces.", "Toss potatoes with olive oil, garlic, lemon zest and seasoning; roast 15 minutes.", "Add seasoned chicken and broccoli to the tray and roast until chicken is cooked through.", "Squeeze lemon over the pan and serve."]
  },
  {
    id: "avocado-black-bean-tacos", title: "Avocado black bean tacos",
    description: "Fast tacos with creamy avocado, smoky beans and fresh cucumber crunch.",
    minutes: 15, tags: ["15 minutes", "Plant-based"], dietTags: ["vegan", "vegetarian", "dairy-free"], accent: "sage", calories: 405,
    ingredients: [{ ingredientId: "tortillas", amount: 6, unit: "each" }, { ingredientId: "black-beans", amount: 1, unit: "can" }, { ingredientId: "avocado", amount: 1, unit: "each" }, { ingredientId: "salsa", amount: 3, unit: "oz" }, { ingredientId: "cucumber", amount: 0.5, unit: "each" }],
    steps: ["Warm the drained beans with spices and a spoonful of water.", "Char tortillas briefly in a dry pan.", "Slice avocado and dice the cucumber.", "Fill tortillas with beans, salsa, avocado and cucumber."]
  },
  {
    id: "spinach-quinoa-egg-bowls", title: "Spinach quinoa & egg bowls",
    description: "A balanced bowl with fluffy quinoa, wilted spinach and a soft egg.",
    minutes: 20, tags: ["High protein", "Simple"], dietTags: ["vegetarian", "high-protein"], accent: "gold", calories: 420,
    ingredients: [{ ingredientId: "quinoa", amount: 4, unit: "oz" }, { ingredientId: "eggs", amount: 2, unit: "each" }, { ingredientId: "spinach", amount: 3, unit: "oz" }, { ingredientId: "greek-yogurt", amount: 2, unit: "oz" }, { ingredientId: "lemon", amount: 0.5, unit: "each" }],
    steps: ["Rinse and cook quinoa until fluffy.", "Wilt spinach in a small skillet with a splash of water.", "Cook eggs to your liking.", "Serve quinoa and spinach with eggs, lemon yogurt and black pepper."]
  },
  {
    id: "roasted-chickpea-broccoli-bowls", title: "Roasted chickpea & broccoli bowls",
    description: "Crispy chickpeas, roasted broccoli and lemony quinoa in one filling bowl.",
    minutes: 30, tags: ["Plant-based", "Meal-prep friendly"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "sage", calories: 440,
    ingredients: [{ ingredientId: "chickpeas", amount: 1, unit: "can" }, { ingredientId: "broccoli", amount: 1, unit: "head" }, { ingredientId: "quinoa", amount: 4, unit: "oz" }, { ingredientId: "lemon", amount: 1, unit: "each" }, { ingredientId: "spices", amount: 1, unit: "set" }],
    steps: ["Heat oven to 425°F (220°C) and rinse the chickpeas.", "Toss chickpeas and broccoli with olive oil and seasoning, then roast until browned.", "Cook quinoa while the tray roasts.", "Serve together with fresh lemon juice."]
  },
  {
    id: "veggie-tofu-fried-rice", title: "Tofu veggie fried rice",
    description: "Leftover rice, vegetables and crisp tofu come together in minutes.",
    minutes: 22, tags: ["Quick", "One pan"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "gold", calories: 465,
    ingredients: [{ ingredientId: "rice", amount: 8, unit: "oz" }, { ingredientId: "tofu", amount: 7, unit: "oz" }, { ingredientId: "peas", amount: 5, unit: "oz" }, { ingredientId: "carrots", amount: 4, unit: "oz" }, { ingredientId: "soy-sauce", amount: 0.05, unit: "bottle" }],
    steps: ["Cube tofu and sear until golden, then set aside.", "Stir-fry carrots and peas until tender.", "Add chilled rice and cook until hot with a few crisp edges.", "Return tofu to the pan and season with soy sauce and sesame oil."]
  },
  {
    id: "coconut-lentil-rice", title: "Coconut lentil rice bowls",
    description: "Red lentils simmered with coconut milk and served with rice and greens.",
    minutes: 28, tags: ["One pot", "Budget friendly"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "gold", calories: 460,
    ingredients: [{ ingredientId: "lentils", amount: 5, unit: "oz" }, { ingredientId: "coconut-milk", amount: 6, unit: "oz" }, { ingredientId: "rice", amount: 6, unit: "oz" }, { ingredientId: "spinach", amount: 3, unit: "oz" }, { ingredientId: "curry-paste", amount: 0.5, unit: "oz" }],
    steps: ["Start rice cooking separately.", "Stir curry paste in a pot for 30 seconds, then add rinsed lentils, coconut milk and water.", "Simmer until lentils are tender, adding water as needed.", "Fold in spinach and serve over rice."]
  },
  {
    id: "tomato-egg-spinach-skillet", title: "Tomato spinach egg skillet",
    description: "Eggs gently cook in a garlicky tomato sauce with a handful of greens.",
    minutes: 18, tags: ["One pan", "High protein"], dietTags: ["vegetarian", "high-protein", "dairy-free"], accent: "peach", calories: 365, mealType: "breakfast",
    ingredients: [{ ingredientId: "eggs", amount: 4, unit: "each" }, { ingredientId: "marinara", amount: 8, unit: "oz" }, { ingredientId: "spinach", amount: 3, unit: "oz" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }, { ingredientId: "tortillas", amount: 2, unit: "each" }],
    steps: ["Warm garlic and marinara in a skillet with a splash of water.", "Stir in spinach until wilted.", "Make four small wells in the sauce and crack in eggs.", "Cover and cook until the whites are set; scoop up with warm tortillas."]
  },
  {
    id: "turkey-stuffed-peppers", title: "Turkey stuffed pepper bowls",
    description: "Ground turkey, rice and tomato tucked into sweet bell peppers.",
    minutes: 35, tags: ["High protein", "Meal prep"], dietTags: ["high-protein", "dairy-free"], accent: "peach", calories: 490,
    ingredients: [{ ingredientId: "ground-turkey", amount: 1, unit: "lb" }, { ingredientId: "bell-pepper", amount: 2, unit: "each" }, { ingredientId: "rice", amount: 5, unit: "oz" }, { ingredientId: "marinara", amount: 6, unit: "oz" }, { ingredientId: "onion", amount: 0.5, unit: "each" }],
    steps: ["Cook rice until tender and heat the oven to 400°F (205°C).", "Brown turkey with diced onion, then stir in cooked rice and marinara.", "Halve and seed the peppers, fill with the turkey mixture and cover loosely.", "Bake until peppers soften and the filling is hot throughout."]
  },
  {
    id: "chickpea-spinach-skillet", title: "Creamy chickpea spinach skillet",
    description: "Chickpeas and spinach in a light garlic-yogurt sauce with lemon.",
    minutes: 18, tags: ["Quick", "Vegetarian"], dietTags: ["vegetarian", "high-protein"], accent: "sage", calories: 390,
    ingredients: [{ ingredientId: "chickpeas", amount: 1, unit: "can" }, { ingredientId: "spinach", amount: 3, unit: "oz" }, { ingredientId: "greek-yogurt", amount: 3, unit: "oz" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }, { ingredientId: "lemon", amount: 0.5, unit: "each" }],
    steps: ["Warm drained chickpeas in a skillet with minced garlic and a little water.", "Fold in spinach until it wilts.", "Take the pan off the heat and stir in yogurt so it stays creamy.", "Finish with lemon, pepper and a little olive oil."]
  },
  {
    id: "peas-parmesan-pasta", title: "Peas & parmesan pasta",
    description: "A quick, cozy pasta with sweet peas, parmesan and black pepper.",
    minutes: 17, tags: ["17 minutes", "Comfort food"], dietTags: ["vegetarian"], accent: "gold", calories: 450,
    ingredients: [{ ingredientId: "pasta", amount: 7, unit: "oz" }, { ingredientId: "peas", amount: 6, unit: "oz" }, { ingredientId: "parmesan", amount: 1.5, unit: "oz" }, { ingredientId: "garlic", amount: 0.5, unit: "head" }, { ingredientId: "olive-oil", amount: 0.05, unit: "bottle" }],
    steps: ["Cook pasta and add the peas for the last two minutes.", "Warm minced garlic gently in olive oil.", "Toss pasta and peas with parmesan and a splash of pasta water.", "Finish with black pepper and another little sprinkle of cheese."]
  },
  {
    id: "tofu-salsa-tacos", title: "Crispy tofu salsa tacos",
    description: "Crisped tofu, fresh salsa and avocado in warm corn tortillas.",
    minutes: 22, tags: ["Plant protein", "Quick"], dietTags: ["vegan", "vegetarian", "dairy-free", "high-protein"], accent: "peach", calories: 430,
    ingredients: [{ ingredientId: "tofu", amount: 7, unit: "oz" }, { ingredientId: "tortillas", amount: 6, unit: "each" }, { ingredientId: "salsa", amount: 3, unit: "oz" }, { ingredientId: "avocado", amount: 1, unit: "each" }, { ingredientId: "spices", amount: 1, unit: "set" }],
    steps: ["Press tofu dry and crumble it into a bowl with spices.", "Sear tofu in a hot skillet until browned at the edges.", "Warm tortillas in a separate dry pan.", "Fill with tofu, salsa and sliced avocado."]
  }
];

RECIPES.push(...EXTRA_RECIPE_SEEDS.map((recipe, index) => ({
  ...recipe,
  servings: 2,
  image: EXTRA_RECIPE_IMAGES[index % EXTRA_RECIPE_IMAGES.length]
})));

export const HOUSEHOLD_ITEMS: Ingredient[] = [
  { id: "toilet-paper", name: "Toilet paper", category: "Paper goods", kind: "paper", price: 12.99, packSize: 1, unit: "pack", packageLabel: "12 mega rolls", searchTerm: "toilet paper 12 mega rolls" },
  { id: "paper-towels", name: "Paper towels", category: "Paper goods", kind: "paper", price: 9.49, packSize: 1, unit: "pack", packageLabel: "6 double rolls", searchTerm: "paper towels 6 double rolls" },
  { id: "tissues", name: "Facial tissues", category: "Paper goods", kind: "paper", price: 5.49, packSize: 1, unit: "pack", packageLabel: "3 tissue boxes", searchTerm: "facial tissues 3 boxes" },
  { id: "trash-bags", name: "Trash bags", category: "Paper goods", kind: "paper", price: 8.49, packSize: 1, unit: "pack", packageLabel: "45-count box", searchTerm: "kitchen trash bags 45 count" },
  { id: "dish-soap", name: "Dish soap", category: "Cleaning", kind: "cleaning", price: 3.49, packSize: 1, unit: "bottle", packageLabel: "24 fl oz bottle", searchTerm: "dish soap 24 oz" },
  { id: "laundry-detergent", name: "Laundry detergent", category: "Cleaning", kind: "cleaning", price: 12.99, packSize: 1, unit: "bottle", packageLabel: "standard bottle", searchTerm: "laundry detergent bottle" },
  { id: "surface-cleaner", name: "All-purpose cleaner", category: "Cleaning", kind: "cleaning", price: 4.99, packSize: 1, unit: "bottle", packageLabel: "spray bottle", searchTerm: "all purpose household cleaner spray" },
  { id: "sponges", name: "Cleaning sponges", category: "Cleaning", kind: "cleaning", price: 3.49, packSize: 1, unit: "pack", packageLabel: "6-count pack", searchTerm: "kitchen cleaning sponges 6 pack" },
  { id: "dishwasher-tabs", name: "Dishwasher tablets", category: "Cleaning", kind: "cleaning", price: 8.99, packSize: 1, unit: "pack", packageLabel: "standard pack", searchTerm: "dishwasher detergent tablets" },
  { id: "toothpaste", name: "Toothpaste", category: "Personal care", kind: "personal-care", price: 4.99, packSize: 1, unit: "pack", packageLabel: "2 tubes", searchTerm: "toothpaste 2 pack" },
  { id: "toothbrushes", name: "Toothbrushes", category: "Personal care", kind: "personal-care", price: 4.49, packSize: 1, unit: "pack", packageLabel: "2-count pack", searchTerm: "soft toothbrush 2 pack" },
  { id: "shampoo", name: "Shampoo", category: "Personal care", kind: "personal-care", price: 7.99, packSize: 1, unit: "bottle", packageLabel: "standard bottle", searchTerm: "shampoo bottle" },
  { id: "body-wash", name: "Body wash", category: "Personal care", kind: "personal-care", price: 6.99, packSize: 1, unit: "bottle", packageLabel: "standard bottle", searchTerm: "body wash bottle" },
  { id: "deodorant", name: "Deodorant", category: "Personal care", kind: "personal-care", price: 6.49, packSize: 1, unit: "stick", packageLabel: "1 stick", searchTerm: "deodorant stick" },
  { id: "razors", name: "Shaving razors", category: "Personal care", kind: "personal-care", price: 9.99, packSize: 1, unit: "pack", packageLabel: "4 disposable razors", searchTerm: "disposable shaving razors 4 pack" },
  { id: "shaving-cream", name: "Shaving cream", category: "Personal care", kind: "personal-care", price: 4.49, packSize: 1, unit: "can", packageLabel: "standard can", searchTerm: "shaving cream can" },
  { id: "period-care", name: "Period care", category: "Personal care", kind: "personal-care", price: 7.99, packSize: 1, unit: "pack", packageLabel: "standard pack", searchTerm: "unscented period care pads" },
  { id: "baby-wipes", name: "Baby wipes", category: "Baby & pets", kind: "baby-pet", householdFor: "kids", price: 3.99, packSize: 1, unit: "pack", packageLabel: "standard pack", searchTerm: "baby wipes pack" },
  { id: "diapers", name: "Diapers", category: "Baby & pets", kind: "baby-pet", householdFor: "kids", price: 19.99, packSize: 1, unit: "pack", packageLabel: "standard pack", searchTerm: "baby diapers pack" },
  { id: "dog-food", name: "Dog food", category: "Baby & pets", kind: "baby-pet", householdFor: "pets", price: 11.99, packSize: 1, unit: "bag", packageLabel: "small bag", searchTerm: "dry dog food bag" },
  { id: "cat-litter", name: "Cat litter", category: "Baby & pets", kind: "baby-pet", householdFor: "pets", price: 13.99, packSize: 1, unit: "box", packageLabel: "standard box", searchTerm: "cat litter box" }
];

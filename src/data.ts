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
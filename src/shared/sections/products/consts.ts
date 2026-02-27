import type { Product } from "./types";
import { Category } from "@/shared/types";

export const products: Product[] = [
  {
    name: "DRIED APPLE",
    title: "Natural Apple Snack",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural snack made from 100% apples with no added sugar, preservatives, or processing. Just fruit — nothing else.",
    tags: ["100% Apples", "No Added Sugar", "High Fiber", "Low GI"],
    freeFrom: ["added sugar", "preservatives", "artificial colors", "gluten"],
    image: "/images/products/DRIED APPLE.webp",
    benefits: [
      {
        name: "Dietary Fiber (Pectin)",
        description: "Supports a healthy gut microbiome and smooth digestion",
      },
      {
        name: "Polyphenols",
        description:
          "Provide antioxidant activity and help reduce inflammation",
      },
      {
        name: "Potassium",
        description: "Supports cardiovascular health",
      },
      {
        name: "Low Glycemic Index",
        description:
          "Does not cause sharp spikes in glucose and insulin levels",
      },
    ],
    nutrition: {
      calories: 243,
      carbs: 64,
      naturalSugars: 57,
      addedSugars: 0,
      fiber: 8.7,
      protein: 2.1,
      fat: 0.5,
      vitaminC: 3,
    },
    servingIdeas: [
      "as a standalone snack",
      "with oatmeal or granola",
      "in yogurt",
      "in tea blends",
      "in kids' lunchboxes",
    ],
    occasions: [
      "work",
      "travel",
      "yoga",
      "in-between meals",
      "kids' lunchboxes",
    ],
  },
  {
    name: "DRIED APPLE WITH CINNAMON",
    title: "Apple & Cinnamon Snack",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural snack made from 100% apples with a touch of cinnamon. No added sugar, preservatives, or artificial ingredients. Just fruit and spice — nothing else.",
    tags: ["100% Apples", "No Added Sugar", "High Fiber", "Low GI"],
    freeFrom: [
      "added sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/DRIED APPLE WITH CINNAMON.webp",
    benefits: [
      {
        name: "Dietary Fiber (Pectin)",
        description: "Supports digestion and gut health",
      },
      {
        name: "Cinnamon",
        description:
          "Helps improve insulin sensitivity and supports stable blood sugar levels",
      },
      {
        name: "Polyphenols",
        description: "Provide antioxidant protection",
      },
      {
        name: "Low Glycemic Load",
        description: "Helps avoid sharp glucose and energy fluctuations",
      },
    ],
    nutrition: {
      calories: 245,
      carbs: 64,
      naturalSugars: 57,
      addedSugars: 0,
      fiber: 9.1,
      protein: 2.2,
      fat: 0.6,
      vitaminC: 3,
    },
    servingIdeas: [
      "as a standalone snack",
      "with oatmeal or granola",
      "in yogurt",
      "with coffee or tea",
    ],
    occasions: [
      "work",
      "travel",
      "pre- or post-workout snack",
      "mid-day energy boost",
      "healthy kids' snacks",
    ],
  },
  {
    name: "DRIED APPLE WITH HONEY & PEANUT",
    title: "Apple, Honey & Peanut Snack",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural snack made from apples with the addition of honey and peanuts. Fruit, nuts, and natural honey — a source of both quick and sustained energy.",
    tags: [
      "Apple + Honey + Peanut",
      "No Refined Sugar",
      "Plant Protein",
      "Energy Boost",
    ],
    freeFrom: [
      "refined sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/DRIED APPLE WITH HONEY & PEANUT.webp",
    benefits: [
      {
        name: "Dietary Fiber (Pectin)",
        description: "Supports digestion and gut health",
      },
      {
        name: "Natural Honey",
        description:
          "Provides quick energy, contains natural enzymes and antioxidants",
      },
      {
        name: "Magnesium (Peanuts)",
        description: "Supports the nervous system and helps reduce fatigue",
      },
      {
        name: "Healthy Fats & Plant-Based Protein",
        description: "Prolong satiety and help maintain stable energy levels",
      },
    ],
    nutrition: {
      calories: 335,
      carbs: 56,
      naturalSugars: 43,
      addedSugars: 0,
      fiber: 7.5,
      protein: 6.4,
      fat: 11,
      vitaminC: 2,
    },
    servingIdeas: [
      "as a standalone snack",
      "before physical activity",
      "with coffee or tea",
      "on the go",
      "for a quick energy boost",
    ],
    occasions: [
      "work",
      "travel",
      "before workouts",
      "energy recovery",
      "between meals",
    ],
  },
  {
    name: "NATURAL BANANA SNACK",
    title: "Natural Banana Snack",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural snack made from 100% bananas. No added sugar, preservatives, or artificial ingredients. Just fruit — nothing else.",
    tags: ["100% Bananas", "No Added Sugar", "High Fiber", "Natural Energy"],
    freeFrom: [
      "added sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/NATURAL BANANA SNACK.webp",
    benefits: [
      {
        name: "Potassium",
        description: "Supports heart health and muscle function",
      },
      {
        name: "Vitamin B6",
        description: "Contributes to energy metabolism",
      },
      {
        name: "Dietary Fiber",
        description: "Supports digestion and gut health",
      },
      {
        name: "Natural Carbohydrates",
        description: "Provide sustained energy without rapid glucose spikes",
      },
    ],
    nutrition: {
      calories: 346,
      carbs: 88,
      naturalSugars: 47,
      addedSugars: 0,
      fiber: 9.9,
      protein: 3.9,
      fat: 1.1,
      vitaminC: 7,
    },
    servingIdeas: [
      "as a standalone snack",
      "with oatmeal or granola",
      "in yogurt",
      "with tea or coffee",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "post-workout snack",
      "between meals",
      "kids' lunchboxes",
    ],
  },
  {
    name: "DRIED BANANA WITH COCONUT",
    title: "Banana & Coconut Snack",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural snack made from bananas with the addition of coconut. Fruit and coconut — a naturally sweet source of clean energy.",
    tags: [
      "Banana + Coconut",
      "No Added Sugar",
      "High Fiber",
      "Tropical Taste",
    ],
    freeFrom: [
      "added sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/DRIED BANANA WITH COCONUT.webp",
    benefits: [
      {
        name: "Potassium (Banana)",
        description: "Supports heart health and muscle function",
      },
      {
        name: "Healthy Fats (Coconut)",
        description: "Help prolong satiety and provide sustained energy",
      },
      {
        name: "Dietary Fiber",
        description: "Supports digestion and gut health",
      },
      {
        name: "Natural Carbohydrates",
        description: "Provide steady energy throughout the day",
      },
    ],
    nutrition: {
      calories: 393,
      carbs: 78,
      naturalSugars: 41,
      addedSugars: 0,
      fiber: 10.8,
      protein: 4.4,
      fat: 10.7,
      vitaminC: 6,
    },
    servingIdeas: [
      "as a standalone snack",
      "with yogurt",
      "in breakfast bowls",
      "with tea or coffee",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "post-workout snack",
      "between meals",
      "active lifestyle",
    ],
  },
  {
    name: "DRIED PERSIMMON",
    title: "Dried Persimmon",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural snack made from 100% ripe persimmons, gently dehydrated to preserve their natural properties. Just fruit — nothing else.",
    tags: [
      "100% Persimmon",
      "No Added Sugar",
      "High Fiber",
      "Rich in Antioxidants",
    ],
    freeFrom: [
      "added sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/DRIED PERSIMMON.webp",
    benefits: [
      {
        name: "Beta-Carotene (Provitamin A)",
        description: "Supports skin and vision health",
      },
      {
        name: "Vitamin C",
        description: "Helps strengthen the immune system",
      },
      {
        name: "Potassium",
        description: "Supports heart and vascular function",
      },
      {
        name: "Dietary Fiber",
        description: "Promotes comfortable digestion",
      },
      {
        name: "Antioxidants",
        description: "Help protect cells from oxidative stress",
      },
    ],
    nutrition: {
      calories: 332,
      carbs: 87,
      naturalSugars: 50,
      addedSugars: 0,
      fiber: 7,
      protein: 1.2,
      fat: 0.6,
    },
    servingIdeas: [
      "as a standalone snack",
      "with tea or coffee",
      "in breakfast bowls",
      "in yogurt",
      "with nuts (especially walnuts or peanuts)",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "mid-day snack",
      "between meals",
      "kids' lunchboxes",
    ],
  },
  {
    name: "DRIED ORANGE",
    title: "Dried Orange",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural snack made from 100% ripe oranges, gently dehydrated to preserve their natural taste and nutrients. Just fruit — nothing else.",
    tags: ["100% Oranges", "No Added Sugar", "High Vitamin C", "High Fiber"],
    freeFrom: [
      "added sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/DRIED ORANGE.webp",
    benefits: [
      {
        name: "Vitamin C",
        description: "Supports immune function",
      },
      {
        name: "Antioxidants",
        description: "Help protect cells from oxidative stress",
      },
      {
        name: "Dietary Fiber",
        description: "Supports digestion and gut health",
      },
      {
        name: "Natural Carbohydrates",
        description: "Provide steady energy",
      },
    ],
    nutrition: {
      calories: 280,
      carbs: 66,
      naturalSugars: 55,
      addedSugars: 0,
      fiber: 7.5,
      protein: 2,
      fat: 0.5,
      vitaminC: 60,
    },
    servingIdeas: [
      "as a standalone snack",
      "with tea or coffee",
      "in breakfast bowls",
      "in yogurt",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "mid-day snack",
      "between meals",
      "kids' lunchboxes",
    ],
  },
  {
    name: "APPLE FRUIT LEATHER",
    title: "Apple Fruit Leather",
    category: Category.FruitLeather,
    badge: "natural",
    tagline:
      "A natural fruit leather made from 100% ripe apples, gently dehydrated to preserve their natural taste and nutrients. Just fruit — nothing else.",
    tags: ["100% Apples", "No Added Sugar", "High Fiber", "Natural Treat"],
    freeFrom: [
      "added sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/APPLE FRUIT LEATHER.webp",
    benefits: [
      {
        name: "Dietary Fiber",
        description: "Supports digestion and gut health",
      },
      {
        name: "Polyphenols",
        description: "Provide antioxidant protection",
      },
      {
        name: "Natural Carbohydrates",
        description: "Provide steady energy throughout the day",
      },
      {
        name: "Potassium",
        description: "Supports heart and muscle function",
      },
    ],
    nutrition: {
      calories: 285,
      carbs: 69,
      naturalSugars: 52,
      addedSugars: 0,
      fiber: 12,
      protein: 1.5,
      fat: 1,
    },
    servingIdeas: [
      "as a standalone fruit treat",
      "with tea or coffee",
      "in breakfast bowls",
      "in yogurt",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "mid-day snack",
      "between meals",
      "kids' lunchboxes",
    ],
  },
  {
    name: "APPLE / BANANA FRUIT LEATHER",
    title: "Apple & Banana Fruit Leather",
    category: Category.FruitLeather,
    badge: "natural",
    tagline:
      "A natural fruit leather made from ripe apples and bananas, gently dehydrated to preserve their natural taste and nutrients. Just fruit — nothing else.",
    tags: ["Apple + Banana", "No Added Sugar", "High Fiber", "Natural Treat"],
    freeFrom: [
      "added sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/APPLE : BANANA FRUIT LEATHER.webp",
    benefits: [
      {
        name: "Dietary Fiber",
        description: "Supports digestion and gut health",
      },
      {
        name: "Natural Carbohydrates",
        description: "Provide steady energy throughout the day",
      },
      {
        name: "Potassium (Banana)",
        description: "Supports heart and muscle function",
      },
      {
        name: "Polyphenols (Apple)",
        description: "Provide antioxidant protection",
      },
    ],
    nutrition: {
      calories: 325,
      carbs: 83.1,
      naturalSugars: 53.6,
      addedSugars: 0,
      fiber: 12.3,
      protein: 2.8,
      fat: 1.1,
    },
    servingIdeas: [
      "as a standalone fruit treat",
      "with tea or coffee",
      "in breakfast bowls",
      "in yogurt",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "mid-day snack",
      "between meals",
      "kids' lunchboxes",
    ],
  },
  {
    name: "APPLE / PINEAPPLE FRUIT LEATHER",
    title: "Apple & Pineapple Fruit Leather",
    category: Category.FruitLeather,
    badge: "natural",
    tagline:
      "A natural fruit leather made from ripe apples and pineapples, gently dehydrated to preserve their natural taste and nutrients. Just fruit — nothing else.",
    tags: [
      "Apple + Pineapple",
      "No Added Sugar",
      "High Vitamin C",
      "Natural Treat",
    ],
    freeFrom: [
      "added sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/APPLE : PINEAPPLE FRUIT LEATHER.webp",
    benefits: [
      {
        name: "Vitamin C (Pineapple)",
        description: "Supports immune function",
      },
      {
        name: "Dietary Fiber",
        description: "Supports digestion and gut health",
      },
      {
        name: "Natural Carbohydrates",
        description: "Provide steady energy throughout the day",
      },
      {
        name: "Antioxidants",
        description: "Help protect cells from oxidative stress",
      },
    ],
    nutrition: {
      calories: 256,
      carbs: 60.4,
      naturalSugars: 51,
      addedSugars: 0,
      fiber: 10,
      protein: 1.9,
      fat: 0.8,
    },
    servingIdeas: [
      "as a standalone fruit treat",
      "with tea or coffee",
      "in breakfast bowls",
      "in yogurt",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "mid-day snack",
      "between meals",
      "kids' lunchboxes",
    ],
  },
  {
    name: "ORANGE SLICES WITH 70% DARK CHOCOLATE",
    title: "Orange Slices with Dark Chocolate",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural snack made from gently dehydrated orange slices, half-coated in rich 70% dark chocolate. Real fruit with premium dark chocolate — nothing else.",
    tags: [
      "Orange + Dark Chocolate",
      "No Added Sugar",
      "High Vitamin C",
      "70% Cocoa",
    ],
    freeFrom: [
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/ORANGE SLICES WITH 70 DARK CHOCOLATE.webp",
    benefits: [
      {
        name: "Vitamin C (Orange)",
        description: "Supports immune function",
      },
      {
        name: "Antioxidants (Dark Chocolate)",
        description: "Help protect cells from oxidative stress",
      },
      {
        name: "Dietary Fiber",
        description: "Supports digestion and gut health",
      },
      {
        name: "Flavonoids (Cocoa)",
        description: "Support heart health and circulation",
      },
      {
        name: "Natural Carbohydrates",
        description: "Provide steady energy",
      },
    ],
    nutrition: {
      calories: 390,
      carbs: 58,
      naturalSugars: 40,
      addedSugars: 0,
      fiber: 9,
      protein: 4,
      fat: 14,
      vitaminC: 35,
    },
    servingIdeas: [
      "as a standalone snack",
      "with tea or coffee",
      "in breakfast bowls",
      "as a dessert alternative",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "mid-day snack",
      "between meals",
      "kids' lunchboxes",
      "dessert with coffee",
    ],
  },
  {
    name: "ORANGE SLICES WITH MILK CHOCOLATE",
    title: "Orange Slices with Milk Chocolate",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural snack made from gently dehydrated orange slices, half-coated in smooth milk chocolate. Real fruit with creamy milk chocolate — nothing else.",
    tags: [
      "Orange + Milk Chocolate",
      "No Added Sugar",
      "High Vitamin C",
      "Kids' Favourite",
    ],
    freeFrom: [
      "added refined sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/ORANGE SLICES WITH MILK CHOCOLATE.webp",
    benefits: [
      {
        name: "Vitamin C (Orange)",
        description: "Supports immune function",
      },
      {
        name: "Antioxidants (Cocoa)",
        description: "Help protect cells from oxidative stress",
      },
      {
        name: "Dietary Fiber",
        description: "Supports digestion and gut health",
      },
      {
        name: "Natural Carbohydrates",
        description: "Provide steady energy",
      },
    ],
    nutrition: {
      calories: 410,
      carbs: 60,
      naturalSugars: 45,
      addedSugars: 0,
      fiber: 7,
      protein: 4,
      fat: 16,
      vitaminC: 30,
    },
    servingIdeas: [
      "as a standalone snack",
      "with tea or coffee",
      "in breakfast bowls",
      "in yogurt",
      "as a dessert alternative",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "mid-day snack",
      "between meals",
      "kids' lunchboxes",
      "dessert with coffee",
    ],
  },
  {
    name: "ORANGE SLICES WITH 70% DARK CHOCOLATE & PINE NUTS",
    title: "Orange Slices with Dark Chocolate & Pine Nuts",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural snack made from gently dehydrated orange slices, half-coated in rich 70% dark chocolate and topped with pine nuts. Real fruit with premium dark chocolate and natural nuts — nothing else.",
    tags: [
      "Orange + Dark Chocolate + Pine Nuts",
      "No Added Sugar",
      "High Vitamin C",
      "70% Cocoa",
    ],
    freeFrom: [
      "added refined sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/ORANGE SLICES WITH 70 DARK CHOCOLATE AND PINE NUTS.webp",
    benefits: [
      {
        name: "Vitamin C (Orange)",
        description: "Supports immune function",
      },
      {
        name: "Antioxidants (Dark Chocolate)",
        description: "Help protect cells from oxidative stress",
      },
      {
        name: "Healthy Fats (Pine Nuts)",
        description: "Support heart health",
      },
      {
        name: "Dietary Fiber",
        description: "Supports digestion and gut health",
      },
      {
        name: "Natural Carbohydrates",
        description: "Provide steady energy",
      },
    ],
    nutrition: {
      calories: 430,
      carbs: 55,
      naturalSugars: 38,
      addedSugars: 0,
      fiber: 9,
      protein: 5,
      fat: 18,
      vitaminC: 30,
    },
    servingIdeas: [
      "as a standalone snack",
      "with tea or coffee",
      "in breakfast bowls",
      "in yogurt",
      "as a dessert alternative",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "mid-day snack",
      "between meals",
      "kids' lunchboxes",
      "dessert with coffee",
    ],
  },
  {
    name: "DRIED PINEAPPLE",
    title: "Dried Pineapple",
    category: Category.DriedFruits,
    badge: "natural",
    tagline:
      "A natural fruit snack made from ripe pineapples, gently dehydrated to preserve their natural taste and nutrients. Just fruit — nothing else.",
    tags: [
      "100% Pineapple",
      "No Added Sugar",
      "High Vitamin C",
      "Tropical Taste",
    ],
    freeFrom: [
      "added sugar",
      "preservatives",
      "artificial colors",
      "syrups",
      "gluten",
    ],
    image: "/images/products/DRIED PINEAPPLE.webp",
    benefits: [
      {
        name: "Vitamin C",
        description: "Supports immune function",
      },
      {
        name: "Dietary Fiber",
        description: "Supports digestion and gut health",
      },
      {
        name: "Natural Carbohydrates",
        description: "Provide steady energy throughout the day",
      },
      {
        name: "Antioxidants",
        description: "Help protect cells from oxidative stress",
      },
    ],
    nutrition: {
      calories: 353,
      carbs: 89,
      naturalSugars: 68,
      addedSugars: 0,
      fiber: 2.3,
      protein: 0.8,
      fat: 0.2,
      vitaminC: 28,
    },
    servingIdeas: [
      "as a standalone fruit snack",
      "with tea or coffee",
      "in breakfast bowls",
      "in yogurt",
      "on the go",
    ],
    occasions: [
      "work",
      "travel",
      "mid-day snack",
      "between meals",
      "kids' lunchboxes",
    ],
  },
];

export const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

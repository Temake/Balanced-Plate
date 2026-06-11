import { 
  type LucideIcon, 
  UtensilsCrossed, 
  Soup, 
  Flame, 
  LeafyGreen, 
  Beef, 
  Pizza, 
  Banana, 
  CupSoda 
} from 'lucide-react';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  dietaryTags: string[];
  healthNotes: string;
  category: 'Soups' | 'Rice Dishes' | 'Swallow' | 'Snacks' | 'Proteins' | 'Drinks';
  icon: LucideIcon;
}

export const recipes: Recipe[] = [
  {
    id: 'jollof-rice',
    name: 'Jollof Rice',
    description:
      'A beloved West African one-pot rice dish cooked in a rich, smoky tomato and pepper sauce with aromatic spices. The hallmark of any Nigerian celebration.',
    prepTime: '45 min',
    difficulty: 'Medium',
    servings: 6,
    dietaryTags: ['Gluten-Free', 'Dairy-Free', 'High Carb'],
    healthNotes:
      'Rich in lycopene from tomatoes. Use brown rice for extra fibre and a lower glycaemic index.',
    category: 'Rice Dishes',
    icon: UtensilsCrossed,
  },
  {
    id: 'egusi-soup',
    name: 'Egusi Soup',
    description:
      'A thick, hearty soup made from ground melon seeds, leafy greens, and assorted proteins. A staple across Yoruba, Igbo, and Hausa kitchens.',
    prepTime: '50 min',
    difficulty: 'Medium',
    servings: 4,
    dietaryTags: ['High Protein', 'Keto-Friendly', 'Low Carb'],
    healthNotes:
      'Melon seeds are packed with healthy fats, magnesium, and zinc. Pair with a small portion of swallow for balanced macros.',
    category: 'Soups',
    icon: Soup,
  },
  {
    id: 'pepper-soup',
    name: 'Pepper Soup',
    description:
      'A light, intensely spiced broth bursting with chilli, uziza, and ehuru. Traditionally served with goat meat, catfish, or chicken.',
    prepTime: '35 min',
    difficulty: 'Easy',
    servings: 4,
    dietaryTags: ['Low Carb', 'High Protein', 'Dairy-Free'],
    healthNotes:
      'The warming spices aid digestion and may help relieve cold symptoms. Very low in calories when made with lean protein.',
    category: 'Soups',
    icon: Flame,
  },
  {
    id: 'moi-moi',
    name: 'Moi Moi',
    description:
      'A savoury steamed bean pudding made from blended black-eyed peas, onions, and peppers. Often enriched with eggs, fish, or corned beef.',
    prepTime: '60 min',
    difficulty: 'Medium',
    servings: 8,
    dietaryTags: ['High Protein', 'Gluten-Free', 'High Fibre'],
    healthNotes:
      'Excellent plant-based protein source. Black-eyed peas provide iron, folate, and soluble fibre for heart health.',
    category: 'Snacks',
    icon: Soup, // Used to be Beans
  },
  {
    id: 'efo-riro',
    name: 'Efo Riro',
    description:
      'A vibrant Yoruba-style vegetable soup featuring sautéed spinach or African spinach in a peppery palm oil base with locust beans and assorted meats.',
    prepTime: '30 min',
    difficulty: 'Easy',
    servings: 4,
    dietaryTags: ['Low Carb', 'High Protein', 'Vitamin-Rich'],
    healthNotes:
      'Loaded with vitamins A, C, and K from leafy greens. Use minimal palm oil and lean proteins for a heart-healthy version.',
    category: 'Soups',
    icon: LeafyGreen,
  },
  {
    id: 'fried-rice',
    name: 'Fried Rice',
    description:
      'Nigerian-style stir-fried rice tossed with colourful vegetables, liver, shrimp, and seasoned with curry and thyme. A party-favourite side dish.',
    prepTime: '40 min',
    difficulty: 'Medium',
    servings: 6,
    dietaryTags: ['High Protein', 'Balanced', 'Dairy-Free'],
    healthNotes:
      'Adding mixed vegetables boosts micronutrient content. Swap white rice for cauliflower rice to cut carbs significantly.',
    category: 'Rice Dishes',
    icon: UtensilsCrossed,
  },
  {
    id: 'suya',
    name: 'Suya',
    description:
      'Thinly sliced, flame-grilled beef skewers coated in a spicy, nutty yaji spice blend. A beloved Nigerian street food enjoyed nationwide.',
    prepTime: '25 min',
    difficulty: 'Easy',
    servings: 4,
    dietaryTags: ['High Protein', 'Keto-Friendly', 'Low Carb'],
    healthNotes:
      'Lean beef provides iron and B12. The groundnut-based yaji spice adds healthy fats. Watch sodium levels in commercial blends.',
    category: 'Proteins',
    icon: Beef,
  },
  {
    id: 'akara',
    name: 'Akara',
    description:
      'Crispy, golden bean fritters made from a spiced black-eyed pea batter and deep-fried to perfection. A classic Nigerian breakfast or snack.',
    prepTime: '20 min',
    difficulty: 'Easy',
    servings: 6,
    dietaryTags: ['High Protein', 'Gluten-Free', 'High Fibre'],
    healthNotes:
      'Rich in plant protein and fibre. For a healthier version, try air-frying to reduce oil absorption significantly.',
    category: 'Snacks',
    icon: Pizza, // Used to be Flatbread/Akara
  },
  {
    id: 'plantain-porridge',
    name: 'Plantain Porridge',
    description:
      'Ripe plantains simmered in a savoury tomato and pepper stew with vegetables and optional smoked fish. Thick, comforting, and naturally sweet.',
    prepTime: '30 min',
    difficulty: 'Easy',
    servings: 4,
    dietaryTags: ['Gluten-Free', 'Dairy-Free', 'Potassium-Rich'],
    healthNotes:
      'Plantains are an excellent source of potassium, vitamin A, and complex carbohydrates for sustained energy.',
    category: 'Swallow',
    icon: Banana,
  },
  {
    id: 'ogbono-soup',
    name: 'Ogbono Soup',
    description:
      'A thick, mucilaginous soup made from ground ogbono (bush mango) seeds, known for its signature draw texture. Rich with meat and vegetables.',
    prepTime: '45 min',
    difficulty: 'Medium',
    servings: 4,
    dietaryTags: ['High Protein', 'Low Carb', 'High Fibre'],
    healthNotes:
      'Ogbono seeds contain soluble fibre that aids digestion and may help regulate blood sugar levels. Rich in healthy fats.',
    category: 'Soups',
    icon: Soup,
  },
  {
    id: 'beans-porridge',
    name: 'Beans Porridge',
    description:
      'Honey beans slow-cooked with palm oil, onions, peppers, and plantain until soft and flavourful. A protein-packed comfort meal.',
    prepTime: '40 min',
    difficulty: 'Easy',
    servings: 4,
    dietaryTags: ['High Protein', 'High Fibre', 'Gluten-Free'],
    healthNotes:
      'Beans are one of the best sources of plant protein and soluble fibre. Supports heart health and blood sugar management.',
    category: 'Swallow',
    icon: UtensilsCrossed, // Used to be Beans
  },
  {
    id: 'zobo-drink',
    name: 'Zobo Drink',
    description:
      'A refreshing, ruby-red drink brewed from dried hibiscus petals (zobo leaves) with ginger, pineapple, and cloves. Served chilled.',
    prepTime: '20 min',
    difficulty: 'Easy',
    servings: 8,
    dietaryTags: ['Low Calorie', 'Vitamin-Rich', 'Dairy-Free'],
    healthNotes:
      'Hibiscus is rich in antioxidants and vitamin C. Studies suggest it may help lower blood pressure. Sweeten with honey instead of sugar.',
    category: 'Drinks',
    icon: CupSoda,
  },
];

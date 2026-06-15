import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header, { BOTTOM_NAV_HEIGHT } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { recipes } from '@/data/recipes';
import type { Recipe } from '@/data/recipes';
import { CookingPot, Clock, Search, X, ChefHat, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'All',
  'Soups',
  'Rice Dishes',
  'Swallow',
  'Snacks',
  'Proteins',
  'Drinks',
] as const;

type Category = (typeof CATEGORIES)[number];

const DIFFICULTY_COLORS: Record<Recipe['difficulty'], string> = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Hard: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

// ─── Recipe Card ──────────────────────────────────────────────────────────────

interface RecipeCardProps {
  recipe: Recipe;
  onCook: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onCook }) => (
  <div className="group flex flex-col rounded-xl border border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-gray-800/60 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-300/50 dark:hover:border-emerald-600/30 hover:-translate-y-0.5">
    {/* Icon hero */}
    <div className="flex items-center justify-center h-28 sm:h-32 bg-gray-50 dark:bg-gray-800/80 transition-colors group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-950/20 text-gray-500 dark:text-gray-400">
      <div className="transition-transform duration-300 group-hover:scale-110 group-hover:text-emerald-500">
        <recipe.icon className="w-16 h-16 sm:w-20 sm:h-20" strokeWidth={1.5} />
      </div>
    </div>

    {/* Content */}
    <div className="flex flex-col flex-1 p-3.5 sm:p-4">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-snug mb-1">
        {recipe.name}
      </h3>

      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
        {recipe.description}
      </p>

      {/* Dietary tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {recipe.dietaryTags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-block text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between mt-auto mb-3">
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {recipe.prepTime}
        </span>
        <span
          className={cn(
            'text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full',
            DIFFICULTY_COLORS[recipe.difficulty],
          )}
        >
          {recipe.difficulty}
        </span>
      </div>

      {/* CTA */}
      <Button
        onClick={() => onCook(recipe.id)}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg h-9 text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-500/20 transition-all duration-200 gap-1.5"
      >
        <ChefHat className="w-3.5 h-3.5" />
        Start Cooking
      </Button>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const Recipes: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [customDish, setCustomDish] = useState('');
  const [category, setCategory] = useState<Category>('All');

  const filteredRecipes = useMemo(() => {
    let list = recipes;

    if (category !== 'All') {
      list = list.filter((r) => r.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      );
    }

    return list;
  }, [search, category]);

  const handleCook = (id: string) => navigate(`/cook/${id}`);
  const handleCustomCook = () => {
    const dish = customDish.trim();
    if (!dish) return;
    navigate(`/cook/custom?dish=${encodeURIComponent(dish)}`);
  };

  return (
    <div className={cn('min-h-screen bg-background flex flex-col', BOTTOM_NAV_HEIGHT, 'md:pb-0')}>
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow max-w-7xl">
        {/* ─── Page Header ─── */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CookingPot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Recipes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Explore authentic Nigerian dishes with step-by-step AI cooking guides.
          </p>
        </div>

        {/* ─── Search ─── */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            id="recipe-search"
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 dark:focus:border-emerald-600 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* ─── Custom AI Dish ─── */}
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Cook anything with AI
              </h2>
              <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                Type any dish and get ingredients plus step-by-step preparation guidance.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={customDish}
              onChange={(event) => setCustomDish(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleCustomCook();
              }}
              placeholder="e.g. Afang soup, masa, spaghetti jollof"
              className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-gray-900 dark:text-white"
            />
            <Button
              onClick={handleCustomCook}
              disabled={!customDish.trim()}
              className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <ChefHat className="h-4 w-4" />
              Generate Guide
            </Button>
          </div>
        </div>

        {/* ─── Category Tabs ─── */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 scrollbar-hide -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'flex-shrink-0 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 border whitespace-nowrap',
                  active
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400',
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ─── Recipe Grid ─── */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onCook={handleCook} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <CookingPot className="w-9 h-9 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              No recipes found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Try adjusting your search or browse a different category.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Recipes;

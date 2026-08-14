// Shape returned inside recommend/routine responses (src/api/recommend, src/api/routine).
export type RoutineProduct = {
  product_uid: string;
  score_uid: string;
  product_name: string;
  brand_name: string;
  category: string;
  product_type: string;
  score: number;
  match_label: string;
  explanation: string;
  hero_ingredient?: string;
  secondary_hero_ingredients?: string;
  size?: string;
  mrp?: string;
  selling_price?: string;
  when_to_use?: string;
  dos?: string;
  donts?: string;
  usage_instructions?: string;
  ingredients?: string;
  image?: string;
};

// Shape returned by GET /retailer-products (src/api/retailer-products).
export type RetailerProduct = {
  id: number | string;
  site?: string;
  product_id?: string;
  sku?: string;
  categories?: string[];
  brand: string;
  product_name: string;
  variant?: string;
  mrp?: number | string | null;
  selling_price?: number | string | null;
  discount_pct?: number | null;
  rating?: number | null;
  rating_count?: number | null;
  in_stock?: boolean;
  product_url?: string;
  image_url?: string;
  product_attributes?: Record<string, unknown>;
};

// Normalized shape the UI actually renders, regardless of which endpoint it came from.
// Roopsee doesn't sell directly — every product links out to a retailer.
// Catalog products (from quiz results / recommend) carry a productUid that
// resolves to *multiple* retailer offers via GET /product-offers. Products
// browsed straight from /retailer-products are already a single retailer's
// listing, so they carry a direct productUrl/site instead.
export type Product = {
  id: string;
  brand: string;
  name: string;
  category: string;
  price: number;
  mrp?: number;
  imageUrl?: string;
  matchScore?: number;
  matchLabel?: string;
  rating?: number;
  heroIngredient?: string;
  whenToUse?: string;
  usageInstructions?: string;
  dos?: string;
  donts?: string;
  ingredients?: string;
  productUid?: string;
  productUrl?: string;
  site?: string;
};

function toNumber(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const num = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(num) ? num : undefined;
}

// The categories array sometimes holds a single element that is itself a
// JSON-encoded array (e.g. categories: ['["Body Care"]']) rather than a
// plain string, so unwrap that before using it as a display label.
function firstCategoryLabel(categories: string[] | undefined): string | undefined {
  const raw = categories?.[0];
  if (!raw) return undefined;

  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
        return parsed[0];
      }
    } catch {
      // Fall through to using the raw string as-is.
    }
  }

  return raw;
}

export function productFromRoutine(product: RoutineProduct): Product {
  const price = toNumber(product.selling_price) ?? toNumber(product.mrp) ?? 0;
  return {
    id: product.product_uid,
    brand: product.brand_name,
    name: product.product_name,
    category: product.product_type || product.category,
    price,
    mrp: toNumber(product.mrp),
    imageUrl: product.image,
    matchScore: product.score,
    matchLabel: product.match_label,
    heroIngredient: product.hero_ingredient,
    whenToUse: product.when_to_use,
    usageInstructions: product.usage_instructions,
    dos: product.dos,
    donts: product.donts,
    ingredients: product.ingredients,
    productUid: product.product_uid,
  };
}

export function productFromRetailer(product: RetailerProduct): Product {
  const price = toNumber(product.selling_price) ?? toNumber(product.mrp) ?? 0;
  return {
    id: String(product.id),
    brand: product.brand,
    name: product.product_name,
    category: firstCategoryLabel(product.categories) || 'Skincare',
    price,
    mrp: toNumber(product.mrp),
    imageUrl: product.image_url,
    rating: product.rating ?? undefined,
    productUrl: product.product_url,
    site: product.site,
  };
}

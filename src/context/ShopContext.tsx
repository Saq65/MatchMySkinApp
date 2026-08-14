import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../types/product';

type ShopContextValue = {
  wishlist: Product[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const value = useMemo<ShopContextValue>(() => {
    const toggleWishlist = (product: Product) => {
      setWishlist(prev =>
        prev.some(item => item.id === product.id)
          ? prev.filter(item => item.id !== product.id)
          : [...prev, product],
      );
    };

    return {
      wishlist,
      isWishlisted: (productId: string) => wishlist.some(item => item.id === productId),
      toggleWishlist,
    };
  }, [wishlist]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return ctx;
}

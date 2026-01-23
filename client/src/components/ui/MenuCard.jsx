import React, { useMemo, useState } from 'react';
import { Button } from './button';
import { useCart } from '../../context/CartContextValues';

const MenuCard = ({ item }) => {
  const { addToCart } = useCart();
  const hasVariants = Array.isArray(item?.variants) && item.variants.length > 0;
  const [showVariants, setShowVariants] = useState(false);

  // Calculate default selections based on variants (only when item changes)
  const defaultSelections = useMemo(() => {
    if (!hasVariants) return {};
    const defaults = {};
    item.variants.forEach((variant) => {
      defaults[variant.name] = [];
    });
    return defaults;
  }, [item, hasVariants]);

  // Initialize with function to use memoized defaultSelections
  const [selections, setSelections] = useState(() => defaultSelections);

  const selectedModifiers = useMemo(() => {
    return Object.entries(selections).flatMap(([name, opts]) => {
      if (!Array.isArray(opts) || opts.length === 0) return [{ name, option: null, priceAdjustment: 0 }];
      return opts.map((option) => ({
        name,
        option: option?.label,
        priceAdjustment: Number(option?.priceAdjustment) || 0,
      }));
    });
  }, [selections]);

  const finalPrice = useMemo(() => {
    const base = Number(item.price) || 0;
    const adjustments = selectedModifiers.reduce((acc, m) => acc + (m.priceAdjustment || 0), 0);
    return base + adjustments;
  }, [item.price, selectedModifiers]);

  const handleConfirmAdd = () => {
    const enrichedItem = { ...item, price: finalPrice };
    addToCart(enrichedItem, 1, selectedModifiers);
    setShowVariants(false);
  };

  return (
    <div className="bg-surface rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-secondary/10">
      <div className="h-44 sm:h-48 overflow-hidden bg-secondary/10">
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-grow gap-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-3 h-3 rounded-full border ${item.isVeg ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'}`}
                aria-label={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
              ></span>
              <h3 className="text-lg sm:text-xl font-bold text-text leading-tight line-clamp-2">{item.name}</h3>
            </div>
            <p className="text-secondary text-sm line-clamp-2">{item.description}</p>
            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-zinc-800 text-xs text-zinc-200 px-2 py-1 rounded-full border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && <span className="text-xs text-zinc-400">+{item.tags.length - 3} more</span>}
              </div>
            )}
          </div>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap">
            {item.category}
          </span>
        </div>
        <div className="flex justify-between items-center mt-auto pt-1">
          <span className="text-base sm:text-lg font-bold text-text">${finalPrice.toFixed(2)}</span>
          <Button
            variant="outline"
            className="text-sm px-4 py-2 min-h-[44px]"
            onClick={(e) => {
              e.stopPropagation();
              if (hasVariants) {
                setShowVariants(true);
              } else {
                addToCart(item);
              }
            }}
          >
            {hasVariants ? 'Choose' : 'Add'}
          </Button>
        </div>
      </div>

      {showVariants && hasVariants && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
          onClick={() => setShowVariants(false)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-secondary">Customize</p>
                <h3 className="text-lg font-bold text-text">{item.name}</h3>
              </div>
              <button className="text-secondary hover:text-text" onClick={() => setShowVariants(false)}>
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {item.variants.map((variant) => (
                <div key={variant.name} className="space-y-2">
                  <p className="text-sm font-semibold text-text">{variant.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => {
                      const selectedList = selections[variant.name] || [];
                      const isSelected = selectedList.some((o) => o.label === option.label);
                      return (
                        <button
                          key={option.label}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                            isSelected ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/10 text-text'
                          }`}
                          onClick={() =>
                            setSelections((prev) => {
                              const current = prev[variant.name] || [];
                              const exists = current.some((o) => o.label === option.label);
                              const next = exists
                                ? current.filter((o) => o.label !== option.label)
                                : [...current, option];
                              return { ...prev, [variant.name]: next };
                            })
                          }
                        >
                          <span className="font-medium">{option.label}</span>
                          {option.priceAdjustment ? (
                            <span className="ml-2 text-xs text-secondary">
                              {option.priceAdjustment > 0 ? `+${option.priceAdjustment}` : option.priceAdjustment}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-sm text-secondary">
                <p className="text-text font-semibold">Total: ${finalPrice.toFixed(2)}</p>
              </div>
              <Button className="px-5" onClick={handleConfirmAdd}>
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuCard;

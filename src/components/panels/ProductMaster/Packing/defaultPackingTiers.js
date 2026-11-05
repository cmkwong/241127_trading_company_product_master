import { v4 as uuidv4 } from 'uuid';

/**
 * Shared helpers for seeding the Price-by-Quantity tiers from the
 * "default packing" row. Kept dependency-light (only `uuid`) so both
 * Main_Pack and PriceByQtyTable can import from it without cycles.
 */

export const MAX_PRICE_TIERS = 4;
export const TIER_QTY_MULTIPLIER = 3;
export const MAX_MIN_ORDER_QTY = 2147483647; // MySQL INT upper bound

/**
 * Build the quantity ladder starting from the default packing's Qty/Pack.
 * Each subsequent tier is multiplied by TIER_QTY_MULTIPLIER
 * (e.g. 120 -> 360 -> 1080 -> 3240).
 *
 * Returns [] when the base quantity is missing / zero / non-numeric.
 * Values above INT max are dropped; duplicates are skipped.
 */
export const buildDefaultTierQuantities = (
  baseQty,
  count = MAX_PRICE_TIERS,
) => {
  const base = Math.trunc(Number(baseQty));
  if (!Number.isFinite(base) || base < 1) return [];

  const quantities = [];
  let value = base;
  for (let i = 0; i < count; i += 1) {
    if (value > MAX_MIN_ORDER_QTY) break;
    if (!quantities.includes(value)) quantities.push(value);
    value *= TIER_QTY_MULTIPLIER;
  }
  return quantities;
};

/**
 * Return the lowest free rung of `base × TIER_QTY_MULTIPLIER^k` that is not in
 * `usedQuantities`, so the next added tier continues the default packing's
 * ladder (120 -> 360 -> 1080 -> 3240) and re-fills a gap if a middle tier was
 * deleted. Returns `null` when there is no usable base (missing/zero/NaN) or
 * the next rung would exceed MySQL's INT upper bound.
 */
export const nextLadderQuantity = (baseQty, usedQuantities = []) => {
  const base = Math.trunc(Number(baseQty));
  if (!Number.isFinite(base) || base < 1) return null;

  const used = new Set(
    (usedQuantities || []).map((q) => Number(q)).filter(Number.isFinite),
  );

  let value = base;
  for (let guard = 0; guard < 64 && used.has(value); guard += 1) {
    value *= TIER_QTY_MULTIPLIER;
  }

  return value > MAX_MIN_ORDER_QTY ? null : value;
};

/**
 * Build the single tier to create the moment Default is ticked. Returns `null`
 * (no write) when the tiers are already at MAX_PRICE_TIERS, the base quantity
 * is missing/zero/non-numeric, or a tier with that quantity already exists
 * (which would violate the (product_id, min_order_qty, currency_id) key).
 *
 * Price is intentionally left blank — it is entered manually afterwards.
 */
export const buildFirstTierRow = ({
  rows,
  baseQty,
  currencyId,
  productId,
}) => {
  const live = (rows || []).filter((row) => !row?._delete);
  if (live.length >= MAX_PRICE_TIERS) return null;

  const base = Math.trunc(Number(baseQty));
  if (!Number.isFinite(base) || base < 1) return null;
  if (live.some((row) => Number(row?.min_order_qty) === base)) return null;

  const lowest = [...live].sort(
    (a, b) => Number(a?.min_order_qty ?? 0) - Number(b?.min_order_qty ?? 0),
  )[0];

  return {
    id: uuidv4(),
    product_id: productId,
    min_order_qty: base,
    currency_id: lowest?.currency_id || currencyId || '',
    sale_price: '',
  };
};

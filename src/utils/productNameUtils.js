const toArray = (value) => (Array.isArray(value) ? value : []);

const toSafeString = (value) => String(value || '').trim();

const getRankedProductNames = (rows = []) => {
  return toArray(rows)
    .filter((row) => !row?._delete)
    .map((row) => {
      const name = toSafeString(row?.name || row?.value || row?.label);
      const parsedOrder = Number(row?.display_order);
      const hasOrder = Number.isFinite(parsedOrder);

      return {
        name,
        rank: hasOrder && parsedOrder === 1 ? 0 : hasOrder ? 1 : 2,
        order: hasOrder ? parsedOrder : Number.POSITIVE_INFINITY,
      };
    })
    .filter((row) => row.name)
    .sort((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }

      return a.order - b.order;
    });
};

export const pickDisplayOrderPreferredName = (rows = []) => {
  return toSafeString(getRankedProductNames(rows)[0]?.name);
};

export const getProductDisplayName = (product = {}) => {
  const productId = toSafeString(product?.id).toLowerCase();
  const nestedNames = getRankedProductNames(product?.product_names).map(
    (row) => row.name,
  );

  const candidates = [
    product?.product_display_name,
    product?.display_name,
    product?.product_name,
    ...nestedNames,
    product?.name,
    product?.id,
  ]
    .map((value) => toSafeString(value))
    .filter(Boolean);

  return (
    candidates.find((value) => value.toLowerCase() !== productId) ||
    candidates[0] ||
    ''
  );
};

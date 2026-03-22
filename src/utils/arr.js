export const removeDuplicatedRow = (arr) => {
  let values_strs = [];
  const uniqueRows = arr
    .map((el) => {
      // const values_str = JSON.stringify(values);
      const values_str = JSON.stringify(el);
      if (!values_strs.includes(values_str)) {
        values_strs.push(values_str);
        // return unique element
        return el;
      } else {
        return undefined;
      }
    })
    .filter((el) => el);
  return uniqueRows;
};

export const sortByDisplayOrder = (
  items = [],
  {
    orderKey = 'display_order',
    tieBreakerKey = 'id',
    invalidOrderValue = Number.MAX_SAFE_INTEGER,
  } = {},
) => {
  const source = Array.isArray(items) ? items : [];

  return [...source].sort((a, b) => {
    const aOrder = Number(a?.[orderKey]);
    const bOrder = Number(b?.[orderKey]);

    const safeA =
      Number.isFinite(aOrder) && aOrder > 0 ? aOrder : invalidOrderValue;
    const safeB =
      Number.isFinite(bOrder) && bOrder > 0 ? bOrder : invalidOrderValue;

    if (safeA !== safeB) return safeA - safeB;

    return String(a?.[tieBreakerKey] || '').localeCompare(
      String(b?.[tieBreakerKey] || ''),
    );
  });
};

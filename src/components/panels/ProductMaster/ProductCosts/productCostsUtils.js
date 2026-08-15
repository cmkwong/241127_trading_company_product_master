export const truthy = (v) => v === true || v === 1 || v === '1';

export const getVariantTypeId = (row, type) => {
  if (!row) return null;
  if (type === 'color') {
    return (
      row.color_type_id ?? row.master_color_type_id ?? row.color_id ?? null
    );
  }
  if (type === 'size') {
    return row.size_type_id ?? row.master_size_type_id ?? row.size_id ?? null;
  }
  return (
    row.capacity_type_id ??
    row.master_capacity_type_id ??
    row.capacity_id ??
    null
  );
};

export const getCapacityLabel = (item) => {
  if (!item) return '';
  if (item.name) return item.name;
  const value = item.value ?? '';
  const unit = item.unit ?? '';
  return `${value} ${unit}`.trim();
};

export const normalizeLower = (v) =>
  String(v || '')
    .trim()
    .toLowerCase();

export const getCostComboKey = (
  colorVariantId,
  capacityVariantId,
  sizeVariantId,
) =>
  [colorVariantId || '', capacityVariantId || '', sizeVariantId || ''].join(
    '|',
  );

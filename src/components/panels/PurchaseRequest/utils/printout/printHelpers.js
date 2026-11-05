export const toSafeString = (value) => String(value || '').trim();

export const toArray = (value) => (Array.isArray(value) ? value : []);

export const getSupplierDisplayName = (supplier) =>
  toSafeString(
    supplier?.supplier_display_name ||
      supplier?.display_name ||
      supplier?.supplier_name ||
      supplier?.name ||
      supplier?.id,
  );

export const getSupplierAddressPreview = (address) => {
  const detail = toSafeString(address?.address_detail);
  if (detail) return detail;

  const parts = [
    address?.address,
    address?.address_1,
    address?.line1,
    address?.address_2,
    address?.line2,
    address?.city,
    address?.state || address?.province,
    address?.country,
    address?.postal_code || address?.zip_code,
  ]
    .map((value) => toSafeString(value))
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return toSafeString(address?.name || address?.label || address?.id);
};

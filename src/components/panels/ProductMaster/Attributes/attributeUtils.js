// Preserve the user's case (trim only) for the stored value.
export const normalize = (value) => String(value ?? '').trim();

// Case-insensitive comparison/dedup key.
export const keyOf = (value) => normalize(value).toLowerCase();

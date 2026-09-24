// Default AI editing prompt stored on the front-end so the server endpoint can
// remain generic. It is shown prefilled in the AI prompt dialog.
export const DEFAULT_PRODUCT_IMAGE_AI_PROMPT = `Edit this product image while preserving its original visual design.

1. Identify all visible Simplified or Traditional Chinese text.
2. Translate the Chinese text into concise, natural, professional English appropriate for product packaging or advertising.
3. Remove the original Chinese text and place the English translation in the same corresponding locations.
4. Match the original typography and design as closely as possible, including font style, weight, size, colour, spacing, alignment, text direction, perspective, and layout.
5. Reconstruct the background cleanly wherever Chinese text is removed. Do not leave overlapping text, blurred characters, artefacts, or traces of the original Chinese text.
6. Preserve all products, logos, illustrations, colours, backgrounds, borders, visual effects, and other non-text elements without modification.
7. Do not translate or alter brand names, model numbers, certification symbols, URLs, or trademarks unless they are clearly descriptive Chinese text.
8. Preserve the original aspect ratio, composition, and highest possible image quality.
9. Keep every existing watermark, logo, certification mark and trademark exactly where it is, overlaid on the artwork. Never erase or replace a region with a flat white or uniform colour.
10. The artwork must fill the entire frame edge-to-edge. Do not add, extend or reserve any white or uniform margin, border, bar or blank area.
11. Keep the output image resolution as original.`;

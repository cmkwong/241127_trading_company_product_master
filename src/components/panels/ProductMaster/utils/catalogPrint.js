import { buildCatalogDocumentHtml } from './CatalogPreview';

/**
 * Builds the standalone A4 HTML document for the Product Catalog. The markup
 * and styling live in `CatalogPreview.jsx` / `CatalogPreview.module.css`.
 */
export const buildCatalogA4Html = (options = {}) =>
  buildCatalogDocumentHtml(options);

/**
 * Print the already-rendered catalog preview iframe. Product images are blob
 * object URLs (created from base64 by `getProductsByIds`), so the preview is
 * rendered in a same-origin iframe (`srcDoc`) and printed directly from it —
 * what the user sees in the preview is exactly what gets printed.
 *
 * Mirrors `handlePrintFromPreview` in the Sales module so the two flows stay
 * consistent: wait for web fonts and image decode, set the document title so
 * the browser uses a sensible PDF filename, then print.
 */
export const printCatalogPreviewFrame = async (iframe, { title = '' } = {}) => {
  const frameWindow = iframe?.contentWindow;
  if (!frameWindow) {
    throw new Error('Catalog preview is not ready yet. Please try again.');
  }

  const originalTitle = document.title;
  const desiredTitle = String(title || '').trim();
  if (desiredTitle) {
    document.title = desiredTitle;
    try {
      frameWindow.document.title = desiredTitle;
    } catch (error) {
      console.warn('Unable to set iframe print title:', error);
    }
  }

  let restored = false;
  const restoreTitle = () => {
    if (restored) return;
    restored = true;
    document.title = originalTitle;
  };

  window.addEventListener('afterprint', restoreTitle, { once: true });
  setTimeout(restoreTitle, 2000);

  try {
    if (frameWindow.document?.fonts?.ready) {
      await frameWindow.document.fonts.ready;
    }

    const images = Array.from(frameWindow.document?.images || []);
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        if (typeof img.decode === 'function') {
          return img.decode().catch(() => undefined);
        }

        return new Promise((resolve) => {
          const cleanup = () => {
            img.removeEventListener('load', cleanup);
            img.removeEventListener('error', cleanup);
            resolve();
          };
          img.addEventListener('load', cleanup, { once: true });
          img.addEventListener('error', cleanup, { once: true });
        });
      }),
    );
  } catch (error) {
    console.warn('Print assets readiness check failed:', error);
  }

  frameWindow.focus();
  frameWindow.print();
};

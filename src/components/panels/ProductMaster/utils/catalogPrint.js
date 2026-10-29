import { buildCatalogDocumentHtml } from './catalogPreview';

/**
 * Builds the standalone A4 HTML document for the Product Catalog. The markup
 * and styling live in `catalogPreview.jsx` / `catalogPreview.module.css`.
 */
export const buildCatalogA4Html = (options = {}) =>
  buildCatalogDocumentHtml(options);

/**
 * Print the catalog. Product images are blob object URLs (created from
 * base64 by `getProductsByIds`), so we print through a hidden same-origin
 * iframe rather than a `window.open` popup — blob URLs resolve reliably in an
 * iframe and there is no popup-blocker dependency.
 */
export const printCatalogA4 = (options = {}) => {
  const html = buildCatalogA4Html(options);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1000);
  };

  const triggerPrint = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    cleanup();
  };

  const images = Array.from(doc.images || []);
  if (images.length > 0) {
    Promise.allSettled(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
      ),
    ).then(triggerPrint);
    // Safety net in case an image never fires load/error.
    setTimeout(triggerPrint, 3000);
  } else {
    triggerPrint();
  }
};


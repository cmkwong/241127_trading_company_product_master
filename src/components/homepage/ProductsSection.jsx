import { useEffect, useRef } from 'react';
import Header from '../common/Texts/Header';
import HomeProductCard from './HomeProductCard';
import styles from './ProductsSection.module.css';

// Resolve the element that actually scrolls for this grid. Depending on the
// page layout the grid itself may or may not be the scroll container, so walk
// up to the nearest ancestor that is scrollable and overflows; fall back to
// the document scroller.
const getScrollParent = (node) => {
  let el = node;
  while (el) {
    const { overflowY } = window.getComputedStyle(el);
    const scrollable = overflowY === 'auto' || overflowY === 'scroll';
    if (scrollable && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return document.scrollingElement || document.documentElement;
};

const ProductsSection = ({
  products = [],
  isLoading = false,
  error = null,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore = null,
}) => {
  const scrollerRef = useRef(null);

  // Infinite scroll: load the next page when the user scrolls near the bottom
  // of the scroll container. A scroll listener is used (rather than an
  // IntersectionObserver) so loading is only triggered by real user scroll,
  // never by a short/filtered grid that happens to keep a sentinel in view.
  useEffect(() => {
    if (!hasMore || isLoading || typeof onLoadMore !== 'function') {
      return undefined;
    }
    const root = getScrollParent(scrollerRef.current);
    if (!root) return undefined;

    let rafId = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const nearBottom =
          root.scrollHeight - root.scrollTop - root.clientHeight < 240;
        if (nearBottom) {
          onLoadMore();
        }
      });
    };

    root.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      root.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  const renderBody = () => {
    if (isLoading && !products.length) {
      return <p className={styles.emptyText}>Loading products…</p>;
    }
    if (error && !products.length) {
      return (
        <p className={styles.emptyText}>
          Could not load products. Please try again.
        </p>
      );
    }
    if (!products.length) {
      return <p className={styles.emptyText}>No products available.</p>;
    }
    return (
      <div className={styles.productsGrid}>
        {products.map((item) => (
          <HomeProductCard key={item.id} product={item} />
        ))}
      </div>
    );
  };

  return (
    <section className={styles.productsSection}>
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <Header as="h2" size="M" color="#0c1e36" weight="bold">
            EXPORTER &amp; MANUFACTURER DIRECT DIRECTORY
          </Header>
          <span className={styles.pulse} aria-hidden="true" />
        </div>
        <button type="button" className={styles.sortButton}>
          Sort by: Hot Selling
        </button>
      </div>

      <div className={styles.gridScroller} ref={scrollerRef}>
        {renderBody()}
        {isLoadingMore && <p className={styles.emptyText}>Loading more…</p>}
        {hasMore && (
          <div className={styles.loadMoreWrap}>
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={onLoadMore}
              disabled={isLoading || isLoadingMore}
            >
              Load more
            </button>
          </div>
        )}
        {!hasMore && products.length > 0 && !isLoading && (
          <p className={styles.footerText}>You&apos;ve reached the end.</p>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;



import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TopBar from '../common/TopBar/TopBar';
import { useAuthContext } from '../../store/AuthContext';
import CategoryPanel from './CategoryPanel';
import UserStatusBar from './UserStatusBar';
import LowPriceZone from './LowPriceZone';
import ProductCollections from './ProductCollections';
import ProductsSection from './ProductsSection';
import {
  HOME_CATEGORY_ITEMS,
  LOW_PRICE_DEALS,
  NEW_ARRIVAL_ITEMS,
  RECOMMENDATION_ITEMS,
  USER_SHORTCUTS,
  USER_STATS,
} from './data/homepageData';
import {
  HOME_PAGE_SIZE,
  fetchHomeProducts,
  mapProductDetailToCard,
} from './utils/homeApi';
import styles from './Main_Homepage.module.css';

// Cap the number of consecutive auto-loaded pages while the active category has
// no matching products yet, so a category with no real products cannot hammer
// the server. The "Load more" button remains as a manual escape hatch.
const MAX_AUTO_FILL_PAGES = 5;

const mergeUnique = (existing, incoming) => {
  const seen = new Set(existing.map((item) => item.id));
  return [
    ...existing,
    ...incoming.filter((item) => item?.id != null && !seen.has(item.id)),
  ];
};

const Main_Homepage = () => {
  const { token } = useAuthContext();
  const [activeCategoryId, setActiveCategoryId] = useState(
    HOME_CATEGORY_ITEMS[0]?.id,
  );
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);
  const nextOffsetRef = useRef(0);
  const loadMoreInFlightRef = useRef(false);
  const autoFillCountRef = useRef(0);

  const loadPage = useCallback(
    async (offset, { append = false } = {}) => {
      const requestId = ++requestIdRef.current;
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await fetchHomeProducts(token, {
          offset,
          limit: HOME_PAGE_SIZE,
        });
        if (requestId !== requestIdRef.current) return;

        const mapped = result.details.map(mapProductDetailToCard);
        if (append) {
          setProducts((prev) => mergeUnique(prev, mapped));
          nextOffsetRef.current = offset + result.details.length;
        } else {
          setProducts(mapped);
          nextOffsetRef.current = result.details.length;
        }
        setHasMore(result.hasMore);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        if (!append) {
          setProducts([]);
          setHasMore(false);
          nextOffsetRef.current = 0;
        }
        setError(err);
      } finally {
        if (requestId === requestIdRef.current) {
          if (append) {
            setIsLoadingMore(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [token],
  );

  // Initial load (and reset) whenever the token changes (login/logout).
  useEffect(() => {
    requestIdRef.current += 1; // invalidate any in-flight request
    loadMoreInFlightRef.current = false;
    nextOffsetRef.current = 0;
    autoFillCountRef.current = 0;
    setIsLoadingMore(false);
    loadPage(0, { append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLoadMore = useCallback(() => {
    if (loadMoreInFlightRef.current || isLoading || !hasMore || error) return;
    loadMoreInFlightRef.current = true;
    loadPage(nextOffsetRef.current, { append: true }).finally(() => {
      loadMoreInFlightRef.current = false;
    });
  }, [isLoading, hasMore, error, loadPage]);

  const visibleProducts = useMemo(() => {
    return products.filter((item) =>
      (item.categoryIds || []).includes(activeCategoryId),
    );
  }, [products, activeCategoryId]);

  // Auto-fill: while the active category has no matching products yet and more
  // pages exist, keep pulling the next page (capped) so a sparse category can
  // still surface its products. Resets when the category or token changes.
  useEffect(() => {
    autoFillCountRef.current = 0;
  }, [activeCategoryId, token]);

  useEffect(() => {
    if (!hasMore || isLoading || error) return;
    if (visibleProducts.length > 0) {
      autoFillCountRef.current = 0;
      return;
    }
    if (autoFillCountRef.current >= MAX_AUTO_FILL_PAGES) return;
    autoFillCountRef.current += 1;
    handleLoadMore();
  }, [hasMore, isLoading, error, visibleProducts.length, handleLoadMore]);

  return (
    <div className={styles.homePage} data-node-id="219:4">
      <TopBar />

      <main className={styles.mainContainer}>
        <section className={styles.topDirectory}>
          <CategoryPanel
            categories={HOME_CATEGORY_ITEMS}
            activeId={activeCategoryId}
            onSelect={setActiveCategoryId}
          />

          <ProductCollections
            recommendationItems={RECOMMENDATION_ITEMS}
            newArrivalItems={NEW_ARRIVAL_ITEMS}
          />

          <div className={styles.rightColumn}>
            <UserStatusBar shortcuts={USER_SHORTCUTS} stats={USER_STATS} />
            <LowPriceZone deals={LOW_PRICE_DEALS} />
          </div>
        </section>

        <section className={styles.productsSectionWrap}>
          <ProductsSection
            products={visibleProducts}
            isLoading={isLoading}
            error={error}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
        </section>
      </main>
    </div>
  );
};

export default Main_Homepage;



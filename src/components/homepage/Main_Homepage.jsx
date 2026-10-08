import { useCallback, useEffect, useRef, useState } from 'react';
import TopBar from '../common/TopBar/TopBar';
import { useAuthContext } from '../../store/AuthContext';
import { useCurrentUser } from '../../store/CurrentUserContext';
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
  fetchProductsByCategory,
  mapProductDetailToCard,
} from './utils/homeApi';
import styles from './Main_Homepage.module.css';

const mergeUnique = (existing, incoming) => {
  const seen = new Set(existing.map((item) => item.id));
  return [
    ...existing,
    ...incoming.filter((item) => item?.id != null && !seen.has(item.id)),
  ];
};

const Main_Homepage = () => {
  const { token } = useAuthContext();
  const { displayName } = useCurrentUser();
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

  const loadPage = useCallback(
    async (categoryId, offset, { append = false } = {}) => {
      const requestId = ++requestIdRef.current;
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await fetchProductsByCategory(
          token,
          categoryId ? [categoryId] : [],
          { offset, limit: HOME_PAGE_SIZE },
        );
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

  // Initial load (and reset) whenever the token changes (login/logout) or the
  // active category changes (category panel click).
  useEffect(() => {
    requestIdRef.current += 1; // invalidate any in-flight request
    loadMoreInFlightRef.current = false;
    nextOffsetRef.current = 0;
    setIsLoadingMore(false);
    loadPage(activeCategoryId, 0, { append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeCategoryId]);

  const handleLoadMore = useCallback(() => {
    if (loadMoreInFlightRef.current || isLoading || !hasMore || error) return;
    loadMoreInFlightRef.current = true;
    loadPage(activeCategoryId, nextOffsetRef.current, { append: true }).finally(
      () => {
        loadMoreInFlightRef.current = false;
      },
    );
  }, [isLoading, hasMore, error, loadPage, activeCategoryId]);

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
            <UserStatusBar
              shortcuts={USER_SHORTCUTS}
              stats={USER_STATS}
              displayName={displayName}
            />
            <LowPriceZone deals={LOW_PRICE_DEALS} />
          </div>
        </section>

        <section className={styles.productsSectionWrap}>
          <ProductsSection
            products={products}
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



import { useMemo, useState } from 'react';
import TopBar from '../common/TopBar/TopBar';
import CategoryPanel from './CategoryPanel';
import UserStatusBar from './UserStatusBar';
import LowPriceZone from './LowPriceZone';
import ProductCollections from './ProductCollections';
import ProductsSection from './ProductsSection';
import {
  HOME_CATEGORY_ITEMS,
  HOME_PRODUCTS,
  LOW_PRICE_DEALS,
  NEW_ARRIVAL_ITEMS,
  RECOMMENDATION_ITEMS,
  USER_SHORTCUTS,
  USER_STATS,
} from './data/homepageData';
import styles from './Main_Homepage.module.css';

const Main_Homepage = () => {
  const [activeCategoryId, setActiveCategoryId] = useState(
    HOME_CATEGORY_ITEMS[0]?.id,
  );

  const visibleProducts = useMemo(() => {
    const filtered = HOME_PRODUCTS.filter(
      (item) => item.categoryId === activeCategoryId,
    );

    // Keep the section visually dense like the Figma grid if the filter is narrow.
    if (filtered.length < 8) {
      return [...filtered, ...HOME_PRODUCTS].slice(0, 16);
    }

    return filtered;
  }, [activeCategoryId]);

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
          <ProductsSection products={visibleProducts} />
        </section>
      </main>
    </div>
  );
};

export default Main_Homepage;

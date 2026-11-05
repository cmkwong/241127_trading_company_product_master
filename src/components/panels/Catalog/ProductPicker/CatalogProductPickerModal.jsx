import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './CatalogProductPickerModal.module.css';

const toTrimmed = (value) => String(value || '').trim();

const getProductDisplayName = (product) => {
  const names = product?.product_names;
  if (!Array.isArray(names) || names.length === 0) return '';
  const sorted = [...names].sort((a, b) => {
    const aOrder = Number(a?.display_order);
    const bOrder = Number(b?.display_order);
    return (Number.isFinite(aOrder) ? aOrder : 999999) -
      (Number.isFinite(bOrder) ? bOrder : 999999);
  });
  for (const row of sorted) {
    const name = toTrimmed(row?.name);
    if (name) return name;
  }
  return '';
};

const CatalogProductPickerModal = ({ onClose, onConfirm }) => {
  const { getAllProducts, hydrateProductIcons } = useProductContext();
  const { category } = useMasterContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const listRef = useRef(null);

  const products = useMemo(() => getAllProducts() || [], [getAllProducts]);

  const categoryNameById = useMemo(() => {
    const map = new Map();
    (Array.isArray(category) ? category : []).forEach((item) => {
      const id = toTrimmed(item?.id);
      const label = toTrimmed(item?.label) || toTrimmed(item?.name);
      if (id && label) map.set(id, label);
    });
    return map;
  }, [category]);

  const getProductCategoryLabels = useCallback(
    (product) =>
      (Array.isArray(product?.product_categories)
        ? product.product_categories
        : []
      )
        .map((relation) => categoryNameById.get(toTrimmed(relation?.category_id)))
        .filter(Boolean),
    [categoryNameById],
  );

  const getProductAlibabaValues = useCallback(
    (product) =>
      (Array.isArray(product?.product_alibaba_ids)
        ? product.product_alibaba_ids
        : []
      )
        .map((row) => toTrimmed(row?.value))
        .filter(Boolean),
    [],
  );

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => {
      const haystack = [
        getProductDisplayName(product),
        ...getProductCategoryLabels(product),
        ...getProductAlibabaValues(product),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [products, searchTerm, getProductCategoryLabels, getProductAlibabaValues]);

  // Warm up icons for the first slice of the filtered list (mirrors Product Master).
  useEffect(() => {
    const ids = filtered
      .slice(0, 30)
      .map((item) => item?.id)
      .filter(Boolean);
    if (ids.length > 0) hydrateProductIcons(ids);
  }, [filtered, hydrateProductIcons]);

  // Lazy-load icons for rows entering the viewport while scrolling.
  useEffect(() => {
    const root = listRef.current;
    if (!root) return undefined;

    const collectVisibleIds = () => {
      const rootRect = root.getBoundingClientRect();
      const ids = [];
      root.querySelectorAll('[data-item-id]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (
          rect.bottom >= rootRect.top - 160 &&
          rect.top <= rootRect.bottom + 160
        ) {
          const id = el.getAttribute('data-item-id');
          if (id) ids.push(id);
        }
      });
      if (ids.length > 0) hydrateProductIcons(ids);
    };

    let rafId = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        collectVisibleIds();
      });
    };

    collectVisibleIds();
    root.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      root.removeEventListener('scroll', handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [filtered, hydrateProductIcons]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm([...selected]);
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.window}>
        <div className={styles.header}>
          <div className={styles.title}>Select Products</div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.searchRow}>
          <input
            type="text"
            className={styles.search}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, category or Alibaba ID..."
          />
        </div>

        <div className={styles.list} ref={listRef}>
          <div className={styles.listHeader}>
            <span className={styles.headerThumb} />
            <span className={styles.headerLabel}>Product</span>
            <span className={`${styles.headerLabel} ${styles.headerCategory}`}>
              Category
            </span>
            <span className={`${styles.headerLabel} ${styles.headerAlibaba}`}>
              Alibaba
            </span>
            <span className={styles.headerCheck} />
          </div>
          {filtered.length === 0 ? (
            <span className={styles.muted}>No products found</span>
          ) : (
            filtered.map((product) => {
              const id = String(product?.id || '').trim();
              const isSelected = selected.has(id);
              const categoryText = getProductCategoryLabels(product).join(', ');
              const alibabaText = getProductAlibabaValues(product).join(', ');
              return (
                <button
                  key={id}
                  type="button"
                  data-item-id={id}
                  className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
                  onClick={() => toggle(id)}
                >
                  {product?.icon_url ? (
                    <img
                      className={styles.thumb}
                      src={product.icon_url}
                      alt=""
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <span className={styles.thumbPlaceholder} />
                  )}
                  <span className={`${styles.cell} ${styles.colName}`}>
                    {getProductDisplayName(product)}
                  </span>
                  <span
                    className={`${styles.cell} ${styles.colCategory}`}
                    title={categoryText}
                  >
                    {categoryText || '—'}
                  </span>
                  <span
                    className={`${styles.cell} ${styles.colAlibaba}`}
                    title={alibabaText}
                  >
                    {alibabaText || '—'}
                  </span>
                  <span className={styles.check}>{isSelected ? '✓' : ''}</span>
                </button>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.count}>{selected.size} selected</span>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={styles.primaryBtn} onClick={handleConfirm}>
              Add to Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogProductPickerModal;

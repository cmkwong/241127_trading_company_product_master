import styles from './Sub_CatalogPreviewRow.module.css';

const SubCatalogPreviewRow = ({ row, index }) => (
  <div className={styles.row} data-catalog-row>
    <span className={styles.rowIndex}>{index}</span>
    <div className={styles.rowInner}>
      <div className={styles.rowInner_1}>
        {/* {row.name ? <span className={styles.attrName}>{row.name}</span> : null} */}
      </div>
      <div className={styles.rowInner_2}>
        <div className={styles.colMain}>
          <div className={styles.mainCell}>
            {row.mainImageUrl ? (
              <img
                className={styles.mainImage}
                src={row.mainImageUrl}
                alt={row.name}
              />
            ) : (
              <div className={styles.mainImage} />
            )}
            {row.sku ? <span className={styles.sku}>{row.sku}</span> : null}
          </div>
        </div>

        <div className={styles.colImages}>
          <div className={styles.imagesCell}>
            {row.thumbImageUrls.map((url, index) => (
              <img
                className={styles.thumb}
                key={`${row.id}-thumb-${index}`}
                src={url}
                alt=""
              />
            ))}
          </div>
        </div>

        <div className={styles.colAttributes}>
          <div className={styles.attrCell}>
            {row.attributes.length > 0 ? (
              <div className={styles.attrList}>
                {row.attributes.map((attr, index) => (
                  <div
                    className={styles.attrRow}
                    key={`${row.id}-attr-${index}`}
                  >
                    <span className={styles.attrDot} />
                    <span>{attr}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.colPrice}>
          <div className={styles.priceCell}>
            {/* <span className={styles.cellHeader}>Price</span> */}
            <div className={styles.cellRows}>
              {row.priceRows.map((price, index) => (
                <div
                  className={styles.cellRow}
                  key={`${row.id}-price-${index}`}
                >
                  <span className={styles.cellLabel}>{price.label}</span>
                  <span className={styles.cellValue}>{price.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SubCatalogPreviewRow;

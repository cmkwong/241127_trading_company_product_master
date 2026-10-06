import Header from '../common/Texts/Header';
import Label from '../common/Texts/Label';
import styles from './SloganLeaf.module.css';
import RIVOLX_LOGO from '../../../public/assets/brand_logos/watermark_pure_logo.png';
const DEFAULT_FEATURE_ITEMS = [
  { icon: '📦', text: 'Product & supplier management' },
  { icon: '💰', text: 'Sales quotation & pricing' },
  { icon: '🚚', text: 'Shipping & logistics tracking' },
  { icon: '📊', text: 'Purchase request workflows' },
];

const SloganLeaf = ({ features = DEFAULT_FEATURE_ITEMS }) => {
  return (
    <section className={styles.brandingPanel} data-node-id="853:3">
      <div className={styles.brandTopBlock}>
        <div className={styles.logoRow} data-node-id="853:4">
          <div className={styles.logoIconWrap}>
            <img
              src={RIVOLX_LOGO}
              alt="Rivolx paw logo"
              className={styles.logoIcon}
            />
          </div>
          <p className={styles.logoWordmark}>RIVOLX</p>
        </div>

        <div className={styles.brandContent} data-node-id="853:8">
          <Header
            as="h1"
            size="XL"
            className={styles.brandHeading}
            color="#ffffff"
          >
            Manage your pet store
            <br />
            with confidence.
          </Header>

          <p className={styles.brandLead}>
            The all-in-one B2B marketplace platform for pet product sourcing,
            quotations, and supplier management.
          </p>

          <ul className={styles.featureList}>
            {features.map((item) => (
              <li key={item.text} className={styles.featureItem}>
                <span className={styles.featureBadge} aria-hidden="true">
                  {item.icon}
                </span>
                <Label className={styles.featureText} size="S" weight="medium">
                  {item.text}
                </Label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.brandCopyright}>
        © 2025 RIVOLX. All rights reserved.
      </p>
    </section>
  );
};

export default SloganLeaf;

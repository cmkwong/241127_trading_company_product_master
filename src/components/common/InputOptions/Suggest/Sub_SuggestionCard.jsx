import PropTypes from 'prop-types';
import styles from './Sub_SuggestionCard.module.css';

/**
 * Sub_SuggestionCard
 * Standardized suggestion card used inside Main_Suggest dropdowns.
 *
 * Renders an optional icon, a title, optional meta label/value rows, and an
 * optional "Open" hyperlink that opens the target record in a new tab.
 */
const Sub_SuggestionCard = ({
  iconUrl = '',
  iconAlt = 'icon',
  title = '',
  metaItems = [],
  linkTo = '',
  linkLabel = 'Open',
}) => {
  const safeLink = typeof linkTo === 'string' ? linkTo.trim() : '';

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={iconAlt}
            className={styles.icon}
            loading="lazy"
          />
        ) : (
          <span className={styles.iconFallback} aria-hidden="true">
            ?
          </span>
        )}
      </div>

      <div className={styles.textBlock}>
        <div className={styles.title}>{title || ''}</div>
        {metaItems.length > 0 && (
          <div className={styles.meta}>
            {metaItems.map((item, index) => (
              <span key={`${item?.label || 'meta'}-${String(index)}`}>
                {item?.label}: {item?.value ?? '-'}
              </span>
            ))}
          </div>
        )}
      </div>

      {safeLink && (
        <a
          className={styles.link}
          href={safeLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          {linkLabel}
        </a>
      )}
    </div>
  );
};

Sub_SuggestionCard.propTypes = {
  iconUrl: PropTypes.string,
  iconAlt: PropTypes.string,
  title: PropTypes.string,
  metaItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  linkTo: PropTypes.string,
  linkLabel: PropTypes.string,
};

export default Sub_SuggestionCard;

import PropTypes from 'prop-types';
import styles from './Sub_IconPreview.module.css';

const Sub_IconPreview = ({ image, onChangeClick, onRemoveClick }) => {
  return (
    <div className={styles.imageContainer}>
      <img src={image} alt="Product icon" className={styles.productImage} />
      <div className={styles.imageControls}>
        <button className={styles.changeButton} onClick={onChangeClick}>
          Change
        </button>
        <button className={styles.removeButton} onClick={onRemoveClick}>
          Remove
        </button>
      </div>
    </div>
  );
};

Sub_IconPreview.propTypes = {
  image: PropTypes.shape({
    url: PropTypes.string.isRequired,
    name: PropTypes.string,
    size: PropTypes.number,
    type: PropTypes.string,
  }).isRequired,
  onChangeClick: PropTypes.func.isRequired,
  onRemoveClick: PropTypes.func.isRequired,
};

export default Sub_IconPreview;

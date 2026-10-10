import Header from '../Texts/Header';
import styles from './Main_InputContainer.module.css';

const Main_InputContainer = ({
  label: title,
  description,
  children,
  layout = 'column',
  className = '',
}) => {
  const hasHeader = Boolean(title) || Boolean(description);

  return (
    <div
      className={
        layout === 'row'
          ? `${styles.inputOptionBoxRow} ${className}`
          : `${styles.inputOptionBox} ${className}`
      }
    >
      {hasHeader ? (
        <div className={styles.headerRow}>
          {typeof title === 'string' ? (
            <Header as="h2" size="L" weight="bold" text={title} />
          ) : (
            title
          )}
          {description ? (
            <p className={styles.descriptionText}>{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className={styles.inputContainer}>{children}</div>
    </div>
  );
};

export default Main_InputContainer;

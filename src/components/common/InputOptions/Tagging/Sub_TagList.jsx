import styles from './Sub_TagList.module.css';
import Sub_TagListRow from './Sub_TagListRow';

const Sub_TagList = (props) => {
  return (
    <div
      className={styles.optionList}
      onMouseEnter={props.handleSelectionMouseEnter}
      onMouseLeave={props.handleSelectionMouseOut}
      onClick={props.handleClickSelection}
    >
      {props.filteredOptions.length === 0 ? (
        <div className={styles.notFound}>Not Found</div>
      ) : (
        props.filteredOptions.map((el) => {
          return (
            <Sub_TagListRow
              key={el.id}
              id={el.id}
              name={el.name}
              level={el.level || 0}
              checked={
                props.selectedOptions && props.selectedOptions.includes(el.id)
              }
              updateOptionData={props.updateOptionData}
            />
          );
        })
      )}
    </div>
  );
};

export default Sub_TagList;

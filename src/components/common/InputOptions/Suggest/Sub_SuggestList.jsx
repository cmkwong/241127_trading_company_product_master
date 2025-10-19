import styles from './Sub_SuggestList.module.css';
import Sub_SuggestRow from './Sub_SuggestRow';

const Sub_SuggestList = (props) => {
  return (
    <div
      className={styles.optionList}
      onMouseEnter={props.handleSelectionMouseEnter}
      onMouseLeave={props.handleSelectionMouseOut}
      onClick={props.handleClickSelection}
    >
      {props.filteredOptions.map((el) => {
        return (
          <Sub_SuggestRow
            key={el.id}
            id={el.id}
            name={el.name}
            checked={
              props.selectedOptions && props.selectedOptions.includes(el.id)
            }
            updateOptionData={props.updateOptionData}
          />
        );
      })}
    </div>
  );
};

export default Sub_SuggestList;

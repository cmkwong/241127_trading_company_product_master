import styles from './OptionList.module.css';
import OptionRow from './OptionRow';

const OptionList = (props) => {
  return (
    <div
      className={styles.optionList}
      onMouseEnter={props.handleSelectionMouseEnter}
      onMouseLeave={props.handleSelectionMouseOut}
      onClick={props.handleClickSelection}
    >
      {props.filteredOptions.map((el) => {
        return (
          <OptionRow
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

export default OptionList;

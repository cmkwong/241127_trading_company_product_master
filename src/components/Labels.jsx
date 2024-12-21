import InputOption from './InputOption';

const Labels = (props) => {
  let { label_type, productData, options, dispatchProductDatas } = props;

  const labels = options.filter((el) => el.label_type === label_type);
  const selectedLabels = options
    .filter(
      (option) =>
        productData.labels.includes(option.id) &&
        option.label_type === label_type
    )
    .map((option) => option.id);

  return (
    <div>
      <InputOption
        selectedOptions={selectedLabels}
        options={labels}
        label_type={label_type}
        dispatch={dispatchProductDatas}
      />
    </div>
  );
};

export default Labels;

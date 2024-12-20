import InputOption from './InputOption';

const Collections = (props) => {
  const label_type = 'collections';

  let { productData, options, dispatchProductDatas } = props;

  const collections = options.filter((el) => el.label_type === label_type);
  const selectedCollections = productData.labels
    .filter((el) => el.label_type === label_type)
    .map((el) => el.id);

  return (
    <div>
      <InputOption
        selectedOptions={selectedCollections}
        options={collections}
        label_type={label_type}
        dispatch={dispatchProductDatas}
      />
    </div>
  );
};

export default Collections;

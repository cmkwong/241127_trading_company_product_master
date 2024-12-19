import InputOption from './InputOption';

const Collections = (props) => {
  let { productData, options, dispatchProductDatas } = props;

  const collections = options.filter((el) => el.label_type === 'collections');
  const selectedCollections = productData.labels
    .filter((el) => el.label_type === 'collections')
    .map((el) => el.id);

  return (
    <div>
      <InputOption
        selectedOptions={selectedCollections}
        options={collections}
        dispatch={dispatchProductDatas}
      />
    </div>
  );
};

export default Collections;

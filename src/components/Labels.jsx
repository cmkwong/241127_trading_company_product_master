import InputOption from './InputOptions/InputOption';
import { useProductDatasContext } from '../store/ProductDatasContext';
import { useProductDataRowContext } from '../store/ProductDataRowContext';

const Labels = (props) => {
  let { label_type, productData } = props;

  // access the context
  const { labels, dispatchProductDatas } = useProductDatasContext();
  const productDataRow = useProductDataRowContext();

  const required_labels = labels.filter((el) => el.label_type === label_type);
  const selectedLabels = labels
    .filter(
      (option) =>
        productData.labels.includes(option.id) &&
        option.label_type === label_type
    )
    .map((option) => option.id);

  // update the label being checked
  const updateLabels = (id, checked) => {
    if (checked) {
      dispatchProductDatas({
        type: 'checkSelectedLabels',
        product_id: productDataRow.product_id,
        payload: { id },
      });
    } else {
      dispatchProductDatas({
        type: 'uncheckSelectedLabels',
        product_id: productDataRow.product_id,
        payload: { id },
      });
    }
  };

  // add the labels
  const addLabels = (value) => {
    dispatchProductDatas({
      type: 'addSelectedLabels',
      product_id: productDataRow.product_id,
      payload: { label_type: label_type, name: value },
    });
  };

  return (
    <div>
      <InputOption
        selectedOptions={selectedLabels}
        options={required_labels}
        updateOptionData={updateLabels}
        addOptionData={addLabels}
        // label_type={label_type}
        // dispatch={dispatchProductDatas}
      />
    </div>
  );
};

export default Labels;

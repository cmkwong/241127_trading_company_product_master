import InputOption from './InputOption';
import { useProductDatasContext } from '../store/ProductDatasContext';

const Labels = (props) => {
  let { label_type, productData } = props;

  // access the context
  const { labels, dispatchProductDatas } = useProductDatasContext();

  const required_labels = labels.filter((el) => el.label_type === label_type);
  const selectedLabels = labels
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
        options={required_labels}
        label_type={label_type}
        dispatch={dispatchProductDatas}
      />
    </div>
  );
};

export default Labels;

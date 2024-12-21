import InputOption from './InputOption';

const Tags = (props) => {
  const label_type = 'tags';

  let { productData, options, dispatchProductDatas } = props;

  const tags = options.filter((el) => el.label_type === label_type);
  const selectedTags = productData.labels
    .filter((el) => el.label_type === label_type)
    .map((el) => el.id);
  return (
    <div>
      <InputOption
        selectedOptions={selectedTags}
        options={tags}
        label_type={label_type}
        dispatch={dispatchProductDatas}
      />
    </div>
  );
};

export default Tags;

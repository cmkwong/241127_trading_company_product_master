import InputOption from './InputOption';

const Tags = (props) => {
  let { productData, options } = props;

  const tags = options.filter((el) => el.label_type === 'tags');
  const selectedTags = productData.labels
    .filter((el) => el.label_type === 'tags')
    .map((el) => el.id);

  return (
    <div>
      <InputOption selectedOptions={selectedTags} options={tags} />
    </div>
  );
};

export default Tags;

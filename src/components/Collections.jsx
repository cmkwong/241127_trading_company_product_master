import InputOption from './InputOption';

const Collections = (props) => {
  let { selectedOptions, options } = props;

  return (
    <div>
      <InputOption selectedOptions={selectedOptions} options={options} />
    </div>
  );
};

export default Collections;

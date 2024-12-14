import InputOption from './InputOption';

const Tags = (props) => {
  let { selectedOptions, setSelectedOptions, options, setOptions } = props;

  return (
    <div>
      <InputOption
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        options={options}
        setOptions={setOptions}
      />
    </div>
  );
};

export default Tags;

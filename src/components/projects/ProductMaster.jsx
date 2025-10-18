import InputOption from '../common/InputOptions/InputOption';
import styles from './ProductMaster.module.css';
const options = [
  {
    id: 1,
    name: 'Cat Toy',
  },
  {
    id: 2,
    name: 'Dog Toy',
  },
];
const ProductMaster = () => {
  return (
    <>
      <InputOption defaultOptions={options} label={'hello'} />
    </>
  );
};

export default ProductMaster;

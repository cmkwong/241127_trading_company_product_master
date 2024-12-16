import styles from './Category.module.css';
import AddStackBtn from './common/AddStackBtn';
import InputField from './common/InputField';
import TextCell from './TextCell';

const Category = (props) => {
  let { productData } = props;
  return (
    <>
      <TextCell
        value={productData.category.map((data) => data.name).join(' >> ')}
      />
      <InputField />
      <InputField />
      <InputField />

      <AddStackBtn txt={'Add Category'} handleClick={() => {}} />
    </>
  );
};

export default Category;

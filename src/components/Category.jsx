import { useEffect, useState } from 'react';
import styles from './Category.module.css';
import AddStackBtn from './common/AddStackBtn';
import InputField from './common/InputField';
import TextCell from './TextCell';

const Category = (props) => {
  let { productData } = props;

  const [hovered, setHovered] = useState(false);
  const [categorList, setCategoryList] = useState(
    [...productData.category].map((el) => el.name)
  );

  const handleChange = (event) => {
    setCategoryList(`${event.target.value}`.split('>>').map((el) => el.trim()));
  };

  return (
    <>
      <TextCell
        value={categorList.map((el) => el).join(' >> ')}
        onChange={handleChange}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {hovered && (
        <div className={styles.categoryContainer}>
          {categorList.map((el, i) => (
            <div key={i} className={styles.categories}>
              <p>
                {i + 1}. {el}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* <AddStackBtn txt={'Add Category'} handleClick={() => {}} /> */}
    </>
  );
};

export default Category;

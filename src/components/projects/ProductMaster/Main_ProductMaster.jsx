import Main_Pack from './Packing/Main_Pack';
import styles from './Main_ProductMaster.module.css';
import Main_ProductName from './ProductName/Main_ProductName';
import Main_Category from './Categories/Main_Category';
import Main_Supplier from './Suppliers/Main_Supplier';
import Main_ProductLink from './ProductLink/Main_ProductLink';
import Main_AlibabaLink from './AlibabaLink/Main_AlibabaLink';
import Main_Remark from './Remarks/Main_Remark';
import Main_ProductIcon from './ProductIcon/Main_ProductIcon';
import Main_CertificateData from './CertificateData/Main_CertificateData';
import SavePageWithProvider from '../../common/SavePage/Main_SavePage';

const Main_ProductMaster = () => {
  // Function to handle saving product data
  const onSaveProduct = async (productData) => {
    // In a real app, you would make an API call here
    console.log('Saving product data:', productData);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  return (
    <SavePageWithProvider
      onSave={onSaveProduct}
      saveButtonText="Save Product"
      successMessage="Product saved successfully!"
      initialData={{
        // You can provide initial data here if needed
        productName: 'ABC',
        category: [],
        supplier: {
          name: '',
          option: '',
        },
        remarks: '',
        // ... other initial values
      }}
    >
      <div className={styles.container}>
        <div className={styles.inputSide}>
          <Main_ProductName />
          <Main_Category />
          <Main_Supplier />
          <Main_ProductLink />
          <Main_AlibabaLink />
          <Main_Pack />
          <Main_CertificateData />
          <Main_Remark />
        </div>
        <div className={styles.icon}>
          <Main_ProductIcon />
        </div>
      </div>
    </SavePageWithProvider>
  );
};

export default Main_ProductMaster;

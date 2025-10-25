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

const Main_ProductMaster = () => {
  return (
    <>
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
    </>
  );
};

export default Main_ProductMaster;

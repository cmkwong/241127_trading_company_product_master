import { Navigate, Route, Routes } from 'react-router-dom';
import Main_ProductMaster from '../components/panels/ProductMaster/Main_ProductMaster';
import Main_SupplierMaster from '../components/panels/SupplierMaster/Main_SupplierMaster';
import Main_CustomerMaster from '../components/panels/CustomerMaster/Main_CustomerMaster';
import Main_SalesQuotation from '../components/panels/SalesQuotation/Main_SalesQuotation';
import Main_PurchaseRequest from '../components/panels/PurchaseRequest/Main_PurchaseRequest';
import Main_APInvoice from '../components/panels/APInvoice/Main_APInvoice';
import Main_MasterControl from '../components/panels/MasterControl/Main_MasterControl';
import Main_Signup from '../components/signup/Main_Signup';
import Main_Homepage from '../components/homepage/Main_Homepage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="panel">
        <Route index element={<Navigate to="product_master" replace />} />

        <Route path="product_master" element={<Main_ProductMaster />} />
        <Route
          path="product_master/:product_id"
          element={<Main_ProductMaster />}
        />

        <Route path="supplier_master" element={<Main_SupplierMaster />} />
        <Route
          path="supplier_master/:supplier_id"
          element={<Main_SupplierMaster />}
        />

        <Route path="customer_master" element={<Main_CustomerMaster />} />
        <Route
          path="customer_master/:customer_id"
          element={<Main_CustomerMaster />}
        />

        <Route path="sales_quotation" element={<Main_SalesQuotation />} />
        <Route
          path="sales_quotation/:quotation_id"
          element={<Main_SalesQuotation />}
        />

        <Route path="purchase_request" element={<Main_PurchaseRequest />} />
        <Route
          path="purchase_request/:purchase_request_id"
          element={<Main_PurchaseRequest />}
        />

        <Route path="ap_invoice" element={<Main_APInvoice />} />
        <Route path="ap_invoice/:ap_invoice_id" element={<Main_APInvoice />} />

        <Route path="master_control" element={<Main_MasterControl />} />
      </Route>

      <Route path="signup" element={<Main_Signup />} />
      <Route path="home" element={<Main_Homepage />} />
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRouter;

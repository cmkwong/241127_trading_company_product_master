import { Navigate, Route, Routes } from 'react-router-dom';
import Main_ProductMaster from '../components/projects/ProductMaster/Main_ProductMaster';
import Main_SupplierMaster from '../components/projects/SupplierMaster/Main_SupplierMaster';
import Main_CustomerMaster from '../components/projects/CustomerMaster/Main_CustomerMaster';
import Main_SalesQuotation from '../components/projects/SalesQuotation/Main_SalesQuotation';
import Main_PurchaseRequest from '../components/projects/PurchaseRequest/Main_PurchaseRequest';
import Main_APInvoice from '../components/projects/APInvoice/Main_APInvoice';
import Main_MasterControl from '../components/projects/MasterControl/Main_MasterControl';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/product_master" replace />} />

      <Route path="/product_master" element={<Main_ProductMaster />} />
      <Route
        path="/product_master/:product_id"
        element={<Main_ProductMaster />}
      />

      <Route path="/supplier_master" element={<Main_SupplierMaster />} />
      <Route
        path="/supplier_master/:supplier_id"
        element={<Main_SupplierMaster />}
      />

      <Route path="/customer_master" element={<Main_CustomerMaster />} />
      <Route
        path="/customer_master/:customer_id"
        element={<Main_CustomerMaster />}
      />

      <Route path="/sales_quotation" element={<Main_SalesQuotation />} />
      <Route
        path="/sales_quotation/:quotation_id"
        element={<Main_SalesQuotation />}
      />

      <Route path="/purchase_request" element={<Main_PurchaseRequest />} />
      <Route
        path="/purchase_request/:purchase_request_id"
        element={<Main_PurchaseRequest />}
      />

      <Route path="/ap_invoice" element={<Main_APInvoice />} />
      <Route path="/ap_invoice/:ap_invoice_id" element={<Main_APInvoice />} />

      <Route path="/master_control" element={<Main_MasterControl />} />

      <Route path="*" element={<Navigate to="/product_master" replace />} />
    </Routes>
  );
};

export default AppRouter;

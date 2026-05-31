import { useState } from 'react';
import Main_ProductMaster from './components/projects/ProductMaster/Main_ProductMaster';
import Main_SupplierMaster from './components/projects/SupplierMaster/Main_SupplierMaster';
import Main_CustomerMaster from './components/projects/CustomerMaster/Main_CustomerMaster';
import Main_MasterControl from './components/projects/MasterControl/Main_MasterControl';
import Main_SalesQuotation from './components/projects/SalesQuotation/Main_SalesQuotation';
import TopBar from './components/projects/TopBar/TopBar';
import { AuthContext_Provider } from './store/AuthContext';
import { GeneralContext_Provider } from './store/GeneralContext';
import { MasterContext_Provider } from './store/MasterContext';
import { CustomerContext_Provider } from './store/CustomerContext';
import { ProductContext_Provider } from './store/ProductContext';
import { SalesQuotationContext_Provider } from './store/SalesQuotationContext';
import { SupplierContext_Provider } from './store/SupplierContext';
import styles from './App.module.css';

function App() {
  const [currentView, setCurrentView] = useState('product');

  const pageTitleByView = {
    product: 'Product Master',
    supplier: 'Supplier Master',
    customer: 'Customer Master',
    salesQuotation: 'Sales Quotation',
    masterControl: 'Master Control',
  };

  return (
    <div className={styles.appContainer}>
      <AuthContext_Provider>
        <GeneralContext_Provider>
          <MasterContext_Provider>
            <ProductContext_Provider>
              <SupplierContext_Provider>
                <CustomerContext_Provider>
                  <SalesQuotationContext_Provider>
                    <TopBar
                      title={pageTitleByView[currentView] || 'Product Master'}
                      activeView={currentView}
                      onViewChange={setCurrentView}
                    />
                    <div className={styles.contentArea}>
                      {currentView === 'product' ? (
                        <Main_ProductMaster />
                      ) : currentView === 'supplier' ? (
                        <Main_SupplierMaster />
                      ) : currentView === 'customer' ? (
                        <Main_CustomerMaster />
                      ) : currentView === 'salesQuotation' ? (
                        <Main_SalesQuotation />
                      ) : (
                        <Main_MasterControl />
                      )}
                    </div>
                  </SalesQuotationContext_Provider>
                </CustomerContext_Provider>
              </SupplierContext_Provider>
            </ProductContext_Provider>
          </MasterContext_Provider>
        </GeneralContext_Provider>
      </AuthContext_Provider>
    </div>
  );
}

export default App;

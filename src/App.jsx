import AppRouter from './routes/AppRouter';
import TopBar from './components/common/TopBar/TopBar';
import { useLocation } from 'react-router-dom';
import { AuthContext_Provider } from './store/AuthContext';
import { GeneralContext_Provider } from './store/GeneralContext';
import { MasterContext_Provider } from './store/MasterContext';
import { CustomerContext_Provider } from './store/CustomerContext';
import { ProductContext_Provider } from './store/ProductContext';
import { PurchaseRequestContext_Provider } from './store/PurchaseRequestContext';
import { SalesQuotationContext_Provider } from './store/SalesQuotationContext';
import { SupplierContext_Provider } from './store/SupplierContext';
import styles from './App.module.css';

function App() {
  const location = useLocation();
  const showTopBar = location.pathname.startsWith('/panel');

  return (
    <div className={styles.appContainer}>
      <AuthContext_Provider>
        <GeneralContext_Provider>
          <MasterContext_Provider>
            <ProductContext_Provider>
              <SupplierContext_Provider>
                <CustomerContext_Provider>
                  <SalesQuotationContext_Provider>
                    <PurchaseRequestContext_Provider>
                      {showTopBar && <TopBar />}
                      <div className={styles.contentArea}>
                        <AppRouter />
                      </div>
                    </PurchaseRequestContext_Provider>
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

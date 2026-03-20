import { useState } from 'react';
import Main_ProductMaster from './components/projects/ProductMaster/Main_ProductMaster';
import Main_SupplierMaster from './components/projects/SupplierMaster/Main_SupplierMaster';
import TopBar from './components/projects/TopBar/TopBar';
import { AuthContext_Provider } from './store/AuthContext';
import { GeneralContext_Provider } from './store/GeneralContext';
import styles from './App.module.css';

function App() {
  const [currentView, setCurrentView] = useState('product');

  return (
    <div className={styles.appContainer}>
      <AuthContext_Provider>
        <GeneralContext_Provider>
          <TopBar
            title={
              currentView === 'product' ? 'Product Master' : 'Supplier Master'
            }
            activeView={currentView}
            onViewChange={setCurrentView}
          />
          <div className={styles.contentArea}>
            {currentView === 'product' ? (
              <Main_ProductMaster />
            ) : (
              <Main_SupplierMaster />
            )}
          </div>
        </GeneralContext_Provider>
      </AuthContext_Provider>
    </div>
  );
}

export default App;

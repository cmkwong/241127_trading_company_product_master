import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../store/AuthContext';
import { CustomerContext } from '../../../store/CustomerContext';
import { ProductContext } from '../../../store/ProductContext';
import { SalesQuotationContext } from '../../../store/SalesQuotationContext';
import { SupplierContext } from '../../../store/SupplierContext';
import { MasterContext } from '../../../store/MasterContext';
import { canProceedWithRecordSwitch } from '../../../utils/contextDataUtils';
import ModuleTopBar from './ModuleTopBar';
import NavButton from '../../common/NavButton/NavButton';
import styles from './TopBar.module.css';

const VIEW_PATH_BY_KEY = {
  product: '/product_master',
  supplier: '/supplier_master',
  customer: '/customer_master',
  salesQuotation: '/sales_quotation',
  purchaseRequest: '/purchase_request',
  apInvoice: '/ap_invoice',
  masterControl: '/master_control',
};

const VIEW_KEY_BY_PATH_PREFIX = {
  '/product_master': 'product',
  '/supplier_master': 'supplier',
  '/customer_master': 'customer',
  '/sales_quotation': 'salesQuotation',
  '/purchase_request': 'purchaseRequest',
  '/ap_invoice': 'apInvoice',
  '/master_control': 'masterControl',
};

const PAGE_TITLE_BY_VIEW = {
  product: 'Product Master',
  supplier: 'Supplier Master',
  customer: 'Customer Master',
  salesQuotation: 'Sales Quotation',
  purchaseRequest: 'Purchase Request',
  apInvoice: 'AP Invoice',
  masterControl: 'Master Control',
};

const resolveActiveView = (pathname) => {
  const normalizedPath = String(pathname || '/');
  for (const [prefix, viewKey] of Object.entries(VIEW_KEY_BY_PATH_PREFIX)) {
    if (normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)) {
      return viewKey;
    }
  }
  return 'product';
};

const TopBar = () => {
  const { token, refreshToken, isLoading, error, clearToken } =
    useAuthContext();
  const productContext = useContext(ProductContext);
  const supplierContext = useContext(SupplierContext);
  const customerContext = useContext(CustomerContext);
  const salesQuotationContext = useContext(SalesQuotationContext);
  const masterContext = useContext(MasterContext);
  const refreshProductList = productContext?.refreshProductList;
  const refreshSupplierList = supplierContext?.refreshSupplierList;
  const refreshCustomerList = customerContext?.refreshCustomerList;
  const refreshSalesQuotationList =
    salesQuotationContext?.refreshSalesQuotationList;
  const refreshAllMasterData = masterContext?.refreshAllMasterData;
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const activeView = resolveActiveView(location.pathname);
  const title = PAGE_TITLE_BY_VIEW[activeView] || 'Product Master';

  const handleLoginClick = () => {
    setShowLogin(!showLogin);
    setLoginError(null);
  };

  const handleLogout = () => {
    clearToken();
    setShowLogin(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeView === 'product') {
        if (typeof refreshProductList === 'function') {
          await refreshProductList();
        }
      } else if (activeView === 'supplier') {
        if (typeof refreshSupplierList === 'function') {
          await refreshSupplierList();
        }
      } else if (activeView === 'customer') {
        if (typeof refreshCustomerList === 'function') {
          await refreshCustomerList();
        }
        if (typeof refreshAllMasterData === 'function') {
          await refreshAllMasterData();
        }
      } else if (activeView === 'salesQuotation') {
        if (typeof refreshSalesQuotationList === 'function') {
          await refreshSalesQuotationList();
        }
        if (typeof refreshAllMasterData === 'function') {
          await refreshAllMasterData();
        }
      } else {
        if (typeof refreshAllMasterData === 'function') {
          await refreshAllMasterData();
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);

    const credentials = {
      username,
      password,
      payload: '',
    };

    try {
      await refreshToken(credentials);
      setShowLogin(false);
    } catch (err) {
      setLoginError('Login failed. Check console or credentials.');
      console.error(err);
    }
  };

  const handleViewSwitch = (nextView) => {
    const nextPath = VIEW_PATH_BY_KEY[nextView];
    if (!nextPath || nextView === activeView) {
      return;
    }

    const currentContext =
      activeView === 'product'
        ? productContext
        : activeView === 'supplier'
          ? supplierContext
          : activeView === 'customer'
            ? customerContext
            : activeView === 'salesQuotation'
              ? salesQuotationContext
              : null;

    const canSwitch = canProceedWithRecordSwitch({
      hasRecordId: !!currentContext?.pageData?.id,
      isDataUnchanged:
        typeof currentContext?.isDataUnchanged === 'function'
          ? currentContext.isDataUnchanged()
          : true,
    });

    if (!canSwitch) {
      return;
    }

    navigate(nextPath);
  };

  return (
    <div className={styles.topBarShell}>
      <div className={styles.topBar}>
        <div className={styles.leftSection}>
          <div className={styles.brand} aria-label="Rivolx">
            <div className={styles.brandIconWrap}>
              <img
                className={styles.brandIcon}
                src="/assets/watermark_pure_logo.png"
                alt=""
              />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>RIVOLX</span>
              <span className={styles.brandTagline}>Your Pets Our Passion</span>
            </div>
          </div>
          <div className={styles.navLinks}>
            <NavButton
              active={activeView === 'product'}
              onClick={() => handleViewSwitch('product')}
            >
              Product Master
            </NavButton>
            <NavButton
              active={activeView === 'supplier'}
              onClick={() => handleViewSwitch('supplier')}
            >
              Supplier Master
            </NavButton>
            <NavButton
              active={activeView === 'salesQuotation'}
              onClick={() => handleViewSwitch('salesQuotation')}
            >
              Sales Quotation
            </NavButton>
            <NavButton
              active={activeView === 'purchaseRequest'}
              onClick={() => handleViewSwitch('purchaseRequest')}
            >
              Purchase Request
            </NavButton>
            <NavButton
              active={activeView === 'apInvoice'}
              onClick={() => handleViewSwitch('apInvoice')}
            >
              AP Invoice
            </NavButton>
            <NavButton
              active={activeView === 'customer'}
              onClick={() => handleViewSwitch('customer')}
            >
              Customer Master
            </NavButton>
            <NavButton
              active={activeView === 'masterControl'}
              onClick={() => handleViewSwitch('masterControl')}
            >
              Master Control
            </NavButton>
          </div>
        </div>

        <div className={styles.authContainer}>
          {token ? (
            <div className={styles.loggedIn}>
              <span className={styles.status}>Logged In</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className={styles.loggedOut}>
              <button className={styles.loginBtn} onClick={handleLoginClick}>
                {showLogin ? 'Close' : 'Login'}
              </button>

              {showLogin && (
                <div className={styles.loginDropdown}>
                  <form onSubmit={handleSubmit} className={styles.loginForm}>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={styles.input}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.input}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={styles.submitBtn}
                    >
                      {isLoading ? 'Logging in...' : 'Submit'}
                    </button>
                    {error && <div className={styles.error}>Auth Error</div>}
                    {loginError && (
                      <div className={styles.error}>{loginError}</div>
                    )}
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ModuleTopBar
        moduleName={title}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};

export default TopBar;

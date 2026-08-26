import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../store/AuthContext';
import { CustomerContext } from '../../../store/CustomerContext';
import { ProductContext } from '../../../store/ProductContext';
import { SalesQuotationContext } from '../../../store/SalesQuotationContext';
import { SupplierContext } from '../../../store/SupplierContext';
import { MasterContext } from '../../../store/MasterContext';
import { canProceedWithRecordSwitch } from '../../../utils/contextDataUtils';
import { getEntityRecord } from '../../../store/GeneralContext';
import ModuleTopBar from './ModuleTopBar';
import NavButton from '../../common/NavButton/NavButton';
import styles from './TopBar.module.css';

const VIEW_PATH_BY_KEY = {
  products: '/product_master',
  supplier: '/supplier_master',
  customer: '/customer_master',
  salesQuotation: '/sales_quotation',
  purchaseRequest: '/purchase_request',
  apInvoice: '/ap_invoice',
  masterControl: '/master_control',
};

const VIEW_KEY_BY_PATH_PREFIX = {
  '/product_master': 'products',
  '/supplier_master': 'supplier',
  '/customer_master': 'customer',
  '/sales_quotation': 'salesQuotation',
  '/purchase_request': 'purchaseRequest',
  '/ap_invoice': 'apInvoice',
  '/master_control': 'masterControl',
};

const PAGE_TITLE_BY_VIEW = {
  products: 'Product Master',
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
  return 'products';
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
  const forceRefreshAllMasterData = masterContext?.forceRefreshAllMasterData;
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
      if (activeView === 'products') {
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
        if (typeof forceRefreshAllMasterData === 'function') {
          await forceRefreshAllMasterData();
        }
      } else if (activeView === 'salesQuotation') {
        if (typeof refreshSalesQuotationList === 'function') {
          await refreshSalesQuotationList();
        }
        if (typeof forceRefreshAllMasterData === 'function') {
          await forceRefreshAllMasterData();
        }
      } else {
        if (typeof forceRefreshAllMasterData === 'function') {
          await forceRefreshAllMasterData();
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
    console.log(nextView, activeView);
    const nextPath = VIEW_PATH_BY_KEY[nextView];
    if (!nextPath || nextView === activeView) {
      return;
    }

    const currentContext =
      activeView === 'products'
        ? productContext
        : activeView === 'supplier'
          ? supplierContext
          : activeView === 'customer'
            ? customerContext
            : activeView === 'salesQuotation'
              ? salesQuotationContext
              : null;

    // Products and suppliers now keep the edited record in the generic entity
    // store (not in context), so read their ids directly. Other modules still
    // expose pageData in context.
    const hasRecordId =
      activeView === 'products'
        ? !!getEntityRecord('products')?.id
        : activeView === 'supplier'
          ? !!getEntityRecord('supplier')?.id
          : !!currentContext?.pageData?.id;

    const canSwitch = canProceedWithRecordSwitch({
      hasRecordId,
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
                src="/assets/brand_logos/RIVOLX_Logos_new_color_pure.svg"
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
              active={activeView === 'products'}
              onClick={() => handleViewSwitch('products')}
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
              <button
                className={styles.userIconBtn}
                type="button"
                aria-label="Account"
              >
                <img
                  src="/assets/icons/admin_user_icon.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>
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

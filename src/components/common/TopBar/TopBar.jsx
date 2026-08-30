import { useContext, useEffect, useRef, useState } from 'react';
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
import NavButton from '../NavButton/NavButton';
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
  '/panel/product_master': 'products',
  '/panel/supplier_master': 'supplier',
  '/panel/customer_master': 'customer',
  '/panel/sales_quotation': 'salesQuotation',
  '/panel/purchase_request': 'purchaseRequest',
  '/panel/ap_invoice': 'apInvoice',
  '/panel/master_control': 'masterControl',
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

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
    setShowUserMenu(false);
  };

  useEffect(() => {
    if (!showUserMenu) {
      return;
    }

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu]);

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

    navigate(`/panel/${nextPath}`);
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
            <div className={styles.loggedIn} ref={userMenuRef}>
              <button
                className={styles.userIconBtn}
                type="button"
                aria-label="Account"
                aria-haspopup="menu"
                aria-expanded={showUserMenu}
                onClick={() => setShowUserMenu((prev) => !prev)}
              >
                <img
                  src="/assets/icons/admin_user_icon.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>

              {showUserMenu && (
                <div className={styles.userMenu} role="menu">
                  <div className={styles.userMenuHeader}>
                    <div className={styles.userAvatar} aria-hidden="true">
                      CC
                    </div>
                    <div className={styles.userDetails}>
                      <span className={styles.userName}>Chris Cheung</span>
                      <span className={styles.userEmail}>
                        chris.cheung@rivolx.com
                      </span>
                    </div>
                  </div>

                  <div className={styles.userMenuDivider} />

                  <button
                    type="button"
                    role="menuitem"
                    className={styles.userMenuItem}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Profile
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className={styles.userMenuItem}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 8v13H3V8" />
                      <path d="M1 3h22v5H1z" />
                      <path d="M10 12h4" />
                    </svg>
                    My Orders
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className={styles.userMenuItem}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="4" y1="21" x2="4" y2="14" />
                      <line x1="4" y1="10" x2="4" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12" y2="3" />
                      <line x1="20" y1="21" x2="20" y2="16" />
                      <line x1="20" y1="12" x2="20" y2="3" />
                      <line x1="1" y1="14" x2="7" y2="14" />
                      <line x1="9" y1="8" x2="15" y2="8" />
                      <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                    Settings
                  </button>

                  <div className={styles.userMenuDivider} />

                  <button
                    type="button"
                    role="menuitem"
                    className={`${styles.userMenuItem} ${styles.userMenuLogout}`}
                    onClick={handleLogout}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
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

import { useState } from 'react';
import SloganLeaf from './SloganLeaf';
import LoginPanel from './LoginPanel';
import SignupPanel from './SignupPanel';
import styles from './Main_Signup.module.css';

const Main_Signup = () => {
  const [view, setView] = useState('login');

  return (
    <div className={styles.signupPage} data-node-id="853:2">
      <SloganLeaf />
      {view === 'signup' ? (
        <SignupPanel onLoginClick={() => setView('login')} />
      ) : (
        <LoginPanel onSignupClick={() => setView('signup')} />
      )}
    </div>
  );
};

export default Main_Signup;

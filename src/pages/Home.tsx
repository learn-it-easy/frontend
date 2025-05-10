import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { HomeProps } from '../types/auth';

const Home = ({ isAuthenticated }: HomeProps) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  return (
    <div className={`home-page ${isAuthenticated ? 'authenticated' : ''}`}>
      <div className="content">
        <h1>{t.home.welcomeHeader}</h1>
        <p>{t.home.test}</p>
        
        {!isAuthenticated && isMobile && (
          <div className="auth-links">
            <Link to="/register" className="auth-link">{t.home.registerButton}</Link>
            <Link to="/login" className="auth-link">{t.home.loginButton}</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
import { Link, useHistory } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useTranslation } from '../hooks/useTranslation';
import { useContext, useState, useEffect } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../config/languages';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header = ({ isAuthenticated, onLogout }: HeaderProps) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { language, setLanguage } = useContext(LanguageContext);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    onLogout();
    history.push('/');
  };
  
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <img src={logo} alt="Логотип" className="logo" />
        </Link>
        <div className="auth-actions">
          {!isMobile && !isAuthenticated && (
            <>
              <Link to="/register" className="auth-button">
                {t.header.registerButton}
              </Link>
              <Link to="/login" className="auth-button login">
                {t.header.loginButton}
              </Link>
            </>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="auth-button logout">
              {t.header.logoutButton}
            </button>
          )}
          <div className="language-selector">
            <button 
              className="language-button" 
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              {language.toUpperCase()}
            </button>
            {showLanguageDropdown && (
              <div className="language-dropdown">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button 
                    className="language-option"
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageDropdown(false);
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
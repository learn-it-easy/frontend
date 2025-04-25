import { NavLink } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
     <>
      {/* Кнопка для мобильных устройств */}
      {isMobile && (
        <button 
          className="navbar-toggle" 
          onClick={toggleNavbar}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      )}
      

      <nav className={`navbar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}>
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink 
              exact
              to="/" 
              className="nav-link"
              activeClassName="active"
              onClick={() => isMobile && setIsOpen(false)}
              isActive={(match) => {
                if (!match) return false;
                return isMobile ? match.isExact : true;
              }}
            >
              {t.navbar.main}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              exact
              to="/profile" 
              className="nav-link"
              activeClassName="active"
              onClick={() => isMobile && setIsOpen(false)}
              isActive={(match) => {
                if (!match) return false;
                return isMobile ? match.isExact : true;
              }}
            >
              {t.navbar.profile}
            </NavLink>
           </li>
           <li className="nav-item">
            <NavLink 
              exact
              to="/folders" 
              className="nav-link"
              activeClassName="active"
              onClick={() => isMobile && setIsOpen(false)}
              isActive={(match) => {
                if (!match) return false;
                return isMobile ? match.isExact : true;
              }}
            >
              {t.navbar.folders}
            </NavLink>
           </li>
           <li className="nav-item">
            <NavLink 
              exact
              to="/add" 
              className="nav-link"
              activeClassName="active"
              onClick={() => isMobile && setIsOpen(false)}
              isActive={(match) => {
                if (!match) return false;
                return isMobile ? match.isExact : true;
              }}
            >
               {t.navbar.add}
            </NavLink>
           </li>
      </ul>
    </nav>
    </>
  );
};

export default Navbar;
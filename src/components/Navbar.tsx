import { NavLink } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import AddCardModal from './AddCardModal';
import { useFolders } from '../contexts/FolderContext';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar = ({ isAuthenticated, onLogout }: HeaderProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { refreshFolders } = useFolders();
  const navbarRef = useRef<HTMLDivElement>(null);

  const handleCardAdded = () => {
    console.log('Card added successfully');
    refreshFolders();
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };


    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isOpen]);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsOpen(false);
    }
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


      <nav
        ref={navbarRef}
        className={`navbar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}
      >
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
            <button
              className="nav-link add-button"
              onClick={() => {
                setIsAddModalOpen(true);
                closeMobileMenu();
              }}
            >
              {t.navbar.add}
            </button>
          </li>

          <li className="nav-item">
            <NavLink
              exact
              to="/text"
              className="nav-link"
              activeClassName="active"
              onClick={() => isMobile && setIsOpen(false)}
              isActive={(match) => {
                if (!match) return false;
                return isMobile ? match.isExact : true;
              }}
            >
              {t.navbar.text}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              exact
              to="/video"
              className="nav-link"
              activeClassName="active"
              onClick={() => isMobile && setIsOpen(false)}
              isActive={(match) => {
                if (!match) return false;
                return isMobile ? match.isExact : true;
              }}
            >
              {t.navbar.video}
            </NavLink>
          </li>

        </ul>

      </nav>

      <AddCardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCardAdded={handleCardAdded}
      />
    </>
  );
};

export default Navbar;
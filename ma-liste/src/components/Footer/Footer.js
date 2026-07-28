import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { ModalContext } from '../../ctx/ModalContext';
import './Footer.css';

function Footer() {
  const location = useLocation();
  const { openModal } = useContext(ModalContext);

  return (
    <footer className="footer">
      <nav>
        <ul>
          <li>
            <Link to="/" className={`footer-link ${location.pathname === '/' ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 14l2 2 4-4" />
              </svg>
              <span>Tâches</span>
            </Link>
          </li>
          <li>
            <Link to="/planning" className={`footer-link ${location.pathname === '/planning' ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Planning</span>
            </Link>
          </li>
          <li className="footer-add-li">
            <button className="footer-add-button" onClick={() => openModal()} title="Créer une tâche">
              <span className="footer-add-bg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
          </li>
          <li>
            <Link to="/agenda" className={`footer-link ${location.pathname === '/agenda' ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>Agenda</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className={`footer-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default Footer;

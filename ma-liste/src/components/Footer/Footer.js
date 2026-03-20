import { Link, useLocation } from 'react-router-dom';
import tasks from '../../assets/tasks.svg';
import dashbaord from '../../assets/dashboard.svg';
import agenda from '../../assets/agenda.svg';
import settings from '../../assets/settings.svg';
import teams from '../../assets/teams.svg';
import './Footer.css'; 


function Footer() {
    const location = useLocation();

    return (
        <footer className="footer">  
            <ul>
                <Link to="/agenda" className={location.pathname === '/agenda' ? 'active' : ''}>
                        <figure className="footer-figure">
                            <img src={agenda} className="footer-logo" alt="Icône agenda" />
                            <figcaption className="footer-text">Agenda</figcaption>
                        </figure>
                </Link>
                <Link to="/teams" className={location.pathname === '/teams' ? 'active' : ''}>
                    <figure className="footer-figure">
                        <img src={teams} className="footer-logo" alt="Icône teams" />
                        <figcaption className="footer-text">Groupes</figcaption>
                    </figure>
                </Link>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                    <figure className="footer-figure">
                        <img src={tasks} className="footer-logo" alt="Icône tasks" />
                        <figcaption className="footer-text">Tâches</figcaption>
                    </figure>
                </Link>
                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                    <figure className="footer-figure">
                        <img src={dashbaord} className="footer-logo" alt="Icône dashboard" />
                        <figcaption className="footer-text">Dashboard</figcaption>
                    </figure>
                </Link>
                <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
                    <figure className="footer-figure">
                        <img src={settings} className="footer-logo" alt="Icône settings" />
                        <figcaption className="footer-text">Réglages</figcaption>
                    </figure>
                </Link>
            </ul>
      </footer>
    );
}

export default Footer;

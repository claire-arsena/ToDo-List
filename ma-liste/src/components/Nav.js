import { Link, useLocation } from 'react-router-dom';
import tasks from '../assets/tasks.svg';
import dashbaord from '../assets/dashboard.svg';
import agenda from '../assets/agenda.svg';
import settings from '../assets/settings.svg';
import teams from '../assets/teams.svg';
import '../styles/Nav.css'; 


function Nav() {
    const location = useLocation();

    return (
        <nav className="nav">  
            <ul>
                <Link to="/agenda" className={location.pathname === '/agenda' ? 'active' : ''}>
                        <figure className="nav-figure">
                            <img src={agenda} className="nav-logo" alt="Icône agenda" />
                            <figcaption className="nav-text">Agenda</figcaption>
                        </figure>
                </Link>
                <Link to="/teams" className={location.pathname === '/teams' ? 'active' : ''}>
                    <figure className="nav-figure">
                        <img src={teams} className="nav-logo" alt="Icône teams" />
                        <figcaption className="nav-text">Groupes</figcaption>
                    </figure>
                </Link>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                    <figure className="nav-figure">
                        <img src={tasks} className="nav-logo" alt="Icône tasks" />
                        <figcaption className="nav-text">Tâches</figcaption>
                    </figure>
                </Link>
                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                    <figure className="nav-figure">
                        <img src={dashbaord} className="nav-logo" alt="Icône dashboard" />
                        <figcaption className="nav-text">Dashboard</figcaption>
                    </figure>
                </Link>
                <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
                    <figure className="nav-figure">
                        <img src={settings} className="nav-logo" alt="Icône settings" />
                        <figcaption className="nav-text">Réglages</figcaption>
                    </figure>
                </Link>
            </ul>
      </nav>
    );
}

export default Nav;
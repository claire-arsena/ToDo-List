import { Link } from 'react-router-dom';
import tasks from '../assets/tasks.svg';
import dashbaord from '../assets/dashboard.svg';
import agenda from '../assets/agenda.svg';
import settings from '../assets/settings.svg';
import teams from '../assets/teams.svg';
import '../styles/Nav.css'; 


function Nav() {
    return (
        <nav className="nav">  
            <ul>
                <Link to="/agenda">
                        <figure className="nav-figure">
                            <img src={agenda} className="nav-logo" alt="Icône agenda" />
                            <figcaption className="nav-text">Agenda</figcaption>
                        </figure>
                </Link>
                <Link to="/teams">
                    <figure className="nav-figure">
                        <img src={teams} className="nav-logo" alt="Icône teams" />
                        <figcaption className="nav-text">Groupes</figcaption>
                    </figure>
                </Link>
                <Link to="/">
                    <figure className="nav-figure">
                        <img src={tasks} className="nav-logo" alt="Icône tasks" />
                        <figcaption className="nav-text">Liste de tâches</figcaption>
                    </figure>
                </Link>
                <Link to="/dashboard">
                    <figure className="nav-figure">
                        <img src={dashbaord} className="nav-logo" alt="Icône dashboard" />
                        <figcaption className="nav-text">Tableau de bord</figcaption>
                    </figure>
                </Link>
                <Link to="/settings">
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
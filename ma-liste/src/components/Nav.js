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
                <a href="./views/Agenda">
                        <figure className="nav-figure">
                            <img src={agenda} className="nav-logo" alt="Icône agenda" />
                            <figcaption className="nav-text">Agenda</figcaption>
                        </figure>
                </a>
                <a href="./views/Teams">
                    <figure className="nav-figure">
                        <img src={teams} className="nav-logo" alt="Icône teams" />
                        <figcaption className="nav-text">Groupes</figcaption>
                    </figure>
                </a>
                <a href="/">
                    <figure className="nav-figure">
                        <img src={tasks} className="nav-logo" alt="Icône tasks" />
                        <figcaption className="nav-text">Liste de tâches</figcaption>
                    </figure>
                </a>
                <a href="./views/Dashboard">
                    <figure className="nav-figure">
                        <img src={dashbaord} className="nav-logo" alt="Icône dashboard" />
                        <figcaption className="nav-text">Tableau de bord</figcaption>
                    </figure>
                </a>
                <a href="./views/Settings">
                    <figure className="nav-figure">
                        <img src={settings} className="nav-logo" alt="Icône settings" />
                        <figcaption className="nav-text">Réglages</figcaption>
                    </figure>
                </a>
            </ul>
      </nav>
    );
}

export default Nav;
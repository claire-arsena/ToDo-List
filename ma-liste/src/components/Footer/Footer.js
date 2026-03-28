import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { ModalContext } from '../../ctx/ModalContext';
import tasks from '../../assets/tasks.svg';
import dashbaord from '../../assets/dashboard.svg';
import agenda from '../../assets/agenda.svg';
import folder from '../../assets/folder.svg';
import add from '../../assets/add.svg';
import './Footer.css'; 


function Footer() {
    const location = useLocation();
    const { openModal } = useContext(ModalContext);

    return (
        <footer className="footer">  
            <ul>
                <Link to="/agenda" className={location.pathname === '/agenda' ? 'active' : ''}>
                        <figure className="footer-figure">
                            <img src={agenda} className="footer-logo" alt="Icône agenda" />
                            <figcaption className="footer-text">Agenda</figcaption>
                        </figure>
                </Link>
                <Link to="/folders" className={location.pathname === '/folders' ? 'active' : ''}>
                    <figure className="footer-figure">
                        <img src={folder} className="footer-logo" alt="Icône dossiers" />
                        <figcaption className="footer-text">Dossiers</figcaption>
                    </figure>
                </Link>
                <button className="footer-add-button" onClick={() => openModal('task')} title="Créer une tâche">
                    <figure className="footer-figure">
                        <b className="footer-add-bg">
                            <img src={add} className="footer-logo footer-add-icon" alt="Icône ajouter" />
                        </b>
                        <figcaption className="footer-text">Ajouter</figcaption>
                    </figure>
                </button>
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
            </ul>
      </footer>
    );
}

export default Footer;

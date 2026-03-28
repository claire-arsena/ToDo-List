import './styles/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TodoContextProvider } from './ctx/TodoContext';
import { ModalContextProvider } from './ctx/ModalContext';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import TaskFormModal from './components/Modal/TaskFormModal';
import FolderFormModal from './components/Modal/FolderFormModal';
import Tasks from './views/Tasks/Tasks';
import Agenda from './views/Agenda';
import Folders from './views/Folders';
import Dashboard from './views/Dashboard';

function App() {
  return (
    <TodoContextProvider>
      <ModalContextProvider>
        <BrowserRouter>
          <main className="App">
            <Header />
            <Footer />
            <TaskFormModal />
            <FolderFormModal />
            <Routes>
              <Route path="/" element={<Tasks />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/folders" element={<Folders />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </BrowserRouter>
      </ModalContextProvider>
    </TodoContextProvider>
  );
}

export default App;

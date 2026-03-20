import './styles/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Tasks from './views/Tasks/Tasks';
import Agenda from './views/Agenda';
import Teams from './views/Teams';
import Dashboard from './views/Dashboard';
import Settings from './views/Settings';

function App() {
  return (
    <BrowserRouter>
      <main className="App">
        <Header />
        <Footer />
        <Routes>
          <Route path="/" element={<Tasks />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;

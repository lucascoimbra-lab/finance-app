import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VerificarConexao from './pages/VerificarConexao.jsx';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verificar-conexao" element={<VerificarConexao />} />
        </Routes>
      </BrowserRouter>
    </div>
  );x
}

export default App;
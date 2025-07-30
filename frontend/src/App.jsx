import { useState } from 'react'
import LoginPage from './pages/LoginPage';
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VerificarConexao from './pages/VerificarConexao.jsx';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>home</div>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verificar-conexao" element={<VerificarConexao />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
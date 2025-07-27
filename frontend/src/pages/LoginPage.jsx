import React, { useState } from 'react';
import logo from '../assets/logo.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.isRegistered) {
        alert('E-mail cadastrado.');
      } else {
        alert('E-mail não cadastrado.');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor.');
      console.error('Erro ao verificar e-mail:', error);
  }
};




  return (
    <div className="container">
      <div className="welcome">
        <h1 className="title-text">Bem vindo</h1>
      </div>
      <br />
      <div className="logo">
        <img src={logo} alt="Logo Pingou" />
      </div>

      <form onSubmit={handleSubmit}>
        <br />
        <label htmlFor="email-input">
          Digite o seu e-mail:
        </label>
        <br />
        <input
          type="email"
          id="email-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <br />
        <button
          type="submit"
          className="default-button"
        >
          Avançar
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
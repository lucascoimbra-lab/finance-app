import React, { useState } from 'react';
import logo from '../assets/logo.png';

function LoginPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('E-mail submetido:', email);
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
import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailLogin, setEmailLogin] = useState(true);
  const [passwordLogin, setPasswordLogin] = useState(false);
  const [registerLogin, setRegisterLogin] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailLogin) {
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
          setName(data.name);
          setEmailLogin(false);
          setPasswordLogin(true);
          //alert('E-mail cadastrado.');
        } else {
          setEmailLogin(false);
          setRegisterLogin(true);
          //alert('E-mail não cadastrado.');
        }
      } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro ao verificar e-mail:', error);
      }
    }
    if (passwordLogin) {
      try {
        const response = await fetch('http://localhost:3000/check-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (data.isValid) {
          navigate('/');
        } else {
          toast.error('Senha incorreta!');
        }
      } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro:', error);
      }
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

        {emailLogin && (<><label htmlFor="email-input">
          Digite o seu e-mail:
        </label>
          <br />
          <input
            type="email"
            id="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /></>)}

        {passwordLogin && (<>
          <p>Olá, {name}!</p>
          <label htmlFor="email-input">
            Digite sua senha:
          </label>
          <br />
          <input
            type="password"
            id="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /></>)}

        {registerLogin && (<><label htmlFor="email-input">
          Digite o seu e-mail:
        </label>
          <br />
          <input
            type="email"
            id="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /></>)}
        <br />
        <br />
        <button
          type="submit"
          className="default-button"
        >
          Avançar
        </button>
      </form>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}



export default LoginPage;
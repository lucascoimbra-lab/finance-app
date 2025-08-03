import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [emailLogin, setEmailLogin] = useState(true);
  const [senhaLogin, setSenhaLogin] = useState(false);
  const [registroNovo, setRegistroNovo] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState('');
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
          setNome(data.nome);
          setEmailLogin(false);
          setSenhaLogin(true);
        } else {
          setEmailLogin(false);
          setRegistroNovo(true);
        }
      } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro ao verificar e-mail:', error);
      }
    }

    if (senhaLogin) {
      try {
        const response = await fetch('http://localhost:3000/check-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            senha,
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

    if (registroNovo) {
      if (senha !== confirmarSenha) {
        toast.error('As senhas informadas estão diferentes.');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome,
            email,
            senha,
          }),
        });

        const data = await response.json();

        if (data?.id_usuario) {
          toast.success('Cadastro realizado com sucesso!');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          toast.error(data.message || 'Erro ao cadastrar.');
        }
      } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro ao cadastrar:', error);
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

        {emailLogin && (
          <>
            <label htmlFor="email-input">Digite o seu e-mail:</label>
            <br />
            <input
              type="email"
              id="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        )}

        {senhaLogin && (
          <>
            <p>Olá, {nome}!</p>
            <label htmlFor="senha-input">Digite sua senha:</label>
            <br />
            <input
              type="password"
              id="senha-input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </>
        )}

        {registroNovo && (
          <>
            <p><b>Primeira vez por aqui?</b></p>

            <label>Digite como gostaria de ser chamado</label>
            <br />
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <br /><br />

            <label>Digite sua senha</label>
            <br />
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <br /><br />

            <label>Repita sua senha</label>
            <br />
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </>
        )}

        <br /><br />
        <button type="submit" className="default-button">
          {registroNovo ? 'Cadastrar' : 'Avançar'}
        </button>
      </form>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}

export default LoginPage;

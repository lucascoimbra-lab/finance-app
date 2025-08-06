import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [etapaEmail, setEtapaEmail] = useState(true);
  const [etapaSenha, setEtapaSenha] = useState(false);
  const [etapaRegistro, setEtapaRegistro] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const navegar = useNavigate();

  const redirecionarParaHome = (id_usuario) => {
    localStorage.setItem('id_usuario', id_usuario);
    setTimeout(() => {
      navegar('/');
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (etapaEmail) {
      try {
        const resposta = await fetch('http://localhost:3000/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const dados = await resposta.json();

        if (dados.isRegistered) {
          setNome(dados.nome);
          setEtapaEmail(false);
          setEtapaSenha(true);
        } else {
          setEtapaEmail(false);
          setEtapaRegistro(true);
        }
      } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro ao verificar e-mail:', error);
      }
    }

    if (etapaSenha) {
      try {
        const resposta = await fetch('http://localhost:3000/check-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            senha,
          }),
        });

        const dados = await resposta.json();

        if (dados.isValid) {
          toast.success(`Bem-vindo, ${nome}!`);
          redirecionarParaHome(dados.id_usuario);
        } else {
          toast.error('Senha incorreta!');
        }
      } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro:', error);
      }
    }

    if (etapaRegistro) {
      if (senha !== confirmarSenha) {
        toast.error('As senhas informadas estão diferentes.');
        return;
      }

      try {
        const resposta = await fetch('http://localhost:3000/usuarios', {
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

        const dados = await resposta.json();

        if (dados?.id_usuario) {
          toast.success('Cadastro realizado com sucesso!');
          redirecionarParaHome(dados.id_usuario);
        } else {
          toast.error(dados.message || 'Erro ao cadastrar.');
        }
      } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro ao cadastrar:', error);
      }
    }
  };

  return (
    <div className="container">
      <div className="logo">
        <img src={logo} alt="Logo Pingou" />
      </div>

      <div className="modal-content">
        {etapaEmail && (
          <h2 className="title-text-login">Bem-vindo(a)</h2>
        )}
        {etapaSenha && (
          <h2 className="title-text-login">Olá, {nome}!</h2>
        )}
        {etapaRegistro && (
          <h2 className="title-text-login">Primeira vez por aqui?</h2>
        )}

        <form onSubmit={handleSubmit}>
          {etapaEmail && (
            <>
              <label htmlFor="email-input">Digite o seu e-mail:</label>
              <input
                type="email"
                id="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          )}

          {etapaSenha && (
            <>
              <label htmlFor="senha-input">Digite sua senha:</label>
              <input
                type="password"
                id="senha-input"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </>
          )}

          {etapaRegistro && (
            <>
              <label>Digite como gostaria de ser chamado</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <label>Digite sua senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              <label>Repita sua senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </>
          )}

          <div className="modal-botoes">
            <button type="submit" className="default-button">
              {etapaRegistro ? 'Cadastrar' : 'Avançar'}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}

export default LoginPage;
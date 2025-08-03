import React, { useState, useEffect } from 'react';
import imagemLogo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function HomePage() {
  const navigate = useNavigate();

  const idUsuario = localStorage.getItem('id_usuario');

  const [dataAtual, setDataAtual] = useState(new Date());
  const [debitos, setDebitos] = useState([]);
  const [erro, setErro] = useState(null);
  const [totalDebitos, setTotalDebitos] = useState(0);
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [saldoDespesasVariaveis, setSaldoDespesasVariaveis] = useState(0);

  useEffect(() => {
    if (!idUsuario) {
      navigate('/login');
    }
  }, [idUsuario, navigate]);

  const avancarMes = () => {
    setDataAtual(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const voltarMes = () => {
    setDataAtual(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  };

  useEffect(() => {
    const mes = dataAtual.getMonth() + 1;
    const ano = dataAtual.getFullYear();

    const buscarSaldos = async () => {
      try {
        const resposta = await fetch(`http://localhost:3000/saldos_mensais?id_usuario=${idUsuario}&mes=${mes}&ano=${ano}`);

        if (!resposta.ok) {
          if (resposta.status === 404) {
            setSaldoDisponivel(0);
            setSaldoDespesasVariaveis(0);
            console.warn('Saldos para o mês não encontrados. Usando valores padrão.');
          } else {
            throw new Error('Erro ao carregar os saldos');
          }
        } else {
          const dados = await resposta.json();
          setSaldoDisponivel(parseFloat(dados.saldo_disponivel));
          setSaldoDespesasVariaveis(parseFloat(dados.saldo_despesas_variaveis));
        }
      } catch (erro) {
        console.error('Erro ao buscar saldos:', erro);
        setErro('Não foi possível carregar os saldos mensais.');
        setSaldoDisponivel(0);
        setSaldoDespesasVariaveis(0);
      }
    };

    const buscarDebitos = async () => {
      try {
        const resposta = await fetch(`http://localhost:3000/obter_debitos?id_usuario=${idUsuario}&mes=${mes}&ano=${ano}`);

        if (!resposta.ok) {
          throw new Error('Erro ao carregar os débitos');
        }

        const dados = await resposta.json();
        setDebitos(dados);
        const total = dados.reduce((acc, debito) => acc + parseFloat(debito.valor), 0);
        setTotalDebitos(total);

      } catch (erro) {
        console.error('Erro ao buscar débitos:', erro);
        setErro('Não foi possível carregar a lista de débitos.');
      }
    };

    if (idUsuario) {
      buscarSaldos();
      buscarDebitos();
    }
  }, [idUsuario, dataAtual]);

  const saldoNaoComprometido = saldoDisponivel - totalDebitos - saldoDespesasVariaveis;

  const totalGeral = saldoDisponivel;
  const percentualDebitos = totalGeral > 0 ? (totalDebitos / totalGeral) * 100 : 0;
  const percentualDespesasVariaveis = totalGeral > 0 ? (saldoDespesasVariaveis / totalGeral) * 100 : 0;
  const percentualNaoComprometido = totalGeral > 0 ? (saldoNaoComprometido / totalGeral) * 100 : 0;

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  if (!idUsuario) {
    return null;
  }

  return (
    <div className="container">
      <div className="month-selector">
        <button className="month-nav-btn" onClick={voltarMes}>←</button>
        <h1 className="title-text">{`${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`}</h1>
        <button className="month-nav-btn" onClick={avancarMes}>→</button>
      </div>

      <div className="saldo-container">
        <div>
          <h2>Saldo disponível</h2>
        </div>
        <div className="saldo-valor">
          R$ {formatarMoeda(saldoDisponivel)}
          <button className="edit-btn">✏️</button>
        </div>
      </div>

      <div className="checklist">
        <h3>Checklist de Pagamentos e Transferências</h3>
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Venc</th>
              <th>Valor</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {erro ? (
              <tr>
                <td colSpan="5">{erro}</td>
              </tr>
            ) : (
              debitos.map((debito) => (
                <tr key={debito.id_debito}>
                  <td>{debito.desc_debito}</td>
                  <td>{new Date(debito.vencimento).getDate()}</td>
                  <td>R$ {formatarMoeda(parseFloat(debito.valor))}</td>
                  <td>
                    <button className="edit-btn">✏️</button>
                  </td>
                  <td>
                    <button className="check-btn">✅</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="resumo">
        <p>
          Total de Débitos
          <br />
          <span className="percentual vermelho">{percentualDebitos.toFixed(0)}%</span>
          <span className="valor vermelho">R$ {formatarMoeda(totalDebitos)}</span>
        </p>
        <br />
        <p>
          Saldo para despesas variáveis <span className="percentual laranja">{percentualDespesasVariaveis.toFixed(0)}%</span>
          <br />
          <span className="valor laranja"> R$ {formatarMoeda(saldoDespesasVariaveis)} <button className="edit-btn">✏️</button> </span>
        </p>
        <br />
        <p>
          Saldo não comprometido <span className="percentual verde">{percentualNaoComprometido.toFixed(0)}%</span>
          <br />
          <span className="valor verde">R$ {formatarMoeda(saldoNaoComprometido)}</span>
        </p>
        <br />
      </div>

      <div className="botoes-footer">
        <button className="default-button">Planejamento</button>
        <button className="default-button cinza">Reservas</button>
      </div>
    </div>
  );
}

export default HomePage;
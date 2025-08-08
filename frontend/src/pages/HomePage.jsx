import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;


// MODAL DE CADASTRO DE DEBITOS

const CadastroDebitoModal = ({ onClose, onSave, mes, ano, debitoParaEditar }) => {
  const [descricaoDebito, setDescricaoDebito] = useState(debitoParaEditar?.desc_debito || '');
  const [valor, setValor] = useState(debitoParaEditar?.valor || '');
  const [vencimento, setVencimento] = useState(debitoParaEditar ? new Date(debitoParaEditar.vencimento).getUTCDate() : '');

  // CADASTRO
  const cadastrarDebito = async (novoDebito) => {
    const url = `${ API_URL }/debitos`;
    const metodo = 'POST';
    const mensagemErro = 'Erro ao cadastrar débito.';

    return await fazerRequisicao(url, metodo, novoDebito, mensagemErro);
  };

  // EDIÇÃO
  const editarDebito = async (novoDebito) => {
    const url = `${ API_URL }/debitos/${debitoParaEditar.id_debito}`;
    const metodo = 'PUT';
    const mensagemErro = 'Erro ao atualizar débito.';

    return await fazerRequisicao(url, metodo, novoDebito, mensagemErro);
  };

  // REQUISIÇÃO GENÉRICA (CADASTRO OU EDIÇÃO)
  const fazerRequisicao = async (url, metodo, novoDebito, mensagemErro) => {
    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoDebito),
      });

      if (!response.ok) {
        throw new Error(mensagemErro);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error(mensagemErro, error);
      toast.error(mensagemErro);
    }
  };

  // FUNÇÃO PRINCIPAL
  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataVencimentoCompleta = new Date(Date.UTC(ano, mes - 1, vencimento));

    const dadosDebito = {
      id_usuario: localStorage.getItem('id_usuario'),
      desc_debito: descricaoDebito,
      valor: parseFloat(valor),
      vencimento: dataVencimentoCompleta,
      status_pagamento: debitoParaEditar ? debitoParaEditar.status_pagamento : false,
    };

    // ESTADO QUE VEM DA HOMEPAGE
    if (debitoParaEditar) {
      await editarDebito(dadosDebito);
    } else {
      await cadastrarDebito(dadosDebito);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{debitoParaEditar ? 'Editar item' : 'Cadastro de item'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Nome do item</label>
          <input type="text" value={descricaoDebito} onChange={(e) => setDescricaoDebito(e.target.value)} required />

          <label>Vencimento (dia)</label>
          <input type="number" value={vencimento} onChange={(e) => setVencimento(e.target.value)} required min="1" max="31" />

          <label>Valor</label>
          <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />

          <div className="modal-botoes">
            <button type="button" className="default-button cinza" onClick={onClose}>Voltar</button>
            <button type="submit" className="default-button">{debitoParaEditar ? 'Atualizar' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// MODAL DE EXCLUSÃO DE DEBITOS

const ConfirmacaoExclusaoModal = ({ onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content small-modal">
        <p>Tem certeza que deseja excluir este débito?</p>
        <div className="modal-botoes">
          <button type="button" className="default-button cinza" onClick={onClose}>Não</button>
          <button type="button" className="default-button" onClick={onConfirm}>Sim</button>
        </div>
      </div>
    </div>
  );
};


// MODAL GENÉRICA PARA EDIÇÃO DO "SALDO DISPONÍVEL" OU DO "SALDO PARA DESPESAS VARIÁVEIS"

const EdicaoSaldoModal = ({ onClose, onSave, mes, ano, tipoSaldo, valorSaldoInicial }) => {
  const [novoValor, setNovoValor] = useState(valorSaldoInicial);
  const titulo = tipoSaldo === 'disponivel' ? 'Saldo disponível' : 'Saldo para despesas variáveis';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idUsuario = localStorage.getItem('id_usuario');
    let endpoint = '';
    const dados = {
      id_usuario: idUsuario,
      mes,
      ano,
    };

    if (tipoSaldo === 'disponivel') {
      endpoint = `${ API_URL }/saldos_mensais/disponivel`;
      dados.saldo_disponivel = parseFloat(novoValor);
    } else if (tipoSaldo === 'variaveis') {
      endpoint = `${ API_URL }/saldos_mensais/variaveis`;
      dados.saldo_despesas_variaveis = parseFloat(novoValor);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar saldo.');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      toast.error('Erro ao atualizar saldo.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar {titulo}</h2>
        <form onSubmit={handleSubmit}>
          <label>Novo valor</label>
          <input
            type="number"
            step="0.01"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            required
          />
          <div className="modal-botoes">
            <button type="button" className="default-button cinza" onClick={onClose}>Voltar</button>
            <button type="submit" className="default-button">Atualizar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// FUNÇÃO PRINCIPAL - HOMEPAGE

function HomePage() {
  const navegar = useNavigate();
  const idUsuario = localStorage.getItem('id_usuario');

  const [modalDebitoAberto, setModalDebitoAberto] = useState(false);
  const [debitoParaEditar, setDebitoParaEditar] = useState(null);

  const [estaExcluindo, setEstaExcluindo] = useState(false);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [idDebitoParaExcluir, setIdDebitoParaExcluir] = useState(null);

  const [modalSaldoAberto, setModalSaldoAberto] = useState(false);
  const [tipoSaldoParaEditar, setTipoSaldoParaEditar] = useState(null);
  const [valorSaldoParaEditar, setValorSaldoParaEditar] = useState(0);

  const [dataAtual, setDataAtual] = useState(new Date());
  const [debitos, setDebitos] = useState([]);
  const [erro, setErro] = useState(null);
  const [totalDebitos, setTotalDebitos] = useState(0);
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [saldoDespesasVariaveis, setSaldoDespesasVariaveis] = useState(0);


  // TRATAMENTO PARA REDIRECIONAR PARA LOGIN, CASO NÃO ESTEJA LOGADO
  useEffect(() => {
    if (!idUsuario) {
      navegar('/login');
    }
  }, [idUsuario, navegar]);

  // FUNÇÕES PARA AVANÇAR E VOLTAR O MÊS (TROCA DA TELA)
  const avancarMes = () => {
    setDataAtual(dataAnterior => {
      const novaData = new Date(dataAnterior);
      novaData.setMonth(novaData.getMonth() + 1);
      return novaData;
    });
  };

  const voltarMes = () => {
    setDataAtual(dataAnterior => {
      const novaData = new Date(dataAnterior);
      novaData.setMonth(novaData.getMonth() - 1);
      return novaData;
    });
  };

  // FUNÇÃO PARA CONVERTER EM REAIS (SEPARADOR DE MILHARES COM "." E DE CENTAVOS COM ",")
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  };

  // FUNÇÃO PARA CARREGAR O SALDO NA TELA DO MES SELECIONADO. SE NÃO TIVER, CONSIDERA COMO 0.
  const buscarSaldos = async (idUser, mes, ano) => {
    try {
      const resposta = await fetch(`${ API_URL }/saldos_mensais?id_usuario=${idUser}&mes=${mes}&ano=${ano}`);

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

  // FUNÇÃO QUE CARREGA OS DÉBITOS DO MÊS/ANO NA TELA
  const buscarDebitos = async (idUser, mes, ano) => {
    try {
      const resposta = await fetch(`${ API_URL }/obter_debitos?id_usuario=${idUser}&mes=${mes}&ano=${ano}`);

      if (!resposta.ok) {
        throw new Error('Erro ao carregar os débitos');
      }

      const dados = await resposta.json();

      const debitosOrdenados = dados.sort((a, b) => {
        const diaA = new Date(a.vencimento).getUTCDate();
        const diaB = new Date(b.vencimento).getUTCDate();

        if (diaA !== diaB) {
          return diaA - diaB;
        }

        return a.valor - b.valor;
      });

      setDebitos(debitosOrdenados);
      const total = dados.reduce((acc, debito) => acc + parseFloat(debito.valor), 0);
      setTotalDebitos(total);
    } catch (erro) {
      console.error('Erro ao buscar débitos:', erro);
      setErro('Não foi possível carregar a lista de débitos.');
    }
  };

  // FUNÇÕES PARA O MODAL DE EXCLUSÃO

  const abrirModalConfirmacao = (id) => {
    setIdDebitoParaExcluir(id);
    setModalConfirmacaoAberto(true);
  };

  const fecharModalConfirmacao = () => {
    setModalConfirmacaoAberto(false);
    setIdDebitoParaExcluir(null);
  };

  const confirmarExclusao = async () => {
    if (!idDebitoParaExcluir) return;

    setEstaExcluindo(true);
    fecharModalConfirmacao();

    try {
      const response = await fetch(`${ API_URL }/debitos/${idDebitoParaExcluir}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir débito.');
      }

      buscarDebitos(idUsuario, dataAtual.getMonth() + 1, dataAtual.getFullYear());
    } catch (error) {
      console.error('Erro ao excluir débito:', error);
      toast.error('Erro ao excluir débito.');
    } finally {
      setEstaExcluindo(false);
      setIdDebitoParaExcluir(null);
    }
  };

  // FUNÇÃO PARA ALTERNAR O STATUS DO PAGAMENTO

  const statusPagamento = async (debito) => {
    const novoStatus = !debito.status_pagamento;
    try {
      const response = await fetch(`${ API_URL }/debitos/${debito.id_debito}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...debito, status_pagamento: novoStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do débito.');
      }

      buscarDebitos(idUsuario, dataAtual.getMonth() + 1, dataAtual.getFullYear());
    } catch (error) {
      console.error('Erro ao atualizar status do débito:', error);
      toast.error('Erro ao atualizar status do débito.');
    }
  };

  // FUNÇÕES PARA O MODAL DE ALTERAÇÃO DE SALDO (É O MESMO PARA SALDO DISPONÍVEL E SALDO DESPESAS VARIÁVEIS)

  const abrirModalSaldo = (tipo, valor) => {
    setTipoSaldoParaEditar(tipo);
    setValorSaldoParaEditar(valor);
    setModalSaldoAberto(true);
  };

  const fecharModalSaldo = () => {
    setModalSaldoAberto(false);
    setTipoSaldoParaEditar(null);
    setValorSaldoParaEditar(0);
  };

  const salvarSaldo = () => {
    const mes = dataAtual.getMonth() + 1;
    const ano = dataAtual.getFullYear();
    buscarSaldos(idUsuario, mes, ano);
  };

  // FUNÇÕES PARA O MODAL DE EDIÇÃO DE DÉBITOS

  useEffect(() => {
    const mes = dataAtual.getMonth() + 1;
    const ano = dataAtual.getFullYear();

    if (idUsuario) {
      buscarSaldos(idUsuario, mes, ano);
      buscarDebitos(idUsuario, mes, ano);
    }
  }, [idUsuario, dataAtual]);

  const editarDebito = (debito) => {
    setDebitoParaEditar(debito);
    setModalDebitoAberto(true);
  };

  const abrirModalDebito = () => {
    setDebitoParaEditar(null);
    setModalDebitoAberto(true);
  };

  const fecharModalDebito = () => {
    setModalDebitoAberto(false);
    setDebitoParaEditar(null);
  };

  // FUNÇÃO PARA COPIAR DÉBITOS E SALDOS DO MES ANTERIOR

  const copiarDebitosESaldos = async () => {
    try {
      const response = await fetch(`${ API_URL }/copiar-debitos-e-saldos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: idUsuario,
          data_atual: dataAtual,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao copiar débitos e saldos.');
      }

      // RECARREGA INFOS NA TELA
      buscarDebitos(idUsuario, dataAtual.getMonth() + 1, dataAtual.getFullYear());
      buscarSaldos(idUsuario, dataAtual.getMonth() + 1, dataAtual.getFullYear());

    } catch (error) {
      console.error('Erro ao copiar débitos e saldos:', error);
      toast.error(error.message);
    }
  };

  // VARIÁVEIS PARA INFORMAÇÕES DO RESUMO GERAL E PERCENTUAIS
  const saldoNaoComprometido = saldoDisponivel - totalDebitos - saldoDespesasVariaveis;
  const totalGeral = saldoDisponivel;
  const percentualDebitos = totalGeral > 0 ? (totalDebitos / totalGeral) * 100 : 0;
  const percentualDespesasVariaveis = totalGeral > 0 ? (saldoDespesasVariaveis / totalGeral) * 100 : 0;
  const percentualNaoComprometido = totalGeral > 0 ? (saldoNaoComprometido / totalGeral) * 100 : 0;
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // RETORNO PRINCIPAL
  return (
    <div className="container">
      <div className="logo">
        <img src={logo} alt="Logo Pingou" style={{ width: '100px', height: 'auto' }} />
      </div>

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
          <button className="edit-btn" onClick={() => abrirModalSaldo('disponivel', saldoDisponivel)}>✏️</button>
        </div>
      </div>

      <div className="checklist">
        <h2 className="left-align">Checklist de Contas</h2>
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Venc</th>
              <th>Valor</th>
              <th></th>
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
                  <td className={debito.status_pagamento ? 'pago' : ''}>{debito.desc_debito}</td>
                  <td className={debito.status_pagamento ? 'pago' : ''}>{new Date(debito.vencimento).getUTCDate()}</td>
                  <td className={debito.status_pagamento ? 'pago' : ''}>R$ {formatarMoeda(parseFloat(debito.valor))}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => editarDebito(debito)}
                      disabled={estaExcluindo || debito.status_pagamento}
                      title="Editar item"
                    >
                      ✏️
                    </button>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => abrirModalConfirmacao(debito.id_debito)}
                      disabled={estaExcluindo || debito.status_pagamento}
                      title="Excluir item"
                    >
                      🗑️
                    </button>
                  </td>
                  <td>
                    <button className="toggle-pagamento-btn"
                      onClick={() => statusPagamento(debito)}
                      title="Marcar/Desmarcar item como pago" 
                      >
                      {debito.status_pagamento ? '✅' : '⬜'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="add-debito-container">
          <button className="default-button-mini" onClick={abrirModalDebito}>
            + Adicionar uma nova conta
          </button>
        </div>
        <div className="copy-debitos-e-saldos-container">
          <button className="default-button-mini" onClick={copiarDebitosESaldos}>
            + Copiar todas as contas e saldos do mês anterior
          </button>
        </div>
      </div>



      {modalDebitoAberto && (
        <CadastroDebitoModal
          onClose={fecharModalDebito}
          onSave={() => buscarDebitos(idUsuario, dataAtual.getMonth() + 1, dataAtual.getFullYear())}
          mes={dataAtual.getMonth() + 1}
          ano={dataAtual.getFullYear()}
          debitoParaEditar={debitoParaEditar}
        />
      )}

      {modalConfirmacaoAberto && (
        <ConfirmacaoExclusaoModal
          onClose={fecharModalConfirmacao}
          onConfirm={confirmarExclusao}
        />
      )}

      {modalSaldoAberto && (
        <EdicaoSaldoModal
          onClose={fecharModalSaldo}
          onSave={salvarSaldo}
          mes={dataAtual.getMonth() + 1}
          ano={dataAtual.getFullYear()}
          tipoSaldo={tipoSaldoParaEditar}
          valorSaldoInicial={valorSaldoParaEditar}
        />
      )}

      <div className="resumo">
        <p>
          Total em Contas
          <br />
          <span className="percentual vermelho">{percentualDebitos.toFixed(0)}%</span>
          <span className="valor vermelho">R$ {formatarMoeda(totalDebitos)}</span>
        </p>
        <br />
        <br />
        <p>
          Saldo para despesas variáveis 
          <br />
          <span className="percentual laranja">{percentualDespesasVariaveis.toFixed(0)}%</span>
          <span className="valor laranja"> R$ {formatarMoeda(saldoDespesasVariaveis)} <button className="edit-btn" onClick={() => abrirModalSaldo('variaveis', saldoDespesasVariaveis)}>✏️</button> </span>
        </p>
        <br />
        <br />
        <p>
          Saldo não comprometido 
          <br />
          <span className="percentual verde">{percentualNaoComprometido.toFixed(0)}%</span>
          <span className="valor verde">R$ {formatarMoeda(saldoNaoComprometido)}</span>
        </p>
        <br />
      </div>

      <div className="botoes-footer">
        <button className="default-button">Planejamento</button>
        <button className="default-button cinza">Reservas</button>
      </div>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}

export default HomePage;
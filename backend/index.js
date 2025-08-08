import { Client } from 'pg';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.API_URL

const saltRounds = 10;
const app = express();

app.use(express.json());
app.use(cors());

// CONFIGURAÇÕES DEPENDÊNCIA BANCO DE DADOS - POSTGRES (PG)

const db_client = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});


await db_client.connect();

// ENDPOINT PADRÃO DO FRAMEWORK

app.get('/', (req, res) => {
  res.send('Olá, mundo com Express!');
});

// ENDPOINT TEST_CONNECTION

app.get('/test_connection', async (req, res) => {
  await db_client.query(`
    UPDATE test_connection
    SET counter = counter + 1
    WHERE id = 1
  `);

  const result = await db_client.query(`
    SELECT counter FROM test_connection WHERE id = 1
  `);

  res.send(result.rows[0]);
});

// ENDPOINT PARA VERIFICAR E-MAIL

app.post('/check-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'E-mail é obrigatório.' });
  }

  try {
    const result = await db_client.query(
      'SELECT id_usuario, nome FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      res.json({ isRegistered: true, nome: result.rows[0].nome });
    } else {
      res.json({ isRegistered: false });
    }
  } catch (error) {
    console.error('Erro ao verificar e-mail no banco de dados:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA VERIFICAR SENHA

app.post('/check-password', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const result = await db_client.query(
      'SELECT id_usuario, senha_hash FROM usuarios WHERE email = $1',
      [email]
    );

    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);

    if (senhaConfere) {
      res.json({ isValid: true, id_usuario: usuario.id_usuario });
    } else {
      res.json({ isValid: false });
    }

  } catch (error) {
    console.error('Erro ao validar senha:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA CADASTRAR USUÁRIOS

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    // verifica se o e-mail já existe
    const emailExistenteQuery = `SELECT id_usuario FROM usuarios WHERE email = $1;`;
    const emailExistenteResult = await db_client.query(emailExistenteQuery, [email]);
    if (emailExistenteResult.rows.length > 0) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // segue com o cadastro
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const query = `
      INSERT INTO usuarios (nome, email, senha_hash)
      VALUES ($1, $2, $3)
      RETURNING id_usuario, nome, email;
    `;

    const values = [nome, email, senhaHash];

    const result = await db_client.query(query, values);

    res.status(201).json({
      id_usuario: result.rows[0].id_usuario,
      nome: result.rows[0].nome,
      email: result.rows[0].email,
    });
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA CADASTRAR SALDOS MENSAIS

app.post('/saldos_mensais', async (req, res) => {
  try {
    const { id_usuario, saldo_disponivel, saldo_despesas_variaveis, mes, ano } = req.body;

    if (!id_usuario || saldo_disponivel === undefined || saldo_despesas_variaveis === undefined || !mes || !ano) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios (id_usuario, saldo_disponivel, saldo_despesas_variaveis, mes, ano)' });
    }

    const query = `
      INSERT INTO saldos_mensais (id_usuario, saldo_disponivel, saldo_despesas_variaveis, mes, ano)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [id_usuario, saldo_disponivel, saldo_despesas_variaveis, mes, ano];

    const result = await db_client.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao inserir saldos mensais:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA ATUALIZAR SALDO DISPONÍVEL
app.put('/saldos_mensais/disponivel', async (req, res) => {
  try {
    const { id_usuario, mes, ano, saldo_disponivel } = req.body;

    if (!id_usuario || !mes || !ano || saldo_disponivel === undefined) {
      return res.status(400).json({ error: 'id_usuario, mes, ano e saldo_disponivel são obrigatórios.' });
    }

    // verifica se o registro já existe para o mês/ano
    const checkQuery = 'SELECT * FROM saldos_mensais WHERE id_usuario = $1 AND mes = $2 AND ano = $3';
    const checkResult = await db_client.query(checkQuery, [id_usuario, mes, ano]);

    if (checkResult.rows.length > 0) {
      // Se existir, atualiza o saldo disponível
      const updateQuery = `
        UPDATE saldos_mensais
        SET saldo_disponivel = $1
        WHERE id_usuario = $2 AND mes = $3 AND ano = $4
        RETURNING *;
      `;
      const updateResult = await db_client.query(updateQuery, [saldo_disponivel, id_usuario, mes, ano]);
      res.status(200).json(updateResult.rows[0]);
    } else {
      // Se não existir, insere o saldo de despesas variáveis como "0"
      const insertQuery = `
        INSERT INTO saldos_mensais (id_usuario, saldo_disponivel, saldo_despesas_variaveis, mes, ano)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const insertResult = await db_client.query(insertQuery, [id_usuario, saldo_disponivel, 0, mes, ano]);
      res.status(201).json(insertResult.rows[0]);
    }
  } catch (error) {
    console.error('Erro ao atualizar saldo disponível:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA ATUALIZAR SALDO DE DESPESAS VARIÁVEIS
app.put('/saldos_mensais/variaveis', async (req, res) => {
  try {
    const { id_usuario, mes, ano, saldo_despesas_variaveis } = req.body;

    if (!id_usuario || !mes || !ano || saldo_despesas_variaveis === undefined) {
      return res.status(400).json({ error: 'id_usuario, mes, ano e saldo_despesas_variaveis são obrigatórios.' });
    }

    // VERIFICA SE EXISTE REGISTRO PARA O MÊS/ANO
    const checkQuery = 'SELECT * FROM saldos_mensais WHERE id_usuario = $1 AND mes = $2 AND ano = $3';
    const checkResult = await db_client.query(checkQuery, [id_usuario, mes, ano]);

    if (checkResult.rows.length > 0) {
      // SE EXISTIR, MOSTRA O SALDO
      const updateQuery = `
        UPDATE saldos_mensais
        SET saldo_despesas_variaveis = $1
        WHERE id_usuario = $2 AND mes = $3 AND ano = $4
        RETURNING *;
      `;
      const updateResult = await db_client.query(updateQuery, [saldo_despesas_variaveis, id_usuario, mes, ano]);
      res.status(200).json(updateResult.rows[0]);
    } else {
      // SE NÃO EXISTIR, MOSTRA ZERADO
      const insertQuery = `
        INSERT INTO saldos_mensais (id_usuario, saldo_disponivel, saldo_despesas_variaveis, mes, ano)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const insertResult = await db_client.query(insertQuery, [id_usuario, 0, saldo_despesas_variaveis, mes, ano]);
      res.status(201).json(insertResult.rows[0]);
    }
  } catch (error) {
    console.error('Erro ao atualizar saldo de despesas variáveis:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});


// ENDPOINT PARA OBTER SALDOS MENSAIS DO MES/ANO
app.get('/saldos_mensais', async (req, res) => {
  try {
    const { id_usuario, mes, ano } = req.query;

    if (!id_usuario || !mes || !ano) {
      return res.status(400).json({ error: 'id_usuario, mes e ano são obrigatórios.' });
    }

    const query = `
      SELECT saldo_disponivel, saldo_despesas_variaveis
      FROM saldos_mensais
      WHERE id_usuario = $1 AND mes = $2 AND ano = $3;
    `;

    const result = await db_client.query(query, [id_usuario, mes, ano]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Saldos mensais não encontrados para o período.' });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao buscar saldos mensais:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA CADASTRAR DÉBITOS
app.post('/debitos', async (req, res) => {
  try {
    const { id_usuario, desc_debito, valor, vencimento } = req.body;

    const query = `
      INSERT INTO debitos (id_usuario, desc_debito, valor, vencimento, status_pagamento)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [id_usuario, desc_debito, valor, vencimento, false];

    const result = await db_client.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao inserir débito:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA OBTER DÉBITO DO MES/ANO
app.get('/obter_debitos', async (req, res) => {
  try {
    const { id_usuario, mes, ano } = req.query;

    if (!id_usuario || !mes || !ano) {
      return res.status(400).json({ error: 'id_usuario, mes e ano são obrigatórios.' });
    }

    const query = `
      SELECT id_debito, desc_debito, valor, vencimento, status_pagamento
      FROM debitos
      WHERE id_usuario = $1
      AND EXTRACT(MONTH FROM vencimento) = $2
      AND EXTRACT(YEAR FROM vencimento) = $3
      ORDER BY vencimento ASC;
    `;

    const result = await db_client.query(query, [id_usuario, mes, ano]);

    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Erro ao buscar débitos:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA ATUALIZAR DÉBITO
app.put('/debitos/:id_debito', async (req, res) => {
  try {
    const { id_debito } = req.params;
    const { desc_debito, valor, vencimento, status_pagamento } = req.body;

    const query = `
      UPDATE debitos
      SET desc_debito = $1, valor = $2, vencimento = $3, status_pagamento = $4
      WHERE id_debito = $5
      RETURNING *;
    `;

    const values = [desc_debito, valor, vencimento, status_pagamento, id_debito];

    const result = await db_client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Débito não encontrado.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar débito:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA EXCLUIR DÉBITO
app.delete('/debitos/:id_debito', async (req, res) => {
  try {
    const { id_debito } = req.params;

    const query = `
      DELETE FROM debitos WHERE id_debito = $1;
    `;

    const result = await db_client.query(query, [id_debito]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Débito não encontrado.' });
    }

    res.status(200).json({ message: 'Débito excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir débito:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA CLONAR DÉBITOS E SALDOS DO MÊS ANTERIOR

app.post('/copiar-debitos-e-saldos', async (req, res) => {
  try {
    const { id_usuario, data_atual } = req.body;

    if (!id_usuario || !data_atual) {
      return res.status(400).json({ error: 'id_usuario e data_atual (AAAA-MM-DD) são obrigatórios.' });
    }

    // VARIÁVEIS MES ATUAL
    const dataAtual = new Date(data_atual);
    const mes_atual = dataAtual.getMonth() + 1;
    const ano_atual = dataAtual.getFullYear();

    // VARIÁVEIS MES ANTERIOR
    const dataAnterior = new Date(dataAtual);
    dataAnterior.setMonth(dataAnterior.getMonth() - 1);
    const mes_anterior = dataAnterior.getMonth() + 1;
    const ano_anterior = dataAnterior.getFullYear();

    // COLETA DÉBITOS MÊS ANTERIOR
    const queryDebitosAnteriores = `
      SELECT desc_debito, valor, vencimento
      FROM debitos
      WHERE id_usuario = $1
      AND EXTRACT(MONTH FROM vencimento) = $2
      AND EXTRACT(YEAR FROM vencimento) = $3;
    `;
    const resultDebitos = await db_client.query(queryDebitosAnteriores, [id_usuario, mes_anterior, ano_anterior]);

    if (resultDebitos.rows.length > 0) {
      const novosDebitos = resultDebitos.rows.map(debito => {
        const diaVencimento = new Date(debito.vencimento).getDate();
        const novaDataVencimento = new Date(ano_atual, mes_atual - 1, diaVencimento);
        const ultimoDiaMesAtual = new Date(ano_atual, mes_atual, 0).getDate();

        // AJUSTE PARA MÊSES COM MAIS DIAS DO QUE OUTROS
        if (diaVencimento > ultimoDiaMesAtual) {
          novaDataVencimento.setDate(ultimoDiaMesAtual);
        }

        return `(${id_usuario}, '${debito.desc_debito.replace(/'/g, "''")}', ${debito.valor}, '${novaDataVencimento.toISOString()}', FALSE)`;
      });

      // INSERT DÉBITOS MÊS ATUAL
      const queryInsercaoDebitos = `
        INSERT INTO debitos (id_usuario, desc_debito, valor, vencimento, status_pagamento)
        VALUES ${novosDebitos.join(',')};
      `;
      await db_client.query(queryInsercaoDebitos);
    }
    
    // COLETA SALDOS MÊS ANTERIOR
    const querySaldoAnterior = `
      SELECT saldo_disponivel, saldo_despesas_variaveis
      FROM saldos_mensais
      WHERE id_usuario = $1
      AND mes = $2
      AND ano = $3;
    `;
    const resultSaldo = await db_client.query(querySaldoAnterior, [id_usuario, mes_anterior, ano_anterior]);
    
    if (resultSaldo.rows.length > 0) {
      const { saldo_disponivel, saldo_despesas_variaveis } = resultSaldo.rows[0];

      const checkSaldoAtualQuery = 'SELECT * FROM saldos_mensais WHERE id_usuario = $1 AND mes = $2 AND ano = $3';
      const checkSaldoAtualResult = await db_client.query(checkSaldoAtualQuery, [id_usuario, mes_atual, ano_atual]);
      
      // ATUALIZA SALDO MÊS ATUAL (CASO EXISTA)
      if (checkSaldoAtualResult.rows.length > 0) {
        const updateSaldoQuery = `
          UPDATE saldos_mensais
          SET saldo_disponivel = $1, saldo_despesas_variaveis = $2
          WHERE id_usuario = $3 AND mes = $4 AND ano = $5;
        `;
        await db_client.query(updateSaldoQuery, [saldo_disponivel, saldo_despesas_variaveis, id_usuario, mes_atual, ano_atual]);
      } else {
        // INSERT SALDO MÊS ATUAL (CASO NÃO EXISTA)
        const insertSaldoQuery = `
          INSERT INTO saldos_mensais (id_usuario, saldo_disponivel, saldo_despesas_variaveis, mes, ano)
          VALUES ($1, $2, $3, $4, $5);
        `;
        await db_client.query(insertSaldoQuery, [id_usuario, saldo_disponivel, saldo_despesas_variaveis, mes_atual, ano_atual]);
      }
    }
    
    res.status(201).json({ message: `Débitos e saldos do mês copiados com sucesso para o mês.` });

  } catch (error) {
    console.error('Erro ao copiar débitos e saldos:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA CADASTRAR RESERVAS

app.post('/reservas', async (req, res) => {
  try {
    const { id_usuario, desc_reserva, valor, mes, ano, observacao } = req.body;

    const query = `
      INSERT INTO reservas (id_usuario, desc_reserva, valor, mes, ano, observacao)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [id_usuario, desc_reserva, valor, mes, ano, observacao];

    const result = await db_client.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao inserir reserva:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT CONFIGURAÇÃO DA NOTIFICAÇÃO DE CONTROLE DO SALDO

app.post('/notificacao-controle-saldo', async (req, res) => {
  try {
    const { id_usuario, hora, dom, seg, ter, qua, qui, sex, sab } = req.body;

    const query = `
      INSERT INTO notificacoes_controle_saldo
        (id_usuario, hora, dom, seg, ter, qua, qui, sex, sab)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [id_usuario, hora, dom, seg, ter, qua, qui, sex, sab];

    const result = await db_client.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar notificação de controle de saldo:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT CONFIGURAÇÃO DA NOTIFICAÇÃO DE AVISO RECEBIMENTO

app.post('/notificacao-dia-recebimento', async (req, res) => {
  try {
    const { id_usuario, dia, hora } = req.body;

    const query = `
      INSERT INTO notificacoes_dia_recebimento (id_usuario, dia, hora)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [id_usuario, dia, hora];

    const result = await db_client.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar notificação de dia de recebimento:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// APP LISTEN

app.listen(process.env.PGPORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em ${ API_URL }`);
});
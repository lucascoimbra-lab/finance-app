import { Client } from 'pg';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

const saltRounds = 10;
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// CONFIGURAÇÕES DEPENDÊNCIA BANCO DE DADOS - POSTGRES (PG)

const db_client = new Client({
  user: 'postgres',
  password: 'Postgress@tcc2025',
  host: process.env.DB_HOST,
  port: 5432,
  database: 'financeapp',
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
      'SELECT senha_hash FROM usuarios WHERE email = $1',
      [email]
    );

    const resultSenhaHash = result.rows[0]?.senha_hash;

    if (!resultSenhaHash) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const senhaConfere = await bcrypt.compare(senha, resultSenhaHash);
    res.json({ isValid: senhaConfere });
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

// ENDPOINT PARA OBTER SALDOS MENSAIS
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
    const { id_usuario, desc_debito, valor, vencimento, repeticoes } = req.body;

    const query = `
      INSERT INTO debitos (id_usuario, desc_debito, valor, vencimento, repeticoes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [id_usuario, desc_debito, valor, vencimento, repeticoes];

    const result = await db_client.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao inserir débito:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ENDPOINT PARA OBTER DÉBITOS
app.get('/obter_debitos', async (req, res) => {
  try {
    const { id_usuario, mes, ano } = req.query; 

    if (!id_usuario || !mes || !ano) {
      return res.status(400).json({ error: 'id_usuario, mes e ano são obrigatórios.' });
    }

    const query = `
      SELECT id_debito, desc_debito, valor, vencimento, repeticoes
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

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

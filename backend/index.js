import { Client } from 'pg'
import express from 'express'

const app = express();
const port = 3000;

app.use(express.json());

// CONFIGURAÇÕES DEPENDÊNCIA BANCO DE DADOS - POSTGRES (PG)

const db_client = new Client({
  user: 'postgres',
  password: 'Postgress@tcc2025',
  host: process.env.DB_HOST,
  port: 5432,
  database: 'financeapp',
})

await db_client.connect()

// ENDPOINT PADRÃO DO FRAMEWORK

app.get('/', (req, res) => {
  res.send('Olá, mundo com Express!');
});

// ENDPOINT TEST_CONNECTION

app.get('/test_connection', async(req, res) => {
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

// ENDPOINT PARA CADASTRAR USUÁRIOS

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const query = `
      INSERT INTO usuarios (nome, email, senha)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [nome, email, senha];

    const result = await db_client.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);

    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

//ENDPOINT PARA CADASTRAR DISPONIBILIDADE INICIAL

app.post('/disponibilidade_inicial', async (req, res) => {
  try {
    const { valor, mes, ano } = req.body;

    const query = `
      INSERT INTO disponibilidade_inicial (valor, mes, ano)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [valor, mes, ano];

    const result = await db_client.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao inserir disponibilidade:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});


//ENDPOINT PARA CADASTRAR DÉBITOS

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


//APP LISTEN

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

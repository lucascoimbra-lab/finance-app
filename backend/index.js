import { Client } from 'pg'
import express from 'express'

const app = express();
const port = 3000;

const db_client = new Client({
  user: 'postgres',
  password: 'Postgress@tcc2025',
  host: process.env.DB_HOST,
  port: 5432,
  database: 'financeapp',
})

await db_client.connect()

app.get('/', (req, res) => {
  res.send('Olá, mundo com Express!');
});

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

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

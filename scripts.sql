-- DOCUMENTO DESTINADO A SALVAR OS COMANDOS UTILIZADOS NA PREPARAÇÃO DAS TABELAS DO BANCO DE DADOS

-- comando pra deletar todas tabelas: drop table debitos, notificacoes_controle_saldo, notificacoes_dia_recebimento, reservas, test_connection, usuarios cascade 

-- Tabela test_connection

CREATE TABLE test_connection (
    id SERIAL PRIMARY KEY,
    counter INT NOT NULL
);
insert into test_connection (counter) values (1);


-- Tabela de Usuários
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(100) NOT NULL
);

-- Disponibilidade
CREATE TABLE disponibilidade_inicial (
    id_disponibilidade_inicial SERIAL PRIMARY KEY,
    valor NUMERIC(10, 2) NOT NULL,
    mes INT CHECK (mes BETWEEN 1 AND 12),
    ano INT CHECK (ano >= 2025 AND ano <= 2200)
);

-- Débitos
CREATE TABLE debitos (
    id_debito SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    desc_debito VARCHAR(200),
    valor NUMERIC(10, 2) NOT NULL,
    vencimento DATE NOT NULL,
    repeticoes INT CHECK (repeticoes >= 0) DEFAULT 0
);

-- Reservas
CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    desc_reserva VARCHAR(200),
    valor NUMERIC(10, 2) NOT NULL,
    mes INT CHECK (mes BETWEEN 1 AND 12),
    ano INT CHECK (ano >= 2025 AND ano <= 2200),
    observacao VARCHAR(200)
);

-- Notificações de Controle de Saldo
CREATE TABLE notificacoes_controle_saldo (
    id_notificacao_controle SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    hora SMALLINT CHECK (hora BETWEEN 0 AND 23),
    dom BOOLEAN DEFAULT FALSE,
    seg BOOLEAN DEFAULT TRUE,
    ter BOOLEAN DEFAULT FALSE,
    qua BOOLEAN DEFAULT FALSE,
    qui BOOLEAN DEFAULT FALSE,
    sex BOOLEAN DEFAULT FALSE,
    sab BOOLEAN DEFAULT FALSE
);

-- Notificações do Dia de Recebimento
CREATE TABLE notificacoes_dia_recebimento (
    id_notificacao_recebimento SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    dia INT CHECK (dia BETWEEN 1 AND 31),
    hora SMALLINT CHECK (hora BETWEEN 0 AND 23)
);
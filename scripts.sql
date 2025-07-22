-- DOCUMENTO DESTINADO A SALVAR OS COMANDOS UTILIZADOS NA PREPARAÇÃO DAS TABELAS DO BANCO DE DADOS

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
    senha VARCHAR(100) NOT NULL
);

-- Notificações de Controle de Saldo
CREATE TABLE notificacoes_controle_saldo (
    id_notificacao_controle SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    hora SMALLINT CHECK (hora BETWEEN 0 AND 23),
    dom BOOLEAN DEFAULT FALSE,
    seg BOOLEAN DEFAULT FALSE,
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
    dia_do_mes INT CHECK (dia_do_mes BETWEEN 1 AND 31),
    hora SMALLINT CHECK (hora BETWEEN 0 AND 23)
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
    carencia VARCHAR(200)
);

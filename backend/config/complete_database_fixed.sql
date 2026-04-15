-- complete_database_fixed.sql - FK-safe import
USE ong_ifopi;

-- Drop in reverse order (FK first)
DROP TABLE IF EXISTS matriculas;
DROP TABLE IF EXISTS professor_disciplinas;
DROP TABLE IF EXISTS turmas;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS notas_faltas;
DROP TABLE IF EXISTS cadastro;

-- Recreate all
CREATE TABLE cadastro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    sobrenome VARCHAR(150) NOT NULL,
    cpf VARCHAR(20),
    email VARCHAR(150) UNIQUE,
    numero VARCHAR(50) UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('aluno', 'professor', 'admin') NOT NULL DEFAULT 'aluno',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE notas_faltas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cadastro_id INT,
    disciplina VARCHAR(100),
    nota DECIMAL(3,1),
    faltas INT,
    data DATE,
    FOREIGN KEY (cadastro_id) REFERENCES cadastro(id)
) ENGINE=InnoDB;

CREATE TABLE professor_disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cadastro_id INT,
    disciplina VARCHAR(100),
    FOREIGN KEY (cadastro_id) REFERENCES cadastro(id)
) ENGINE=InnoDB;

CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nome_curso VARCHAR(120),
    descricao TEXT,
    carga_horaria INT,
    modalidade VARCHAR(50)
) ENGINE=InnoDB;

CREATE TABLE turmas (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT,
    turno VARCHAR(30),
    data_inicio DATE,
    data_fim DATE,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
) ENGINE=InnoDB;

CREATE TABLE matriculas (
    id_matricula INT AUTO_INCREMENT PRIMARY KEY,
    id_cadastro INT,
    id_turma INT,
    status ENUM('ativo', 'concluido', 'cancelado') DEFAULT 'ativo',
    FOREIGN KEY (id_cadastro) REFERENCES cadastro(id),
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma)
) ENGINE=InnoDB;

-- Test data (senhas: aluno123, prof123, admin123)
INSERT INTO cadastro (nome, sobrenome, numero, senha, tipo) VALUES 
('João', 'Silva', 'ALUNO123', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno');

INSERT INTO cadastro (nome, sobrenome, email, senha, tipo) VALUES 
('Maria', 'Santos', 'prof@ong.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),
('Admin', 'ONG', 'admin@ong.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT INTO cursos VALUES (1, 'PHP', 'Curso PHP', 40, 'Presencial');


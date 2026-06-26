-- Database Schema - EduConnect
-- DBMS: PostgreSQL

-- Habilita extensão para geração de UUIDs (opcional, utilizando UUID como chave primária para alta escalabilidade)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------
-- Função de Trigger para Atualização de updated_at
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------
-- Tabela users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'professor', 'aluno')),
  cpf VARCHAR(11) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabela courses (Disciplinas)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabela classes (Turmas)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  semester INT NOT NULL CHECK (semester IN (1, 2)),
  shift VARCHAR(20) NOT NULL CHECK (shift IN ('matutino', 'vespertino', 'noturno')),
  course_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- -----------------------------------------------------
-- Tabela enrollments (Matrículas)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL,
  class_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'trancado', 'cancelado', 'concluido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
  UNIQUE (student_id, class_id)
);

-- -----------------------------------------------------
-- Tabela tasks (Atividades/Tarefas)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  weight DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  class_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabela submissions (Entregas de Tarefas)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL,
  student_id UUID NOT NULL,
  content TEXT NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'entregue' CHECK (status IN ('entregue', 'atrasado', 'corrigido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE (task_id, student_id)
);

-- -----------------------------------------------------
-- Tabela grades (Notas)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL,
  task_id UUID NOT NULL,
  submission_id UUID,
  note DECIMAL(4, 2) NOT NULL CHECK (note >= 0.00 AND note <= 10.00),
  feedback TEXT,
  teacher_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments (id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES submissions (id) ON DELETE SET NULL,
  FOREIGN KEY (teacher_id) REFERENCES users (id) ON DELETE RESTRICT,
  UNIQUE (enrollment_id, task_id)
);

-- -----------------------------------------------------
-- Tabela notifications
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Índices para Performance e Otimização de Consultas
-- -----------------------------------------------------

-- Busca de credenciais de usuários e verificação de CPF
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users (cpf);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Consultas de turmas vinculadas a um curso ou professor
CREATE INDEX IF NOT EXISTS idx_classes_course ON classes (course_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes (teacher_id);

-- Consultas de matrículas por aluno ou por turma
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments (student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments (class_id);

-- Busca de atividades de uma turma
CREATE INDEX IF NOT EXISTS idx_tasks_class ON tasks (class_id);

-- Acesso rápido a entregas de atividades por estudante e tarefa
CREATE INDEX IF NOT EXISTS idx_submissions_task ON submissions (task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions (student_id);

-- Acesso a boletins, consolidação de notas e histórico
CREATE INDEX IF NOT EXISTS idx_grades_enrollment ON grades (enrollment_id);
CREATE INDEX IF NOT EXISTS idx_grades_task ON grades (task_id);

-- Otimização de busca por notificações não lidas
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id) WHERE read_status = FALSE;

-- -----------------------------------------------------
-- Registro de Triggers para atualização automática de updated_at
-- -----------------------------------------------------
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_courses BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_classes BEFORE UPDATE ON classes FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_enrollments BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_tasks BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_submissions BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_grades BEFORE UPDATE ON grades FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_notifications BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- -----------------------------------------------------
-- Tabela logs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Índices de auditoria rápida para logs
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs (user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs (created_at);
CREATE INDEX IF NOT EXISTS idx_logs_action ON logs (action);

-- -----------------------------------------------------
-- Tabela refresh_tokens
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);



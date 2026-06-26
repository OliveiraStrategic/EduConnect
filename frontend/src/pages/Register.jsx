import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('aluno');
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register({ name, email, password, role, cpf });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError(result.message || 'Erro ao criar conta. Verifique os dados.');
    }
  };

  const selectStyle = {
    padding: '12px 16px',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    borderRadius: 'var(--border-radius)',
    border: '1px solid var(--border-color)',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: 'var(--text-primary)',
    transition: 'var(--transition)',
    cursor: 'pointer',
    width: '100%',
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel" style={{ maxWidth: '520px' }}>
        <div className="auth-logo-section">
          <h2 className="auth-logo-title">Criar Conta</h2>
          <p className="auth-subtitle">Registre-se para acessar o EduConnect</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius)',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--success)',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius)',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '20px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}>
            Conta criada com sucesso! Redirecionando para login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Nome Completo"
            placeholder="Ex: Gabriel Garcia"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="CPF (Apenas números)"
            placeholder="Ex: 12345678901"
            value={cpf}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Perfil de Usuário <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={selectStyle}
              required
            >
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <Input
            label="Endereço de E-mail"
            type="email"
            placeholder="Ex: gabriel@instituicao.edu.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Senha de Acesso"
            type="password"
            placeholder="Crie uma senha de acesso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" fullWidth disabled={loading || success}>
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </Button>
        </form>

        <div className="auth-footer">
          <span>Já possui uma conta? </span>
          <Link to="/login" className="auth-link">Entrar</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import userService from '../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form/Modal States
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('aluno');
  const [cpf, setCpf] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.listUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(err.message || 'Erro ao buscar lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('aluno');
    setCpf('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setCpf(user.cpf || '');
    setPassword(''); // Não exibe hash de senha
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (editingId) {
        // Modo Edição
        const response = await userService.updateUser(editingId, { name, email, role, cpf });
        if (response.success) {
          setSuccess('Usuário atualizado com sucesso!');
          clearForm();
          fetchUsers();
        }
      } else {
        // Modo Criação
        const response = await userService.createUser({ name, email, password, role, cpf });
        if (response.success) {
          setSuccess('Usuário cadastrado com sucesso!');
          clearForm();
          fetchUsers();
        }
      }
    } catch (err) {
      setError(err.message || 'Erro ao salvar dados do usuário.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza de que deseja deletar permanentemente este usuário?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await userService.deleteUser(id);
      if (response.success) {
        setSuccess('Usuário excluído com sucesso!');
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Erro ao remover usuário.');
      setLoading(false);
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
    <div className="app-layout">
      <Sidebar />
      <div className="main-content-container">
        <Navbar />
        <main className="content-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1>Gerenciamento de Usuários</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Lista consolidada de estudantes, professores e administradores.</p>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} variant="primary">
                + Novo Usuário
              </Button>
            )}
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
              {success}
            </div>
          )}

          {showForm && (
            <div className="glass-card fade-in" style={{ padding: '30px', marginBottom: '30px', borderRadius: 'var(--border-radius)' }}>
              <h3>{editingId ? 'Editar Cadastro de Usuário' : 'Registrar Novo Usuário'}</h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <Input
                  label="Nome Completo"
                  placeholder="Nome do usuário"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                
                <Input
                  label="CPF"
                  placeholder="CPF (apenas números)"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  required
                />

                <Input
                  label="E-mail Acadêmico"
                  type="email"
                  placeholder="email@educonnect.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {!editingId && (
                  <Input
                    label="Senha de Acesso"
                    type="password"
                    placeholder="Defina a senha inicial"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Perfil de Usuário *
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

                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <Button onClick={clearForm} variant="outline">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingId ? 'Salvar Alterações' : 'Criar Usuário'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <Loading />
          ) : (
            <div className="fade-in">
              <Table
                headers={['Nome', 'E-mail', 'CPF', 'Perfil', 'Ações']}
                data={users}
                renderRow={(user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 500 }}>{user.name}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : '-'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        backgroundColor: user.role === 'admin' ? '#fee2e2' : user.role === 'professor' ? '#fef3c7' : '#d1fae5',
                        color: user.role === 'admin' ? '#ef4444' : user.role === 'professor' ? '#d97706' : '#10b981',
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                      <Button onClick={() => handleEditClick(user)} variant="secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        Editar
                      </Button>
                      <Button onClick={() => handleDelete(user.id)} variant="danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        Deletar
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserManagement;

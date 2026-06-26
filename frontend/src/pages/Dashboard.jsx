import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import api from '../api/api';

// Importações do Chart.js e wrappers react-chartjs-2
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Registro dos elementos requeridos pelo Chart.js v4
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  
  // Dashboard states
  const [metrics, setMetrics] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Inicia requisições concorrentes
      const [metricsRes, activityRes, notificationsRes] = await Promise.all([
        api.get('/dashboard/metrics'),
        api.get('/dashboard/activity'),
        api.get('/notifications?limit=5')
      ]);

      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data.metrics);
        setRecentActivity(metricsRes.data.data.recentActivity || []);
      }
      
      if (activityRes.data.success) {
        setActivityData(activityRes.data.data || []);
      }

      if (notificationsRes.data.success) {
        setNotifications(notificationsRes.data.data.notifications || []);
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar métricas da dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // Prepara os dados para o gráfico de pizza (Usuários por papel)
  const pieChartData = {
    labels: ['Alunos', 'Professores', 'Administradores'],
    datasets: [
      {
        data: metrics ? [metrics.totalStudents, metrics.totalTeachers, metrics.totalUsers - metrics.totalStudents - metrics.totalTeachers] : [0, 0, 0],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };

  // Prepara os dados para o gráfico de linhas (Atividades recentes por dia)
  // Agrupa os dados por data para plotar no gráfico
  const activityDates = [...new Set(activityData.map(item => new Date(item.date).toLocaleDateString('pt-BR')))].reverse();
  const activityCounts = activityDates.map(date => {
    return activityData
      .filter(item => new Date(item.date).toLocaleDateString('pt-BR') === date)
      .reduce((acc, curr) => acc + parseInt(curr.count, 10), 0);
  });

  const lineChartData = {
    labels: activityDates.length > 0 ? activityDates : ['Sem dados'],
    datasets: [
      {
        label: 'Ações Registradas',
        data: activityCounts.length > 0 ? activityCounts : [0],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#4f46e5',
        pointBorderWidth: 2
      }
    ]
  };

  const dashboardContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px'
  };

  const cardStyle = {
    padding: '24px',
    borderRadius: 'var(--border-radius)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const cardTitleStyle = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const cardValueStyle = {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif"
  };

  const chartsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px'
  };

  const chartCardStyle = {
    padding: '24px',
    borderRadius: 'var(--border-radius)',
    minHeight: '300px'
  };

  const feedGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content-container">
        <Navbar />
        <main className="content-body">
          {loading ? (
            <Loading />
          ) : (
            <div style={dashboardContainerStyle} className="fade-in">
              {/* Cabeçalho */}
              <div>
                <h1>Olá, {user?.name}!</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Acompanhe os principais indicadores de monitoramento e auditoria em produção do **EduConnect**.
                </p>
              </div>

              {error && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  padding: '12px 16px',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '0.875rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  {error}
                </div>
              )}

              {/* Cards de Métricas */}
              <div style={gridStyle}>
                <div className="glass-card" style={cardStyle}>
                  <span style={cardTitleStyle}>Total de Usuários</span>
                  <span style={cardValueStyle}>{metrics?.totalUsers || 0}</span>
                </div>
                <div className="glass-card" style={{ ...cardStyle, borderLeft: '4px solid #10b981' }}>
                  <span style={cardTitleStyle}>Total de Alunos</span>
                  <span style={{ ...cardValueStyle, color: '#10b981' }}>{metrics?.totalStudents || 0}</span>
                </div>
                <div className="glass-card" style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
                  <span style={cardTitleStyle}>Total de Professores</span>
                  <span style={{ ...cardValueStyle, color: '#f59e0b' }}>{metrics?.totalTeachers || 0}</span>
                </div>
                <div className="glass-card" style={{ ...cardStyle, borderLeft: '4px solid #4f46e5' }}>
                  <span style={cardTitleStyle}>Atividades Registradas</span>
                  <span style={{ ...cardValueStyle, color: '#4f46e5' }}>{metrics?.totalActivities || 0}</span>
                </div>
              </div>

              {/* Gráficos de Produção */}
              <div style={chartsGridStyle}>
                <div className="glass-card" style={chartCardStyle}>
                  <h3 style={{ marginBottom: '20px' }}>Atividades do Sistema (Linha do Tempo)</h3>
                  <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                    <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
                <div className="glass-card" style={chartCardStyle}>
                  <h3 style={{ marginBottom: '20px' }}>Usuários por Perfil</h3>
                  <div style={{ position: 'relative', height: '220px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>

              {/* Seção Inferior: Notificações e Feeds */}
              <div style={feedGridStyle}>
                {/* Canal de Notificações */}
                <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--border-radius)' }}>
                  <h3 style={{ marginBottom: '20px' }}>Notificações Internas</h3>
                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nenhuma notificação recente.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {notifications.map((notif) => (
                        <div key={notif.id} style={{
                          padding: '12px',
                          borderRadius: 'var(--border-radius)',
                          backgroundColor: 'rgba(79, 70, 229, 0.05)',
                          borderLeft: '3px solid var(--primary)',
                          fontSize: '0.85rem'
                        }}>
                          <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{notif.title}</strong>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>{notif.message}</span>
                          <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                            {new Date(notif.created_at).toLocaleString('pt-BR')}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Logs de Auditoria Recentes */}
                <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--border-radius)' }}>
                  <h3 style={{ marginBottom: '20px' }}>Logs Recentes de Auditoria</h3>
                  {recentActivity.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nenhum log registrado ainda.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {recentActivity.map((log) => (
                        <div key={log.id} style={{
                          padding: '12px',
                          borderRadius: 'var(--border-radius)',
                          backgroundColor: 'var(--bg-primary)',
                          fontSize: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}>
                          <span style={{ color: 'var(--text-primary)' }}>
                            <strong>{log.user_name || 'SYSTEM'}</strong> executou <strong>{log.action}</strong>
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{log.description}</span>
                          <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import UserManagement from '../pages/UserManagement';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas Privadas Genéricas */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Rotas Privadas Restritas a Administrador */}
      <Route element={<RoleRoute allowedRoles={['admin']} />}>
        <Route path="/users" element={<UserManagement />} />
      </Route>

      {/* Redirecionamento de Rota Raiz */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Fallback de Rota Inexistente */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

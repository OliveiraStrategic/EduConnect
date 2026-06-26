import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const RoleRoute = ({ allowedRoles }) => {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default RoleRoute;

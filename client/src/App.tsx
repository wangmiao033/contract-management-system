import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './theme';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContractList from './pages/ContractList';
import ContractDetail from './pages/ContractDetail';
import ContractEdit from './pages/ContractEdit';
import UserList from './pages/UserList';
import UserEdit from './pages/UserEdit';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="contracts">
                <Route index element={<ContractList />} />
                <Route path="new" element={<ContractEdit />} />
                <Route path=":id" element={<ContractDetail />} />
                <Route path=":id/edit" element={<ContractEdit />} />
              </Route>
              <Route
                path="users"
                element={
                  <PrivateRoute roles={['admin']}>
                    <UserList />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default App; 
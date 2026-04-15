import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login.jsx';
import Admin from './components/Admin.jsx';
import Professor from './components/Professor.jsx';
import Aluno from './components/Aluno.jsx';
import Home from './components/Home.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <PrivateRoute allowedType="admin">
            <Admin />
          </PrivateRoute>
        } />
        <Route path="/professor" element={
          <PrivateRoute allowedType="professor">
            <Professor />
          </PrivateRoute>
        } />
        <Route path="/aluno" element={
          <PrivateRoute allowedType="aluno">
            <Aluno />
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;


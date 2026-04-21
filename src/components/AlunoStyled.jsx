import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { FaRefresh, FaSpinner, FaSignOutAlt } from 'react-icons/fa6';

const AlunoStyled = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ultimaNota, setUltimaNota] = useState(0);
  const [ultimasFaltas, setUltimasFaltas] = useState(0);

  useEffect(() => {
    if (user) {
      loadDados();
    }
  }, [user]);

  const loadDados = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/backend/routes/aluno.php?numero=${user.numero}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setUltimaNota(data.ultima_nota || 0);
        setUltimasFaltas(data.ultimas_faltas || 0);
      }
    } catch (e) {
      toast.error('Erro carregar dados');
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleGradesUpdate = () => {
      loadDados();
    };
    
    window.addEventListener('alunoGradesUpdated', handleGradesUpdate);
    return () => window.removeEventListener('alunoGradesUpdated', handleGradesUpdate);
  }, []);

  const logoutHandler = () => {
    logout();
  };

  const getNotaColor = (nota) => {
    if (nota >= 7) return 'text-green-600 bg-green-100';
    if (nota >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getFaltasStatus = (faltas) => {
    if (faltas === 0) return 'text-green-600 bg-green-100';
    if (faltas <= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className='min-h-screen bg-[#d9d9d9] font-poppins text-[#7c7c7c]'>
      {/* Header - Match Admin */}
      <header className='w-full'>
        <div className='h-[20px] w-full bg-[#005ea8]'></div>
        <div className='h-[72px] flex justify-center items-center bg-[#d9d9d9]'>
          <img src='/images/logo.png' alt='Logo IFOPI' className='w-[96px] h-auto' />
        </div>
        <div className='h-[7px] bg-gradient-to-b from-black/25 to-transparent'></div>
      </header>

      {/* Main Content */}
      <main className='w-[86%] max-w-[1180px] mx-auto mt-[34px] mb-[40px]'>
        {/* Top Bar */}
        <div className='flex justify-between items-center mb-[30px]'>
          <h1 className='text-[28px] font-bold text-[#005ea8]'>
            📊 Meu Progresso - {user?.nome}
          </h1>
          <button 
            onClick={logoutHandler} 
            className='bg-[#005ea8] text-white px-[20px] py-[12px] rounded-lg hover:bg-[#004494] transition-all shadow-md flex items-center gap-2 text-sm font-medium'
          >
            <FaSignOutAlt />
            Sair
          </button>
        </div>

        {/* Stats Cards - Match Admin table style */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-[24px] mb-[40px]'>
          {/* Nota Card */}
          <div className='bg-white shadow-[5px_7px_8px_rgba(0,0,0,0.18)] p-[32px] rounded-xl border border-[#e0e0e0]'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-[12px] h-[12px] rounded-full bg-gradient-to-r from-green-500 to-green-600'></div>
              <h3 className='text-lg font-bold text-[#005ea8]'>Média Geral</h3>
            </div>
            <div className={`text-[48px] font-black mb-4 ${getNotaColor(ultimaNota)}`}>
              {ultimaNota.toFixed(1)} <span className='text-xl font-normal'>/ 10</span>
            </div>
            <div className='w-full h-[24px] bg-gray-200 rounded-full overflow-hidden shadow-inner'>
              <div 
                className={`h-full rounded-full shadow-lg transition-all duration-1000 ${getNotaColor(ultimaNota)}`}
                style={{width: `${Math.min((ultimaNota / 10) * 100, 100)}%`}}
              />
            </div>
          </div>

          {/* Faltas Card */}
          <div className='bg-white shadow-[5px_7px_8px_rgba(0,0,0,0.18)] p-[32px] rounded-xl border border-[#e0e0e0]'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-[12px] h-[12px] rounded-full bg-gradient-to-r from-orange-500 to-orange-600'></div>
              <h3 className='text-lg font-bold text-[#005ea8]'>Faltas Recentes</h3>
            </div>
            <div className={`text-[48px] font-black mb-4 ${getFaltasStatus(ultimasFaltas)}`}>
              {ultimasFaltas}
            </div>
            <div className={`text-sm font-medium px-4 py-2 rounded-lg mt-4 ${getFaltasStatus(ultimasFaltas)}`}>
              {ultimasFaltas === 0 ? '✅ Perfeito!' : ultimasFaltas <= 3 ? '⚠️ Atenção' : '🚨 Urgente'}
            </div>
          </div>
        </div>

        {/* Action Buttons - Match Admin toolbar */}
        <div className='bg-white shadow-[5px_7px_8px_rgba(0,0,0,0.18)] p-[20px] rounded-xl mb-[40px] flex flex-col sm:flex-row gap-4 justify-center'>
          <button 
            onClick={loadDados} 
            disabled={loading}
            className='flex-1 max-w-md px-8 py-4 bg-[#005ea8] text-white rounded-lg font-bold hover:bg-[#004494] transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? <><FaSpinner className='animate-spin'/> Atualizando...</> : <><FaRefresh/> Atualizar Dados</>}
          </button>
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('alunoGradesUpdated'));
              toast.success('🔥 Sincronização testada!');
            }}
            className='flex-1 max-w-md px-8 py-4 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 text-lg'
          >
            🔄 Testar Sync
          </button>
        </div>
      </main>

      {/* Responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          .w-\\[86\\%] { width: 94% !important; margin-top: 24px; }
          .grid-cols-2 { grid-template-columns: 1fr; }
          main .shadow-\\[5px_7px_8px_rgba\\(0,0,0,0.18\\)\\] { 
            padding: 24px !important; 
            border-radius: 16px !important; 
          }
        }
        @media (max-width: 480px) {
          .text-\\[48px\\] { font-size: 36px !important; }
        }
      `}</style>
    </div>
  );
};

export default AlunoStyled;


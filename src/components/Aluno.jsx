import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';

const Aluno = () => {
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
        toast.success(`Última nota: ${data.ultima_nota?.toFixed(1)} | Faltas: ${data.ultimas_faltas}`);
      }
    } catch (e) {
      toast.error('Erro carregar dados');
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleGradesUpdate = () => {
      console.log('🔥 Aluno LIVE update!');
      loadDados();
    };
    
    window.addEventListener('alunoGradesUpdated', handleGradesUpdate);
    return () => window.removeEventListener('alunoGradesUpdated', handleGradesUpdate);
  }, []);

  const logoutHandler = () => {
    if (confirm('Deseja sair?')) {
      logout();
    }
  };

  return (
    <div className='bg-[#eaeaea] min-h-screen font-poppins'>
      <header className='bg-ifopiBlueLight p-[10px] text-center'>
        <div className='logo inline-block'>
          <img src='/images/logo.png' alt='IFOPI' className='w-[120px]' />
        </div>
      </header>

      <main className='p-[30px] text-center'>
        <div className='flex justify-center items-center gap-[20px] mb-[30px] flex-wrap'>
          <h1 className='text-[24px] text-ifopiBlueLight'>Meu Progresso - {user?.nome}</h1>
          <button onClick={logoutHandler} className='bg-ifopiBlueLight border-none text-white p-[10px_18px] rounded-[8px] cursor-pointer hover:bg-[#154a7a] flex items-center gap-1'>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <path d="M21 12h-9"></path>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className='text-xl animate-pulse py-20'>Carregando...</div>
        ) : (
          <div className='flex flex-col lg:flex-row justify-center gap-[32px] flex-wrap items-stretch max-w-5xl mx-auto mb-[40px]'>
            {/* MÉDIA GERAL = ÚLTIMA NOTA */}
            <div className='bg-white p-[28px] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex-1 max-w-[300px] border border-gray-100'>
              <h3 className='text-ifopiBlueLight mb-[16px] font-bold text-lg'>Média Geral</h3>
              <p className='text-[40px] font-black text-ifopiBlueLight mb-[12px]'>{ultimaNota.toFixed(1)}<span className='text-lg font-normal'>/10</span></p>
              <div className='w-full h-[20px] bg-gray-200 rounded-full overflow-hidden mb-[12px] shadow-inner'>
                <div 
                  className={`h-full rounded-full transition-all duration-1000 shadow-lg ${
                    ultimaNota >= 7 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    ultimaNota >= 5 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`} 
                  style={{width: `${(ultimaNota / 10) * 100}%`}}
                />
              </div>
            </div>

            {/* FALTAS = ÚLTIMAS FALTAS */}
            <div className='bg-white p-[28px] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex-1 max-w-[300px] border border-gray-100'>
              <h3 className='text-ifopiBlueLight mb-[16px] font-bold text-lg'>Faltas</h3>
              <p className='text-[40px] font-black text-ifopiBlueLight'>{ultimasFaltas}</p>
              <div className='mt-[16px] grid grid-cols-3 gap-2'>
                <div className={`p-2 rounded-lg text-xs font-medium text-center ${
                  ultimasFaltas === 0 ? 'bg-green-100 text-green-800' :
                  ultimasFaltas <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {ultimasFaltas === 0 ? 'Perfeito' : ultimasFaltas <= 3 ? 'OK' : 'Atenção'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          <button 
            onClick={loadDados} 
            className='px-[32px] py-[16px] bg-ifopiBlue text-white rounded-[12px] hover:bg-[#1e5fa8] transition-all font-bold shadow-xl hover:shadow-2xl active:scale-[0.97] flex items-center gap-3 justify-center min-w-[180px]'
            disabled={loading}
          >
            {loading ? '⏳' : '🔄'} Atualizar
          </button>
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('alunoGradesUpdated'));
              toast.success('🔥 Sync test triggered!');
            }}
            className='px-[32px] py-[16px] bg-emerald-500 text-white rounded-[12px] hover:bg-emerald-600 transition-all font-bold shadow-xl hover:shadow-2xl active:scale-[0.97] flex items-center gap-3 justify-center min-w-[180px]'
          >
            Teste Sync
          </button>
        </div>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          main.p-\\[30px\\] { padding: 24px 20px; }
          .flex { flex-direction: column !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default Aluno;


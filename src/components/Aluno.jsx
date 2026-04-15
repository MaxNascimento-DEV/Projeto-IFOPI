import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';

const Aluno = () => {
  const { user, logout } = useAuth();
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setNotas(data.notas || []);
        toast.success('Notas carregadas!');
      }
    } catch (e) {
      toast.error('Erro carregar notas');
    }
    setLoading(false);
  };

  const totalMedia = notas.reduce((sum, n) => sum + parseFloat(n.media || 0), 0) / Math.max(notas.length, 1);
  const totalFaltas = notas.reduce((sum, n) => sum + parseInt(n.total_faltas || 0), 0);

  const logoutHandler = () => {
    if (confirm('Deseja sair?')) {
      logout();
    }
  };

  return (
    <div className='bg-[#eaeaea] min-h-screen font-poppins'>
      {/* TOPO */}
      <header className='bg-ifopiBlueLight p-[10px] text-center'>
        <div className='logo inline-block'>
          <img src='/images/logo.png' alt='IFOPI' className='w-[120px]' />
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className='p-[30px] text-center'>
        <div className='flex justify-center items-center gap-[20px] mb-[30px] flex-wrap'>
          <h1 id='nomeAluno' className='text-[24px] text-ifopiBlueLight'>Meu Progresso - {user?.nome}</h1>
          <button onClick={logoutHandler} className='bg-ifopiBlueLight border-none text-white p-[10px_18px] rounded-[8px] cursor-pointer hover:bg-[#154a7a] flex items-center gap-1'>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <path d="M21 12h-9"></path>
            </svg>
          </button>
        </div>

        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className='flex justify-center gap-[30px] flex-wrap'>
            {/* MÉDIA */}
            <div className='bg-white p-[20px] w-[220px] rounded-[12px] shadow-[0_6px_0_rgba(0,0,0,0.15)]'>
              <h3 className='text-ifopiBlueLight mb-[10px]'>Média Geral</h3>
              <p className='text-[24px] font-bold text-ifopiBlueLight'>{totalMedia.toFixed(1)}/10.0</p>
              <div className='mt-[15px] w-full h-[10px] bg-[#ddd] rounded-[10px]'>
                <div 
                  className='h-full bg-[#bbb] rounded-[10px] transition-all duration-500' 
                  style={{width: `${Math.min((totalMedia / 10) * 100, 100)}%`}}
                />
              </div>
            </div>

            {/* FALTAS */}
            <div className='bg-white p-[20px] w-[220px] rounded-[12px] shadow-[0_6px_0_rgba(0,0,0,0.15)]'>
              <h3 className='text-ifopiBlueLight mb-[10px]'>Faltas</h3>
              <p className='text-[24px] font-bold text-ifopiBlueLight'>{totalFaltas}</p>
            </div>

            {/* DISCIPLINAS */}
            <div className='bg-white p-[20px] w-[220px] rounded-[12px] shadow-[0_6px_0_rgba(0,0,0,0.15)]'>
              <h3 className='text-ifopiBlueLight mb-[10px]'>Disciplinas</h3>
              <p className='text-[24px] font-bold text-ifopiBlueLight'>{notas.length}</p>
            </div>
          </div>
        )}

        <button 
          onClick={loadDados} 
          className='mt-[20px] px-[20px] py-[10px] bg-ifopiBlue text-white rounded-[8px] hover:bg-[#154a7a]'
          disabled={loading}
        >
          Atualizar Dados
        </button>
      </main>

      {/* Responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          .flex {
            flex-direction: column !important;
          }
          .flex.gap-\\[20px\\] {
            gap: 10px;
          }
          main.p-\\[30px\\] {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Aluno;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { FaUser, FaBook, FaChalkboardTeacher, FaSearch, FaSave, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const Professor = () => {
  const { user, logout } = useAuth();
  const [disciplinas, setDisciplinas] = useState([]);
  const [selectedDisc, setSelectedDisc] = useState('');
  const [search, setSearch] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  useEffect(() => {
    if (user) {
      loadDisciplinas();
    }
  }, [user]);

  const loadDisciplinas = async () => {
    try {
      const response = await fetch(`/backend/routes/professor.php?action=disciplinas`, { credentials: 'include' });
      const data = await response.json();
      setDisciplinas(data.disciplinas || []);
      if (data.disciplinas?.length > 0) {
        setSelectedDisc(data.disciplinas[0]);
        loadAlunos(data.disciplinas[0]);
      }
    } catch (e) {
      toast.error('Erro carregar disciplinas');
    }
  };

  const loadAlunos = async (disciplina) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        disciplina,
        date: dateFilter,
        status: statusFilter,
        search
      });
      const response = await fetch(`/backend/routes/professor.php?action=students&${params}`, { credentials: 'include' });
      const data = await response.json();
      setAlunos(data.alunos || []);
      toast.success(`Carregados ${data.alunos?.length || 0} alunos`);
    } catch (e) {
      toast.error('Erro carregar alunos');
    }
    setLoading(false);
  };

  const saveNota = async (aluno) => {
    try {
      const response = await fetch('/backend/routes/professor.php?action=update', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aluno_id: aluno.id,
          disciplina: selectedDisc,
          nota: parseFloat(aluno.nota) || 0,
          faltas: parseInt(aluno.faltas) || 0,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.mensagem);
        setAlunos(alunos.map(a => a.id === aluno.id ? {...a, nota: parseFloat(aluno.nota), faltas: parseInt(aluno.faltas)} : a));
      }
    } catch (e) {
      toast.error('Erro salvar');
    }
  };

  const filteredAlunos = alunos.filter(a => 
    a.nome.toLowerCase().includes(search.toLowerCase()) || 
    a.numero.includes(search)
  );

  return (
    <div className='min-h-screen bg-[#d9d9d9] font-poppins text-[#7c7c7c]'>
      {/* Header matching Admin/Painel */}
      <header className='w-full'>
        <div className='h-[20px] w-full bg-ifopiBlue'></div>
        <div className='h-[72px] flex justify-center items-center bg-[#d9d9d9]'>
          <img src='/images/logo.png' alt='Logo IFOPI' className='w-[96px] h-auto' />
        </div>
        <div className='h-[7px] bg-gradient-to-b from-black/25 to-transparent'></div>
      </header>

      <div className='w-[86%] max-w-[1180px] mx-auto mt-[34px] mb-[40px]'>
        {/* Title */}
        <div className='flex justify-between items-center mb-[30px]'>
          <h1 className='text-[24px] text-ifopiBlueLight font-bold'>Lançamento de Notas - {user?.nome}</h1>
          <button onClick={logout} className='bg-ifopiBlue text-white px-[20px] py-[10px] rounded-[8px] hover:bg-[#154a7a] transition'>
            Sair
          </button>
        </div>

        {/* Toolbar - same as Painel */}
        <div className='h-[32px] bg-ifopiBlue shadow-[5px_7px_8px_rgba(0,0,0,0.18)] grid grid-cols-[120px_170px_1fr] items-center mb-[20px] rounded-t'>
          <div className='relative'>
            <button className='w-full h-full bg-transparent text-white text-[11px] px-[10px] flex items-center justify-between font-poppins'>
              {dateFilter}
              <svg className='w-[12px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
              </svg>
            </button>
          </div>
          
          <div className='relative border-l border-white/12'>
            <button className='w-full h-full bg-transparent text-white text-[11px] px-[10px] flex items-center justify-between font-poppins'>
              TODOS ALUNOS
              <svg className='w-[12px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
              </svg>
            </button>
          </div>
          
          <div className='grid grid-cols-[1fr_auto] items-center h-full'>
            <input 
              placeholder='Filtrar...' 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className='w-full h-full bg-transparent text-white pl-[12px] text-[12px] placeholder-white/90'
              onKeyPress={(e) => e.key === 'Enter' && loadAlunos(selectedDisc)}
            />
            <button className='w-[44px] h-full bg-transparent text-white text-[14px]'>
              🔍
            </button>
          </div>
        </div>

        {/* Discipline filter */}
        <div className='bg-[#d9d9d9] p-[12px] rounded mb-[20px]'>
          <label className='block text-[12px] text-[#9a9a9a] mb-[8px]'>Disciplina</label>
          <select 
            value={selectedDisc} 
            onChange={(e) => {
              setSelectedDisc(e.target.value);
              loadAlunos(e.target.value);
            }}
            className='w-full h-[32px] bg-white border border-[#ababab] px-[12px] text-[13px] rounded'
          >
            <option value="">Selecione disciplina</option>
            {disciplinas.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Table Card */}
        <div className='bg-[#d9d9d9] shadow-[5px_7px_8px_rgba(0,0,0,0.18)] rounded overflow-hidden'>
          <div className='grid grid-cols-[1.6fr_1.2fr_70px] bg-white p-[12px] text-[11px] text-[#9a9a9a] border-b border-[#ababab] font-bold'>
            <span>ALUNO</span>
            <span>MATRÍCULA</span>
            <span>NOTA</span>
          </div>
          <div className='min-h-[400px]'>
            {filteredAlunos.map((aluno) => (
              <div key={aluno.id} className='grid grid-cols-[1.6fr_1.2fr_70px] items-center h-[34px] p-[12px] border-b border-[#ababab] hover:bg-white/20 text-[12px]'>
                <div className='flex items-center gap-[14px]'>
                  <FaUser className='text-[#707070] text-[15px]' />
                  <span>{aluno.nome} {aluno.sobrenome}</span>
                </div>
                <span className='text-[#818181]'>{aluno.numero}</span>
                <div className='flex gap-[8px]'>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.1"
                    value={aluno.nota || ''}
                    onChange={(e) => {
                      const newAlunos = alunos.map(a => a.id === aluno.id ? {...a, nota: e.target.value} : a);
                      setAlunos(newAlunos);
                    }}
                    className='w-[50px] p-[4px] border border-[#ababab] rounded text-[12px] bg-white focus:outline-none focus:border-ifopiBlue'
                  />
                  <button 
                    onClick={() => saveNota(aluno)}
                    className='w-[22px] h-[12px] border-none rounded-full relative cursor-pointer transition-all bg-green-500'
                    title='Salvar nota'
                  >
                    <FaSave className='absolute text-white text-[8px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' />
                  </button>
                </div>
              </div>
            ))}
            {filteredAlunos.length === 0 && (
              <div className='p-[40px] text-center text-[#9a9a9a] text-[14px]'>
                {loading ? 'Carregando...' : 'Nenhum aluno encontrado'}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .w-\\[86\\%] { width: 95%; margin-top: 22px; }
          .grid-cols-\\[1\\.6fr_1\\.2fr_70px\\] { grid-template-columns: 1fr 1fr auto; }
        }
      `}</style>
    </div>
  );
};

export default Professor;

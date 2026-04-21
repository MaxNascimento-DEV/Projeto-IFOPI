import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { FaUser, FaPlus, FaMinus, FaSave, FaSpinner, FaSearch, FaSignOutAlt } from 'react-icons/fa6';

const ProfessorStyled = () => {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingIds, setSavingIds] = useState(new Set());
  const [stats, setStats] = useState({ total: 0, avgNota: 0, totalFaltas: 0 });

  useEffect(() => {
    if (user?.tipo === 'professor') {
      loadAlunos();
    }
  }, [user]);

  const loadAlunos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search });
      const response = await fetch(`/backend/routes/professor.php?${params}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setAlunos(data.alunos || []);
        const total = data.alunos?.length || 0;
        const avgNota = data.alunos?.reduce((sum, a) => sum + (parseFloat(a.nota) || 0), 0) / Math.max(1, total);
        const totalFaltas = data.alunos?.reduce((sum, a) => sum + (parseInt(a.faltas) || 0), 0);
        setStats({ total, avgNota: avgNota.toFixed(1), totalFaltas });
      }
    } catch (e) {
      toast.error('Erro ao carregar alunos');
    }
    setLoading(false);
  }, [search]);

  const updateAlunoLocal = useCallback((alunoId, field, value) => {
    setAlunos(prev => prev.map(a => 
      a.id === alunoId 
        ? { ...a, [field]: field === 'nota' ? parseFloat(value) || '' : parseInt(value) || 0 }
        : a
    ));
  }, []);

  const saveNotaFaltas = useCallback(async (aluno, e) => {
    if (e) e.stopPropagation();
    const alunoId = aluno.id;
    const nota = parseFloat(aluno.nota) || 0;
    const faltas = parseInt(aluno.faltas) || 0;

    if (nota > 10 || nota < 0 || faltas < 0) {
      toast.error('Nota 0-10, faltas ≥ 0');
      return;
    }

    setSavingIds(prev => new Set([...prev, alunoId]));
    try {
      const response = await fetch('/backend/routes/professor.php', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aluno_id: alunoId, nota, faltas }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`✅ ${aluno.nome_completo.slice(0,15)}... salvo`);
        window.dispatchEvent(new CustomEvent('alunoGradesUpdated', { detail: { alunoId } }));
      }
    } catch (e) {
      toast.error('Erro ao salvar');
    }
    setSavingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(alunoId);
      return newSet;
    });
  }, [alunos]);

  const changeFaltas = useCallback((alunoId, delta) => {
    setAlunos(prev => prev.map(a => 
      a.id === alunoId 
        ? { ...a, faltas: Math.max(0, (parseInt(a.faltas) || 0) + delta) }
        : a
    ));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadAlunos(), 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const filteredAlunos = useMemo(() => 
    alunos.filter(a => 
      (!search || 
        a.nome_completo.toLowerCase().includes(search.toLowerCase()) || 
        a.numero.includes(search))
    ), [alunos, search]);

  const logoutHandler = () => {
    logout();
  };

  return (
    <div className='min-h-screen bg-[#d9d9d9] font-poppins text-[#7c7c7c]'>
      {/* Header - Match Admin/Aluno */}
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
            📚 Gestão de Notas - Prof. {user?.nome}
          </h1>
          <button 
            onClick={logoutHandler} 
            className='bg-[#005ea8] text-white px-[20px] py-[12px] rounded-lg hover:bg-[#004494] transition-all shadow-md flex items-center gap-2 text-sm font-medium'
          >
            <FaSignOutAlt />
            Sair
          </button>
        </div>

        {/* Stats Bar */}
        {stats.total > 0 && (
          <div className='bg-white shadow-[5px_7px_8px_rgba(0,0,0,0.18)] p-[20px] rounded-xl mb-[24px] grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
            <div className='p-4'>
              <div className='text-3xl font-bold text-[#005ea8]'>{stats.total}</div>
              <div className='text-sm text-[#9a9a9a] mt-1'>Total Alunos</div>
            </div>
            <div className='p-4'>
              <div className='text-3xl font-bold text-green-600'>{stats.avgNota}</div>
              <div className='text-sm text-[#9a9a9a] mt-1'>Média Geral</div>
            </div>
            <div className='p-4'>
              <div className='text-3xl font-bold text-orange-600'>{stats.totalFaltas}</div>
              <div className='text-sm text-[#9a9a9a] mt-1'>Faltas Totais</div>
            </div>
          </div>
        )}

        {/* Search Toolbar */}
        <div className='bg-white shadow-[5px_7px_8px_rgba(0,0,0,0.18)] p-[20px] rounded-xl mb-[24px] flex items-center gap-4'>
          <FaSearch className='text-[#9a9a9a] text-xl flex-shrink-0' />
          <input 
            placeholder='🔍 Buscar por nome ou matrícula...' 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className='flex-1 h-[44px] bg-[#f8f9fa] border border-[#e0e0e0] px-[20px] rounded-xl text-lg placeholder-[#9a9a9a] focus:outline-none focus:border-[#005ea8] focus:ring-2 focus:ring-[#005ea8]/20 transition-all'
          />
        </div>

        {/* Table Container */}
        <div className='bg-white shadow-[5px_7px_8px_rgba(0,0,0,0.18)] rounded-xl overflow-hidden'>
          {/* Table Header */}
          <div className='grid grid-cols-[2fr_1.2fr_1fr_1fr_80px] bg-gradient-to-r from-[#005ea8] to-[#004494] p-[16px] text-white text-sm font-bold'>
            <span>Aluno</span>
            <span>Matrícula</span>
            <span>Nota</span>
            <span>Faltas</span>
            <span>Ações</span>
          </div>

          {/* Table Body */}
          <div className='max-h-[70vh] overflow-auto'>
            {loading ? (
              <div className='p-[80px] text-center'>
                <FaSpinner className='animate-spin mx-auto text-4xl text-[#005ea8] mb-6' />
                <div className='text-lg text-[#9a9a9a]'>Carregando alunos...</div>
              </div>
            ) : filteredAlunos.length === 0 ? (
              <div className='p-[80px] text-center py-20'>
                <div className='text-4xl text-[#9a9a9a] mb-4'>👥</div>
                <div className='text-xl text-[#9a9a9a]'>{search ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}</div>
              </div>
            ) : (
              filteredAlunos.map((aluno) => (
                <div key={aluno.id} className='grid grid-cols-[2fr_1.2fr_1fr_1fr_80px] items-center h-[56px] p-[16px] border-b border-[#f0f0f0] hover:bg-[#f8f9fa] group transition-colors'>
                  {/* Aluno Name */}
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-gradient-to-br from-[#005ea8] to-[#004494] rounded-2xl flex items-center justify-center'>
                      <FaUser className='text-white text-lg' />
                    </div>
                    <div>
                      <div className='font-semibold text-lg text-[#333]'>{aluno.nome_completo}</div>
                      <div className='text-sm text-[#9a9a9a]'>ID: {aluno.id}</div>
                    </div>
                  </div>

                  {/* Matrícula */}
                  <div className='font-mono text-[#666] bg-gray-50 px-3 py-1 rounded-lg text-sm'>
                    {aluno.numero}
                  </div>

                  {/* Nota Input */}
                  <input 
                    type="number" 
                    min="0" max="10" step="0.1"
                    value={aluno.nota ?? ''}
                    onChange={(e) => updateAlunoLocal(aluno.id, 'nota', e.target.value)}
                    onBlur={() => saveNotaFaltas(aluno)}
                    className='w-full max-w-[80px] p-3 border border-[#e0e0e0] rounded-xl text-center text-lg font-bold bg-white hover:border-[#005ea8] focus:outline-none focus:border-[#005ea8] focus:ring-2 focus:ring-[#005ea8]/20 shadow-sm transition-all placeholder:text-[#9a9a9a]'
                    placeholder='0.0'
                  />

                  {/* Faltas */}
                  <div className='flex items-center gap-2'>
                    <span className='text-xl font-bold text-[#333] min-w-[32px]'>{aluno.faltas || 0}</span>
                    <div className='flex gap-1'>
                      <button 
                        onClick={() => changeFaltas(aluno.id, -1)}
                        className='w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95'
                        title='Remover falta'
                      >
                        <FaMinus className='text-sm'/>
                      </button>
                      <button 
                        onClick={() => changeFaltas(aluno.id, 1)}
                        className='w-10 h-10 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95'
                        title='Adicionar falta'
                      >
                        <FaPlus className='text-sm'/>
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button 
                    onClick={(e) => saveNotaFaltas(aluno, e)}
                    disabled={savingIds.has(aluno.id)}
                    className='opacity-0 group-hover:opacity-100 ml-auto p-3 w-12 h-12 bg-gradient-to-r from-[#005ea8] to-[#004494] hover:from-[#004494] hover:to-[#00377a] text-white rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Salvar alterações'
                  >
                    {savingIds.has(aluno.id) ? 
                      <FaSpinner className='animate-spin text-sm'/> : 
                      <FaSave className='text-sm'/>
                    }
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Responsive */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .w-\\[86\\%] { width: 94% !important; }
        }
        @media (max-width: 768px) {
          .grid-cols-\\[2fr_1\\.2fr_1fr_1fr_80px\\] { 
            grid-template-columns: 2.2fr 1.2fr 1fr 1fr auto !important; 
          }
          .h-\\[56px\\] { height: 64px !important; }
        }
        @media (max-width: 480px) {
          .text-\\[28px\\] { font-size: 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default ProfessorStyled;


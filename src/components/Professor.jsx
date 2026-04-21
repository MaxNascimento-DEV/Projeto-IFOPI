import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { FaUser, FaPlus, FaMinus, FaSave, FaSpinner, FaSearch } from 'react-icons/fa';

const Professor = () => {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingIds, setSavingIds] = useState(new Set());
  const [stats, setStats] = useState({ total: 0, avgNota: 0, totalFaltas: 0 });


  // Load ALL students on mount (no discipline)
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
        // Calculate stats
        const total = data.alunos?.length || 0;
        const avgNota = data.alunos?.reduce((sum, a) => sum + (parseFloat(a.nota) || 0), 0) / Math.max(1, total);
        const totalFaltas = data.alunos?.reduce((sum, a) => sum + (parseInt(a.faltas) || 0), 0);
        setStats({ total, avgNota: avgNota.toFixed(1), totalFaltas });
        toast.success(`📊 ${total} alunos carregados | Média: ${avgNota.toFixed(1)}`);
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
      toast.error('Nota 0-10, faltas >= 0');
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
        toast.success(`✅ ${aluno.nome_completo.slice(0,15)}... atualizado`, { duration: 2000 });
        window.dispatchEvent(new CustomEvent('alunoGradesUpdated', { detail: { alunoId } }));
        const avgNota = alunos.reduce((sum, a) => sum + (parseFloat(a.nota) || 0), 0) / Math.max(1, alunos.length);
        const totalFaltas = alunos.reduce((sum, a) => sum + (parseInt(a.faltas) || 0), 0);
        setStats(prev => ({ ...prev, avgNota: avgNota.toFixed(1), totalFaltas }));
      }
    } catch (e) {
      toast.error('Erro ao salvar');
    }
    setSavingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(alunoId);
      return newSet;
    });
  }, [updateAlunoLocal, alunos]);


  const changeFaltas = useCallback((alunoId, delta) => {
    setAlunos(prev => prev.map(a => 
      a.id === alunoId 
        ? { ...a, faltas: Math.max(0, (parseInt(a.faltas) || 0) + delta) }
        : a
    ));
  }, []);

  // Search debounced
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

  return (
    <div className='min-h-screen bg-[#d9d9d9] font-poppins text-[#7c7c7c]'>
      <header className='w-full'>
        <div className='h-[20px] w-full bg-ifopiBlue'></div>
        <div className='h-[72px] flex justify-center items-center bg-[#d9d9d9]'>
          <img src='/images/logo.png' alt='Logo IFOPI' className='w-[96px] h-auto' />
        </div>
        <div className='h-[7px] bg-gradient-to-b from-black/25 to-transparent'></div>
      </header>

      <div className='w-[86%] max-w-[1180px] mx-auto mt-[34px] mb-[40px]'>
        <div className='flex justify-between items-center mb-[30px]'>
          <h1 className='text-[24px] text-ifopiBlueLight font-bold'>
            📚 Gestão de Turma - {user?.nome}
          </h1>

          <button onClick={logout} className='bg-ifopiBlue text-white px-[20px] py-[10px] rounded-[8px] hover:bg-[#154a7a] transition-all'>
            Sair
          </button>
        </div>

        {/* Stats Bar */}
        {stats.total > 0 && (
          <div className='bg-white shadow-[5px_7px_8px_rgba(0,0,0,0.18)] p-[16px] rounded mb-[20px] grid grid-cols-3 gap-4 text-[14px]'>
            <div><strong>{stats.total}</strong> Alunos</div>
            <div><strong>{stats.avgNota}</strong> Média Geral</div>
            <div><strong>{stats.totalFaltas}</strong> Faltas Totais</div>
          </div>
        )}

        {/* Filters */}
        {/* Search only */}
        <div className='grid grid-cols-1 md:grid-cols-1 gap-[16px] mb-[20px]'>
          <div className='bg-[#d9d9d9] p-[12px] rounded flex items-center gap-2'>
            <FaSearch className='text-[#9a9a9a]'/>
            <input 
              placeholder='Buscar aluno...' 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className='flex-1 h-[36px] bg-white border border-[#ababab] px-[12px] rounded text-[13px] focus:outline-none focus:border-ifopiBlue'
            />
          </div>
        </div>


        {/* Dynamic Table */}
        <div className='bg-[#d9d9d9] shadow-[5px_7px_8px_rgba(0,0,0,0.18)] rounded overflow-hidden'>
          <div className='grid grid-cols-[2fr_1.2fr_80px_60px_24px] bg-white p-[12px] text-[11px] text-[#9a9a9a] border-b border-[#ababab] font-bold'>
            <span>ALUNO</span>
            <span>MATRÍCULA</span>
            <span>NOTA</span>
            <span>FALTAS</span>
            <span></span>
          </div>
          <div className='min-h-[400px] max-h-[70vh] overflow-auto'>
            {loading ? (
              <div className='p-[60px] text-center'><FaSpinner className='animate-spin mx-auto text-2xl text-ifopiBlue mb-4'/></div>
            ) : filteredAlunos.length === 0 ? (
              <div className='p-[60px] text-center text-[#9a9a9a] text-[14px]'>
                {search ? 'Nenhum aluno encontrado' : 'Carregando alunos...'}
              </div>
            ) : (

              filteredAlunos.map((aluno) => (
                <div key={aluno.id} className='grid grid-cols-[2fr_1.2fr_80px_60px_24px] items-center h-[44px] p-[12px] border-b border-[#f0f0f0] hover:bg-white/50 group'>
                  <div className='flex items-center gap-[12px]'>
                    <FaUser className='text-[#707070] text-[16px] flex-shrink-0'/>
                    <span className='font-medium text-[13px]'>{aluno.nome_completo}</span>
                  </div>
                  <span className='text-[#818181] font-mono text-[12px]'>{aluno.numero}</span>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.1"
                    value={aluno.nota ?? ''}
                    onChange={(e) => updateAlunoLocal(aluno.id, 'nota', e.target.value)}
                    onBlur={() => saveNotaFaltas(aluno)}
                    className='w-full max-w-[60px] p-[6px] border border-[#ababab] rounded text-[13px] text-center bg-white/80 hover:border-ifopiBlue focus:outline-none focus:border-ifopiBlue focus:ring-2 focus:ring-ifopiBlue/20 transition-all'
                    placeholder='0.0'
                  />
                  <div className='flex items-center gap-[4px]'>
                    <span className='text-[13px] font-mono min-w-[20px] text-right'>{aluno.faltas || 0}</span>
                    <div className='flex gap-[2px]'>
                      <button 
                        onClick={() => changeFaltas(aluno.id, -1)}
                        className='w-[20px] h-[20px] bg-red-500/80 hover:bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center transition-all shadow-sm'
                        title='Remover falta'
                      >
                        <FaMinus />
                      </button>
                      <button 
                        onClick={() => changeFaltas(aluno.id, 1)}
                        className='w-[20px] h-[20px] bg-green-500/80 hover:bg-green-500 text-white text-[10px] rounded-full flex items-center justify-center transition-all shadow-sm'
                        title='Adicionar falta'
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => saveNotaFaltas(aluno, e)}
                    disabled={savingIds.has(aluno.id)}
                    className='opacity-0 group-hover:opacity-100 p-0 w-[20px] h-[20px] bg-blue-500 hover:bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Salvar tudo'
                  >
                    {savingIds.has(aluno.id) ? <FaSpinner className='animate-spin'/> : <FaSave />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .w-\\[86\\%] { width: 95%; margin-top: 22px; }
          .grid-cols-\\[2fr_1\\.2fr_80px_60px_24px\\] { 
            grid-template-columns: 2fr 1fr 60px 60px auto !important; 
          }
        }
      `}</style>
    </div>
  );
};

export default Professor;

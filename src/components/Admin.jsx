import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaUser, FaMagnifyingGlass, FaFilter, FaCheck, FaXmark, FaChevronDown } from 'react-icons/fa6';

const API_BASE = '/backend/routes/admin.php';

const Admin = () => {
  const { user, logout } = useAuth();

  const handleDelete = async (id, tipo) => {
    if (!confirm(`Confirmar deleção do ${tipo}? Esta ação é irreversível!`)) return;
    
    try {
      const res = await fetch(`${API_BASE}?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.mensagem);
        // Refresh current tab
        if (activeTab === 'alunos') {
          fetchStudents();
        } else {
          fetchProfessors();
        }
      } else {
        toast.error(data.mensagem || 'Erro ao deletar');
      }
    } catch (err) {
      toast.error('Erro de conexão');
    }
  };
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('HOJE');
  const [selectedStudentsFilter, setSelectedStudentsFilter] = useState('TODOS OS ALUNOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [unidade, setUnidade] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [onlyEnrolled, setOnlyEnrolled] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '', nome: '', sobrenome: '', cpf: '', email: '', numero: ''
  });

  const loadUserForEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      id: user.id,
      nome: user.nome,
      sobrenome: user.sobrenome || '',
      email: user.email || '',
      cpf: user.cpf || '',
      numero: user.numero || ''
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.nome || !editFormData.email || !/^[^@]+@[^@]+\.[^@]+$/.test(editFormData.email)) {
      toast.error('Nome e email válidos obrigatórios');
      return;
    }
    try {
      console.log('Enviando update:', editFormData); // debug
      const res = await fetch(API_BASE, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ action: 'update-user', ...editFormData })
      });
      console.log('Response status:', res.status, res.statusText); // debug
      let data = {};
      let rawText = "";
      try {
        rawText = await res.text();
        console.log("Raw response:", rawText);
        if (rawText && rawText.trim() !== "") {
          data = JSON.parse(rawText);
        }
      } catch (err) {
        console.error("Parse error:", err);
        console.log("Raw response (erro):", rawText);
        toast.error("Erro ao processar resposta do servidor");
        return;
      }
      console.log('Response data:', data); // debug
      if (data.success) {
        toast.success(data.mensagem);
        setShowEditModal(false);
        setEditingUser(null);
        setEditFormData({ id: '', nome: '', sobrenome: '', cpf: '', email: '', numero: '' });
        fetchStudents();
        fetchProfessors();
      } else {
        toast.error(data.mensagem || 'Erro ao atualizar');
      }
    } catch (err) {
      console.error('Edit error:', err);
      toast.error('Erro de conexão: ' + err.message);
    }
  };


  const [formData, setFormData] = useState({
    nome: '', sobrenome: '', cpf: '', email: '', senha: '', disciplinas: []
  });

  const [submitting, setSubmitting] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [studentsDropdownOpen, setStudentsDropdownOpen] = useState(false);
  const [professors, setProfessors] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [activeTab, setActiveTab] = useState('alunos');
  const [teacherFormData, setTeacherFormData] = useState({
    nome: '', sobrenome: '', email: '', senha: ''
  });


  const dateOptions = ['HOJE', 'ONTEM', 'ÚLTIMOS 7 DIAS', 'ÚLTIMOS 30 DIAS'];

  const studentsOptions = ['TODOS OS ALUNOS', 'ATIVOS', 'INATIVOS', 'MATRICULADOS', 'NÃO MATRICULADOS'];
  const unidades = ['', 'Unidade 1', 'Unidade 2', 'Unidade 3'];
  const modalidades = ['', 'Presencial', 'Online', 'Híbrido'];

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'students',
        date: selectedDateFilter,
        students: selectedStudentsFilter,
        search: searchQuery,
        unidade,
        modalidade,
        enrolled: onlyEnrolled
      });
      const res = await fetch(`${API_BASE}?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      } else {
        toast.error(data.mensagem || 'Erro ao carregar alunos');
      }
    } catch (err) {
      toast.error('Falha na conexão');
    } finally {
      setLoading(false);
    }
  }, [selectedDateFilter, selectedStudentsFilter, searchQuery, unidade, modalidade, onlyEnrolled]);

  const fetchProfessors = useCallback(async () => {
    setLoadingTeachers(true);
    try {
      const res = await fetch(`${API_BASE}?action=users&q=`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        const profs = data.users.filter(u => u.tipo === 'professor') || [];
        setProfessors(profs);
      } else {
        toast.error('Erro ao carregar professores');
      }
    } catch (err) {
      toast.error('Falha ao carregar professores');
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'alunos') {
      fetchStudents();
    } else {
      fetchProfessors();
    }
  }, [activeTab]);


  const applyFilters = () => {
    fetchStudents();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setUnidade('');
    setModalidade('');
    setOnlyEnrolled(false);
    setSelectedDateFilter('HOJE');
    setSelectedStudentsFilter('TODOS OS ALUNOS');
    setDateDropdownOpen(false);
    setStudentsDropdownOpen(false);
    fetchStudents();
  };

  const toggleStatus = async (id) => {
    const student = students.find(s => s.id === id);
    if (!student) return;

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-status', id, active: !student.active })
      });
      const data = await res.json();
      if (data.success) {
        setStudents(students.map(s => s.id === id ? { ...s, active: !s.active } : s));
        toast.success('Status atualizado');
      }
    } catch (err) {
      toast.error('Erro ao atualizar status');
    }
  };

  // Preserve all original CRUD functions (handleSubmitStudent, handleSubmitTeacher, handleDelete, handleEdit, etc.)
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTeacherInputChange = (e) => {
    setTeacherFormData({ ...teacherFormData, [e.target.name]: e.target.value });
  };


  const handleSubmitStudent = async (e) => {

    e.preventDefault();
    if (!formData.nome || !formData.senha || !formData.email || !/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
      toast.error('Nome, email válido e senha obrigatórios');
      return;
    }
    if (formData.senha.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-student', ...formData })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.mensagem);
        setShowStudentModal(false);
        setFormData({ nome: '', sobrenome: '', cpf: '', email: '', senha: '', disciplinas: [] });
        fetchStudents();
      } else {
        toast.error(data.mensagem || 'Erro ao criar aluno');
      }
    } catch (err) {
      toast.error('Falha ao criar aluno');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTeacher = async (e) => {
    e.preventDefault();
    if (!teacherFormData.nome || !teacherFormData.senha || !teacherFormData.email || !teacherFormData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Nome, email válido e senha obrigatórios');
      return;
    }
    if (teacherFormData.senha.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-teacher', ...teacherFormData })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.mensagem);
        setShowTeacherModal(false);
        setTeacherFormData({ nome: '', sobrenome: '', email: '', senha: '' });
        fetchProfessors();
      } else {
        toast.error(data.mensagem || 'Erro ao criar professor');
      }
    } catch (err) {
      toast.error('Falha ao criar professor');
    }
  };


  // ... (all other original functions: handleSubmitTeacher, handleDelete, handleEdit, loadUserForEdit, handleSubmitEdit - keep as is)


  return (

    <div className='min-h-screen bg-[#d9d9d9] font-poppins text-[#7c7c7c]'>
      {/* Header */}
      <header className='w-full'>
        <div className='h-[20px] w-full bg-[#005ea8]'></div>
        <div className='h-[72px] flex justify-center items-center bg-[#d9d9d9]'>
          <img src='/images/logo.png' alt='Logo IFOPI' className='w-[96px] h-auto' />
        </div>
        <div className='h-[7px] bg-gradient-to-b from-black/25 to-transparent'></div>
      </header>

      {/* Dashboard */}
      <main className='dashboard w-[86%] max-w-[1180px] mx-auto mt-[34px] mb-[40px] grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-[12px]'>
        {/* Main Panel */}
        <section className='main-panel'>
          {/* Tabs */}
          <div className='tabs h-[38px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex border-b border-[#e0e0e0]'>
            <button 
              className={`tab-btn flex-1 text-[13px] font-medium py-[10px] border-b-2 transition-all ${activeTab === 'alunos' ? 'border-ifopiBlue text-ifopiBlue' : 'border-transparent text-[#666]'}`}
              onClick={() => setActiveTab('alunos')}
            >
              Alunos ({students.length})
            </button>
            <button 
              className={`tab-btn flex-1 text-[13px] font-medium py-[10px] border-b-2 transition-all ${activeTab === 'professores' ? 'border-ifopiBlue text-ifopiBlue' : 'border-transparent text-[#666]'}`}
              onClick={() => setActiveTab('professores')}
            >
              Professores ({professors.length})
            </button>
          </div>

          {/* Toolbar */}
          <div className='toolbar h-[32px] bg-[#005ea8] grid grid-cols-[120px_170px_1fr] items-center shadow-[5px_7px_8px_rgba(0,0,0,0.18)]'>

            {/* Date Dropdown */}
            <div className='dropdown relative h-full'>
              <button 
                className='toolbar-select w-full h-full border-none bg-transparent text-white text-[11px] font-normal p-0 px-[10px] flex items-center justify-between cursor-pointer'
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              >
                <span>{selectedDateFilter}</span>
                <FaChevronDown className='text-white' />
              </button>
              {dateDropdownOpen && (
                <div className='dropdown-menu absolute top-full left-0 w-full bg-[#f2f2f2] border border-[#c7c7c7] shadow-[0_8px_18px_rgba(0,0,0,0.18)] flex flex-col z-20'>
                  {dateOptions.map(option => (
                    <button 
                      key={option}
                      className='border-none bg-transparent text-left p-[10px_12px] text-[11px] text-[#666] cursor-pointer hover:bg-[rgba(0,94,168,0.08)] hover:text-[#005ea8]'
                      onClick={() => {
                        setSelectedDateFilter(option);
                        setDateDropdownOpen(false);
                        applyFilters();
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Students Dropdown */}
            <div className='dropdown relative h-full border-l border-white/12'>
              <button 
                className='toolbar-select wide w-full h-full border-none bg-transparent text-white text-[11px] font-normal p-0 px-[10px] flex items-center justify-between cursor-pointer'
                onClick={() => setStudentsDropdownOpen(!studentsDropdownOpen)}
              >
                <span>{selectedStudentsFilter}</span>
                <FaChevronDown className='text-white' />
              </button>
              {studentsDropdownOpen && (
                <div className='dropdown-menu absolute top-full left-0 w-full bg-[#f2f2f9] border border-[#c7c7c7] shadow-[0_8px_18px_rgba(0,0,0,0.18)] flex flex-col z-20'>
                  {studentsOptions.map(option => (
                    <button 
                      key={option}
                      className='border-none bg-transparent text-left p-[10px_12px] text-[11px] text-[#666] cursor-pointer hover:bg-[rgba(0,94,168,0.08)] hover:text-[#005ea8]'
                      onClick={() => {
                        setSelectedStudentsFilter(option);
                        setStudentsDropdownOpen(false);
                        applyFilters();
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <div className='toolbar-search h-full grid grid-cols-[1fr_44px] items-center'>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full h-full border-none outline-none bg-transparent text-white p-0 px-[12px] text-[12px] placeholder-white/90'
                placeholder='Filtrar'
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
              <button 
                onClick={applyFilters}
                className='h-full border-none bg-transparent text-white text-[14px] cursor-pointer p-0 px-[12px]'
              >
                <FaMagnifyingGlass />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className='table-card min-h-[470px] bg-[#d9d9d9] shadow-[5px_7px_8px_rgba(0,0,0,0.18)]'>
            {activeTab === 'alunos' ? (
              <>
                <div className='table-head min-h-[28px] px-[12px] text-[11px] text-[#9a9a9a] border-b border-[#ababab] grid grid-cols-[1.6fr_1.2fr_70px_60px_30px] items-center'>
                  <span>Aluno</span>
                  <span>Matrícula</span>
                  <span>Status</span>
                  <span>Ações</span>
                  <span></span>
                </div>

                {loading ? (
                  <div className='p-[20px_12px] text-[12px] text-[#9a9a9a] text-center'>Carregando alunos...</div>
                ) : students.length === 0 ? (
                  <div className='empty-message p-[20px_12px] text-[12px] text-[#9a9a9a]'>Nenhum aluno encontrado.</div>
                ) : (
                  <div id='tableBody'>
                    {students.map((student) => (
                      <div key={student.id} className='table-row min-h-[34px] px-[12px] border-b border-[#f0f0f0] text-[12px] grid grid-cols-[1.6fr_1.2fr_70px_60px_30px] items-center hover:bg-white/50'>
                        <div className='flex items-center gap-[12px]'>
                          <FaUser className='text-[15px] text-[#707070]' />
                          <span className='font-medium'>{student.nome} {student.sobrenome}</span>
                        </div>
                        <span className='font-mono text-[#818181]'>{student.numero}</span>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            className={`w-[22px] h-[12px] border-none rounded-full relative cursor-pointer transition-all shadow-sm ${student.active ? 'bg-green-500' : 'bg-red-500'}`}
                            onClick={() => toggleStatus(student.id)}
                            title={student.active ? 'Inativo' : 'Ativo'}
                          />
                          <button
                            onClick={() => loadUserForEdit(student)}
                            className='text-blue-600 hover:text-blue-400 p-1 text-xs transition-colors'
                            title='Editar'
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, 'aluno')}
                            className='text-red-500 hover:text-red-600 p-1 text-xs transition-colors ml-1'
                            title='Deletar'
                          >
                            🗑️
                          </button>
                        </div>
                        <div></div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className='table-head min-h-[28px] px-[12px] text-[11px] text-[#9a9a9a] border-b border-[#ababab] grid grid-cols-[1.6fr_1.5fr_1.2fr_60px_30px] items-center'>
                  <span>Professor</span>
                  <span>Email</span>
                  <span>Disciplinas</span>
                  <span>Ações</span>
                  <span></span>
                </div>
                {loadingTeachers ? (
                  <div className='p-[20px_12px] text-[12px] text-[#9a9a9a] text-center'>Carregando professores...</div>
                ) : professors.length === 0 ? (
                  <div className='empty-message p-[20px_12px] text-[12px] text-[#9a9a9a]'>Nenhum professor encontrado.</div>
                ) : (
                  <div id='tableBodyProf'>
                    {professors.map((prof) => (
                      <div key={prof.id} className='table-row min-h-[34px] px-[12px] border-b border-[#f0f0f0] text-[12px] grid grid-cols-[1.6fr_1.5fr_1.2fr_60px_30px] items-center hover:bg-white/50'>
                        <div className='flex items-center gap-[12px]'>
                          <FaUser className='text-[15px] text-[#707070]' />
                          <span className='font-medium'>{prof.nome} {prof.sobrenome}</span>
                        </div>
                        <span className='text-[#666] text-[11px]'>{prof.email}</span>
                        <span className='text-[#818181] text-[11px]'>{prof.disciplinas?.join(', ') || 'N/A'}</span>
                        <div className='flex justify-end gap-1'>
                          <button
                            onClick={() => loadUserForEdit(prof)}
                            className='text-blue-600 hover:text-blue-400 p-1 text-xs transition-colors'
                            title='Editar'
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(prof.id, 'professor')}
                            className='text-red-500 hover:text-red-600 p-1 text-xs transition-colors'
                            title='Deletar'
                          >
                            🗑️
                          </button>
                        </div>
                        <div></div>
                      </div>

                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        </section>

        {/* Filter Panel */}
        <aside className='filter-panel min-h-[470px] shadow-[5px_7px_8px_rgba(0,0,0,0.18)] flex flex-col lg:min-h-auto'>
          <div className='filter-header h-[32px] bg-[#005ea8] text-white flex items-center gap-[6px] px-[12px] text-[10px] font-normal'>
            <span>FILTRO AVANÇADO</span>
            <FaFilter />
          </div>
          <div className='filter-body flex-1 bg-[#d9d9d9] p-[10px_12px]'>
            <div className='filter-group mb-[10px]'>
              <div className='filter-line-top mb-[4px] flex justify-between items-center'>
                <label htmlFor='unidade' className='text-[9px] text-[#9a9a9a]'>Unidade</label>
                <div className='only-enrolled flex items-center justify-between gap-[8px] text-[9px] text-[#8a8a8a]'>
                  <span>Somente Matriculados</span>
                  <label className='switch relative w-[28px] h-[14px] flex-shrink-0'>
                    <input 
                      type='checkbox' 
                      id='onlyEnrolled' 
                      checked={onlyEnrolled}
                      onChange={(e) => setOnlyEnrolled(e.target.checked)}
                      className='hidden'
                    />
                    <span className='slider absolute inset-0 rounded-full bg-[#7a7a7a] cursor-pointer'>
                      <span className='before:content-[""] before:absolute before:w-[10px] before:h-[10px] before:left-[2px] before:top-[2px] before:rounded-full before:bg-white before:transition-all'></span>
                    </span>
                  </label>
                </div>
              </div>
              <select 
                id='unidade'
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className='w-full h-[28px] border border-[#ababab] bg-[#d9d9d9] text-[#7d7d7d] px-[8px] outline-none text-[10px]'
              >
                {unidades.map(u => <option key={u} value={u}>{u || 'Todas'}</option>)}
              </select>
            </div>
            <div className='filter-group mb-[10px]'>
              <label htmlFor='modalidade' className='block mb-[4px] text-[9px] text-[#9a9a9a]'>Modalidade</label>
              <select 
                id='modalidade'
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value)}
                className='w-full h-[28px] border border-[#ababab] bg-[#d9d9d9] text-[#7d7d7d] px-[8px] outline-none text-[10px]'
              >
                {modalidades.map(m => <option key={m} value={m}>{m || 'Todas'}</option>)}
              </select>
            </div>
          </div>
          <div className='filter-footer bg-[#d9d9d9] p-[10px_12px] flex gap-[12px]'>
            <button className='action-btn action-apply flex-1 border-none bg-transparent text-[10px] cursor-pointer flex items-center gap-[5px] text-[#63c83d]' onClick={applyFilters}>
              <FaCheck />
              FILTRAR
            </button>
            <button className='action-btn action-clear flex-1 border-none bg-transparent text-[10px] cursor-pointer flex items-center gap-[5px] text-[#d63d3d]' onClick={clearFilters}>
              <FaXmark />
              LIMPAR
            </button>
          </div>
        </aside>

        {/* Original Sidebar Buttons (positioned above table if needed) */}
        {/* Desktop Sidebar Buttons */}
        <div className='hidden lg:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border'>
          <button
            onClick={() => setShowStudentModal(true)}
            className="w-[140px] h-[48px] bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center text-sm"
          >
            ➕ Novo Aluno
          </button>
          <button
            onClick={() => setShowTeacherModal(true)}
            className="w-[140px] h-[48px] bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center text-sm"
          >
            👨‍🏫 Novo Professor
          </button>
        </div>

        {/* Mobile Buttons */}
        <div className='lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 space-y-2'>
          <button
            onClick={() => setShowStudentModal(true)}
            className="w-32 h-14 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.05] transition-all duration-200 flex items-center justify-center text-sm"
          >
            ➕ Aluno
          </button>
          <button
            onClick={() => setShowTeacherModal(true)}
            className="w-32 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.05] transition-all duration-200 flex items-center justify-center text-sm"
          >
            👨‍🏫 Prof
          </button>
        </div>


        {/* Student Registration Modal */}
        {showStudentModal && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>Novo Aluno</h2>
                <button onClick={() => setShowStudentModal(false)} className='text-gray-500 hover:text-gray-700 text-xl'>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmitStudent} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Nome *</label>
                  <input 
                    name='nome' 
                    value={formData.nome} 
                    onChange={handleInputChange}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                    required 
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Sobrenome</label>
                  <input 
                    name='sobrenome' 
                    value={formData.sobrenome} 
                    onChange={handleInputChange}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>CPF</label>
                    <input 
                      name='cpf' 
                      value={formData.cpf} 
                      onChange={handleInputChange}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
                    <input 
                      name='email' 
                      type='email'
                      value={formData.email} 
                      onChange={handleInputChange}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Senha * (mín 6 chars)</label>
                  <input 
                    name='senha' 
                    type='password'
                    value={formData.senha} 
                    onChange={handleInputChange}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                    required 
                  />
                </div>
                <button 
                  type='submit' 
                  disabled={submitting}
                  className='w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all text-lg'
                >
                  {submitting ? 'Criando...' : 'Criar Aluno'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Teacher Registration Modal */}
        {showTeacherModal && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>Novo Professor</h2>
                <button onClick={() => setShowTeacherModal(false)} className='text-gray-500 hover:text-gray-700 text-xl'>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmitTeacher} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Nome *</label>
                  <input 
                    name='nome' 
                    value={teacherFormData.nome} 
                    onChange={handleTeacherInputChange}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                    required 
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Sobrenome</label>
                  <input 
                    name='sobrenome' 
                    value={teacherFormData.sobrenome} 
                    onChange={handleTeacherInputChange}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
                    <input 
                      name='email' 
                      type='email'
                      value={teacherFormData.email} 
                      onChange={handleTeacherInputChange}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                      required 
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Senha * (mín 6 chars)</label>
                    <input 
                      name='senha' 
                      type='password'
                      value={teacherFormData.senha} 
                      onChange={handleTeacherInputChange}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                      required 
                    />
                  </div>
                </div>
                <button 
                  type='submit' 
                  className='w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-all text-lg'
                >
                  Criar Professor
                </button>

              </form>
            </div>
          </div>
        )}

        {/* Edit Modal - preserved if exists */}
{showEditModal && editingUser && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>Editar {editingUser.tipo === 'aluno' ? 'Aluno' : 'Professor'}</h2>
                <button onClick={() => {setShowEditModal(false); setEditingUser(null);}} className='text-gray-500 hover:text-gray-700 text-xl'>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmitEdit} className='space-y-4'>
                <input type="hidden" name="id" value={editFormData.id} />
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Nome *</label>
                  <input 
                    name='nome' 
                    value={editFormData.nome} 
                    onChange={handleEditInputChange}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                    required 
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Sobrenome</label>
                  <input 
                    name='sobrenome' 
                    value={editFormData.sobrenome} 
                    onChange={handleEditInputChange}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>CPF</label>
                    <input 
                      name='cpf' 
                      value={editFormData.cpf} 
                      onChange={handleEditInputChange}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
                    <input 
                      name='email' 
                      type='email'
                      value={editFormData.email} 
                      onChange={handleEditInputChange}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Matrícula/Nº</label>
                  <input 
                    name='numero' 
                    value={editFormData.numero} 
                    onChange={handleEditInputChange}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100' 
                    disabled
                  />
                </div>
                <button 
                  type='submit' 
                  className='w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all text-lg'
                >
                  Salvar Alterações
                </button>
              </form>
            </div>
          </div>
        )}

      </main>


      {/* Responsive */}
      <style jsx>{`  
        @media (max-width: 980px) {
          .dashboard { 
            width: 92%; 
            grid-template-columns: 1fr;
          }
          .filter-panel { min-height: auto; }
        }
        @media (max-width: 640px) {
          .logo-w-\\[96px\\] { width: 82px; }
          .dashboard { 
            width: 95%; 
            margin-top: 22px; 
            gap: 14px; 
          }
          .toolbar { 
            grid-template-columns: 1fr; 
            height: auto; 
          }
          .dropdown { height: auto; }
          .toolbar-select, .toolbar-search { 
            min-height: 40px; 
            border-bottom: 1px solid rgba(255,255,255,0.14); 
          }
          .table-head, .table-row { grid-template-columns: 1.4fr 1fr 52px; }
          .table-head { font-size: 10px; }
          .table-row { font-size: 11px; }
        }
        .status-toggle::after {
          content: '';
          position: absolute;
          top: 2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d9d9d9;
          transition: 0.2s;
          right: 2px;
        }
        .status-toggle:not(.active)::after { right: auto; left: 2px; }
      `}</style>
    </div>
  );
};

export default Admin;

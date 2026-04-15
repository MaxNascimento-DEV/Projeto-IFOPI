import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/backend/routes/auth.php?action=login', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, senha })
      });
      const data = await response.json();
      if (data.success) {
        login(data);
        const path = data.tipo === 'admin' ? '/admin' : data.tipo === 'aluno' ? '/aluno' : '/professor';
        window.location.href = path;
      } else {
        setError(data.mensagem || 'Erro no login');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-screen w-screen font-poppins overflow-hidden'>
      <div className='flex h-full'>
        {/* Left - Image + Text */}
        <div className='w-[60%] relative bg-[url(/images/Igarassu.jpg)] bg-cover bg-center'>
          <div className='absolute inset-0 bg-[rgba(0,80,150,0.6)] backdrop-blur-[2px]'></div>
          <div className='absolute z-[2] top-[100px] left-[160px] max-w-[800px] p-[10px] text-[20px] font-[300] leading-[1.8] text-white/90'>
            O IFOPI nasceu com o propósito de transformar vidas por meio da
            educação e da qualificação profissional. Localizado em Igarassu, o
            instituto foi criado a partir da necessidade de oferecer
            oportunidades reais para jovens e adultos que desejam ingressar ou
            se destacar no mercado de trabalho.
            <br /><br />
            Desde o início, o IFOPI se propõe a ir além do ensino tradicional,
            conectando teoria e prática de forma acessível e objetiva. Com uma
            abordagem voltada para as demandas atuais do mercado, a instituição
            busca capacitar seus alunos com habilidades técnicas e
            comportamentais essenciais para o desenvolvimento profissional.
            <br /><br />
            Ao longo de sua trajetória, o IFOPI vem se consolidando como um
            espaço de crescimento, inclusão e transformação social, formando
            profissionais preparados e confiantes para enfrentar os desafios do
            mundo do trabalho.
            <br /><br />
            Com uma presença ativa nas redes sociais e uma comunicação próxima
            do público, o instituto reforça diariamente seu compromisso com a
            educação de qualidade, acessível e voltada para resultados.
            <br /><br />
            Hoje, o IFOPI continua expandindo seu impacto, ajudando a construir
            futuros e abrindo portas para novas conquistas.
          </div>
        </div>

        {/* Right - Form */}
        <div className='w-[40%] bg-[#f2f2f2] flex justify-center items-center p-8'>
          <div className='w-[70%] flex flex-col items-center space-y-6'>
            <img src='/images/logo.png' alt='Logo IFOPI' className='w-[400px] mb-[40px]' />
            
            <form onSubmit={handleSubmit} className='w-full space-y-4'>
              <div>
                <label className='block w-full mb-[5px] text-ifopiBlueLight font-[500]'>E-mail</label>
                <input 
                  type='email' 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  className='w-full p-[12px] rounded-[12px] border-none bg-[#e6eef6] outline-none mb-[15px]' 
                  required 
                />
              </div>
              <div>
                <label className='block w-full mb-[5px] text-ifopiBlueLight font-[500]'>Senha</label>
                <input 
                  type='password' 
                  value={senha} 
                  onChange={(e) => setSenha(e.target.value)} 
                  className='w-full p-[12px] rounded-[12px] border-none bg-[#e6eef6] outline-none mb-[15px]' 
                  required 
                />
              </div>
              {error && <div className='bg-red-100 border border-red-400 text-red-700 p-3 rounded-[12px] text-sm'>{error}</div>}
              <button 
                type='submit' 
                disabled={loading} 
                className='w-full p-[12px] border-none rounded-[12px] bg-ifopiBlueLight text-white text-[18px] cursor-pointer hover:bg-[#154a7a] disabled:opacity-50 mt-[10px]'
              >
                {loading ? 'ENTRANDO...' : 'ENTRAR'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Responsive */}
      <style jsx>{`
        @media (max-width: 575.98px) {
          .h-screen {
            height: auto;
          }
          .flex.h-full {
            flex-direction: column;
            height: auto;
          }
          div.w-\\[60\\%] {
            width: 100%;
            height: 220px;
          }
          div.absolute.z-\\[2\\] {
            top: 10px;
            left: 10px;
            padding-left: 10px;
            padding-right: 20px;
          }
          div.w-\\[40\\%] {
            width: 100%;
            padding: 20px 0;
          }
          img.w-\\[400px\\] {
            width: 180px;
            margin-bottom: 25px;
          }
          input {
            padding: 10px;
            font-size: 14px;
          }
          button {
            padding: 12px;
            font-size: 16px;
          }
          label {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;

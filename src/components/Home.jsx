import { Link } from 'react-router-dom';

const Home = () => (
  <>
    <header className="w-full h-[80px] bg-[#f2f2f2] flex justify-center items-center border-t-[8px] border-ifopiBlue font-poppins">
      <img src='/images/logo.png' alt='IFOPI' className='w-[140px]' />
    </header>
    
    <section className='relative h-[650px] bg-[url(/images/IgarassuHome.png)] bg-no-repeat bg-center bg-cover'>
      <div className='absolute inset-0 bg-[rgba(0,80,150,0.6)]'></div>
    </section>

    <div className='relative font-poppins mx-auto w-[60%] -mt-[120px] mb-[40px] bg-[#eaeaea] p-[40px] rounded-[20px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)]'>
      <h1 className='text-ifopiBlue text-[28px] mb-[15px]'>Construa seu futuro com quem entende do mercado!</h1>
      <p className='text-[14px] text-ifopiBlueLight mb-[25px]'>
        Aprenda na prática, desenvolva habilidades reais e prepare-se para
        conquistar oportunidades no mercado de trabalho com o IFOPI.
      </p>
      <Link 
        to='/login' 
        className='inline-block py-[14px] px-[30px] bg-ifopiBlue text-white no-underline rounded-[10px] font-bold hover:bg-[#094a7a] transition-all duration-300'
      >
        Acessar plataforma
      </Link>
      <small className='block mt-[10px]'>Mais de 500 alunos já transformaram suas carreiras.</small>
    </div>
  </>
);

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';

const HomeNew = () => {
  return (
    <>
      <header className="header">
        <img src="/imagens/logo.png" alt="IFOPI" className="logo" />
      </header>

      <section className="hero">
        <div className="overlay"></div>
      </section>

      <div className="card-home">
        <h1>Construa seu futuro com quem entende do mercado!</h1>

        <p>
          Aprenda na prática, desenvolva habilidades reais e prepare-se para
          conquistar oportunidades no mercado de trabalho com o IFOPI.
        </p>

        <Link to="/login" className="btn">
          Acessar plataforma
        </Link>

        <small>Mais de 500 alunos já transformaram suas carreiras.</small>
      </div>
    </>
  );
};

export default HomeNew;
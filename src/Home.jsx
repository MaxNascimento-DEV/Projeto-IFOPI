import { Link } from 'react-router-dom';

const Home = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 animate-pulse">
        ONG IFOPI
      </h1>
      <p className="text-xl md:text-2xl text-gray-700 mb-12 leading-relaxed">
        Sistema completo de gerenciamento escolar para ONG.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <Link to="/login" className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          🚀 Acessar Login
        </Link>
        <Link to="/admin" className="px-12 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          🛠️ Área Admin
        </Link>
      </div>
      <p className="mt-12 text-sm text-gray-500">
        Backend: localhost:8000 | Frontend: localhost:5173 | DB: ong_ifopi
      </p>
    </div>
  </div>
);

export default Home;


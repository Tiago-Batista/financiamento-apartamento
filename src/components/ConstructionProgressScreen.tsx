import { useContext } from 'react';
import { GoogleAuthContext } from '../contexts/GoogleAuthContext';

function ConstructionProgressScreen() {
  const authContext = useContext(GoogleAuthContext);

  return (
    <div>
      <h1>Progresso da Construção</h1>
      {/* Conteúdo baseado no contexto de autenticação */}
    </div>
  );
}

export default ConstructionProgressScreen;

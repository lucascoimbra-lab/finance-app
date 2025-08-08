import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function VerificarConexao() {
  const [contador, setContador] = useState(null);

  useEffect(() => {
    fetch(`${ API_URL }/test_connection`)
      .then(res => res.json())
      .then(data => setContador(data.counter));
  }, []);

  return (
    <div>
      <h1>Verificação de Conexão</h1>
      <p>Contador do banco: {contador}</p>
    </div>
  );
}

export default VerificarConexao;

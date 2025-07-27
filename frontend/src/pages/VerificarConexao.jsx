import { useEffect, useState } from 'react';

function VerificarConexao() {
  const [contador, setContador] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/test_connection')
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

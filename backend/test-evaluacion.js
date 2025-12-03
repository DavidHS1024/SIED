const testEndpoint = async () => {
  const response = await fetch('http://localhost:3000/api/evaluacion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      idDocente: 1,
      idPeriodo: 1,
      idEvaluador: 1,
      detalles: [
        { idItem: 1, puntaje: 4, observacion: "Buen desempeño" },
        { idItem: 2, puntaje: 5, observacion: "Cumple totalmente" }
      ]
    })
  });

  const data = await response.json();
  console.log('Respuesta del servidor:', data);
};

testEndpoint();
const { app } = require('./app');

const puertoServidor = Number(process.env.PORT) || 3000;

app.listen(puertoServidor, () => {
  console.log(`API disponible en http://localhost:${puertoServidor}`);
});

const express = require('express');

const app = express();

app.use(express.json());

const mascotasIniciales = [
  {
    id: 1,
    nombre: 'Arveja',
    especie: 'Perro',
    edad: 3,
    adoptado: false,
  },
  {
    id: 2,
    nombre: 'Copito',
    especie: 'Gato',
    edad: 2,
    adoptado: true,
  },
];

const camposMascota = ['nombre', 'especie', 'edad', 'adoptado'];
let mascotas = copiarMascotas(mascotasIniciales);
let siguienteId = obtenerSiguienteId(mascotas);

function copiarMascotas(lista) {
  return lista.map((mascota) => ({ ...mascota }));
}

function obtenerSiguienteId(lista) {
  return lista.reduce((mayorId, mascota) => Math.max(mayorId, mascota.id), 0) + 1;
}

function obtenerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validarMascota(datos = {}, esActualizacion = false) {
  const errores = [];

  if (!esActualizacion) {
    for (const campo of camposMascota) {
      if (datos[campo] === undefined) {
        errores.push(`El campo '${campo}' es obligatorio.`);
      }
    }
  }

  if (datos.nombre !== undefined &&
      (typeof datos.nombre !== 'string' || datos.nombre.trim() === '')) {
    errores.push("El campo 'nombre' debe ser un texto no vacío.");
  }

  if (datos.especie !== undefined &&
      (typeof datos.especie !== 'string' || datos.especie.trim() === '')) {
    errores.push("El campo 'especie' debe ser un texto no vacío.");
  }

  if (datos.edad !== undefined &&
      (!Number.isInteger(datos.edad) || datos.edad < 0)) {
    errores.push("El campo 'edad' debe ser un número entero mayor o igual a 0.");
  }

  if (datos.adoptado !== undefined && typeof datos.adoptado !== 'boolean') {
    errores.push("El campo 'adoptado' debe ser true o false.");
  }

  return errores;
}

function normalizarMascota(datos) {
  return Object.fromEntries(
    camposMascota
      .filter((campo) => datos[campo] !== undefined)
      .map((campo) => {
        const valor = datos[campo];
        return [campo, typeof valor === 'string' ? valor.trim() : valor];
      }),
  );
}

function buscarMascota(valor) {
  const id = obtenerId(valor);
  return {
    id,
    indice: mascotas.findIndex((mascota) => mascota.id === id),
  };
}

function obtenerCuerpo(req) {
  return req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};
}

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de adopción de mascotas funcionando.',
    endpoints: '/mascotas',
  });
});

app.get('/mascotas', (req, res) => {
  res.status(200).json(mascotas);
});

app.get('/mascotas/:id', (req, res) => {
  const { indice } = buscarMascota(req.params.id);

  if (indice === -1) {
    return res.status(404).json({ mensaje: 'Mascota no encontrada.' });
  }

  return res.status(200).json(mascotas[indice]);
});

app.post('/mascotas', (req, res) => {
  const cuerpo = obtenerCuerpo(req);
  const errores = validarMascota(cuerpo);

  if (errores.length > 0) {
    return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
  }

  const nuevaMascota = {
    id: siguienteId,
    ...normalizarMascota(cuerpo),
  };

  siguienteId += 1;
  mascotas.push(nuevaMascota);

  return res.status(201).json(nuevaMascota);
});

app.put('/mascotas/:id', (req, res) => {
  const { indice } = buscarMascota(req.params.id);

  if (indice === -1) {
    return res.status(404).json({ mensaje: 'Mascota no encontrada.' });
  }

  const cuerpo = obtenerCuerpo(req);
  const errores = validarMascota(cuerpo, true);
  const datosActualizados = normalizarMascota(cuerpo);
  const datosRecibidos = Object.keys(datosActualizados);

  if (datosRecibidos.length === 0) {
    errores.push('Debes enviar al menos un campo para actualizar.');
  }

  if (errores.length > 0) {
    return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
  }

  mascotas[indice] = { ...mascotas[indice], ...datosActualizados };

  return res.status(200).json(mascotas[indice]);
});

app.delete('/mascotas/:id', (req, res) => {
  const { indice } = buscarMascota(req.params.id);

  if (indice === -1) {
    return res.status(404).json({ mensaje: 'Mascota no encontrada.' });
  }

  const [mascotaEliminada] = mascotas.splice(indice, 1);

  return res.status(200).json({
    mensaje: 'Mascota eliminada correctamente.',
    mascota: mascotaEliminada,
  });
});

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

function reiniciarDatos() {
  mascotas = copiarMascotas(mascotasIniciales);
  siguienteId = obtenerSiguienteId(mascotas);
}

module.exports = { app, reiniciarDatos };

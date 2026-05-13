/**
 * OposTest JEx - Motor de Test Asíncrono
 */

// Variables de estado global
let baseDeDatos = null; // Se llenará con el fetch
let preguntasActuales = [];
let indicePreguntaActual = 0;
let aciertos = 0;
let fallos = 0;
const PREGUNTAS_POR_BLOQUE = 30;

// Elementos del DOM
const seccionIntro = document.querySelector('.intro');
const seccionGrid = document.querySelector('.topics-grid');
const contenedorTest = document.getElementById('test-container');
const tituloTest = document.getElementById('test-title');
const textoPregunta = document.getElementById('question-text');
const contenedorOpciones = document.getElementById('options-container');
const botonSiguiente = document.getElementById('btn-next');
const botonSalir = document.getElementById('btn-exit');
const contadorPreguntas = document.getElementById('question-counter');
const textoAciertosMarcador = document.getElementById('score-correct');
const textoFallosMarcador = document.getElementById('score-incorrect');

// Elementos de Resultados
const contenedorResultados = document.getElementById('results-container');
const textoAciertosFinal = document.getElementById('final-score');
const textoTotalFinal = document.getElementById('total-score');
const mensajePuntuacion = document.getElementById('score-message');
const botonReiniciar = document.getElementById('btn-restart');

// --- EVENT LISTENERS ---
document.querySelectorAll('.btn-start').forEach(boton => {
    boton.addEventListener('click', (e) => {
        const idTema = e.target.getAttribute('data-tema');
        iniciarFlujoTest(idTema);
    });
});

botonSalir.addEventListener('click', salirAlMenu);
botonSiguiente.addEventListener('click', avanzarPregunta);
botonReiniciar.addEventListener('click', salirAlMenu);

// --- LÓGICA DE CARGA DE DATOS (FETCH) ---

async function obtenerPreguntas() {
    // Si ya las hemos cargado una vez, no volvemos a hacer la petición
    if (baseDeDatos) return baseDeDatos;

    try {
        const respuesta = await fetch('preguntas.json');
        if (!respuesta.ok) throw new Error('No se pudo cargar el archivo de preguntas');
        baseDeDatos = await respuesta.json();
        return baseDeDatos;
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al cargar el temario. Asegúrate de estar usando un servidor local o revisa el archivo preguntas.json.');
        return null;
    }
}

// --- LÓGICA DEL TEST ---

async function iniciarFlujoTest(idTema) {
    const datos = await obtenerPreguntas();
    
    if (!datos || !datos[idTema] || datos[idTema].length === 0) {
        alert("Este tema aún no tiene preguntas disponibles en el JSON.");
        return;
    }

    // Preparar preguntas del bloque
    const todasLasDelTema = datos[idTema];
    const mezcladas = mezclarArray(todasLasDelTema);
    preguntasActuales = mezcladas.slice(0, PREGUNTAS_POR_BLOQUE);

    // Resetear contadores
    indicePreguntaActual = 0;
    aciertos = 0;
    fallos = 0;

    // UI
    seccionIntro.classList.add('hidden');
    seccionGrid.classList.add('hidden');
    contenedorResultados.classList.add('hidden');
    contenedorTest.classList.remove('hidden');
    tituloTest.textContent = `Tema ${idTema}`;

    cargarPregunta();
}

function cargarPregunta() {
    const preguntaActual = preguntasActuales[indicePreguntaActual];
    textoPregunta.textContent = preguntaActual.pregunta;
    actualizarMarcador();
    
    contenedorOpciones.innerHTML = '';
    botonSiguiente.disabled = true; 

    // Mapear y desordenar respuestas
    const opcionesMapeadas = preguntaActual.opciones.map((texto, i) => ({
        texto,
        esCorrecta: i === preguntaActual.respuesta_correcta
    }));

    const opcionesMezcladas = mezclarArray(opcionesMapeadas);

    opcionesMezcladas.forEach(obj => {
        const boton = document.createElement('button');
        boton.className = 'btn-option';
        boton.textContent = obj.texto;
        if (obj.esCorrecta) boton.dataset.correcta = "true";
        
        boton.addEventListener('click', () => comprobarRespuesta(boton, obj.esCorrecta));
        contenedorOpciones.appendChild(boton);
    });
}

function comprobarRespuesta(botonSeleccionado, esCorrecta) {
    const preguntaActual = preguntasActuales[indicePreguntaActual];
    const botones = document.querySelectorAll('.btn-option');
    botones.forEach(btn => btn.disabled = true);

    if (esCorrecta) {
        botonSeleccionado.classList.add('correct');
        aciertos++;
    } else {
        botonSeleccionado.classList.add('incorrect');
        fallos++;
        document.querySelector('.btn-option[data-correcta="true"]').classList.add('correct');
    }

    const cajaExplicacion = document.createElement('div');
    cajaExplicacion.className = 'explanation-box';
    cajaExplicacion.innerHTML = `<strong>Explicación:</strong> ${preguntaActual.explicacion}`;
    contenedorOpciones.appendChild(cajaExplicacion);

    botonSiguiente.disabled = false;
    actualizarMarcador();
}

// --- UTILIDADES ---

function mezclarArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function actualizarMarcador() {
    textoAciertosMarcador.textContent = aciertos;
    textoFallosMarcador.textContent = fallos;
    contadorPreguntas.textContent = `Pregunta ${indicePreguntaActual + 1} / ${preguntasActuales.length}`;
}

function avanzarPregunta() {
    indicePreguntaActual++;
    if (indicePreguntaActual < preguntasActuales.length) {
        cargarPregunta();
    } else {
        mostrarResultados();
    }
}

function mostrarResultados() {
    contenedorTest.classList.add('hidden');
    contenedorResultados.classList.remove('hidden');
    textoAciertosFinal.textContent = aciertos;
    textoTotalFinal.textContent = preguntasActuales.length;

    const porc = (aciertos / preguntasActuales.length) * 100;
    mensajePuntuacion.textContent = porc >= 70 ? "¡Nivel de aprobado! Sigue así." : "Aún falta un poco de estudio. ¡Tú puedes!";
}

function salirAlMenu() {
    contenedorTest.classList.add('hidden');
    contenedorResultados.classList.add('hidden');
    seccionIntro.classList.remove('hidden');
    seccionGrid.classList.remove('hidden');
}
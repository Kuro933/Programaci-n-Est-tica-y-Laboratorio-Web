const CANCHAS = [
    {
        id: "cancha1",
        nombre: "Cancha 1 — Club Norte",
        ubicacion: "neuquen",
        ubicacionLabel: "Neuquén Capital",
        tipo: "techada",
        imagen: "imagenes/cancha_1.jpg",
        descripcion: "Neuquén Capital · Césped sintético · Iluminación LED"
    },
    {
        id: "cancha2",
        nombre: "Cancha 2 — Padel Center",
        ubicacion: "cipolletti",
        ubicacionLabel: "Cipolletti",
        tipo: "abierta",
        imagen: "imagenes/cancha_2.jpg",
        descripcion: "Cipolletti · Vista panorámica · Vestuarios incluidos"
    },
    {
        id: "cancha3",
        nombre: "Cancha 3 — Sport Club",
        ubicacion: "plottier",
        ubicacionLabel: "Plottier",
        tipo: "techada",
        imagen: "imagenes/cancha_3.jpg",
        descripcion: "Plottier · Cancha premium · Estacionamiento"
    },
    {
        id: "cancha4",
        nombre: "Cancha 4 — Río Padel",
        ubicacion: "centenario",
        ubicacionLabel: "Centenario",
        tipo: "abierta",
        imagen: "imagenes/cancha_4.jpg",
        descripcion: "Centenario · Cancha panorámica · Bar incluido"
    }
];

const HORARIOS_TODOS = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00", "18:00",
    "19:00", "20:00", "21:00", "22:00"
];

const HORARIOS_MANANA = ["08:00", "09:00", "10:00", "11:00", "12:00"];
const HORARIOS_TARDE = ["14:00", "15:00", "16:00", "17:00", "18:00"];
const HORARIOS_NOCHE = ["19:00", "20:00", "21:00", "22:00"];

function obtenerCanchaPorId(id) {
    let i;
    for (i = 0; i < CANCHAS.length; i++) {
        if (CANCHAS[i].id === id) {
            return CANCHAS[i];
        }
    }
    return null;
}

function formatearFecha(fechaISO) {
    const partes = fechaISO.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function formatearFechaLarga(fechaISO) {
    const fecha = new Date(fechaISO + "T12:00:00");
    const opciones = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    const texto = fecha.toLocaleDateString("es-AR", opciones);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function calcularHorarioFin(horario) {
    const partes = horario.split(":");
    let horas = Number(partes[0]);
    let minutos = Number(partes[1]) + 90;
    horas += Math.floor(minutos / 60);
    minutos = minutos % 60;
    const horasTexto = horas < 10 ? "0" + horas : String(horas);
    const minutosTexto = minutos < 10 ? "0" + minutos : String(minutos);
    return horasTexto + ":" + minutosTexto;
}

function esReservaActiva(reserva) {
    return reserva.estado === "confirmada" || reserva.estado === "pendiente";
}

function turnoEstaOcupado(fecha, canchaId, horario, reservas, reservaIgnoradaId) {
    let i;
    for (i = 0; i < reservas.length; i++) {
        const reserva = reservas[i];
        if (reservaIgnoradaId && reserva.id === reservaIgnoradaId) {
            continue;
        }
        if (
            esReservaActiva(reserva) &&
            reserva.fecha === fecha &&
            reserva.canchaId === canchaId &&
            reserva.horario === horario
        ) {
            return true;
        }
    }
    return false;
}

function contarTurnosLibres(fecha, canchaId, reservas) {
    let libres = 0;
    let i;
    for (i = 0; i < HORARIOS_TODOS.length; i++) {
        if (!turnoEstaOcupado(fecha, canchaId, HORARIOS_TODOS[i], reservas, null)) {
            libres++;
        }
    }
    return libres;
}

function obtenerProximoTurnoLibre(fecha, canchaId, reservas) {
    let i;
    for (i = 0; i < HORARIOS_TODOS.length; i++) {
        if (!turnoEstaOcupado(fecha, canchaId, HORARIOS_TODOS[i], reservas, null)) {
            return HORARIOS_TODOS[i];
        }
    }
    return null;
}

function obtenerNombrePagina() {
    const ruta = window.location.pathname;
    const partes = ruta.split("/");
    return partes[partes.length - 1];
}

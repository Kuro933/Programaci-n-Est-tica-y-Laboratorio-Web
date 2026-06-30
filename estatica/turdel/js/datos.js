const HORARIOS_TODOS = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00", "18:00",
    "19:00", "20:00", "21:00", "22:00"
];

const HORARIOS_MANANA = ["08:00", "09:00", "10:00", "11:00", "12:00"];
const HORARIOS_TARDE = ["14:00", "15:00", "16:00", "17:00", "18:00"];
const HORARIOS_NOCHE = ["19:00", "20:00", "21:00", "22:00"];

function obtenerCanchas() {
    const canchas = obtenerCanchasStorage();
    return canchas;
}

function obtenerCanchasDeClub(clubId) {
    const canchas = obtenerCanchas();
    const resultado = [];
    let i;

    for (i = 0; i < canchas.length; i++) {
        if (canchas[i].clubId === clubId) {
            resultado.push(canchas[i]);
        }
    }

    return resultado;
}

function obtenerCanchaPorId(id) {
    const canchas = obtenerCanchas();
    let i;

    for (i = 0; i < canchas.length; i++) {
        if (canchas[i].id === id) {
            return canchas[i];
        }
    }
    return null;
}

function obtenerHorariosCancha(canchaId) {
    const cancha = obtenerCanchaPorId(canchaId);

    if (!cancha || !cancha.horariosDisponibles || cancha.horariosDisponibles.length === 0) {
        return HORARIOS_TODOS.slice();
    }

    return cancha.horariosDisponibles;
}

function horarioEstaDisponibleEnCancha(canchaId, horario) {
    const horarios = obtenerHorariosCancha(canchaId);
    let i;

    for (i = 0; i < horarios.length; i++) {
        if (horarios[i] === horario) {
            return true;
        }
    }
    return false;
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
    const horarios = obtenerHorariosCancha(canchaId);
    let libres = 0;
    let i;

    for (i = 0; i < horarios.length; i++) {
        if (!turnoEstaOcupado(fecha, canchaId, horarios[i], reservas, null)) {
            libres++;
        }
    }
    return libres;
}

function obtenerProximoTurnoLibre(fecha, canchaId, reservas) {
    const horarios = obtenerHorariosCancha(canchaId);
    let i;

    for (i = 0; i < horarios.length; i++) {
        if (!turnoEstaOcupado(fecha, canchaId, horarios[i], reservas, null)) {
            return horarios[i];
        }
    }
    return null;
}

function obtenerNombrePagina() {
    const ruta = window.location.pathname;
    const partes = ruta.split("/");
    return partes[partes.length - 1];
}

function obtenerUsuarioPorId(id) {
    const usuarios = obtenerUsuarios();
    let i;

    for (i = 0; i < usuarios.length; i++) {
        if (usuarios[i].id === id) {
            return usuarios[i];
        }
    }

    return null;
}

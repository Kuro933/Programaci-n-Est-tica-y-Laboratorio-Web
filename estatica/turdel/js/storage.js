const STORAGE_KEYS = {
    usuarios: "turdel_usuarios",
    sesion: "turdel_sesion",
    reservas: "turdel_reservas",
    partidos: "turdel_partidos",
    estadisticas: "turdel_estadisticas",
    inicializado: "turdel_inicializado"
};

function obtenerDeStorage(clave) {
    const datos = localStorage.getItem(clave);
    if (datos === null) {
        return null;
    }
    return JSON.parse(datos);
}

function guardarEnStorage(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function obtenerUsuarios() {
    const usuarios = obtenerDeStorage(STORAGE_KEYS.usuarios);
    return usuarios || [];
}

function guardarUsuarios(usuarios) {
    guardarEnStorage(STORAGE_KEYS.usuarios, usuarios);
}

function obtenerSesion() {
    return obtenerDeStorage(STORAGE_KEYS.sesion);
}

function guardarSesion(usuario) {
    if (usuario === null) {
        localStorage.removeItem(STORAGE_KEYS.sesion);
    } else {
        guardarEnStorage(STORAGE_KEYS.sesion, usuario);
    }
}

function obtenerReservas() {
    const reservas = obtenerDeStorage(STORAGE_KEYS.reservas);
    return reservas || [];
}

function guardarReservas(reservas) {
    guardarEnStorage(STORAGE_KEYS.reservas, reservas);
}

function obtenerPartidos() {
    const partidos = obtenerDeStorage(STORAGE_KEYS.partidos);
    return partidos || [];
}

function guardarPartidos(partidos) {
    guardarEnStorage(STORAGE_KEYS.partidos, partidos);
}

function obtenerEstadisticas() {
    const estadisticas = obtenerDeStorage(STORAGE_KEYS.estadisticas);
    return estadisticas || [];
}

function guardarEstadisticas(estadisticas) {
    guardarEnStorage(STORAGE_KEYS.estadisticas, estadisticas);
}

function generarId() {
    return "id_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

function inicializarDatosPorDefecto() {
    if (localStorage.getItem(STORAGE_KEYS.inicializado) === "true") {
        return;
    }

    const usuarios = [
        {
            id: "user_demo",
            nombre: "María",
            apellido: "González",
            email: "demo@turdel.com",
            telefono: "+54 299 400-0000",
            contraseña: "123456",
            ciudad: "neuquen"
        }
    ];

    const reservas = [
        {
            id: "res_1",
            usuarioId: "user_demo",
            fecha: "2026-06-01",
            horario: "09:00",
            canchaId: "cancha1",
            jugadores: 4,
            notas: "",
            estado: "confirmada"
        },
        {
            id: "res_2",
            usuarioId: "user_demo",
            fecha: "2026-06-01",
            horario: "12:00",
            canchaId: "cancha1",
            jugadores: 4,
            notas: "",
            estado: "confirmada"
        },
        {
            id: "res_3",
            usuarioId: "user_demo",
            fecha: "2026-06-01",
            horario: "14:00",
            canchaId: "cancha1",
            jugadores: 4,
            notas: "",
            estado: "confirmada"
        },
        {
            id: "res_4",
            usuarioId: "user_demo",
            fecha: "2026-06-01",
            horario: "17:00",
            canchaId: "cancha1",
            jugadores: 4,
            notas: "",
            estado: "confirmada"
        },
        {
            id: "res_5",
            usuarioId: "user_demo",
            fecha: "2026-06-01",
            horario: "21:00",
            canchaId: "cancha1",
            jugadores: 4,
            notas: "",
            estado: "confirmada"
        },
        {
            id: "res_6",
            usuarioId: "user_otro",
            fecha: "2026-06-01",
            horario: "10:00",
            canchaId: "cancha2",
            jugadores: 4,
            notas: "",
            estado: "confirmada"
        }
    ];

    const partidos = [
        {
            id: "part_1",
            creadorId: "user_demo",
            creadorNombre: "María G.",
            fecha: "2026-06-07",
            horario: "16:00",
            canchaId: "cancha1",
            nivel: "intermedio",
            descripcion: "Partido intermedio — buscamos 2 jugadores más",
            jugadores: ["María G.", "Lucas P."]
        },
        {
            id: "part_2",
            creadorId: "user_otro",
            creadorNombre: "Diego R.",
            fecha: "2026-06-08",
            horario: "10:00",
            canchaId: "cancha2",
            nivel: "avanzado",
            descripcion: "Partido avanzado — falta 1 jugador",
            jugadores: ["Diego R.", "Ana M.", "Carlos T."]
        },
        {
            id: "part_3",
            creadorId: "user_otro2",
            creadorNombre: "Sofía L.",
            fecha: "2026-06-06",
            horario: "19:00",
            canchaId: "cancha4",
            nivel: "principiante",
            descripcion: "Partido principiante — sumate al cuarto",
            jugadores: ["Sofía L."]
        }
    ];

    const estadisticas = [
        {
            id: "stat_1",
            usuarioId: "user_demo",
            fecha: "2026-05-28",
            canchaId: "cancha1",
            rival: "Lucas y Ana",
            resultado: "victoria",
            set1: "6-4",
            set2: "6-3",
            set3: "",
            notas: ""
        },
        {
            id: "stat_2",
            usuarioId: "user_demo",
            fecha: "2026-05-21",
            canchaId: "cancha2",
            rival: "Diego y Martín",
            resultado: "derrota",
            set1: "4-6",
            set2: "6-4",
            set3: "3-6",
            notas: ""
        },
        {
            id: "stat_3",
            usuarioId: "user_demo",
            fecha: "2026-05-14",
            canchaId: "cancha3",
            rival: "Carlos y Sofía",
            resultado: "victoria",
            set1: "7-5",
            set2: "6-2",
            set3: "",
            notas: ""
        },
        {
            id: "stat_4",
            usuarioId: "user_demo",
            fecha: "2026-05-07",
            canchaId: "cancha1",
            rival: "Pablo y Elena",
            resultado: "victoria",
            set1: "6-1",
            set2: "6-4",
            set3: "",
            notas: ""
        }
    ];

    guardarUsuarios(usuarios);
    guardarReservas(reservas);
    guardarPartidos(partidos);
    guardarEstadisticas(estadisticas);
    localStorage.setItem(STORAGE_KEYS.inicializado, "true");
}

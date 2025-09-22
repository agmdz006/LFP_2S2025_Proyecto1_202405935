class AnalizadorTorneo {
  constructor(tokens) {
    this.tokens = tokens
    this.torneo = {}
    this.equipos = []
    this.partidos = []
    this.estadisticas = {}

    console.log("[ANALIZADOR] Inicializando análisis de torneo")
    console.log("[ANALIZADOR] Tokens recibidos:", tokens.length)
  }

  // Método para extraer información del torneo
  extraerInformacionTorneo() {
    console.log("[ANALIZADOR] Extrayendo información del torneo")

    let i = 0
    while (i < this.tokens.length) {
      const token = this.tokens[i]

      if (token.lexema === "TORNEO") {
        i = this.procesarSeccionTorneo(i)
      } else if (token.lexema === "EQUIPOS") {
        i = this.procesarSeccionEquipos(i)
      } else if (token.lexema === "ELIMINACION") {
        i = this.procesarSeccionEliminacion(i)
      } else {
        i++
      }
    }

    this.calcularEstadisticas()
    console.log("[ANALIZADOR] Información extraída:", this.torneo)
    console.log("[ANALIZADOR] Equipos encontrados:", this.equipos.length)
    console.log("[ANALIZADOR] Partidos encontrados:", this.partidos.length)
  }

  // Procesar sección TORNEO
  procesarSeccionTorneo(indice) {
    console.log("[ANALIZADOR] Procesando sección TORNEO")
    let i = indice + 1 // Saltar 'TORNEO'

    // Saltar '{'
    if (i < this.tokens.length && this.tokens[i].lexema === "{") {
      i++
    }

    while (i < this.tokens.length && this.tokens[i].lexema !== "}") {
      const token = this.tokens[i]

      if (token.lexema === "nombre" && i + 2 < this.tokens.length) {
        this.torneo.nombre = this.limpiarComillas(this.tokens[i + 2].lexema)
        i += 3
      } else if (token.lexema === "equipos" && i + 2 < this.tokens.length) {
        this.torneo.cantidadEquipos = Number.parseInt(this.tokens[i + 2].lexema)
        i += 3
      } else if (token.lexema === "sede" && i + 2 < this.tokens.length) {
        this.torneo.sede = this.limpiarComillas(this.tokens[i + 2].lexema)
        i += 3
      } else {
        i++
      }
    }

    return i + 1 // Saltar '}'
  }

  // Procesar sección EQUIPOS
  procesarSeccionEquipos(indice) {
    console.log("[ANALIZADOR] Procesando sección EQUIPOS")
    let i = indice + 1 // Saltar 'EQUIPOS'

    // Saltar '{'
    if (i < this.tokens.length && this.tokens[i].lexema === "{") {
      i++
    }

    while (i < this.tokens.length && this.tokens[i].lexema !== "}") {
      if (this.tokens[i].lexema === "equipo") {
        i = this.procesarEquipo(i)
      } else {
        i++
      }
    }

    return i + 1 // Saltar '}'
  }

  // Procesar un equipo individual
  procesarEquipo(indice) {
    let i = indice + 1 // Saltar 'equipo'
    const equipo = {
      nombre: "",
      jugadores: [],
      estadisticas: {
        partidosJugados: 0,
        ganados: 0,
        perdidos: 0,
        golesFavor: 0,
        golesContra: 0,
        diferencia: 0,
        faseAlcanzada: "Cuartos",
      },
    }

    // Saltar ':' y obtener nombre
    if (i + 1 < this.tokens.length) {
      equipo.nombre = this.limpiarComillas(this.tokens[i + 1].lexema)
      i += 2
    }

    // Saltar '['
    if (i < this.tokens.length && this.tokens[i].lexema === "[") {
      i++
    }

    // Procesar jugadores
    while (i < this.tokens.length && this.tokens[i].lexema !== "]") {
      if (this.tokens[i].lexema === "jugador") {
        i = this.procesarJugador(i, equipo)
      } else {
        i++
      }
    }

    this.equipos.push(equipo)
    console.log("[ANALIZADOR] Equipo procesado:", equipo.nombre, "con", equipo.jugadores.length, "jugadores")

    return i + 1 // Saltar ']'
  }

  // Procesar un jugador individual
  procesarJugador(indice, equipo) {
    let i = indice + 1 // Saltar 'jugador'
    const jugador = {
      nombre: "",
      posicion: "",
      numero: 0,
      edad: 0,
      goles: 0,
      minutosGol: [],
    }

    // Saltar ':' y obtener nombre
    if (i + 1 < this.tokens.length) {
      jugador.nombre = this.limpiarComillas(this.tokens[i + 1].lexema)
      i += 2
    }

    // Saltar '['
    if (i < this.tokens.length && this.tokens[i].lexema === "[") {
      i++
    }

    // Procesar atributos del jugador
    while (i < this.tokens.length && this.tokens[i].lexema !== "]") {
      const token = this.tokens[i]

      if (token.lexema === "posicion" && i + 2 < this.tokens.length) {
        jugador.posicion = this.limpiarComillas(this.tokens[i + 2].lexema)
        i += 3
      } else if (token.lexema === "numero" && i + 2 < this.tokens.length) {
        jugador.numero = Number.parseInt(this.tokens[i + 2].lexema)
        i += 3
      } else if (token.lexema === "edad" && i + 2 < this.tokens.length) {
        jugador.edad = Number.parseInt(this.tokens[i + 2].lexema)
        i += 3
      } else {
        i++
      }
    }

    equipo.jugadores.push(jugador)
    return i + 1 // Saltar ']'
  }

  // Procesar sección ELIMINACION
  procesarSeccionEliminacion(indice) {
    console.log("[ANALIZADOR] Procesando sección ELIMINACION")
    let i = indice + 1 // Saltar 'ELIMINACION'

    // Saltar '{'
    if (i < this.tokens.length && this.tokens[i].lexema === "{") {
      i++
    }

    while (i < this.tokens.length && this.tokens[i].lexema !== "}") {
      if (
        this.tokens[i].lexema === "cuartos" ||
        this.tokens[i].lexema === "semifinal" ||
        this.tokens[i].lexema === "final"
      ) {
        i = this.procesarFase(i)
      } else {
        i++
      }
    }

    return i + 1 // Saltar '}'
  }

  // Procesar una fase del torneo
  procesarFase(indice) {
    const fase = this.tokens[indice].lexema
    let i = indice + 1 // Saltar nombre de fase

    console.log("[ANALIZADOR] Procesando fase:", fase)

    // Saltar ':' y '['
    if (i < this.tokens.length && this.tokens[i].lexema === ":") i++
    if (i < this.tokens.length && this.tokens[i].lexema === "[") i++

    while (i < this.tokens.length && this.tokens[i].lexema !== "]") {
      if (this.tokens[i].lexema === "partido") {
        i = this.procesarPartido(i, fase)
      } else {
        i++
      }
    }

    return i + 1 // Saltar ']'
  }

  // Procesar un partido individual
  procesarPartido(indice, fase) {
    let i = indice + 1 // Saltar 'partido'
    const partido = {
      fase: fase,
      equipoLocal: "",
      equipoVisitante: "",
      resultado: "",
      goleadores: [],
      ganador: "",
    }

    // Saltar ':' y obtener equipo local
    if (i + 1 < this.tokens.length) {
      partido.equipoLocal = this.limpiarComillas(this.tokens[i + 1].lexema)
      i += 2
    }

    // Saltar 'vs' y obtener equipo visitante
    if (i + 1 < this.tokens.length && this.tokens[i].lexema === "vs") {
      partido.equipoVisitante = this.limpiarComillas(this.tokens[i + 1].lexema)
      i += 2
    }

    // Saltar '['
    if (i < this.tokens.length && this.tokens[i].lexema === "[") {
      i++
    }

    // Procesar información del partido
    while (i < this.tokens.length && this.tokens[i].lexema !== "]") {
      const token = this.tokens[i]

      if (token.lexema === "resultado" && i + 2 < this.tokens.length) {
        partido.resultado = this.limpiarComillas(this.tokens[i + 2].lexema)
        i += 3
      } else if (token.lexema === "goleadores") {
        i = this.procesarGoleadores(i, partido)
      } else {
        i++
      }
    }

    // Determinar ganador
    if (partido.resultado !== "Pendiente" && this.contieneGuion(partido.resultado)) {
      const goles = partido.resultado.split("-")
      const golesLocal = Number.parseInt(goles[0])
      const golesVisitante = Number.parseInt(goles[1])

      if (golesLocal > golesVisitante) {
        partido.ganador = partido.equipoLocal
      } else if (golesVisitante > golesLocal) {
        partido.ganador = partido.equipoVisitante
      }
    }

    this.partidos.push(partido)
    console.log(
      "[ANALIZADOR] Partido procesado:",
      partido.equipoLocal,
      "vs",
      partido.equipoVisitante,
      "-",
      partido.resultado,
    )

    return i + 1 // Saltar ']'
  }

  // Procesar goleadores de un partido
  procesarGoleadores(indice, partido) {
    let i = indice + 1 // Saltar 'goleadores'

    // Saltar ':' y '['
    if (i < this.tokens.length && this.tokens[i].lexema === ":") i++
    if (i < this.tokens.length && this.tokens[i].lexema === "[") i++

    while (i < this.tokens.length && this.tokens[i].lexema !== "]") {
      if (this.tokens[i].lexema === "goleador") {
        i = this.procesarGoleador(i, partido)
      } else {
        i++
      }
    }

    return i + 1 // Saltar ']'
  }

  // Procesar un goleador individual
  procesarGoleador(indice, partido) {
    let i = indice + 1 // Saltar 'goleador'
    const goleador = {
      nombre: "",
      minuto: 0,
    }

    // Saltar ':' y obtener nombre
    if (i + 1 < this.tokens.length) {
      goleador.nombre = this.limpiarComillas(this.tokens[i + 1].lexema)
      i += 2
    }

    // Saltar '['
    if (i < this.tokens.length && this.tokens[i].lexema === "[") {
      i++
    }

    // Procesar minuto
    while (i < this.tokens.length && this.tokens[i].lexema !== "]") {
      if (this.tokens[i].lexema === "minuto" && i + 2 < this.tokens.length) {
        goleador.minuto = Number.parseInt(this.tokens[i + 2].lexema)
        i += 3
      } else {
        i++
      }
    }

    partido.goleadores.push(goleador)
    return i + 1 // Saltar ']'
  }

  // Calcular estadísticas del torneo
  calcularEstadisticas() {
    console.log("[ANALIZADOR] Calculando estadísticas")

    // Inicializar estadísticas de equipos
    this.equipos.forEach((equipo) => {
      equipo.estadisticas = {
        partidosJugados: 0,
        ganados: 0,
        perdidos: 0,
        golesFavor: 0,
        golesContra: 0,
        diferencia: 0,
        faseAlcanzada: "Cuartos",
      }
    })

    // Procesar cada partido para calcular estadísticas
    this.partidos.forEach((partido) => {
      if (partido.resultado !== "Pendiente" && this.contieneGuion(partido.resultado)) {
        const goles = partido.resultado.split("-")
        const golesLocal = Number.parseInt(goles[0])
        const golesVisitante = Number.parseInt(goles[1])

        // Encontrar equipos
        const equipoLocal = this.equipos.find((e) => e.nombre === partido.equipoLocal)
        const equipoVisitante = this.equipos.find((e) => e.nombre === partido.equipoVisitante)

        if (equipoLocal && equipoVisitante) {
          // Actualizar estadísticas del equipo local
          equipoLocal.estadisticas.partidosJugados++
          equipoLocal.estadisticas.golesFavor += golesLocal
          equipoLocal.estadisticas.golesContra += golesVisitante

          // Actualizar estadísticas del equipo visitante
          equipoVisitante.estadisticas.partidosJugados++
          equipoVisitante.estadisticas.golesFavor += golesVisitante
          equipoVisitante.estadisticas.golesContra += golesLocal

          // Determinar ganador y perdedor
          if (golesLocal > golesVisitante) {
            equipoLocal.estadisticas.ganados++
            equipoVisitante.estadisticas.perdidos++
          } else if (golesVisitante > golesLocal) {
            equipoVisitante.estadisticas.ganados++
            equipoLocal.estadisticas.perdidos++
          }

          // Actualizar fase alcanzada
          if (partido.fase === "semifinal") {
            equipoLocal.estadisticas.faseAlcanzada = "Semifinal"
            equipoVisitante.estadisticas.faseAlcanzada = "Semifinal"
          } else if (partido.fase === "final") {
            equipoLocal.estadisticas.faseAlcanzada = "Final"
            equipoVisitante.estadisticas.faseAlcanzada = "Final"
          }
        }

        // Actualizar goles de jugadores
        partido.goleadores.forEach((goleador) => {
          this.equipos.forEach((equipo) => {
            const jugador = equipo.jugadores.find((j) => j.nombre === goleador.nombre)
            if (jugador) {
              jugador.goles++
              jugador.minutosGol.push(goleador.minuto)
            }
          })
        })
      }
    })

    // Calcular diferencia de goles
    this.equipos.forEach((equipo) => {
      equipo.estadisticas.diferencia = equipo.estadisticas.golesFavor - equipo.estadisticas.golesContra
    })

    console.log("[ANALIZADOR] Estadísticas calculadas")
  }

  // Obtener información del torneo
  getTorneo() {
    return this.torneo
  }

  // Obtener equipos
  getEquipos() {
    return this.equipos
  }

  // Obtener partidos
  getPartidos() {
    return this.partidos
  }

  // Obtener goleadores ordenados
  getGoleadores() {
    const goleadores = []

    this.equipos.forEach((equipo) => {
      equipo.jugadores.forEach((jugador) => {
        if (jugador.goles > 0) {
          goleadores.push({
            nombre: jugador.nombre,
            equipo: equipo.nombre,
            goles: jugador.goles,
            minutosGol: jugador.minutosGol,
          })
        }
      })
    })

    // Ordenar por goles (descendente)
    goleadores.sort((a, b) => b.goles - a.goles)

    return goleadores
  }

  // Obtener estadísticas generales
  getEstadisticasGenerales() {
    const totalPartidos = this.partidos.length
    const partidosCompletados = this.partidos.filter((p) => p.resultado !== "Pendiente").length
    let totalGoles = 0
    let totalEdad = 0
    let totalJugadores = 0

    this.equipos.forEach((equipo) => {
      equipo.estadisticas.golesFavor && (totalGoles += equipo.estadisticas.golesFavor)
      equipo.jugadores.forEach((jugador) => {
        totalEdad += jugador.edad
        totalJugadores++
      })
    })

    return {
      nombreTorneo: this.torneo.nombre || "Sin nombre",
      sede: this.torneo.sede || "Sin sede",
      equiposParticipantes: this.equipos.length,
      totalPartidos: totalPartidos,
      partidosCompletados: partidosCompletados,
      totalGoles: totalGoles,
      promedioGoles: partidosCompletados > 0 ? (totalGoles / partidosCompletados).toFixed(1) : 0,
      edadPromedio: totalJugadores > 0 ? (totalEdad / totalJugadores).toFixed(2) : 0,
      faseActual: this.determinarFaseActual(),
    }
  }

  // Determinar fase actual del torneo
  determinarFaseActual() {
    const fases = ["Cuartos", "Semifinal", "Final"]
    let faseActual = "Cuartos"

    this.partidos.forEach((partido) => {
      if (partido.resultado !== "Pendiente") {
        if (partido.fase === "semifinal") faseActual = "Semifinal"
        if (partido.fase === "final") faseActual = "Final"
      }
    })

    return faseActual
  }

  limpiarComillas(texto) {
    let resultado = ""
    for (let i = 0; i < texto.length; i++) {
      if (texto[i] !== '"') {
        resultado += texto[i]
      }
    }
    return resultado
  }

  // Manual method to check for dash character
  contieneGuion(texto) {
    for (let i = 0; i < texto.length; i++) {
      if (texto[i] === "-") {
        return true
      }
    }
    return false
  }
}

window.AnalizadorTorneo = AnalizadorTorneo


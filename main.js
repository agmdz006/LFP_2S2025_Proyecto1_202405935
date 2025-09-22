class Main {
  constructor() {
    this.lexer = null
    this.analizador = null
    this.tokens = []
    this.errores = []

    console.log("[MAIN] Aplicación inicializada")
    console.log("[MAIN] Verificando elementos DOM...")
    this.verificarElementos()
    this.inicializarEventos()
  }

  verificarElementos() {
    const elementos = {
      inputArchivo: document.getElementById("inputArchivo"),
      btnTokens: document.getElementById("btnTokens"),
      btnErrores: document.getElementById("btnErrores"),
      btnBracket: document.getElementById("btnBracket"),
      btnEstadisticas: document.getElementById("btnEstadisticas"),
      btnGoleadores: document.getElementById("btnGoleadores"),
      btnGeneral: document.getElementById("btnGeneral"),
      btnGraphviz: document.getElementById("btnGraphviz"), // Added for Graphviz button
      resultado: document.getElementById("resultado"),
      mensaje: document.getElementById("mensaje"),
      contenidoArchivo: document.getElementById("contenidoArchivo"), // Added for textarea
    }

    for (const [nombre, elemento] of Object.entries(elementos)) {
      if (elemento) {
        console.log(`[MAIN] ✅ Elemento ${nombre} encontrado`)
      } else {
        console.error(`[MAIN] ❌ Elemento ${nombre} NO encontrado`)
      }
    }
  }

  // Inicializar eventos de la interfaz
  inicializarEventos() {
    // Evento para cargar archivo
    const inputArchivo = document.getElementById("inputArchivo")
    if (inputArchivo) {
      inputArchivo.addEventListener("change", (e) => {
        console.log("[MAIN] Evento change disparado")
        this.cargarArchivo(e)
      })

      // Also listen for input event as backup
      inputArchivo.addEventListener("input", (e) => {
        console.log("[MAIN] Evento input disparado")
        this.cargarArchivo(e)
      })

      console.log("[MAIN] ✅ Event listeners del input agregados")
    } else {
      console.error("[MAIN] ❌ No se pudo encontrar el input de archivo")
    }

    // Eventos para botones de reportes
    const botones = {
      btnTokens: () => this.mostrarTokens(),
      btnErrores: () => this.mostrarErrores(),
      btnBracket: () => this.mostrarBracket(),
      btnEstadisticas: () => this.mostrarEstadisticasEquipos(),
      btnGoleadores: () => this.mostrarGoleadores(),
      btnGeneral: () => this.mostrarEstadisticasGenerales(),
      btnGraphviz: () => this.generarDiagramasGraphviz(), // Added Graphviz button handler
    }

    for (const [id, handler] of Object.entries(botones)) {
      const boton = document.getElementById(id)
      if (boton) {
        boton.addEventListener("click", handler)
        console.log(`[MAIN] ✅ Event listener agregado a ${id}`)
      } else {
        console.error(`[MAIN] ❌ No se pudo encontrar el botón ${id}`)
      }
    }

    console.log("[MAIN] Eventos inicializados")
  }

  // Cargar y procesar archivo
  cargarArchivo(evento) {
    console.log("[MAIN] cargando archivo llamado")
    console.log("[MAIN] Evento:", evento)
    console.log("[MAIN] Target:", evento.target)
    console.log("[MAIN] Archivos:", evento.target.files)

    const archivo = evento.target.files[0]
    if (!archivo) {
      console.log("[MAIN] No se seleccionó archivo")
      this.mostrarMensaje("Por favor selecciona un archivo .txt", "warning")
      return
    }

    if (!archivo.name.toLowerCase().endsWith(".txt")) {
      console.log("[MAIN] Archivo no es .txt:", archivo.name)
      this.mostrarMensaje("Por favor selecciona un archivo con extensión .txt", "error")
      return
    }

    console.log("[MAIN] Cargando archivo:", archivo.name)
    console.log("[MAIN] Tamaño del archivo:", archivo.size, "bytes")
    console.log("[MAIN] Tipo del archivo:", archivo.type)

    const lector = new FileReader()

    lector.onerror = (e) => {
      console.error("[MAIN] Error al leer archivo:", e)
      this.mostrarMensaje("Error al leer el archivo", "error")
    }

    lector.onload = (e) => {
      const contenido = e.target.result
      console.log("[MAIN] Archivo cargado exitosamente")
      console.log("[MAIN] Longitud del contenido:", contenido.length)
      console.log("[MAIN] Primeros 200 caracteres:", contenido.substring(0, 200))

      const textarea = document.getElementById("contenidoArchivo")
      if (textarea) {
        textarea.value = contenido
        console.log("[MAIN] Contenido mostrado en textarea")
      }

      this.procesarTexto(contenido)
    }

    lector.readAsText(archivo, "UTF-8")
  }

  // Procesar texto del archivo
  procesarTexto(texto) {
    console.log("[MAIN] Procesando texto")

    try {
      // Crear lexer y analizar
      const Token = window.Token // Declarando la variable token
      const Lexer = window.Lexer // Declarando la variable Lexer
      const AnalizadorTorneo = window.AnalizadorTorneo // Declarando la variable AnalizadorTorneo
      this.lexer = new Lexer(texto) //declarando instancia lexer con el archivo como atributo
      const resultado = this.lexer.analizar() //ejecutando método analizar para la instancia

      this.tokens = resultado.tokens
      this.errores = resultado.errores

      console.log("[MAIN] Análisis léxico completado")
      console.log("[MAIN] Tokens encontrados:", this.tokens.length)
      console.log("[MAIN] Errores encontrados:", this.errores.length)

      // Si no hay errores, procesar información del torneo
      if (this.errores.length === 0) {
        this.analizador = new AnalizadorTorneo(this.tokens)
        this.analizador.extraerInformacionTorneo()
        console.log("[MAIN] Información del torneo extraída")
      }

      // Habilitar botones
      this.habilitarBotones()

      // Mostrar mensaje de éxito
      this.mostrarMensaje("Archivo procesado correctamente", "success")
    } catch (error) {
      console.error("[MAIN] Error al procesar archivo:", error)
      this.mostrarMensaje("Error al procesar el archivo: " + error.message, "error")
    }
  }

  // Habilitar botones de reportes
  habilitarBotones() {
    const botones = [
      "btnTokens",
      "btnErrores",
      "btnBracket",
      "btnEstadisticas",
      "btnGoleadores",
      "btnGeneral",
      "btnGraphviz",
    ] // Added btnGraphviz
    botones.forEach((id) => {
      const boton = document.getElementById(id)
      if (boton) {
        boton.disabled = false
        boton.classList.remove("disabled")
      }
    })
    console.log("[MAIN] Botones habilitados")
  }

  // Mostrar mensaje al usuario
  mostrarMensaje(mensaje, tipo) {
    console.log(`[MAIN] Mostrando mensaje: ${mensaje} (${tipo})`)
    const contenedor = document.getElementById("mensaje")
    if (contenedor) {
      contenedor.innerHTML = `<div class="mensaje ${tipo}">${mensaje}</div>`
      setTimeout(() => {
        contenedor.innerHTML = ""
      }, 5000) // Increased timeout to 5 seconds
    } else {
      console.error("[MAIN] No se pudo encontrar el contenedor de mensajes")
    }
  }

  // Descargar reporte
  descargarReporte(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = nombreArchivo
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log(`[MAIN] Reporte ${nombreArchivo} descargado`)
  }

  // Mostrar tabla de tokens
  mostrarTokens() {
    console.log("[MAIN] Generando reporte de tokens")

    if (!this.tokens || this.tokens.length === 0) {
      this.mostrarMensaje("No hay tokens para mostrar", "warning")
      return
    }

    let html = `
            <div class="reporte">
                <h2>Reporte de Tokens Extraídos</h2>
                <table class="tabla-reporte">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Lexema</th>
                            <th>Tipo</th>
                            <th>Línea</th>
                            <th>Columna</th>
                        </tr>
                    </thead>
                    <tbody>
        `

    this.tokens.forEach((token, index) => {
      html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${token.lexema}</td>
                    <td>${token.tipo}</td>
                    <td>${token.linea}</td>
                    <td>${token.columna}</td>
                </tr>
            `
    })

    html += `
                    </tbody>
                </table>
            </div>
        `

    document.getElementById("resultado").innerHTML = html

    const reporteCompleto = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Tokens Extraídos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f2f2f2; }
        h2 { color: #333; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`

    this.descargarReporte(reporteCompleto, "reporte_tokens.html")
    console.log("[MAIN] Reporte de tokens generado")
  }

  // Mostrar tabla de errores
  mostrarErrores() {
    console.log("[MAIN] Generando reporte de errores")

    if (!this.errores || this.errores.length === 0) {
      this.mostrarMensaje("No hay errores para mostrar", "success")
      const html = '<div class="reporte"><h2>No se encontraron errores léxicos</h2></div>'
      document.getElementById("resultado").innerHTML = html

      const reporteCompleto = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Errores Léxicos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h2 { color: #333; text-align: center; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`

      this.descargarReporte(reporteCompleto, "reporte_errores.html")
      return
    }

    let html = `
            <div class="reporte">
                <h2>Reporte de Errores Léxicos</h2>
                <table class="tabla-reporte">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Lexema</th>
                            <th>Tipo de Error</th>
                            <th>Descripción</th>
                            <th>Línea</th>
                            <th>Columna</th>
                        </tr>
                    </thead>
                    <tbody>
        `

    this.errores.forEach((error, index) => {
      html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${error.lexema}</td>
                    <td>${error.tipoError}</td>
                    <td>${error.descripcion}</td>
                    <td>${error.linea}</td>
                    <td>${error.columna}</td>
                </tr>
            `
    })

    html += `
                    </tbody>
                </table>
            </div>
        `

    document.getElementById("resultado").innerHTML = html

    const reporteCompleto = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Errores Léxicos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f2f2f2; }
        h2 { color: #333; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`

    this.descargarReporte(reporteCompleto, "reporte_errores.html")
    console.log("[MAIN] Reporte de errores generado")
  }

  // Mostrar bracket de eliminación
  mostrarBracket() {
    console.log("[MAIN] Generando reporte de bracket")

    if (!this.analizador) {
      this.mostrarMensaje("Primero debe procesar un archivo válido", "warning")
      return
    }

    const partidos = this.analizador.getPartidos()

    let html = `
            <div class="reporte">
                <h2>Reporte de Bracket de Eliminación</h2>
                <table class="tabla-reporte">
                    <thead>
                        <tr>
                            <th>Fase</th>
                            <th>Partido</th>
                            <th>Resultado</th>
                            <th>Ganador</th>
                        </tr>
                    </thead>
                    <tbody>
        `

    partidos.forEach((partido) => {
      html += `
                <tr>
                    <td>${this.capitalizarFase(partido.fase)}</td>
                    <td>${partido.equipoLocal} vs ${partido.equipoVisitante}</td>
                    <td>${partido.resultado}</td>
                    <td>${partido.ganador || "Pendiente"}</td>
                </tr>
            `
    })

    html += `
                    </tbody>
                </table>
            </div>
        `

    document.getElementById("resultado").innerHTML = html

    const reporteCompleto = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Bracket de Eliminación</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f2f2f2; }
        h2 { color: #333; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`

    this.descargarReporte(reporteCompleto, "reporte_bracket.html")
    console.log("[MAIN] Reporte de bracket generado")
  }

  // Mostrar estadísticas por equipo
  mostrarEstadisticasEquipos() {
    console.log("[MAIN] Generando reporte de estadísticas por equipo")

    if (!this.analizador) {
      this.mostrarMensaje("Primero debe procesar un archivo válido", "warning")
      return
    }

    const equipos = this.analizador.getEquipos()

    let html = `
            <div class="reporte">
                <h2>Reporte de Estadísticas por Equipo</h2>
                <table class="tabla-reporte">
                    <thead>
                        <tr>
                            <th>Equipo</th>
                            <th>Partidos Jugados</th>
                            <th>Ganados</th>
                            <th>Perdidos</th>
                            <th>Goles Favor</th>
                            <th>Goles Contra</th>
                            <th>Diferencia</th>
                            <th>Fase Alcanzada</th>
                        </tr>
                    </thead>
                    <tbody>
        `

    equipos.forEach((equipo) => {
      const est = equipo.estadisticas
      html += `
                <tr>
                    <td>${equipo.nombre}</td>
                    <td>${est.partidosJugados}</td>
                    <td>${est.ganados}</td>
                    <td>${est.perdidos}</td>
                    <td>${est.golesFavor}</td>
                    <td>${est.golesContra}</td>
                    <td>${est.diferencia >= 0 ? "+" : ""}${est.diferencia}</td>
                    <td>${est.faseAlcanzada}</td>
                </tr>
            `
    })

    html += `
                    </tbody>
                </table>
            </div>
        `

    document.getElementById("resultado").innerHTML = html

    const reporteCompleto = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Estadísticas por Equipo</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f2f2f2; }
        h2 { color: #333; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`

    this.descargarReporte(reporteCompleto, "reporte_estadisticas_equipos.html")
    console.log("[MAIN] Reporte de estadísticas por equipo generado")
  }

  // Mostrar tabla de goleadores
  mostrarGoleadores() {
    console.log("[MAIN] Generando reporte de goleadores")

    if (!this.analizador) {
      this.mostrarMensaje("Primero debe procesar un archivo válido", "warning")
      return
    }

    const goleadores = this.analizador.getGoleadores()

    let html = `
            <div class="reporte">
                <h2>Reporte de Goleadores</h2>
                <table class="tabla-reporte">
                    <thead>
                        <tr>
                            <th>Posición</th>
                            <th>Jugador</th>
                            <th>Equipo</th>
                            <th>Goles</th>
                            <th>Minutos de Gol</th>
                        </tr>
                    </thead>
                    <tbody>
        `

    goleadores.forEach((goleador, index) => {
      const minutosStr = goleador.minutosGol.map((m) => m + "'").join(", ")
      html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${goleador.nombre}</td>
                    <td>${goleador.equipo}</td>
                    <td>${goleador.goles}</td>
                    <td>${minutosStr}</td>
                </tr>
            `
    })

    html += `
                    </tbody>
                </table>
            </div>
        `

    document.getElementById("resultado").innerHTML = html

    const reporteCompleto = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Goleadores</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f2f2f2; }
        h2 { color: #333; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`

    this.descargarReporte(reporteCompleto, "reporte_goleadores.html")
    console.log("[MAIN] Reporte de goleadores generado")
  }

  mostrarEstadisticasGenerales() {
    console.log("[MAIN] Generando reporte completo con todas las estadísticas")

    if (!this.analizador) {
      this.mostrarMensaje("Primero debe procesar un archivo válido", "warning")
      return
    }

    const stats = this.analizador.getEstadisticasGenerales()
    const equipos = this.analizador.getEquipos()
    const goleadores = this.analizador.getGoleadores()
    const partidos = this.analizador.getPartidos()

    // Información General
    const htmlGeneral = `
            <div class="reporte">
                <h2>Información General del Torneo</h2>
                <table class="tabla-reporte">
                    <thead>
                        <tr>
                            <th>Estadística</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Nombre del Torneo</td><td>${stats.nombreTorneo}</td></tr>
                        <tr><td>Sede</td><td>${stats.sede}</td></tr>
                        <tr><td>Equipos Participantes</td><td>${stats.equiposParticipantes}</td></tr>
                        <tr><td>Total de Partidos Programados</td><td>${stats.totalPartidos}</td></tr>
                        <tr><td>Partidos Completados</td><td>${stats.partidosCompletados}</td></tr>
                        <tr><td>Total de Goles</td><td>${stats.totalGoles}</td></tr>
                        <tr><td>Promedio de Goles por Partido</td><td>${stats.promedioGoles}</td></tr>
                        <tr><td>Edad Promedio de Jugadores</td><td>${stats.edadPromedio} años</td></tr>
                        <tr><td>Fase Actual</td><td>${stats.faseActual}</td></tr>
                    </tbody>
                </table>
            </div>
        `

    // Bracket
    let htmlBracket = `
            <div class="reporte">
                <h2>Bracket de Eliminación</h2>
                <table class="tabla-reporte">
                    <thead>
                        <tr>
                            <th>Fase</th>
                            <th>Partido</th>
                            <th>Resultado</th>
                            <th>Ganador</th>
                        </tr>
                    </thead>
                    <tbody>
        `

    partidos.forEach((partido) => {
      htmlBracket += `
                <tr>
                    <td>${this.capitalizarFase(partido.fase)}</td>
                    <td>${partido.equipoLocal} vs ${partido.equipoVisitante}</td>
                    <td>${partido.resultado}</td>
                    <td>${partido.ganador || "Pendiente"}</td>
                </tr>
            `
    })

    htmlBracket += `
                    </tbody>
                </table>
            </div>
        `

    // Estadísticas por Equipo
    let htmlEquipos = `
            <div class="reporte">
                <h2>Estadísticas por Equipo</h2>
                <table class="tabla-reporte">
                    <thead>
                        <tr>
                            <th>Equipo</th>
                            <th>Partidos Jugados</th>
                            <th>Ganados</th>
                            <th>Perdidos</th>
                            <th>Goles Favor</th>
                            <th>Goles Contra</th>
                            <th>Diferencia</th>
                            <th>Fase Alcanzada</th>
                        </tr>
                    </thead>
                    <tbody>
        `

    equipos.forEach((equipo) => {
      const est = equipo.estadisticas
      htmlEquipos += `
                <tr>
                    <td>${equipo.nombre}</td>
                    <td>${est.partidosJugados}</td>
                    <td>${est.ganados}</td>
                    <td>${est.perdidos}</td>
                    <td>${est.golesFavor}</td>
                    <td>${est.golesContra}</td>
                    <td>${est.diferencia >= 0 ? "+" : ""}${est.diferencia}</td>
                    <td>${est.faseAlcanzada}</td>
                </tr>
            `
    })

    htmlEquipos += `
                    </tbody>
                </table>
            </div>
        `

    // Goleadores
    let htmlGoleadores = `
            <div class="reporte">
                <h2>Tabla de Goleadores</h2>
                <table class="tabla-reporte">
                    <thead>
                        <tr>
                            <th>Posición</th>
                            <th>Jugador</th>
                            <th>Equipo</th>
                            <th>Goles</th>
                            <th>Minutos de Gol</th>
                        </tr>
                    </thead>
                    <tbody>
        `

    goleadores.forEach((goleador, index) => {
      const minutosStr = goleador.minutosGol.map((m) => m + "'").join(", ")
      htmlGoleadores += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${goleador.nombre}</td>
                    <td>${goleador.equipo}</td>
                    <td>${goleador.goles}</td>
                    <td>${minutosStr}</td>
                </tr>
            `
    })

    htmlGoleadores += `
                    </tbody>
                </table>
            </div>
        `

    // Mostrar todos los reportes
    const htmlCompleto = htmlGeneral + htmlBracket + htmlEquipos + htmlGoleadores
    document.getElementById("resultado").innerHTML = htmlCompleto

    // Descargar reporte completo
    const reporteCompleto = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte Completo del Torneo</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 40px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f2f2f2; }
        h2 { color: #333; margin-top: 40px; }
        .reporte { margin-bottom: 50px; }
    </style>
</head>
<body>
    <h1 style="text-align: center; color: #2c3e50;">Reporte Completo del Torneo</h1>
    ${htmlCompleto}
</body>
</html>`

    this.descargarReporte(reporteCompleto, "reporte_completo_torneo.html")
    console.log("[MAIN] Reporte completo generado y mostrado")
  }

  // Capitalizar nombre de fase
  capitalizarFase(fase) {
    const fases = {
      cuartos: "Cuartos de Final",
      semifinal: "Semifinal",
      final: "Final",
    }
    return fases[fase] || fase
  }

  // Generar diagramas Graphviz
  generarDiagramasGraphviz() {
    console.log("[MAIN] Generando diagrama Graphviz del torneo")

    if (!this.analizador) {
      this.mostrarMensaje("Primero debe procesar un archivo válido", "warning")
      return
    }

    const GraphvizGenerator = window.GraphvizGenerator
    const generador = new GraphvizGenerator(this.analizador)

    // Generar el diagrama principal del torneo
    const diagramaTorneo = generador.generarDiagramaTorneo()

    // Descargar el diagrama
    generador.descargarDiagrama(diagramaTorneo, "torneo_eliminacion.txt")

    this.mostrarMensaje("Diagrama Graphviz generado y descargado exitosamente", "success")
    console.log("[MAIN] Diagrama Graphviz del torneo generado")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("[MAIN] DOM cargado, inicializando aplicación")
  console.log("[MAIN] Verificando que todas las clases estén disponibles...")


  const Token = window.Token // declarando variable token
  const Lexer = window.Lexer // declarando variable lexer
  const AnalizadorTorneo = window.AnalizadorTorneo // declarando variable AnalizadorTorneo
  const GraphvizGenerator = window.GraphvizGenerator // declarando variable GraphvizGenerator

  if (typeof Token === "undefined") {
    console.error("[MAIN] ❌ Clase Token no está disponible")
  } else {
    console.log("[MAIN] ✅ Clase Token disponible")
  }

  if (typeof Lexer === "undefined") {
    console.error("[MAIN] ❌ Clase Lexer no está disponible")
  } else {
    console.log("[MAIN] ✅ Clase Lexer disponible")
  }

  if (typeof AnalizadorTorneo === "undefined") {
    console.error("[MAIN] ❌ Clase AnalizadorTorneo no está disponible")
  } else {
    console.log("[MAIN] ✅ Clase AnalizadorTorneo disponible")
  }

  if (typeof GraphvizGenerator === "undefined") {
    console.error("[MAIN] ❌ Clase GraphvizGenerator no está disponible")
  } else {
    console.log("[MAIN] ✅ Clase GraphvizGenerator disponible")
  }

  try {
    window.app = new Main()
    console.log("[MAIN] ✅ Aplicación inicializada correctamente")
  } catch (error) {
    console.error("[MAIN] ❌ Error al inicializar aplicación:", error)
  }
})

window.addEventListener("load", () => {
  console.log("[MAIN] verificando si la app ya existe")
  if (!window.app) {
    console.log("[MAIN] App no existe, intentando crear...")
    try {
      window.app = new Main()
    } catch (error) {
      console.error("[MAIN] Error en la carga de la ventana:", error)
    }
  }
})


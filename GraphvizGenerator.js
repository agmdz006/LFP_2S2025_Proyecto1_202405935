class GraphvizGenerator {
  constructor(analizador) {
    this.analizador = analizador
    console.log("[GRAPHVIZ] Generador de diagramas Graphviz inicializado")
  }

  generarDiagramaTorneo() {
    console.log("[GRAPHVIZ] Generando diagrama único del torneo")

    const partidos = this.analizador.getPartidos()
    const torneo = this.analizador.getTorneo()

    let dot = `digraph TorneoEliminacion {
    // Configuración general del grafo
    rankdir=TB;
    node [fontname="Arial", fontsize=10];
    edge [fontname="Arial"];
    
    // Título del torneo en óvalo amarillo
    titulo [label="${torneo.nombre || "Copa Mundial Universitaria"}\\n${torneo.sede || "Guatemala"}", 
           shape=ellipse, 
           style=filled, 
           fillcolor=gold, 
           fontsize=12, 
           fontname="Arial Bold"];
    
    // Subgrafo para Cuartos de Final
    subgraph cluster_cuartos {
        label="Cuartos de Final";
        style=filled;
        color=lightgrey;
        fontname="Arial Bold";
        fontsize=11;
        
`

    // Agregar equipos de cuartos
    const partidosCuartos = partidos.filter((p) => p.fase === "cuartos")
    const equiposCuartos = []

    partidosCuartos.forEach((partido, index) => {
      // Equipo local
      const equipoLocal = partido.equipoLocal
      const equipoVisitante = partido.equipoVisitante
      const ganadorPartido = partido.ganador

      // Determinar colores (verde para ganadores, rojo para perdedores)
      const colorLocal = ganadorPartido === equipoLocal ? "lightgreen" : "lightcoral"
      const colorVisitante = ganadorPartido === equipoVisitante ? "lightgreen" : "lightcoral"

      dot += `        cuarto_local_${index} [label="${equipoLocal}\\n${ganadorPartido === equipoLocal ? "✓" : "✗"}", 
                                           style=filled, 
                                           fillcolor=${colorLocal}, 
                                           shape=box];
        cuarto_visitante_${index} [label="${equipoVisitante}\\n${ganadorPartido === equipoVisitante ? "✓" : "✗"}", 
                                                style=filled, 
                                                fillcolor=${colorVisitante}, 
                                                shape=box];
`

      equiposCuartos.push({
        local: { nombre: equipoLocal, nodo: `cuarto_local_${index}`, ganador: ganadorPartido === equipoLocal },
        visitante: {
          nombre: equipoVisitante,
          nodo: `cuarto_visitante_${index}`,
          ganador: ganadorPartido === equipoVisitante,
        },
      })
    })

    dot += `    }
    
    // Subgrafo para Semifinal
    subgraph cluster_semifinal {
        label="Semifinal";
        style=filled;
        color=lightblue;
        fontname="Arial Bold";
        fontsize=11;
        
`

    // Agregar equipos de semifinal
    const partidosSemis = partidos.filter((p) => p.fase === "semifinal")
    const equiposSemis = []

    partidosSemis.forEach((partido, index) => {
      const equipoLocal = partido.equipoLocal
      const equipoVisitante = partido.equipoVisitante
      const ganadorPartido = partido.ganador

      const colorLocal = ganadorPartido === equipoLocal ? "lightgreen" : "lightcoral"
      const colorVisitante = ganadorPartido === equipoVisitante ? "lightgreen" : "lightcoral"

      dot += `        semi_local_${index} [label="${equipoLocal}\\n${ganadorPartido === equipoLocal ? "✓" : "✗"}", 
                                        style=filled, 
                                        fillcolor=${colorLocal}, 
                                        shape=box];
        semi_visitante_${index} [label="${equipoVisitante}\\n${ganadorPartido === equipoVisitante ? "✓" : "✗"}", 
                                              style=filled, 
                                              fillcolor=${colorVisitante}, 
                                              shape=box];
`

      equiposSemis.push({
        local: { nombre: equipoLocal, nodo: `semi_local_${index}`, ganador: ganadorPartido === equipoLocal },
        visitante: {
          nombre: equipoVisitante,
          nodo: `semi_visitante_${index}`,
          ganador: ganadorPartido === equipoVisitante,
        },
      })
    })

    dot += `    }
    
    // Subgrafo para Final
    subgraph cluster_final {
        label="Final";
        style=filled;
        color=gold;
        fontname="Arial Bold";
        fontsize=11;
        
`

    // Agregar equipos de final
    const partidoFinal = partidos.find((p) => p.fase === "final")
    if (partidoFinal) {
      const equipoLocal = partidoFinal.equipoLocal
      const equipoVisitante = partidoFinal.equipoVisitante
      const ganadorPartido = partidoFinal.ganador

      if (ganadorPartido) {
        // Si hay ganador, mostrar finalista en amarillo
        dot += `        finalista [label="${ganadorPartido}\\nFINALISTA", 
                                style=filled, 
                                fillcolor=gold, 
                                shape=box,
                                fontname="Arial Bold"];
        pendiente [label="TBD\\nPendiente", 
                   style=filled, 
                   fillcolor=lightyellow, 
                   shape=box];
`
      } else {
        // Si no hay ganador, mostrar ambos equipos
        dot += `        final_local [label="${equipoLocal}", 
                                   style=filled, 
                                   fillcolor=lightyellow, 
                                   shape=box];
        final_visitante [label="${equipoVisitante}", 
                                      style=filled, 
                                      fillcolor=lightyellow, 
                                      shape=box];
`
      }
    }

    dot += `    }
    
    finalista_final [label="finalista", 
                     shape=ellipse, 
                     style=filled, 
                     fillcolor=white];
    
    // Conexiones entre fases - organizando el flujo vertical
    titulo -> {`

    // Conectar título con cuartos
    equiposCuartos.forEach((partido, index) => {
      dot += `cuarto_local_${index} cuarto_visitante_${index} `
    })

    dot += `} [style=invis];
    
    // Conectar cuartos con semifinales (solo ganadores)
`

    // Conectar ganadores de cuartos con semifinales
    equiposCuartos.forEach((partidoCuarto, index) => {
      const semiIndex = Math.floor(index / 2)
      if (partidoCuarto.local.ganador && equiposSemis[semiIndex]) {
        dot += `    ${partidoCuarto.local.nodo} -> ${equiposSemis[semiIndex].local.nodo} [label="Ganador", color=green, penwidth=2];
`
      }
      if (partidoCuarto.visitante.ganador && equiposSemis[semiIndex]) {
        dot += `    ${partidoCuarto.visitante.nodo} -> ${equiposSemis[semiIndex].visitante.nodo} [label="Ganador", color=green, penwidth=2];
`
      }
    })

    if (partidoFinal) {
      equiposSemis.forEach((partidoSemi, index) => {
        if (partidoSemi.local.ganador) {
          dot += `    ${partidoSemi.local.nodo} -> finalista [label="Ganador", color=green, penwidth=2];
`
        }
        if (partidoSemi.visitante.ganador) {
          dot += `    ${partidoSemi.visitante.nodo} -> finalista [label="Ganador", color=green, penwidth=2];
`
        }
      })

      // Conectar la sección final con el nodo finalista_final
      dot += `    finalista -> finalista_final [label="Ganador", color=red, penwidth=3];
`
    }

    dot += `
}`

    return dot
  }

  descargarDiagrama(codigoDot, nombreArchivo) {
    const blob = new Blob([codigoDot], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = nombreArchivo
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log(`[GRAPHVIZ] Diagrama ${nombreArchivo} descargado`)
  }
}

// Exportar al objeto window
window.GraphvizGenerator = GraphvizGenerator

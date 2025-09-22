class Token {
  constructor(lexema, tipo, linea, columna) {
    this.lexema = lexema
    this.tipo = tipo
    this.linea = linea
    this.columna = columna
  }

  // Tipos de tokens
  static TIPOS = {
    PALABRA_RESERVADA: "Palabra Reservada",
    IDENTIFICADOR: "Identificador",
    CADENA: "Cadena",
    NUMERO: "Número",
    RESULTADO: "Resultado", // Added new token type for sports scores
    LLAVE_IZQUIERDA: "Llave Izquierda",
    LLAVE_DERECHA: "Llave Derecha",
    CORCHETE_IZQUIERDO: "Corchete Izquierdo",
    CORCHETE_DERECHO: "Corchete Derecho",
    DOS_PUNTOS: "Dos Puntos",
    COMA: "Coma",
    VS: "VS",
    GUION: "Guión",
    ATRIBUTO: "Atributo",
    POSICION: "Posición",
    ERROR: "Error",
  }

  // Palabras reservadas del lenguaje
  static PALABRAS_RESERVADAS = [
    "TORNEO",
    "EQUIPOS",
    "ELIMINACION",
    "equipo",
    "jugador",
    "partido",
    "goleador",
    "cuartos",
    "semifinal",
    "final",
    "resultado",
    "goleadores",
    "vs",
  ]

  // Atributos válidos
  static ATRIBUTOS = ["nombre", "equipos", "sede", "posicion", "numero", "edad", "resultado", "minuto"]

  // Posiciones válidas
  static POSICIONES = ["PORTERO", "DEFENSA", "MEDIOCAMPO", "DELANTERO"]

  // Método para verificar si es palabra reservada
  static esPalabraReservada(lexema) {
    for (let i = 0; i < this.PALABRAS_RESERVADAS.length; i++) {
      if (this.PALABRAS_RESERVADAS[i] === lexema) {
        return true
      }
    }
    return false
  }

  // Método para verificar si es atributo
  static esAtributo(lexema) {
    for (let i = 0; i < this.ATRIBUTOS.length; i++) {
      if (this.ATRIBUTOS[i] === lexema) {
        return true
      }
    }
    return false
  }

  // Método para verificar si es posición válida
  static esPosicion(lexema) {
    for (let i = 0; i < this.POSICIONES.length; i++) {
      if (this.POSICIONES[i] === lexema) {
        return true
      }
    }
    return false
  }

  static esNumero(lexema) {
    if (!lexema || lexema.length === 0) return false

    for (let i = 0; i < lexema.length; i++) {
      const char = lexema[i]
      if (char < "0" || char > "9") {
        return false
      }
    }

    const num = Number.parseInt(lexema, 10)
    return !isNaN(num) && num >= 0
  }

  // Método para verificar si es un resultado de partido
  static esResultado(lexema) {
    if (!lexema || lexema.length < 3) return false

    // Check if it's in quotes first
    let contenido = lexema
    if (lexema.startsWith('"') && lexema.endsWith('"')) {
      contenido = lexema.slice(1, -1)
    }

    // Check for pattern: number-number (like "3-1", "2-0", etc.)
    let tieneGuion = false
    let posicionGuion = -1

    for (let i = 0; i < contenido.length; i++) {
      if (contenido[i] === "-") {
        if (tieneGuion) return false // More than one dash
        tieneGuion = true
        posicionGuion = i
        break
      }
    }

    if (!tieneGuion || posicionGuion === 0 || posicionGuion === contenido.length - 1) {
      return false
    }

    // Check if parts before and after dash are numbers
    const parteAntes = contenido.substring(0, posicionGuion)
    const parteDespues = contenido.substring(posicionGuion + 1)

    return this.esNumero(parteAntes) && this.esNumero(parteDespues)
  }

  // Método para determinar el tipo de token
  static determinarTipo(lexema) {
    if (this.esPalabraReservada(lexema)) {
      return this.TIPOS.PALABRA_RESERVADA
    }
    if (this.esAtributo(lexema)) {
      return this.TIPOS.ATRIBUTO
    }
    if (this.esPosicion(lexema)) {
      return this.TIPOS.POSICION
    }
    if (this.esResultado(lexema)) {
      return this.TIPOS.RESULTADO
    }
    if (this.esNumero(lexema)) {
      return this.TIPOS.NUMERO
    }

    // Símbolos especiales
    switch (lexema) {
      case "{":
        return this.TIPOS.LLAVE_IZQUIERDA
      case "}":
        return this.TIPOS.LLAVE_DERECHA
      case "[":
        return this.TIPOS.CORCHETE_IZQUIERDO
      case "]":
        return this.TIPOS.CORCHETE_DERECHO
      case ":":
        return this.TIPOS.DOS_PUNTOS
      case ",":
        return this.TIPOS.COMA
      case "vs":
        return this.TIPOS.VS
      case "-":
        return this.TIPOS.GUION
      default:
        // Si está entre comillas, es un resultado
        if (lexema.startsWith('"') && lexema.endsWith('"')) {
          return this.TIPOS.RESULTADO
        }
        // Si no es ninguno de los anteriores, es un identificador
        return this.TIPOS.IDENTIFICADOR
    }
  }
}

// Clase para manejar errores léxicos
class ErrorLexico {
  constructor(lexema, tipoError, descripcion, linea, columna) {
    this.lexema = lexema
    this.tipoError = tipoError
    this.descripcion = descripcion
    this.linea = linea
    this.columna = columna
  }

  static TIPOS_ERROR = {
    TOKEN_INVALIDO: "Token inválido",
    FALTA_SIMBOLO: "Falta de símbolo esperado",
    FORMATO_INCORRECTO: "Formato incorrecto",
    COMILLAS_INCORRECTAS: "Uso incorrecto de comillas",
    PARENTESIS_INCORRECTOS: "Uso incorrecto de paréntesis",
  }
}

window.Token = Token
window.ErrorLexico = ErrorLexico

class Lexer {
  constructor(texto) {
    this.texto = texto
    this.pos = 0
    this.linea = 1
    this.columna = 1
    this.estado = "INICIAL"
    this.tokens = []
    this.errores = []
    this.buffer = ""

    console.log("[LEXER] Inicializando analizador léxico")
    console.log("[LEXER] Texto a analizar:", texto.substring(0, 100) + "...")
  }

  // Método para avanzar en el texto
  avanzar() {
    if (this.pos < this.texto.length) {
      if (this.texto[this.pos] === "\n") {
        this.linea++
        this.columna = 1
      } else {
        this.columna++
      }
      this.pos++
    }
  }

  // Método para obtener el carácter actual
  caracterActual() {
    if (this.pos >= this.texto.length) {
      return null
    }
    return this.texto[this.pos]
  }

  // Método para mirar el siguiente carácter sin avanzar
  siguienteCaracter() {
    if (this.pos + 1 >= this.texto.length) {
      return null
    }
    return this.texto[this.pos + 1]
  }

  // Método para omitir espacios en blanco
  omitirEspacios() {
    while (this.caracterActual() && this.esEspacio(this.caracterActual())) {
      this.avanzar()
    }
  }

  // Método para leer una cadena entre comillas
  leerCadena() {
    let cadena = ""
    const lineaInicio = this.linea
    const columnaInicio = this.columna

    // Consumir la comilla inicial
    cadena += this.caracterActual()
    this.avanzar()

    while (this.caracterActual() && this.caracterActual() !== '"') {
      cadena += this.caracterActual()
      this.avanzar()
    }

    if (this.caracterActual() === '"') {
      cadena += this.caracterActual()
      this.avanzar()
      return new window.Token(cadena, window.Token.TIPOS.CADENA, lineaInicio, columnaInicio)
    } else {
      // Error: cadena sin cerrar
      this.errores.push(
        new window.ErrorLexico(
          cadena,
          window.ErrorLexico.TIPOS_ERROR.COMILLAS_INCORRECTAS,
          "Cadena sin cerrar",
          lineaInicio,
          columnaInicio,
        ),
      )
      return null
    }
  }

  // Método para leer un número
  leerNumero() {
    let numero = ""
    const lineaInicio = this.linea
    const columnaInicio = this.columna

    while (this.caracterActual() && this.esDigito(this.caracterActual())) {
      numero += this.caracterActual()
      this.avanzar()
    }

    return new window.Token(numero, window.Token.TIPOS.NUMERO, lineaInicio, columnaInicio)
  }

  // Método para leer un identificador o palabra reservada
  leerIdentificador() {
    let identificador = ""
    const lineaInicio = this.linea
    const columnaInicio = this.columna

    while (this.caracterActual() && this.esLetra(this.caracterActual())) {
      identificador += this.caracterActual()
      this.avanzar()
    }

    const tipo = window.Token.determinarTipo(identificador)
    return new window.Token(identificador, tipo, lineaInicio, columnaInicio)
  }

  // Método para leer resultado (formato X-Y)
  leerResultado() {
    let resultado = ""
    const lineaInicio = this.linea
    const columnaInicio = this.columna

    // Leer primer número
    while (this.caracterActual() && this.esDigito(this.caracterActual())) {
      resultado += this.caracterActual()
      this.avanzar()
    }

    // Verificar guión
    if (this.caracterActual() === "-") {
      resultado += this.caracterActual()
      this.avanzar()

      // Leer segundo número
      while (this.caracterActual() && this.esDigito(this.caracterActual())) {
        resultado += this.caracterActual()
        this.avanzar()
      }

      return new window.Token(resultado, window.Token.TIPOS.IDENTIFICADOR, lineaInicio, columnaInicio)
    } else {
      // Error: formato incorrecto
      this.errores.push(
        new window.ErrorLexico(
          resultado,
          window.ErrorLexico.TIPOS_ERROR.FORMATO_INCORRECTO,
          "Resultado de partido incompleto",
          lineaInicio,
          columnaInicio,
        ),
      )
      return null
    }
  }

  // Método principal de análisis
  analizar() {
    console.log("[LEXER] Iniciando análisis léxico")

    while (this.pos < this.texto.length) {
      this.omitirEspacios()

      if (this.pos >= this.texto.length) break

      const caracter = this.caracterActual()
      const lineaActual = this.linea
      const columnaActual = this.columna

      // Analizar según el carácter actual
      if (caracter === '"') {
        const token = this.leerCadena()
        if (token) {
          this.tokens.push(token)
          console.log("[LEXER] Token encontrado:", token.lexema, "-", token.tipo)
        }
      } else if (this.esDigito(caracter)) {
        // Verificar si es un resultado (número-número)
        let posTemp = this.pos
        const lineaTemp = this.linea
        const columnaTemp = this.columna

        // Leer números y verificar si hay guión
        let esResultado = false
        while (posTemp < this.texto.length && this.esDigito(this.texto[posTemp])) {
          posTemp++
        }
        if (posTemp < this.texto.length && this.texto[posTemp] === "-") {
          posTemp++
          if (posTemp < this.texto.length && this.esDigito(this.texto[posTemp])) {
            esResultado = true
          }
        }

        if (esResultado) {
          const token = this.leerResultado()
          if (token) {
            this.tokens.push(token)
            console.log("[LEXER] Token encontrado:", token.lexema, "-", token.tipo)
          }
        } else {
          const token = this.leerNumero()
          this.tokens.push(token)
          console.log("[LEXER] Token encontrado:", token.lexema, "-", token.tipo)
        }
      } else if (this.esLetra(caracter)) {
        const token = this.leerIdentificador()
        this.tokens.push(token)
        console.log("[LEXER] Token encontrado:", token.lexema, "-", token.tipo)
      } else {
        // Símbolos especiales
        const simbolo = caracter
        this.avanzar()

        const tipo = window.Token.determinarTipo(simbolo)
        if (tipo !== window.Token.TIPOS.ERROR) {
          const token = new window.Token(simbolo, tipo, lineaActual, columnaActual)
          this.tokens.push(token)
          console.log("[LEXER] Token encontrado:", token.lexema, "-", token.tipo)
        } else {
          // Error: carácter no reconocido
          this.errores.push(
            new window.ErrorLexico(
              simbolo,
              window.ErrorLexico.TIPOS_ERROR.TOKEN_INVALIDO,
              "Carácter no reconocido",
              lineaActual,
              columnaActual,
            ),
          )
          console.log("[LEXER] Error encontrado:", simbolo, "en línea", lineaActual, "columna", columnaActual)
        }
      }
    }

    console.log("[LEXER] Análisis completado")
    console.log("[LEXER] Total de tokens:", this.tokens.length)
    console.log("[LEXER] Total de errores:", this.errores.length)

    return {
      tokens: this.tokens,
      errores: this.errores,
    }
  }

  // Método para obtener tokens
  getTokens() {
    return this.tokens
  }

  // Método para obtener errores
  getErrores() {
    return this.errores
  }

  // Método manual para verificar espacios
  esEspacio(caracter) {
    return caracter === " " || caracter === "\t" || caracter === "\n" || caracter === "\r"
  }

  // Método manual para verificar dígitos
  esDigito(caracter) {
    return caracter >= "0" && caracter <= "9"
  }

  // Método manual para verificar letras
  esLetra(caracter) {
    const codigo = caracter.charCodeAt(0)
    return (
      (codigo >= 65 && codigo <= 90) || // A-Z
      (codigo >= 97 && codigo <= 122)  // a-z
    )
  }
}

window.Lexer = Lexer


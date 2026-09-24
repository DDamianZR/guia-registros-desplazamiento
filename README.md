# Guía de estudio · Registros de desplazamiento (DSD)

Guía de estudio interactiva sobre **registros de desplazamiento** (shift registers) para el primer examen de **Diseño de Sistemas Digitales** (Sexto Semestre). Basada en el cuestionario del **Capítulo 9 de Floyd**, *Fundamentos de Sistemas Digitales*.

Hecha para **entender de verdad** los temas —con analogías, un simulador y el cuestionario resuelto y explicado— y pensada para repasar sin perder el foco.

## 🔗 Ver la guía

Página publicada en GitHub Pages: **(se agrega el enlace tras el despliegue)**

## 📚 Qué incluye

- **Empieza aquí** — lo esencial que sí o sí cae en el examen.
- **Conceptos** — qué es un registro, por qué es memoria, capacidad de almacenamiento.
- **Los 4 tipos** — SISO, SIPO, PISO, PIPO (con el truco para las siglas).
- **Serie vs Paralelo** — la distinción que más cae, con tabla comparativa.
- **Simulador interactivo** — mete bits y ve cómo se desplazan.
- **Cálculos de tiempo** — fórmulas, ejemplos resueltos y calculadora.
- **Contadores** — anillo (módulo = n) y Johnson (módulo = 2n), con animación.
- **Aplicaciones** — retardo, conversión serie↔paralelo, codificador de teclado.
- **Cuestionario resuelto** — las 10 preguntas de opción múltiple, interactivas.
- **Diagramas de tiempo** — el método universal + problemas 5–8 resueltos.
- **Chuleta final** — repaso de 3 minutos antes de entrar.

## 🛠️ Estructura

```
.
├── index.html        # Contenido de la guía
├── css/styles.css    # Estilos (tema claro/oscuro)
└── js/app.js         # Simulador, calculadora, contadores y cuestionario
```

Es un sitio estático: no necesita servidor. Puedes abrir `index.html` directo en el navegador.

## ⚠️ Nota sobre las figuras

Las secuencias de bits de *entrada* de los diagramas de tiempo (problemas 5–8) se leyeron de las figuras escaneadas del libro. El **método y los cálculos son correctos**; verifica cada secuencia contra tu figura y, si algún bit no cuadra, corrígelo (la salida se recorre igual).

---

Hecha para estudiar y compartir. ¡Mucho éxito en el examen! 🚀

function logDestacado() {
  const stack = new Error().stack;
  const match = stack ? stack.split('\n')[2]?.match(/at\s+([^\s(]+)/) : null;
  const nombreFuncion = match ? match[1] : 'el ámbito global';

  // Un solo estilo amarillo brillante y texto en negrita
  const estilo = 'background: #FFEB3B; color: #000; padding: 2px 5px; font-weight: bold; font-size: 12px;';

  console.log(`%cEstoy en la función: ${nombreFuncion}`, estilo);
}


function mostrarEnConsola(...args) {
  // Llama primero a la traza visual
  if (typeof window.logDestacado === 'function') {
    window.logDestacado();
  }

  // Muestra los valores pasados
  if (args.length === 1) {
    console.log(args[0]);
  } else if (args.length > 1) {
    console.log(...args);
  }
}

// Exposición global
window.mostrarEnConsola = mostrarEnConsola;


// Lo expones de forma global
window.logDestacado = logDestacado;
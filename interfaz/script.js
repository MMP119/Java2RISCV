import { parse as parseInterpreter } from '../interprete/analizador/analizador.js';
import { InterpreterVisitor} from '../interprete/patron/interprete.js';
import { obtenerErrores, limpiarErrores, obtenerErroresHTML, registrarError } from '../interprete/global/errores.js';
import { obtenerSimbolos, limpiarSimbolos, obtenerSimbolosHTML } from '../interprete/global/simbolos.js';

// para risc-v
import { parse as parseCompiler } from '../RISC-V/analizador/analizador.js';
import { CompilerVisitor } from '../RISC-V/compilador/compilador.js';


// modo personalizado para RISC-V
CodeMirror.defineSimpleMode("riscv", {
    start: [
        // Instrucciones aritméticas, lógicas, de carga/almacenamiento, control de flujo, etc.
        { regex: /\b(?:add|sub|mul|mulh|mulhsu|mulhu|div|divu|rem|remu|addi|li|la|j|slli|slti|sltiu|xori|ori|andi|srai|srli|lb|lh|lw|lbu|lhu|sb|sh|sw|beq|bne|blt|bge|bltu|bgeu|jal|jalr|ecall|ebreak|lui|auipc|fence|fence.i|csrrw|csrrs|csrrc|csrrwi|csrrsi|csrrci|sll|srl|sra|xor|or|and|slt|sltu|mv)\b/, token: "keyword" },

        // Registros RISC-V
        { regex: /\b(?:zero|ra|sp|gp|tp|t[0-6]|s[0-11]|a[0-7]|pc)\b/, token: "variable-3" },  // Cambiado a 'variable-3' para otro color

        // Comentarios
        { regex: /#.*/, token: "comment" },

        // Números (decimales, hexadecimales, binarios)
        { regex: /\b\d+\b/, token: "number" },
        { regex: /\b0x[0-9a-fA-F]+\b/, token: "number" },
        { regex: /\b0b[01]+\b/, token: "number" },

        // Etiquetas y saltos
        { regex: /[a-zA-Z_]\w*:/, token: "atom" },
    ]
});

// Inicializa CodeMirror en el textarea con id 'codeInput'
var editor = CodeMirror.fromTextArea(document.getElementById('codeInput'), {
    lineNumbers: true,
    mode: 'text/x-java', // Modo Java
    theme: "dracula",
    viewportMargin: Infinity, // asegura que todo el contenido sea visible
});

// Inicializa CodeMirror en el textarea con id 'consoleOutput'
var consoleEditor = CodeMirror.fromTextArea(document.getElementById('consoleOutput'), {
    lineNumbers: true,
    mode: "riscv", //modo ensamblador
    theme: "dracula",
    readOnly: true,
    viewportMargin: Infinity,
});



//garbage collector
const content = localStorage.getItem('content')
editor.setValue(content || "");

// save content in local storage
editor.on('change', (editor) => {
    const content = editor.getValue()
    localStorage.setItem('content', content)
});


//funcion para el boton 'open', abre un archivo
document.getElementById('openButton').addEventListener('click', function() {
    var input = document.createElement('input'); //crea un input
    input.type = 'file';    //tipo file
    input.onchange = e => { //cuando cambia el input
        var file = e.target.files[0]; //obtiene el archivo
        var reader = new FileReader(); //crea un lector de archivos
        reader.readAsText(file,'UTF-8'); //lee el archivo
        reader.onload = readerEvent => { //cuando termina de leer
            var content = readerEvent.target.result; //obtiene el contenido
            editor.setValue(content); //pone el contenido en el editor
        }
    }
    input.click(); //hace click en el input
});


// función para el botón 'Run'
document.getElementById('runButton').addEventListener('click', () => {

    limpiarErrores(); // Limpiar errores anteriores
    limpiarSimbolos(); // Limpiar tabla de símbolos
    const code = editor.getValue();

    try {
        const ast = parseInterpreter(code); // analizar el código

        const interpretacion = new InterpreterVisitor(); // crear un visitante

        // Verificar si el AST es un arreglo o un solo nodo
        if (Array.isArray(ast)) {
            ast.forEach(nodo => nodo.accept(interpretacion));
        } else {
            ast.accept(interpretacion); // Si es un solo nodo
        }

        //let output = interpretacion.salida;
        let output = "";
        const erroes = obtenerErrores();
        let parseo = false;
        if(erroes.length > 0){
            erroes.forEach(error => {
                if(error.mensaje === 'No se puede dividir entre 0'){
                    console.log(error)
                    parseo = true; //si hay un error de division entre 0 se puede parsear, otro error no
                }
            });
        }
        if(erroes.length > 0 && !parseo){
            output += '-------------->    ERROR FATAL, NO SE PUEDE COMPILAR   <--------------\n\n';
            output += '\n\n============================== ERRORES ==============================\n';
            erroes.forEach(error => {
                output += `Error: ${error.mensaje}\nLínea: ${error.linea}, Columna: ${error.columna}\n`;
            });
            consoleEditor.setValue(output);
        }else{

                const astCompiler = parseCompiler(code); // analizar el código

                const compilador = new CompilerVisitor(); // crear un visitante

                astCompiler.forEach(sentencia => sentencia.accept(compilador));

                output =  compilador.code.toString();

                consoleEditor.setValue(output);
    
            }     

    } catch (e) {
        if (e.name === 'SyntaxError') {
            // Mostrar el error de sintaxis en la consola
            consoleEditor.setValue(
                `Error de sintaxis: ${e.message}\nLínea: ${e.location.start.line}, Columna: ${e.location.start.column}`
            );

            //agrergar el error a la lista de errores
            registrarError('Sintáctico', e.message, e.location.start.line, e.location.start.column);
        } else {
            // Manejar otros posibles errores
            const errorMessage = e.location 
            ? `Error: ${e.message}\nLínea: ${e.location.start.line}, Columna: ${e.location.start.column}`
            : `Error: ${e.message}`;

            consoleEditor.setValue(errorMessage);

            consoleEditor.setValue(
                `Error: ${e.message}\n`+
                `lase/Error: ${e.name}\n`+
                `Stack: ${e.stack}`
            );

        }
    }
});

// función para el botón 'Clear'
document.getElementById('clearButton').addEventListener('click', function() {
    editor.setValue('');
    consoleEditor.setValue('');
});


// funcion para el boton 'save', guarda el archivo
document.getElementById('saveButton').addEventListener('click', function() {
    // Solicitar al usuario el nombre del archivo
    let fileName = window.prompt('Ingrese el nombre del archivo:', '');
    
    // Si el usuario cancela o no ingresa un nombre, salir de la función
    if (fileName === null || fileName === '') {
        return; // No hacer nada si el usuario cancela
    }
    
    // Obtener el contenido del editor
    const codeContent = editor.getValue();

    // Asegurar que el archivo tenga una extensión
    if (!fileName.endsWith('.aok')) {
        fileName += '.aok';
    }

    // Crear un blob con el contenido del editor
    const blob = new Blob([codeContent], { type: 'text/plain' });

    // Crear un enlace de descarga
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);

    // Asignar el nombre ingresado por el usuario al archivo
    downloadLink.download = fileName;

    // Simular un clic en el enlace para iniciar la descarga
    downloadLink.click();
});


//boton para guardar la salida en consola
document.getElementById('downloadButton').addEventListener('click', function() {

    // Solicitar al usuario el nombre del archivo
    let fileName = window.prompt('Ingrese el nombre del archivo:', '');
    
    // Si el usuario cancela o no ingresa un nombre, salir de la función
    if (fileName === null || fileName === '') {
        return; // No hacer nada si el usuario cancela
    }
    
    // Obtener el contenido del editor
    const codeContent = consoleEditor.getValue();

    // Asegurar que el archivo tenga una extensión
    if (!fileName.endsWith('.s')) {
        fileName += '.s';
    }

    // Crear un blob con el contenido del editor
    const blob = new Blob([codeContent], { type: 'text/plain' });

    // Crear un enlace de descarga
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);

    // Asignar el nombre ingresado por el usuario al archivo
    downloadLink.download = fileName;

    // Simular un clic en el enlace para iniciar la descarga
    downloadLink.click();

});


//para el erroresButton
document.getElementById('erroresButton').addEventListener('click', function() {
    obtenerErroresHTML();
});


//para el botón de tabla de simbolos
document.getElementById('simbolosButton').addEventListener('click', function() {
    obtenerSimbolosHTML();
});
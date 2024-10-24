import { registers as r, floatRegisters as f } from "../constantes/constantes.js";
import { Generador } from "../generador/generador.js";
import { BaseVisitor} from "../compilador/visitor.js"
import { registrarError } from "../../interprete/global/errores.js";
import { numberToF32 } from "../utils/utils.js";
import { FrameVisitor } from "./frame.js";
import { ReferenciaVariable } from "./nodos.js";

export class CompilerVisitor extends BaseVisitor{

    constructor(){
        super();
        this.code = new Generador();
        this.labelBreak = null;
        this.labelContinue = null;

        this.functionMetadata = {};
        this.insideFunction = false;
        this.frameDclIndex = 0;
        this.returnLabel = null;


        /**
         * @type {Expresion|null}
         */
        this.antesContinue = null;
    }


    /**
     * @type {BaseVisitor['visitExpresionStmt']}
     */
    visitExpresionStmt(node){
        node.exp.accept(this);

        //verificar si es un float, para usar los registros flotantes
        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FT0 : r.T0);
    }


    /**
     * @type {BaseVisitor['visitNumero']}
     */
    visitNumero(node){
        this.code.comment(`Primitivo: ${node.valor}`);
        this.code.pushContant({ type: node.tipo, valor: node.valor });
        this.code.comment(`Fin Primitivo: ${node.valor}`);
    }


    /**
     * @type {BaseVisitor['visitCadena']}
     */
    visitCadena(node){
        if(node.tipo == 'string'){
            this.code.comment(`Cadena: ${node.valor}`);
            this.code.pushContant({ type: node.tipo, valor: node.valor });
            this.code.comment(`Fin Cadena: ${node.valor}`);
        }
        if (node.tipo == 'char') {
            this.code.comment(`Caracter: ${node.valor}`);
            this.code.pushContant({ type: node.tipo, valor: node.valor });
            this.code.comment(`Fin Caracter: ${node.valor}`);
        }
    }


    /**
     * @type {BaseVisitor['visitBooleano']}
     */
    visitBooleano(node){
        this.code.comment(`Booleano: ${node.valor}`);
        this.code.pushContant({ type: 'boolean', valor: node.valor ? 1 : 0 });
        this.code.comment(`Fin Booleano: ${node.valor}`);
    }


    /**
     * @type {BaseVisitor['visitDeclaracionTipoVariable']}
     */

    visitDeclaracionTipoVariable(node){
        this.code.comment(`Declaracion de variable: ${node.id}`);

        if(node.exp === null && node.tipo !== null){ //para expresiones como int a; o float b;
            switch (node.tipo) {
                case 'int':
                    this.code.pushContant({ type: 'null', valor: 'null' });
                    break;
                case 'float':
                    this.code.pushContant({ type: 'null', valor: 'null' });
                    break;
                case 'char':
                    this.code.pushContant({ type: 'null', valor: 'null' });
                    break;
                case 'string':
                    this.code.pushContant({ type: 'null', valor: 'null' });
                    break;
                case 'boolean':
                    this.code.pushContant({ type: 'null', valor: 'null' });
                    break;
                default:
                    registrarError('Semántico', `Tipo de dato no soportado: ${node.tipo}`,node.location.start.line, node.location.start.column);
                    throw new Error(`Tipo de dato no soportado: ${node.tipo}`);
            }
        }else{
            node.exp.accept(this);
        }
        
        this.code.tagObject(node.id);
        this.code.comment(`Fin Declaracion de variable: ${node.id}`);
    }



    /**
     * @type {BaseVisitor['visitDeclaracionArreglo']}
     */
    visitDeclaracionArreglo(node){
        const idArreglo = node.id
        const tipoArreglo = node.tipo
        const exp = node.exp
        const tipo2 = node.tipo2
        const idArreglo2 = node.id2

        //CASO 1: Si tipo2 e id2 son null, es un arreglo como int [] a = {1,2,3,4,5};

        //CASO 2: Si id2 es null, es un arreglo como int [] a = new int[5]; y se llena con valores por defecto

        //CASO 3: Si exp es null, tipo2 es null, es una "copia de arreglo" como int [] a = b;, b es otro arreglo

        //valores por defecto segun el tipo, como para el casos como int [] a = new int[5];
        /*
        * case 'int': 0
        * case 'float': 0.0
        * case 'string': ""
        * case 'boolean': false
        * case 'char': '\u0000' (caracter nulo)
        */

        this.code.comment(`Declaracion de arreglo: ${node.id}`);

        if(tipo2 === null && idArreglo2 === null && Array.isArray(exp)){
            //caso 1, arreglos con valores explicitos como int [] a = {1,2,3,4,5};
                                                //      tipo[]idArreglo={expresion};

            this.code.comment('Declaración de arreglo con valores explícitos');

            const size = exp.length * 4;  // Cada entero ocupa 4 bytes
            const totalSize = size;  // Espacio solo para los elementos, sin compartir memoria

            // Reservar espacio en la pila para el arreglo
            this.code.addi(r.SP, r.SP, -totalSize);
            this.code.comment(`Reservando ${totalSize} bytes en el stack para ${idArreglo}`);

            // Guardar la dirección base del arreglo en T1
            this.code.add(r.T1, r.SP, r.ZERO);

            // Empujar la dirección base del arreglo al stack lógico
            this.code.pushObject({
                type: 'arreglo',
                length: size,
                typeObjects: tipoArreglo,
            });

            // Guardar los elementos en orden
            exp.forEach((valor, index) => {
                valor.accept(this);  // Generar el código para la expresión

                const isValueFloat = this.code.getTopObject().type === 'float';
                this.code.popObject(isValueFloat ? f.FT0 : r.T0);  // Obtener el valor

                const offset = index * 4;  // Offset para cada elemento
                if (isValueFloat) {
                    this.code.fsw(f.FT0, r.T1, offset);  // Guardar flotante
                } else {
                    this.code.sw(r.T0, r.T1, offset);  // Guardar entero
                }
            });

            // Etiquetar el objeto con el identificador del arreglo
            this.code.tagObject(idArreglo);

            this.code.comment(`Fin de la declaración del arreglo ${idArreglo}`);

        }else if(idArreglo2 === null && !Array.isArray(exp)){
            //caso 2, arreglos con valores por defecto como int [] a = new int[5];
                                                        // tipo[]idArreglo=new tipo2 [exp] expresion acá no es un arreglo
            
            this.code.comment('Declaracion de arreglo con valores por defecto');

            exp.accept(this); //el tamaño del arreglo está en r.T0

            this.code.comment(`Reservando ${r.T1} bytes en el stack para ${node.id}`);

            const size = exp.valor * 4; // ocupa 4 bytes

            this.code.addi(r.SP, r.SP, -size); // Reservar espacio en la pila

            this.code.pushObject({
                type: 'arreglo',
                length: size,
                typeObjects: tipoArreglo,
            });

            //para inicializar el arreglo con valores por defecto
            for (let i = 0; i < exp.valor; i++) {
                const offset = i * 4; // Desplazamiento en memoria

                switch(tipo2){

                    case 'int':
                        this.code.li(r.T0, 0); // Cargar el valor por defecto en un registro temporal
                        this.code.sw(r.T0, r.SP, offset); // Guardar el valor en memoria
                        break;
    
                    case 'float':
                        this.code.li(r.T0, 0.0); // Cargar el valor por defecto en un registro temporal
                        this.code.fcvtsw(f.FT0, r.T0); // Convertir el entero a float
                        this.code.fsw(f.FT0, r.SP, offset); // Guardar el valor en memoria
                        break;
    
                    case 'string':
                        // Inicializar con un string vacío ('\0')
                        this.code.comment('Inicializando string vacío');
                        this.code.addi(r.T0, r.HP, 0); // T0 apunta al heap (string vacío)
                        this.code.sb(r.ZERO, r.HP, 0); // Almacenar \0 en el heap
                        this.code.addi(r.HP, r.HP, 1); // Avanzar el heap
                        this.code.sw(r.T0, r.SP, offset); // Guardar puntero en memoria
                        break;
                    
                    case 'char':
                        this.code.li(r.T0, 0); // Cargar el valor por defecto en un registro temporal
                        this.code.sw(r.T0, r.SP, offset); // Guardar el valor en memoria
                        break;
    
                    case 'boolean':
                        this.code.li(r.T0, 0); // Cargar el valor por defecto en un registro temporal
                        this.code.sw(r.T0, r.SP, offset); // Guardar el valor en memoria
                        break;
    
                    default:
                        registrarError('Semántico', `Tipo de dato no soportado declaracion de arreglo`, node.location.start.line, node.location.start.column);
                        throw new Error(`Tipo de dato no soportado declaracion de arreglo`);
    
                }
            }

            this.code.tagObject(idArreglo);
            this.code.comment(`Fin Declaracion de arreglo con valores por defecto`);

        }else if (exp === null) {
            // Caso 3: Copia de arreglo (int[] a = b;)
            //tipo[]idArreglo = idArreglo2;
            this.code.comment('Declaracion de arreglo con copia de otro arreglo');
        
            //obtener la direccion base del arreglo a copiar
            idArreglo2.accept(this); //la direccion base del arreglo a copiar está en r.T0
            const arregloInfo = this.code.getTopObject();
            const tamaniobase = arregloInfo.length; //tamaño del arreglo a copiar (ya está en bytes, multiplicar por 4 para obtener el tamaño en bytes)

            //reservar espacio en la pila para el nuevo arreglo
            this.code.addi(r.SP, r.SP, -tamaniobase);
            this.code.comment(`Reservando ${tamaniobase} bytes en el stack para ${idArreglo}`);

            //guardar la direccion base del nuevo arreglo en t1
            this.code.add(r.T1, r.SP, r.ZERO);

            //empujar la direccion base del nuevo arreglo al stack logico
            this.code.pushObject({
                type: 'arreglo',
                length: tamaniobase,
                typeObjects: tipoArreglo,
            });

            //copiar los elementos del arreglo a copiar al nuevo arreglo
            for (let i = 0; i < tamaniobase/4; i++) {
                const offset = i * 4; //desplazamiento en memoria
                
                this.code.lw(r.T4, r.T0, offset); //cargar el valor del arreglo a copiar en t4
                this.code.sw(r.T4, r.T1, offset); //guardar el valor en el nuevo arreglo
                
            }

            //etiquetar el objeto con el identificador del arreglo
            this.code.tagObject(node.id);

            this.code.comment('Fin Declaracion de arreglo con copia de otro arreglo');
        }

        this.code.comment(`Fin Declaracion de arreglo: ${node.id}`);

    }


    /**
     * @type {BaseVisitor['visitArrayFunc']}
     */
    visitArrayFunc(node){

        switch (node.method) {
        
            case 'indexOf': // Retorna el índice de la primera coincidencia o -1 si no existe
                this.code.comment('Inicio Metodo indexOf');

                // Obtener el valor a buscar y guardarlo en T5
                node.exp.accept(this);  // Valor en r.T0
                this.code.mv(r.T5, r.T0);  // Guardar el valor buscado en T5

                // Obtener la referencia al arreglo
                node.id.accept(this);  // Dirección base del arreglo en r.T0
                const arregloInfo = this.code.getTopObject();
                const size = arregloInfo.length / 4;  // Número de elementos en el arreglo

                // Crear etiquetas
                const labelStart = this.code.newEtiquetaUnica('indexOf_start');
                const labelFound = this.code.newEtiquetaUnica('indexOf_found');
                const labelNoFound = this.code.newEtiquetaUnica('indexOf_no_found');
                const labelEnd = this.code.newEtiquetaUnica('indexOf_end');

                // Inicializar contador de índice (T2 = 0)
                this.code.li(r.T2, 0);

                // Cargar -1 en T3 para el caso de no encontrado
                this.code.li(r.T3, -1);

                this.code.label(labelStart);

                // Verificar si llegamos al final del arreglo
                this.code.li(r.T4, size);  // Tamaño del arreglo en T4
                this.code.bge(r.T2, r.T4, labelNoFound);  // Si T2 >= size, no encontrado

                // Calcular el offset y obtener la dirección del elemento actual
                this.code.li(r.A1, 4);  // Cada elemento ocupa 4 bytes
                this.code.mul(r.A1, r.A1, r.T2);  // A1 = índice * 4 (offset)
                this.code.add(r.A0, r.T0, r.A1);  // A0 = Dirección base + offset

                // Cargar el valor del elemento actual en T1
                this.code.lw(r.T1, r.A0, 0);  // Valor en T1

                // Comparar el valor del arreglo con el valor buscado
                this.code.beq(r.T1, r.T5, labelFound);  // Si son iguales, encontrado

                // Incrementar el índice y repetir el ciclo
                this.code.addi(r.T2, r.T2, 1);  // T2++
                this.code.j(labelStart);  // Volver al inicio

                // Si el valor fue encontrado, empujar el índice al stack
                this.code.label(labelFound);
                this.code.push(r.T2);  // Empujar el índice encontrado
                this.code.pushObject({ type: 'int', length: 4 });
                this.code.j(labelEnd);  // Saltar al final

                // Si no se encontró, empujar -1 al stack
                this.code.label(labelNoFound);
                this.code.push(r.T3);  // Empujar -1
                this.code.pushObject({ type: 'int', length: 4 });

                // Fin del método
                this.code.label(labelEnd);
                this.code.comment('Fin Metodo indexOf');
                break;

            case 'join': //Une todos los elementos del array en un string, separado por comas Ej: [1,2,3]-> “1,2,3”

                this.code.comment(`Metodo join`);
                node.id.accept(this);
                const object = this.code.getTopObject();
                this.code.pushObject({ type: 'printArregloJoin', length:object.length, typeObjects: object.typeObjects });
                this.code.comment(`Fin Metodo join`);

                break;

            case 'length': //indica la cantidad de elementos que posee el vector

                this.code.comment(`Metodo length`);

                node.id.accept(this);

                const arreglo = this.code.getTopObject()
                this.code.pushContant({ type: 'int', valor: arreglo.length/4 });       
                this.code.comment(`Fin Metodo length`);

                break;

            case 'setElement': //algo como a[0] = 5, se asigna el valor 5 al arreglo en la posición 0;

                this.code.comment('Metodo setElement');

                // Obtener el índice y guardarlo en T5
                node.exp[0].accept(this);  // Índice a modificar
                this.code.mv(r.T5, r.T0);  // Guardamos el índice en T5
            
                // Obtener el valor a asignar y guardarlo en A2
                node.exp[1].accept(this);  // Valor a asignar
                this.code.mv(r.A2, r.T0);  // Guardamos el valor en A2

                // obtener la dirección base del arreglo 
                node.id.accept(this);  // dirección base del arreglo queda en r.T0
            
                // Calcular el offset: offset = indice * 4
                this.code.li(r.T4, 4);          // Cada entero ocupa 4 bytes
                this.code.mul(r.T4, r.T5, r.T4);  // T4 = T5 * 4 (offset)
            
                // Sumar el offset a la dirección base del arreglo en A1
                this.code.add(r.A1, r.T0, r.T4);  // A1 = A1 + offset
            
                // Guardar el valor en la posición calculada
                this.code.sw(r.A2, r.A1, 0);  // Guardamos A2 en la dirección A1
            
                this.code.comment('Fin Metodo setElement');
                break;

            case 'getElement': // Obtener un valor de un arreglo como a[0]
                this.code.comment('Inicio Metodo getElement');
            
                // Obtener el índice y guardarlo en T5
                node.exp[0].accept(this);  // Evaluar el índice y dejar el resultado en r.T0
                const ind = this.code.getTopObject();
            
                if (ind.hasOwnProperty('id')) { // Si el índice es una variable
                    this.code.mv(r.T5, r.T1);  // Copiar el valor desde T1 (valor de la variable)
                } else {
                    this.code.mv(r.T5, r.T0);  // Copiar el índice directamente a T5
                }
            
                // Obtener la referencia del arreglo
                node.id.accept(this);  // Dirección base del arreglo queda en r.T0
                this.code.mv(r.T3, r.T0);  // Guardamos la dirección base en T3
                
                // Parámetros: índice en T5, dirección base del arreglo en T3
                this.code.li(r.T4, 4);           // Cada elemento ocupa 4 bytes
                this.code.mul(r.T4, r.T5, r.T4); // T4 = T5 * 4 (offset)

                // Sumar el offset a la dirección base del arreglo en A1
                this.code.add(r.A1, r.T3, r.T4); // A1 = Dirección base + offset

                // Cargar el valor del arreglo en T2
                this.code.lw(r.T2, r.A1, 0);     // T2 = Mem[A1]
                this.code.printInt(r.T2);

                this.code.comment('Fin Metodo getElement');
                break;

            default:
                break;
        }

    }


    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitOperacionBinaria(node){
        this.code.comment(`Operacion: ${node.op}`);

        node.izq.accept(this); // izq |
        node.der.accept(this); // izq | der

        
        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT0 :r.T0); // der
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT1 :r.T1); // izq

        if ((izq.type === 'string' && der.type === 'string') && node.op === '+') {
            this.code.add(r.A0, r.ZERO, r.T1);
            this.code.add(r.A1, r.ZERO, r.T0);
            this.code.callBuiltin('concatString');
            this.code.pushObject({ type: 'string', length: 4 });
            return;
        }

        if (isIzqFloat || isDerFloat) {
            if (!isIzqFloat) this.code.fcvtsw(f.FT1, r.T1);
            if (!isDerFloat) this.code.fcvtsw(f.FT0, r.T0);

            switch (node.op) {
                case '+':
                    this.code.fadd(f.FT0, f.FT0, f.FT1);
                    break;
                case '-':
                    this.code.fsub(f.FT0, f.FT1, f.FT0);
                    break;
                case '*':
                    this.code.fmul(f.FT0, f.FT0, f.FT1);
                    break;
                case '/':
                    this.code.fdiv(f.FT0, f.FT1, f.FT0);
                    break;
                case '%':
                    this.code.frem(f.FT0, f.FT1, f.FT0);
                    break;
                case '==':
                    this.code.callBuiltin('igualdadFloat');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return;
                case '!=':
                    this.code.callBuiltin('desigualdadFloat');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return;
                case '>':
                    this.code.callBuiltin('mayorQueFloat');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return;
                case '<':
                    this.code.callBuiltin('menorQueFloat');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return;
                case '>=':
                    this.code.callBuiltin('mayorIgualFloat');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return;
                case '<=':
                    this.code.callBuiltin('menorIgualFloat');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return;                    
                
            }

            this.code.pushFloat(f.FT0);
            this.code.pushObject({ type: 'float', length: 4 });
            return;
        }

        switch (node.op) {
            case '+':
                this.code.add(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
                break;
            case '-':
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
                break;
            case '*':
                this.code.mul(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
                break;
            case '/':
                this.code.div(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
                break;
            case '%':               
                this.code.rem(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
                break;
            case '==':

                if (izq.type === 'string' && der.type === 'string') {
                    this.code.callBuiltin('igualdadStrings');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return;
                }

                this.code.callBuiltin('igualdad');
                this.code.pushObject({ type: 'boolean', length: 4 });
                break;
            case '!=':

                if (izq.type === 'string' && der.type === 'string') {
                    this.code.callBuiltin('desigualdadStrings');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return;
                }

                this.code.callBuiltin('desigualdad');
                this.code.pushObject({ type: 'boolean', length: 4 });
                break;
            case '>':
                this.code.callBuiltin('mayorQue');
                this.code.pushObject({ type: 'boolean', length: 4 });
                break;
            case '<':
                this.code.callBuiltin('menorQue');
                this.code.pushObject({ type: 'boolean', length: 4 });
                break;
            case '>=':
                this.code.callBuiltin('mayorIgual');
                this.code.pushObject({ type: 'boolean', length: 4 });
                break;
            case '<=':
                this.code.callBuiltin('menorIgual');
                this.code.pushObject({ type: 'boolean', length: 4 });
                break;
            case '&&':
                this.code.comment('Comparación AND');
                this.code.and(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.comment('Fin Comparación AND');
                this.code.pushObject({ type: 'boolean', length: 4 });
                break;
            case '||':
                this.code.comment('Comparación OR');
                this.code.or(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.comment('Fin Comparación OR');
                this.code.pushObject({ type: 'boolean', length: 4 });
                break;
        }
    }


    
    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    visitOperacionUnaria(node){

        node.exp.accept(this);

        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat?f.FT0:r.T0);

        switch (node.op) {
            case '-':
                this.code.comment('Operación negación');
                if(isFloat){
                    
                     // Cargar cero en FT1
                    this.code.li(r.T0, 0); // Cargar cero en un registro temporal
                    this.code.fcvtsw(f.FT1, r.T0); // Convertir el entero cero a float en FT1
                    this.code.fsub(f.FT0, f.FT1, f.FT0);
                    this.code.pushFloat(f.FT0);
                    this.code.pushObject({ type: 'float', length: 4 });

                }else{

                    this.code.li(r.T1, 0);
                    this.code.sub(r.T0, r.T1, r.T0);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });

                }
                this.code.comment('FIN Operación negación');
                break;
                
            case '!':
                this.code.comment('Comparación NOT');
                this.code.li(r.T1, 1); //cargar 1 en t1(true)
                this.code.xor(r.T0, r.T0, r.T1); //xor para negar t0 = t0 xor t1 (invierte el valor de t0)
                this.code.push(r.T0);
                this.code.pushObject({ type: 'boolean', length: 4 });
                this.code.comment('FIN NOT');
                break;
        }
    
    }


    /**
     * @type {BaseVisitor['visitAgrupacion']}
     */
    visitAgrupacion(node){
        return node.exp.accept(this);
    }



    /**
     * @type {BaseVisitor['visitPrint']}
     */
    visitPrint(node) {
        this.code.comment('Print');
        
        let resultado = "";
        
        node.exp.forEach((exp) => {
            const valor = exp.accept(this);
            resultado += valor;
            
            // Pop object y luego decidir el tipo
            const info = this.code.getTopObject()
            const isFloat = info.type === 'float'; 
            const object = this.code.popObject(isFloat ? f.FA0 : r.A0);
            
            const tipoPrint = {
                'int': () => this.code.printInt(),
                'float':() => this.code.printFloat(),
                'string': () => this.code.printString(),
                'boolean': () => this.code.callBuiltin('printBool'),
                'char' : () => this.code.printChar(),
                'null' : () => this.code.printNull(),
                'arreglo' : () => this.code.printArray(object),
                'printArregloJoin' : () => this.code.printArregloJoin(object),
            };
            
            // Llama a la función correcta según el tipo de objeto
            if (tipoPrint[object.type]) {
                tipoPrint[object.type]();
            } else {
                throw new Error(`Tipo de dato no soportado para imprimir: ${object.type}`);
            }
            
            // si es el ultimo del arreglo de expresiones, se imprime un salto de linea
            if(exp === node.exp[node.exp.length - 1]){
                this.code.callBuiltin('printNewLine');
            }

        });
    }



    /**
     * @type {BaseVisitor['visitAsignacion']}
     */
    visitAsignacion(node){
        this.code.comment(`Asignacion de variable: ${node.id}`);

        node.asgn.accept(this);
        const isValueFloat = this.code.getTopObject().type === 'float';
        const valueObject = this.code.popObject(isValueFloat ? f.FT0 : r.T0);
        const [offset, variableObject] = this.code.getObject(node.id);

        if (this.insideFunction) {
            this.code.addi(r.T1, r.FP, -variableObject.offset * 4); 
            this.code.sw(r.T0, r.T1);
            return
        }

        if (isValueFloat) {

            this.code.addi(r.T1, r.SP, offset);
            this.code.fsw(f.FT0, r.T1);
            this.code.pushFloat(f.FT0);
        
        }else{

            this.code.addi(r.T1, r.SP, offset);
            this.code.sw(r.T0, r.T1);
            this.code.push(r.T0);

        }

        variableObject.type = valueObject.type;
        this.code.pushObject(valueObject);

        this.code.comment(`Fin Asignacion de variable: ${node.id}`);

    }



    /**
     * @type {BaseVisitor['visitReferenciaVariable']}
     */
    visitReferenciaVariable(node){
        this.code.comment(`Referencia a variable ${node.id}: ${JSON.stringify(this.code.objectStack)}`);

        const [offset, variableObject] = this.code.getObject(node.id);
        //console.log('variableObject', variableObject, 'offset', offset);
        
        if (this.insideFunction) {
            //console.log('entra como referencia a variable en funcion');
            this.code.addi(r.T1, r.FP, -variableObject.offset * 4);
            this.code.lw(r.T0, r.T1);
            this.code.push(r.T0);
            this.code.pushObject({ ...variableObject, id: undefined });
            return
        }

        this.code.addi(r.T0, r.SP, offset);

        // Verificar si es un arreglo y empujar la dirección base
        if (variableObject.type === 'arreglo') {
            this.code.push(r.T0); // Empujar la dirección base
        } else {
            this.code.lw(r.T1, r.T0, 0); // Cargar el valor en T1
            this.code.push(r.T1); // Empujar el valor al stack
        }

        this.code.pushObject({ ...variableObject, id: undefined });
        this.code.comment(`Fin referencia de variable ${node.id}: ${JSON.stringify(this.code.objectStack)}`);
    }




    /**
     * @type {BaseVisitor['visitBloque']}
     */
    visitBloque(node){
        this.code.comment('Inicio de bloque');

        this.code.newScope();

        node.dcls.forEach(d => d.accept(this));

        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.code.comment('Fin de bloque');
    }



    /**
     * @type {BaseVisitor['visitIf']}
     */
    visitIf(node) {
        this.code.comment('Inicio de If');

        // Visitar la condición y generar el código correspondiente
        node.cond.accept(this);
        
        // Pop the result of the condition into a register

        //verificar si es float, para usar los registros flotantes
        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FT0 : r.T0); // El resultado de la condición está en T0 (1 o 0)

        // Generar etiquetas únicas para manejar el flujo
        const labelTrue = this.code.newEtiquetaUnica('if_true');
        const labelEnd = this.code.newEtiquetaUnica('if_end');
        const labelFalse = node.stmtFalse ? this.code.newEtiquetaUnica('else') : null;

        // Si T0 es verdadero (1), saltar a la etiqueta de la rama verdadera
        this.code.comment('Comparación de If');
        this.code.bne(r.T0, r.ZERO, labelTrue);

        // Si hay una rama falsa, saltar a ella
        if (labelFalse) {
            this.code.j(labelFalse);
        } else {
            // Si no hay rama falsa, saltar directamente al final
            this.code.j(labelEnd);
        }

        // Etiqueta para la rama verdadera
        this.code.label(labelTrue);
        node.stmtTrue.accept(this); // Ejecutar el bloque si la condición es verdadera

        // Saltar al final del `if` después de ejecutar el bloque verdadero
        this.code.j(labelEnd);

        // Rama falsa (opcional)
        if (labelFalse) {
            this.code.label(labelFalse);
            node.stmtFalse.accept(this); // Ejecutar el bloque si la condición es falsa
        }

        // Etiqueta final
        this.code.label(labelEnd);

        this.code.comment('Fin de If');
    }



    /**
     * @type {BaseVisitor['visitWhile']}
     */
    visitWhile(node) {

        this.code.comment('Inicio de While');

        // Generar etiquetas únicas para manejar el flujo
        const labelStart = this.code.newEtiquetaUnica('while_start');
        const labelEnd = this.code.newEtiquetaUnica('while_end');
        const labelContinue = labelStart; // La etiqueta de continue debe saltar a la reevaluación de la condición

        // Etiqueta de inicio
        this.code.label(labelStart);

        // Visitar la condición y generar el código correspondiente
        node.cond.accept(this);

        // Pop the result of the condition into a register
        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FT0 : r.T0);

        // Si T0 es falso (0), saltar al final del bucle
        this.code.comment('Comparación de While');
        this.code.beq(r.T0, r.ZERO, labelEnd); // Si la condición es falsa, saltar al final, si no, continuar

        // Guardar las etiquetas de break y continue en el contexto actual
        const oldLabelBreak = this.labelBreak;
        const oldLabelContinue = this.labelContinue;

        // Asignar las nuevas etiquetas para este bucle
        this.labelBreak = labelEnd;
        this.labelContinue = labelContinue;

        // Ejecutar el bloque del bucle
        node.stmt.accept(this);
        
        // Restaurar las etiquetas anteriores
        this.labelBreak = oldLabelBreak;
        this.labelContinue = oldLabelContinue;

        // Volver al inicio del bucle
        this.code.j(labelStart);

        // Etiqueta final
        this.code.label(labelEnd);

        this.code.comment('Fin de While');    
    
    }



    /**
     * @type {BaseVisitor['visitFor']}
     */
    visitFor(node) {

        this.code.comment('Inicio de For');

        this.code.newScope(); // Crear un nuevo ámbito para las variables del bucle

        // Inicialización
        node.init.accept(this);

        // Generar etiquetas únicas
        const labelStart = this.code.newEtiquetaUnica('for_start');
        const labelEnd = this.code.newEtiquetaUnica('for_end');
        const labelContinue = this.code.newEtiquetaUnica('for_continue'); // La etiqueta de continue debe saltar al incremento

        // Etiqueta de inicio
        this.code.label(labelStart);

        // Evaluar la condición
        node.cond.accept(this);

        // Pop the result of the condition into a register
        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FT0 : r.T0);

        // Si T0 es falso (0), saltar al final del bucle
        this.code.comment('Comparación de For');
        this.code.beq(r.T0, r.ZERO, labelEnd); // Si la condición es falsa, saltar al final


        const oldLabelBreak = this.labelBreak;
        const oldLabelContinue = this.labelContinue;

        // Asignar las nuevas etiquetas para este bucle
        this.labelBreak = labelEnd;
        this.labelContinue = labelContinue;

        // Ejecutar el cuerpo del bucle
        node.stmt.accept(this);

        // Incremento
        this.code.label(this.labelContinue);
        node.inc.accept(this);
        this.code.popObject(isFloat ? f.FT0 : r.T0); // Para que no quede en la pila

        // Saltar al inicio para reevaluar la condición
        this.code.j(labelStart);

        // Restaurar las etiquetas anteriores
        this.labelBreak = oldLabelBreak;
        this.labelContinue = oldLabelContinue;

        // Etiqueta final
        this.code.label(labelEnd);

        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.code.comment('Fin de For');
    }

    

    /**
     * @type {BaseVisitor['visitSwitch']}
     */
    visitSwitch(node) {
        this.code.comment('Inicio de Switch');

        // Evaluar la expresión del switch y guardar el valor en T0
        node.exp.accept(this);
        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FT0 : r.T0); // El valor del switch está en T0

        // Copiar el valor de la expresión en t1
        this.code.comment('Copiar el valor de la expresión en t1');
        this.code.mv(r.T1, r.T0); // t1 = t0

        const labelEnd = this.code.newEtiquetaUnica('switch_end');
        let labelDefault = null; // Etiqueta para el bloque default
        const caseLabels = node.cases.map(() => this.code.newEtiquetaUnica('case')); // Etiquetas para cada case
        const oldLabelBreak = this.labelBreak; // Guardar la etiqueta de break actual

        this.labelBreak = labelEnd; // La etiqueta de break debe saltar al final del switch

        let defaultJumpAdded = false; // Para evitar saltar al default innecesariamente

        // Comparar el valor del switch con cada case
        node.cases.forEach((caseNode, index) => {
            this.code.comment(`Caso ${index + 1}`);

            caseNode.exp.accept(this);
            const isFloat = this.code.getTopObject().type === 'float';
            this.code.popObject(isFloat ? f.FT0 : r.T0); // El valor del case está en T0

            // Si coincide, saltar a este case
            this.code.beq(r.T1, r.T0, caseLabels[index]);
        });

        // Si existe un default, generar la etiqueta para el default
        if (node.defaultClause) {
            labelDefault = this.code.newEtiquetaUnica('default');
            this.code.j(labelDefault); // Saltar al default si ningún case coincide
            defaultJumpAdded = true;
        }

        // Si no hay default, saltar directamente al final
        if (!defaultJumpAdded) {
            this.code.j(labelEnd);
        }

        // Generar los bloques de código para cada case
        node.cases.forEach((caseNode, index) => {
            this.code.label(caseLabels[index]); // Etiqueta del case

            // Ejecutar el código del case
            caseNode.stmt.forEach(stmt => {
                stmt.accept(this);
            });
            
            //si es el ultimo case y no hay break, saltar al final así no se ejecuta el default
            if(index === node.cases.length - 1){
                this.code.j(labelEnd);
            }

        });

        // Bloque del default (si existe y ningún case coincidió)
        if (node.defaultClause) {
            this.code.label(labelDefault);
            node.defaultClause.stmt.forEach(stmt => {
                stmt.accept(this);
            });
        }

        // Etiqueta para el final del switch
        this.code.label(labelEnd);
        this.labelBreak = oldLabelBreak; // Restaurar la etiqueta de break
        this.code.comment('Fin de Switch');
    }


    
    /**
     * @type {BaseVisitor['visitBreak']}
     */
    visitBreak(node) {
        if (this.labelBreak) {
            this.code.comment('Break');
            this.code.j(this.labelBreak); // Saltar a la etiqueta de break actual (final del bucle o case en switch)
        } else {
            // Error: no se puede usar break fuera de un bucle o switch
            registrarError('Semántico', 'Error: "break" usado fuera de un bucle o switch.',node.location.start.line, node.location.start.column);
            throw new Error("Error: 'break' usado fuera de un bucle o switch.");
        }
    }



    /**
     * @type {BaseVisitor['visitContinue']}
     */
    visitContinue(node) {
        if (this.labelContinue) {
            this.code.comment('Continue');
            this.code.j(this.labelContinue); // Saltar a la etiqueta de reevaluación del bucle actual
        } else {
            // Error: no se puede usar continue fuera de un bucle
            registrarError('Semántico', 'Error: "break" usado fuera de un bucle o switch.',node.location.start.line, node.location.start.column);
            throw new Error("Error: 'continue' usado fuera de un bucle.");
        }
    }



    /**
     * @type {BaseVisitor['visitReturn']}
     */
    visitReturn(node) {
        this.code.comment('Inicio de Return');

        if(node.exp){
            node.exp.accept(this);
            this.code.popObject(r.A0);

            const frameSize = this.functionMetadata[this.insideFunction].frameSize;
            const returnOffset = frameSize - 1;
            this.code.addi(r.T0, r.FP, -returnOffset*4);
            this.code.sw(r.A0, r.T0);
        }

        this.code.j(this.returnLabel);
        this.code.comment('Fin de Return');
    }



    /**
     * @type {BaseVisitor['visitFuncDcl']}
     */
    visitFuncDcl(node){
        const baseSize = 2; // Tamaño base de la pila (ra, fp)

        const paramsSize = node.params.length; // Tamaño de los parámetros

        //console.log(node.params, paramsSize);

        const frameVisitor = new FrameVisitor(baseSize + paramsSize);

        node.bloque.accept(frameVisitor);
        const localFrame = frameVisitor.frame;
        const localSize = localFrame.length;

        const returnSize = 1;

        const totalSize = baseSize + paramsSize + localSize + returnSize;
        this.functionMetadata[node.id] = {
            frameSize: totalSize,
            returnType: node.tipo,
        }

        const instruccionesDeMain = this.code.instrucciones;
        const instruccionesDeDeclaracionDeFuncion = [];
        this.code.instrucciones = instruccionesDeDeclaracionDeFuncion;


        node.params.forEach((param, index) => {
            this.code.pushObject({
                id: param.id,
                type: param.tipo,
                length: 4,
                offset: baseSize + index,
            })
        });

        localFrame.forEach(variableLocal =>{
            this.code.pushObject({
                ...variableLocal,
                length: 4,
                type: 'local',
            })
        });

        this.insideFunction = node.id;
        this.frameDclIndex = 0;
        this.returnLabel = this.code.newEtiquetaUnica('return');

        this.code.comment(`Declaración de función: ${node.id}`);
        this.code.label(node.id);

        node.bloque.accept(this);

        this.code.label(this.returnLabel);

        this.code.add(r.T0, r.ZERO, r.FP);
        this.code.lw(r.RA, r.T0);
        this.code.jalr(r.ZERO, r.RA, 0);
        this.code.comment(`Fin de la función: ${node.id}`);

        //clear los metadatos
        for(let i = 0; i<paramsSize+localSize; i++){
            this.code.objectStack.pop(); // no se retrodece el sp, hasta más adelante
        }

        this.code.instrucciones = instruccionesDeMain

        instruccionesDeDeclaracionDeFuncion.forEach(instruccion => {
            this.code.instruccionesDeFunciones.push(instruccion);
        });

    }



    /**
     * @type {BaseVisitor['visitLlamada']}
     */
    visitLlamada(node){
        
        if(!(node.callee instanceof ReferenciaVariable)) return;

        const nombreFuncion = node.callee.id;

        this.code.comment(`Llamada a función: ${nombreFuncion}`);

        const etiquetaRetornoLlamada = this.code.newEtiquetaUnica('returnLlamada');

        //guardar los argumentos
        node.args.forEach((arg, index)=>{
            arg.accept(this);
            this.code.popObject(r.T0);
            this.code.addi(r.T1, r.SP, -4*(3+index));
            this.code.sw(r.T0, r.T1);
        });

        //calcular direccion del nuevo fp en tq
        this.code.addi(r.T1, r.SP, -4);

        //guardar direccion del retorno
        this.code.la(r.T0, etiquetaRetornoLlamada);
        this.code.push(r.T0);

        //guardar el fp
        this.code.push(r.FP);
        this.code.addi(r.FP, r.T1, 0);

        //coloca el sp al final del frame
        this.code.addi(r.SP, r.SP, -(node.args.length*4));

        //saltar a la funcion
        this.code.j(nombreFuncion);
        this.code.label(etiquetaRetornoLlamada);

        //recuperar el valor del retorno
        const frameSize = this.functionMetadata[nombreFuncion].frameSize;
        const returnSize =frameSize - 1;
        this.code.addi(r.T0, r.FP, -returnSize*4);
        this.code.lw(r.A0, r.T0);

        //regresar el fp al contexto de ejecucion anterior
        this.code.addi(r.T0, r.FP, -4);
        this.code.lw(r.FP, r.T0);

        //regresar el sp al contexto de ejecucion 
        this.code.addi(r.SP, r.SP, (frameSize-1)*4);

        this.code.push(r.A0);
        this.code.pushObject({ type: this.functionMetadata[nombreFuncion].returnType, length: 4 });

        this.code.comment(`Fin de llamada a función: ${nombreFuncion}`);

    }



    /**
     * @type {BaseVisitor['visitparseInt']}
     */
    visitparseInt(node) {
        this.code.comment('Inicio parseInt');

        // Obtener la referencia del string si es una variable
        if(node.exp instanceof ReferenciaVariable){
            node.exp.accept(this);  // Esto cargará la referencia en T1 si es un string
            this.code.mv(r.T0, r.T1);  // Copiar la referencia a T0 para procesarla
            this.code.callBuiltin('parseIntReferencia');
        }else{
            
            //node.exp.valor tiene el string, el cual debemos hacer el parse int
            const valor = parseInt(node.exp.valor); 
            const value =  Math.floor(valor);

            // Cargar el valor en un registro temporal
            this.code.li(r.T0, value);
            this.code.push(r.T0);
        }

        // Empujar el objeto del entero al stack lógico
        this.code.pushObject({ type: 'int', length: 4 });
        this.code.comment('Fin parseInt');
    }


    /**
     * @type {BaseVisitor['visitparseFloat']}
     */    
    visitparseFloat(node){

        this.code.comment('Inicio parseFloat');

        // Obtener la referencia del string si es una variable
        if(node.exp instanceof ReferenciaVariable){
            node.exp.accept(this);  // Esto cargará la referencia en T1 si es un string
            this.code.mv(r.T0, r.T1);  // Copiar la referencia a T0 para procesarla
            this.code.callBuiltin('parseFloatReferencia');
        }else{
            
            //node.exp.valor tiene el string, el cual debemos hacer el parse float
            const value = parseFloat(node.exp.valor); 
            const ieee754 = numberToF32(value);  // Convertimos a IEEE 754 (32 bits)

            // Cargar el valor en un registro temporal
            this.code.li(r.T0, ieee754);
            this.code.push(r.T0);
        }

        // Empujar el objeto del entero al stack lógico
        this.code.pushObject({ type: 'float', length: 4 });
        this.code.comment('Fin parseFloat');
        
    }


    /**
     * @type {BaseVisitor['visitToString']}
     */
    visittoString(node) {
        this.code.comment('Inicio toString');

        if(node.exp instanceof ReferenciaVariable){
            node.exp.accept(this);
            const object  = this.code.getTopObject();
            this.code.mv(r.T0, r.T1);  // Copiar la referencia a T0 para procesarla
            if(object.type === 'int'){
                this.code.callBuiltin('intToString');
            }else if(object.type === 'float'){
                this.code.callBuiltin('floatToString');
            }
        }else{
            const string = node.exp.valor.toString();
            this.code.pushContant({ type: 'string', valor: string });
        }        
        
        this.code.pushObject({ type: 'string', length: 4 });

        this.code.comment('Fin toString');
    }


    /**
     * @type {BaseVisitor['visittoLowerCase']}
     */
    visittoLowerCase(node){
        this.code.comment('Inicio toLowerCase');

        if(node.exp instanceof ReferenciaVariable){
            node.exp.accept(this);
            this.code.mv(r.T0, r.T1);  // Copiar la referencia a T0 para procesarla
            this.code.callBuiltin('toLowerCase');
        }else{
            const string = node.exp.valor.toLowerCase();
            this.code.pushContant({ type: 'string', valor: string });
        }

        this.code.pushObject({ type: 'string', length: 4 });
        this.code.comment('Fin toLowerCase');
    }


    /**
     * @type {BaseVisitor['visittoUpperCase']}
     */
    visittoUpperCase(node){
        this.code.comment('Inicio toUpperCase');

        if(node.exp instanceof ReferenciaVariable){
            node.exp.accept(this);
            this.code.mv(r.T0, r.T1);  // Copiar la referencia a T0 para procesarla
            this.code.callBuiltin('toUpperCase');
        }else{
            const string = node.exp.valor.toUpperCase();
            this.code.pushContant({ type: 'string', valor: string });
        }

        this.code.pushObject({ type: 'string', length: 4 });
        this.code.comment('Fin toUpperCase');
    }

    /**
     * @type {BaseVisitor['visittypEof']}
     */
    visittypEof(node){
        this.code.comment('Inicio typEof');

        let tipoDato;
        
        if(node.exp instanceof ReferenciaVariable){
            node.exp.accept(this);
            this.code.mv(r.T0, r.T1);
            const objeto = this.code.getTopObject();
            tipoDato = objeto.type;
        }else{
            tipoDato = node.exp.tipo;
        }
        this.code.pushContant({ type: 'string', valor: tipoDato });
        this.code.pushObject({ type: 'string', length: 4 });
        this.code.comment('Fin typEof');

    }

}
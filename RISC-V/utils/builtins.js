import { registers as r, floatRegisters as f} from "../constantes/constantes.js";
import { Generador } from "../generador/generador.js";
import { stringTo1ByteArray} from "../utils/utils.js";


/**
 * @param {Generador} code
 */
export const concatString = (code) => {

    code.comment('Guardando en el stack la dirección en heap de la cadena concatenada')
    code.push(r.HP);

    code.comment('Copiando la 1er cadena en el heap')

    const end1 = code.newEtiquetaUnica('end1');
    const loop1 = code.newEtiquetaUnica('loop1');
    code.label(loop1);

    code.lb(r.T1, r.A0);
    code.beq(r.T1, r.ZERO, end1);
    code.sb(r.T1, r.HP);
    code.addi(r.HP, r.HP, 1);
    code.addi(r.A0, r.A0, 1);
    code.j(loop1);
    code.label(end1);

    code.comment('Copiando la 2da cadena en el heap')
    const end2 = code.newEtiquetaUnica('end2');
    const loop2 = code.newEtiquetaUnica('loop2');
    code.label(loop2);

    code.lb(r.T1, r.A1);
    code.beq(r.T1, r.ZERO, end2);
    code.sb(r.T1, r.HP);
    code.addi(r.HP, r.HP, 1);
    code.addi(r.A1, r.A1, 1);
    code.j(loop2);
    code.label(end2);

    code.comment('Guardando en el heap el caracter nulo')
    code.sb(r.ZERO, r.HP);
    code.addi(r.HP, r.HP, 1);
}


export const igualdadStrings = (code) => {
    // Inicializar comparacion de strings
    code.comment('Comparación de cadenas de texto');
                
    let loopLabel = code.newEtiquetaUnica('string_cmp_loop');
    let endLabel = code.newEtiquetaUnica('string_cmp_end');
    let trueLabel = code.newEtiquetaUnica('string_cmp_true');
    let falseLabel = code.newEtiquetaUnica('string_cmp_false');

    // Apuntar al inicio de ambas cadenas
    code.add(r.T2, r.ZERO, r.T1); // r.T1 contiene el puntero a la primera cadena
    code.add(r.T3, r.ZERO, r.T0); // r.T0 contiene el puntero a la segunda cadena

    code.label(loopLabel);

    // Cargar un byte de cada cadena
    code.lbu(r.T4, r.T2); // Cargar el siguiente byte de la primera cadena en r.T4
    code.lbu(r.T5, r.T3); // Cargar el siguiente byte de la segunda cadena en r.T5

    // Comparar los dos bytes
    code.bne(r.T4, r.T5, falseLabel); // Si los bytes son diferentes, las cadenas no son iguales
    code.beq(r.T4, r.ZERO, trueLabel); // Si llegamos al final de la cadena ('\0'), las cadenas son iguales

    // Avanzar al siguiente carácter
    code.addi(r.T2, r.T2, 1);
    code.addi(r.T3, r.T3, 1);
    code.j(loopLabel); // Repetir el ciclo

    // Si encontramos que las cadenas son iguales
    code.label(trueLabel);
    code.li(r.T0, 1); // True (1) si las cadenas son iguales
    code.j(endLabel);

    // Si encontramos una diferencia
    code.label(falseLabel);
    code.li(r.T0, 0); // False (0) si las cadenas son diferentes

    // Fin de la comparación
    code.label(endLabel);
    code.push(r.T0); // Poner el resultado en la pila
    code.comment('Fin Comparación de cadenas');   

}


export const igualdad = (code) => {

    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison')

    code.comment('Comparación igualdad');
    // Si son iguales, setear a true (1)
    code.beq(r.T1, r.T0, labelTrue);
    code.j(labelFalse);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación igualdad');

}


export const igualdadFloat = (code) =>{

    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación igualdad de flotantes');
    // Si son iguales, setear a true (1)
    code.feqs(r.T0, f.FT1, f.FT0);
    code.beq(r.T0, r.ZERO, labelFalse);
    code.j(labelTrue);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación igualdad de flotantes');

}


export const desigualdadStrings = (code) => {

    // Inicializar comparacion de strings
    code.comment('Comparación de desigualdad de cadenas de texto');
            
    let loopLabel = code.newEtiquetaUnica('string_cmp_loop');
    let endLabel = code.newEtiquetaUnica('string_cmp_end');
    let trueLabel = code.newEtiquetaUnica('string_cmp_true');
    let falseLabel = code.newEtiquetaUnica('string_cmp_false');

    // Apuntar al inicio de ambas cadenas
    code.add(r.T2, r.ZERO, r.T1); // r.T1 contiene el puntero a la primera cadena
    code.add(r.T3, r.ZERO, r.T0); // r.T0 contiene el puntero a la segunda cadena

    code.label(loopLabel);

    // Cargar un byte de cada cadena
    code.lbu(r.T4, r.T2); // Cargar el siguiente byte de la primera cadena en r.T4
    code.lbu(r.T5, r.T3); // Cargar el siguiente byte de la segunda cadena en r.T5

    // Comparar los dos bytes
    code.bne(r.T4, r.T5, trueLabel); // Si los bytes son diferentes, las cadenas no son iguales (True)
    code.beq(r.T4, r.ZERO, falseLabel); // Si llegamos al final de la cadena ('\0'), las cadenas son iguales (False)

    // Avanzar al siguiente carácter
    code.addi(r.T2, r.T2, 1);
    code.addi(r.T3, r.T3, 1);
    code.j(loopLabel); // Repetir el ciclo

    // Si encontramos que las cadenas son diferentes
    code.label(trueLabel);
    code.li(r.T0, 1); // True (1) si las cadenas son diferentes
    code.j(endLabel);

    // Si encontramos que las cadenas son iguales
    code.label(falseLabel);
    code.li(r.T0, 0); // False (0) si las cadenas son iguales

    // Fin de la comparación
    code.label(endLabel);
    code.push(r.T0); // Poner el resultado en la pila
    code.comment('Fin Comparación de desigualdad de cadenas');

}


export const desigualdad = (code) => {

    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación desigualdad');
    // Si son diferentes, setear a true (1)
    code.bne(r.T1, r.T0, labelTrue);
    code.j(labelFalse);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación desigualdad');
}


export const desigualdadFloat = (code) =>{

    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación desigualdad de flotantes');
    // Si son diferentes, setear a true (1)
    code.feqs(r.T0, f.FT1, f.FT0);
    code.beq(r.T0, r.ZERO, labelTrue);
    code.j(labelFalse);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación desigualdad de flotantes');

}


export const mayorQue = (code) =>{
    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación mayor que');
    // Si es mayor, setear a true (1)
    code.bgt(r.T1, r.T0, labelTrue);
    code.j(labelFalse);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación mayor que');

}


export const mayorQueFloat = (code) =>{

    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación mayor que flotante');
    // Si es mayor, setear a true (1)
    code.flts(r.T0, f.FT0, f.FT1);  //f1 < f0 si f1 es mayor que f0, es falso ya que está al revés para comparar si f1 es mayor que f0
    code.beq(r.T0, r.ZERO, labelFalse);
    code.j(labelTrue);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación mayor que flotante');

}


export const menorQue = (code) =>{
    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación menor que');
    // Si es menor, setear a true (1)
    code.blt(r.T1, r.T0, labelTrue);
    code.j(labelFalse);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación menor que');

}

export const menorQueFloat = (code) =>{

    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación menor que flotante');
    // Si es menor, setear a true (1)
    code.flts(r.T0, f.FT1, f.FT0);
    code.beq(r.T0, r.ZERO, labelFalse);
    code.j(labelTrue);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación menor que flotante');

}


export const menorIgual = (code) =>{

    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación menor o igual que');
    // Si es menor o igual, setear a true (1)
    code.ble(r.T1, r.T0, labelTrue);
    code.j(labelFalse);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación menor o igual que');

}


export const menorIgualFloat = (code) =>{

    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación menor o igual que flotante');
    // Si es menor o igual, setear a true (1)
    code.fles(r.T0, f.FT1, f.FT0);
    code.beq(r.T0, r.ZERO, labelFalse);
    code.j(labelTrue);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación menor o igual que flotante');

}


export const mayorIgual = (code) =>{

    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación mayor o igual que');
    // Si es mayor o igual, setear a true (1)
    code.bge(r.T1, r.T0, labelTrue);
    code.j(labelFalse);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación mayor o igual que');
}


export const mayorIgualFloat = (code) =>{

    //Generar etiquetas únicas
    let labelTrue = code.newEtiquetaUnica('set_true');
    let labelFalse = code.newEtiquetaUnica('set_false');
    let end_comparison = code.newEtiquetaUnica('end_comparison');

    code.comment('Comparación mayor o igual que flotante');
    // Si es mayor o igual, setear a true (1)
    code.fles(r.T0, f.FT0, f.FT1);
    code.beq(r.T0, r.ZERO, labelFalse);
    code.j(labelTrue);
    code.label(labelTrue);
    code.li(r.T0, 1); // se agina true a t0
    code.j(end_comparison)
    code.label(labelFalse);
    code.li(r.T0, 0); // se asigna false a t1
    code.label(end_comparison);
    code.push(r.T0);
    code.comment('Fin Comparación mayor o igual que flotante');

}


export const printNewLine=(code)=>{
    code.comment('Imprimir salto de línea');
    code.li(r.A0, 10);
    code.li(r.A7, 11);
    code.ecall();
    code.comment('Fin imprimir salto de línea');
}



export const printBool = (code, rd = r.A0) => {
    code.comment('Imprimir booleano');

    // Guardar A0 si se está usando otro registro
    if (rd !== r.A0) {
        code.push(r.A0);             // Guardar A0 en el stack
        code.add(r.A0, rd, r.ZERO);  // Mover el valor de rd a A0
    }

    const printTrue = code.newEtiquetaUnica('print_true');
    const printFalse = code.newEtiquetaUnica('print_false');
    const endPrintBool = code.newEtiquetaUnica('end_print_bool');

    // Comparar si A0 es 1 (true)
    code.li(r.T1, 1);                // Cargar 1 en T1
    code.beq(r.A0, r.T1, printTrue); // Si A0 es 1, ir a imprimir "true"
    code.j(printFalse);              // Si no, ir a imprimir "false"

    // Sección para imprimir "true"
    code.label(printTrue);
    code.comment('Imprimir true');
    pushString(code, "true");        // Cargar la cadena "true" en el heap
    code.lw(r.A0, r.SP);             // Recuperar la dirección de "true"
    code.addi(r.SP, r.SP, 4);        // Ajustar el puntero del stack
    code.li(r.A7, 4);                // Código de syscall para imprimir una cadena
    code.ecall();                    // Llamada de sistema

    code.j(endPrintBool);            // Saltar al final

    // Sección para imprimir "false"
    code.label(printFalse);
    code.comment('Imprimir false');
    pushString(code, "false");       // Cargar la cadena "false" en el heap
    code.lw(r.A0, r.SP);             // Recuperar la dirección de "false"
    code.addi(r.SP, r.SP, 4);        // Ajustar el puntero del stack
    code.li(r.A7, 4);                // Código de syscall para imprimir una cadena
    code.ecall();                    // Llamada de sistema

    // Fin de la impresión
    code.label(endPrintBool);

    // Restaurar A0 si fue modificado
    if (rd !== r.A0) {
        code.pop(r.A0);  // Recuperar el valor original de A0
    }

    code.comment('Fin imprimir booleano');
};


const pushString = (code, string) => {
    const stringArray = stringTo1ByteArray(string); // Convierte a un arreglo de bytes ASCII

    code.comment(`Pushing string: "${string}"`);
    code.push(r.HP); // Guardar la dirección del heap en el stack

    // Cargar cada carácter en el heap
    stringArray.forEach((charCode) => {
        code.li(r.T0, charCode);  // Cargar el código ASCII en T0
        code.sb(r.T0, r.HP);      // Guardar el byte en el heap
        code.addi(r.HP, r.HP, 1); // Mover el puntero del heap
    });

    // Agregar el terminador nulo (\0) al final
    code.li(r.T0, 0);
    code.sb(r.T0, r.HP);
    code.addi(r.HP, r.HP, 1); // Avanzar en el heap para futuras inserciones
};


export const parseIntReferencia = (code) => {
    // Inicializar el acumulador
    code.li(r.T1, 0);  // T1 = 0 (acumulador del entero)

    // Crear etiquetas para el bucle
    const inicioBucle = code.newEtiquetaUnica('parseInt_inicio');
    const finBucle = code.newEtiquetaUnica('parseInt_fin');
    const puntoDecimal = code.newEtiquetaUnica('punto_decimal');

    // Etiqueta de inicio del bucle
    code.label(inicioBucle);

    // Cargar el carácter actual en T2
    code.lb(r.T2, r.T0, 0);  // T2 = Mem[T0] (carácter actual)

    // Verificar si es el carácter nulo (fin del string)
    code.beqz(r.T2, finBucle);  // Si T2 == 0 (fin del string), salir del bucle

    // Verificar si es un punto decimal ('.')
    code.li(r.T3, 46);  // ASCII de '.'
    code.beq(r.T2, r.T3, puntoDecimal);  // Si T2 == '.', saltar a punto_decimal

    // Restar '0' para obtener el valor numérico del dígito
    code.li(r.T3, 48);  // ASCII de '0'
    code.sub(r.T2, r.T2, r.T3);  // T2 = T2 - '0'

    // Multiplicar el acumulador por 10 y sumar el dígito actual
    code.li(r.T4, 10);
    code.mul(r.T1, r.T1, r.T4);  // T1 = T1 * 10
    code.add(r.T1, r.T1, r.T2);  // T1 = T1 + T2

    // Avanzar al siguiente carácter del string
    code.addi(r.T0, r.T0, 1);  // T0++

    // Volver al inicio del bucle
    code.j(inicioBucle);

    // Etiqueta para el punto decimal (truncamiento)
    code.label(puntoDecimal);
    code.comment('Truncando en el punto decimal');
    code.j(finBucle);  // Saltar al fin del bucle

    // Etiqueta de fin del bucle
    code.label(finBucle);

    // Empujar el resultado al stack físico
    code.push(r.T1);  // Empujar el valor final al stack
};


export const parseFloatReferencia = (code) => {
    // Inicializar acumuladores
    code.li(r.T1, 0);  // T1 = parte entera
    code.fcvtsw(f.FT0, r.T1);  // FT0 = parte decimal
    code.li(r.T2, 1);  // T2 = divisor decimal

    // Crear etiquetas para el bucle
    const inicioBucle = code.newEtiquetaUnica('parseFloat_inicio');
    const finBucle = code.newEtiquetaUnica('parseFloat_fin');
    const procesarDecimal = code.newEtiquetaUnica('parseFloat_decimal');
    const procesandoParteDecimal = code.newEtiquetaUnica('procesando_decimal');

    // Etiqueta de inicio del bucle
    code.label(inicioBucle);

    // Cargar el carácter actual en T3
    code.lb(r.T3, r.T0, 0);  // T3 = Mem[T0] (carácter actual)

    // Verificar si es el carácter nulo
    code.beqz(r.T3, finBucle);  // Si es 0, salir del bucle

    // Verificar si es un punto decimal
    code.li(r.T4, 46);  // ASCII de '.'
    code.beq(r.T3, r.T4, procesarDecimal);  // Si es '.', ir a procesar decimales

    // Restar 0 para obtener el valor numérico
    code.li(r.T4, 48);  // ASCII de '0'
    code.sub(r.T3, r.T3, r.T4);  // T3 = T3 - '0'

    // Multiplicar parte entera por 10 y sumar el dígito
    code.li(r.T4, 10);
    code.mul(r.T1, r.T1, r.T4);  // T1 = T1 * 10
    code.add(r.T1, r.T1, r.T3);  // T1 = T1 + T3

    // Avanzar al siguiente carácter
    code.addi(r.T0, r.T0, 1);  // T0++

    // Volver al inicio del bucle
    code.j(inicioBucle);

    // Procesar la parte decimal
    code.label(procesarDecimal);
    code.addi(r.T0, r.T0, 1);  // Avanzar al siguiente carácter

    // Bucle para procesar decimales
    code.label(procesandoParteDecimal);
    code.lb(r.T3, r.T0, 0);  // Cargar carácter actual

    // Verificar si es el carácter nulo
    code.beqz(r.T3, finBucle);  // Salir si es nulo

    // Restar '0' para obtener valor numérico
    code.li(r.T4, 48);
    code.sub(r.T3, r.T3, r.T4);

    // Actualizar divisor decimal
    code.li(r.T4, 10);
    code.mul(r.T2, r.T2, r.T4);  // T2 *= 10

    // Calcular valor decimal y agregarlo a FT0
    code.li(r.T4, 1);  // FT1 = 1.0
    code.fcvtsw(f.FT1, r.T4);  // FT1 = T3
    code.fcvtsw(f.FT2, r.T3);  // FT2 = T3
    code.fcvtsw(f.FT3, r.T2);  // FT3 = divisor
    code.fmul(f.FT1, f.FT1, f.FT2);  // FT1 *= T3
    code.fdiv(f.FT1, f.FT1, f.FT3);  // FT1 /= divisor
    code.fadd(f.FT0, f.FT0, f.FT1);  // FT0 += FT1

    // Avanzar al siguiente carácter
    code.addi(r.T0, r.T0, 1);  // T0++

    // Volver a procesar más decimales
    code.j(procesandoParteDecimal);

    // Fin del bucle
    code.label(finBucle);

    // Combinar parte entera y decimal
    code.fcvtsw(f.FT4, r.T1);  // FT4 = parte entera
    code.fadd(f.FT0, f.FT0, f.FT4);  // FT0 = T1 + FT0

    // Empujar resultado al stack
    code.pushFloat(f.FT0);
};


export const intToString = (code) => {
    
    const inicioBucle = code.newEtiquetaUnica('intToString_inicio');
    const finBucle = code.newEtiquetaUnica('intToString_fin');
    const esNegativo = code.newEtiquetaUnica('intToString_esNegativo');
    const noEsNegativo = code.newEtiquetaUnica('intToString_noEsNegativo');

    // Crear un registro temporal para el número (por si es negativo)
    code.mv(r.T1, r.T0);  // T1 = T0 (el valor original)

    // Verificar si el número es negativo
    code.bgez(r.T0, noEsNegativo);  // Si T0 >= 0, no es negativo

    // Si es negativo, cambiar el signo
    code.label(esNegativo);
    code.neg(r.T1, r.T0);  // T1 = -T0 (valor positivo)
    code.sb(r.T3, r.HP, 0);  // Guardar '-' en el heap
    code.addi(r.HP, r.HP, 1);  // Avanzar el heap pointer

    code.label(noEsNegativo);

    // Inicializar puntero de escritura (en el heap)
    code.add(r.T2, r.HP, r.ZERO);  // T2 apunta al inicio del string

    // Bucle para convertir int a string (carácter por carácter)
    code.label(inicioBucle);

    // Calcular dígito (T3 = T1 % 10)
    code.li(r.T4, 10);
    code.rem(r.T3, r.T1, r.T4);  // Resto en T3

    // Convertir el dígito a su ASCII ('0' = 48)
    code.addi(r.T3, r.T3, 48);  // T3 = T3 + '0'

    // Guardar el dígito en el heap
    code.sb(r.T3, r.T2, 0);  // Mem[T2] = T3

    // Avanzar el puntero del heap
    code.addi(r.T2, r.T2, 1);  // T2++

    // Dividir el número por 10
    code.div(r.T1, r.T1, r.T4);  // T1 = T1 / 10

    // Si el número no es 0, continuar
    code.bnez(r.T1, inicioBucle);  // Si T1 != 0, seguir

    // Agregar carácter nulo al final del string
    code.li(r.T3, 0);  
    code.sb(r.T3, r.T2, 0);  // Mem[T2] = '\0'

    // Mover el heap pointer después del string
    code.addi(r.HP, r.T2, 1);

    // Empujar la referencia del string al stack
    code.push(r.HP);  

    code.label(finBucle);
    
};

export const floatToString = (code) => {
    code.comment('Convirtiendo float a string');

    // Obtener el float del stack
    code.popFloat(f.FT0);  // Recuperar float en FT0

    // Llamar al syscall para convertir float a string
    code.li(r.A7, 35);  // Syscall para float to string
    code.li(r.A1, 2);   // 2 decimales (especificar precisión)
    code.ecall();        // Llamar al syscall

    // Comprobar si la dirección en A0 es válida
    code.beqz(r.A0, 'error_floatToString');  // Si A0 es 0, lanzar error

    // Guardar la referencia del string en el heap (HP)
    code.push(r.A0);  // Empujar la referencia del string al stack
    code.comment('Fin floatToString');
    code.j('retorno_floatToString');  // Saltar al final

    // Manejar error de dirección nula
    code.label('error_floatToString');
    code.comment('Error: Dirección nula al convertir float a string');
    code.li(r.A7, 10);  // Finalizar ejecución
    code.ecall();

    code.label('retorno_floatToString');
    code.ret();
};


export const toLowerCase = (code) => {

    const inicioBucle = code.newEtiquetaUnica('toLowerCase_inicio');
    const finBucle = code.newEtiquetaUnica('toLowerCase_fin');
    const continuar = code.newEtiquetaUnica('continuar');

    // Etiqueta de inicio del bucle
    code.label(inicioBucle);

    // Cargar el carácter actual en T1
    code.lb(r.T1, r.T0, 0);  // T1 = Mem[T0] (carácter actual)

    // Verificar si es el carácter nulo (fin del string)
    code.beqz(r.T1, finBucle);  // Si T1 == 0, salir del bucle

    // Verificar si el carácter está en mayúscula ('A' <= char <= 'Z')
    code.li(r.T2, 65);  // ASCII de 'A'
    code.li(r.T3, 90);  // ASCII de 'Z'
    
    // Si el carácter no es mayúscula, saltar a continuar
    code.blt(r.T1, r.T2, continuar);  // Si T1 < 'A', no convertir
    code.bgt(r.T1, r.T3, continuar);  // Si T1 > 'Z', no convertir

    // Convertir a minúscula (char + 32)
    code.addi(r.T1, r.T1, 32);  // T1 = T1 + 32

    // Guardar el carácter convertido en el string
    code.label(continuar);
    code.sb(r.T1, r.T0, 0);  // Mem[T0] = T1

    // Avanzar al siguiente carácter
    code.addi(r.T0, r.T0, 1);  // T0++

    // Volver al inicio del bucle
    code.j(inicioBucle);

    // Etiqueta de fin del bucle
    code.label(finBucle);

}


export const toUpperCase = (code) => {

    const inicioBucle = code.newEtiquetaUnica('toUpperCase_inicio');
    const finBucle = code.newEtiquetaUnica('toUpperCase_fin');

    // Etiqueta de inicio del bucle
    code.label(inicioBucle);

    // Cargar el carácter actual en T1
    code.lb(r.T1, r.T0, 0);  // T1 = Mem[T0] (carácter actual)

    // Verificar si es el carácter nulo (fin del string)
    code.beqz(r.T1, finBucle);  // Si T1 == 0, salir del bucle

    // Verificar si el carácter está en minúscula ('a' <= char <= 'z')
    code.li(r.T2, 97);  // ASCII de 'a'
    code.li(r.T3, 122); // ASCII de 'z'
    const continuar = code.newEtiquetaUnica('continuar');

    // Si no es una letra minúscula, saltar sin modificarlo
    code.blt(r.T1, r.T2, continuar);  // Si T1 < 'a', continuar sin cambios
    code.bgt(r.T1, r.T3, continuar);  // Si T1 > 'z', continuar sin cambios

    // Convertir a mayúscula (char - 32)
    code.addi(r.T1, r.T1, -32);  // T1 = T1 - 32

    // Guardar el carácter convertido en el string
    code.label(continuar);
    code.sb(r.T1, r.T0, 0);  // Mem[T0] = T1

    // Avanzar al siguiente carácter
    code.addi(r.T0, r.T0, 1);  // T0++

    // Volver al inicio del bucle
    code.j(inicioBucle);

    // Etiqueta de fin del bucle
    code.label(finBucle);

}

export const builtins = {
    concatString: concatString,
    igualdad: igualdad,
    igualdadStrings: igualdadStrings,
    desigualdad: desigualdad,
    desigualdadStrings: desigualdadStrings,
    menorIgual: menorIgual,
    mayorIgual: mayorIgual,
    mayorQue: mayorQue,
    menorQue: menorQue,
    igualdadFloat: igualdadFloat,
    desigualdadFloat: desigualdadFloat,
    mayorQueFloat: mayorQueFloat,
    menorQueFloat: menorQueFloat,
    menorIgualFloat: menorIgualFloat,
    mayorIgualFloat: mayorIgualFloat,
    printNewLine: printNewLine,
    printBool: printBool,
    parseIntReferencia: parseIntReferencia,
    parseFloatReferencia: parseFloatReferencia,
    intToString: intToString,
    floatToString: floatToString,
    toLowerCase: toLowerCase,
    toUpperCase: toUpperCase

}
import { registers as r, floatRegisters as f} from "../constantes/constantes.js";
import { Generador } from "../generador/generador.js";


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


}
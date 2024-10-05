import { registers as r } from "../constantes/constantes.js";
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

export const builtins = {
    concatString: concatString
}
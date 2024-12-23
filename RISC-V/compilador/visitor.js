
/**

 * @typedef {import('./nodos').Expresion} Expresion


 * @typedef {import('./nodos').OperacionBinaria} OperacionBinaria


 * @typedef {import('./nodos').OperacionUnaria} OperacionUnaria


 * @typedef {import('./nodos').Agrupacion} Agrupacion


 * @typedef {import('./nodos').Numero} Numero


 * @typedef {import('./nodos').Cadena} Cadena


 * @typedef {import('./nodos').Booleano} Booleano


 * @typedef {import('./nodos').DeclaracionTipoVariable} DeclaracionTipoVariable


 * @typedef {import('./nodos').ReferenciaVariable} ReferenciaVariable


 * @typedef {import('./nodos').Print} Print


 * @typedef {import('./nodos').ExpresionStmt} ExpresionStmt


 * @typedef {import('./nodos').Asignacion} Asignacion


 * @typedef {import('./nodos').Bloque} Bloque


 * @typedef {import('./nodos').If} If


 * @typedef {import('./nodos').While} While


 * @typedef {import('./nodos').For} For


 * @typedef {import('./nodos').Foreach} Foreach


 * @typedef {import('./nodos').Break} Break


 * @typedef {import('./nodos').Continue} Continue


 * @typedef {import('./nodos').Return} Return


 * @typedef {import('./nodos').Llamada} Llamada


 * @typedef {import('./nodos').FuncDcl} FuncDcl


 * @typedef {import('./nodos').Ternario} Ternario


 * @typedef {import('./nodos').Switch} Switch


 * @typedef {import('./nodos').DeclaracionArreglo} DeclaracionArreglo


 * @typedef {import('./nodos').DeclaracionMatriz} DeclaracionMatriz


 * @typedef {import('./nodos').ArrayFunc} ArrayFunc


 * @typedef {import('./nodos').MatrizFunc} MatrizFunc


 * @typedef {import('./nodos').parseInt} parseInt


 * @typedef {import('./nodos').parseFloat} parseFloat


 * @typedef {import('./nodos').toString} toString


 * @typedef {import('./nodos').toLowerCase} toLowerCase


 * @typedef {import('./nodos').toUpperCase} toUpperCase


 * @typedef {import('./nodos').typEof} typEof


 * @typedef {import('./nodos').StructDcl} StructDcl


 * @typedef {import('./nodos').Instancia} Instancia


 * @typedef {import('./nodos').Get} Get


 * @typedef {import('./nodos').Set} Set


 * @typedef {import('./nodos').ObjKey} ObjKey

 */


/**
 * Clase base para los visitantes
 * @abstract
 */
export class BaseVisitor {

    
    /**
     * @param {Expresion} node
     * @returns {any}
     */
    visitExpresion(node) {
        throw new Error('Metodo visitExpresion no implementado');
    }
    

    /**
     * @param {OperacionBinaria} node
     * @returns {any}
     */
    visitOperacionBinaria(node) {
        throw new Error('Metodo visitOperacionBinaria no implementado');
    }
    

    /**
     * @param {OperacionUnaria} node
     * @returns {any}
     */
    visitOperacionUnaria(node) {
        throw new Error('Metodo visitOperacionUnaria no implementado');
    }
    

    /**
     * @param {Agrupacion} node
     * @returns {any}
     */
    visitAgrupacion(node) {
        throw new Error('Metodo visitAgrupacion no implementado');
    }
    

    /**
     * @param {Numero} node
     * @returns {any}
     */
    visitNumero(node) {
        throw new Error('Metodo visitNumero no implementado');
    }
    

    /**
     * @param {Cadena} node
     * @returns {any}
     */
    visitCadena(node) {
        throw new Error('Metodo visitCadena no implementado');
    }
    

    /**
     * @param {Booleano} node
     * @returns {any}
     */
    visitBooleano(node) {
        throw new Error('Metodo visitBooleano no implementado');
    }
    

    /**
     * @param {DeclaracionTipoVariable} node
     * @returns {any}
     */
    visitDeclaracionTipoVariable(node) {
        throw new Error('Metodo visitDeclaracionTipoVariable no implementado');
    }
    

    /**
     * @param {ReferenciaVariable} node
     * @returns {any}
     */
    visitReferenciaVariable(node) {
        throw new Error('Metodo visitReferenciaVariable no implementado');
    }
    

    /**
     * @param {Print} node
     * @returns {any}
     */
    visitPrint(node) {
        throw new Error('Metodo visitPrint no implementado');
    }
    

    /**
     * @param {ExpresionStmt} node
     * @returns {any}
     */
    visitExpresionStmt(node) {
        throw new Error('Metodo visitExpresionStmt no implementado');
    }
    

    /**
     * @param {Asignacion} node
     * @returns {any}
     */
    visitAsignacion(node) {
        throw new Error('Metodo visitAsignacion no implementado');
    }
    

    /**
     * @param {Bloque} node
     * @returns {any}
     */
    visitBloque(node) {
        throw new Error('Metodo visitBloque no implementado');
    }
    

    /**
     * @param {If} node
     * @returns {any}
     */
    visitIf(node) {
        throw new Error('Metodo visitIf no implementado');
    }
    

    /**
     * @param {While} node
     * @returns {any}
     */
    visitWhile(node) {
        throw new Error('Metodo visitWhile no implementado');
    }
    

    /**
     * @param {For} node
     * @returns {any}
     */
    visitFor(node) {
        throw new Error('Metodo visitFor no implementado');
    }
    

    /**
     * @param {Foreach} node
     * @returns {any}
     */
    visitForeach(node) {
        throw new Error('Metodo visitForeach no implementado');
    }
    

    /**
     * @param {Break} node
     * @returns {any}
     */
    visitBreak(node) {
        throw new Error('Metodo visitBreak no implementado');
    }
    

    /**
     * @param {Continue} node
     * @returns {any}
     */
    visitContinue(node) {
        throw new Error('Metodo visitContinue no implementado');
    }
    

    /**
     * @param {Return} node
     * @returns {any}
     */
    visitReturn(node) {
        throw new Error('Metodo visitReturn no implementado');
    }
    

    /**
     * @param {Llamada} node
     * @returns {any}
     */
    visitLlamada(node) {
        throw new Error('Metodo visitLlamada no implementado');
    }
    

    /**
     * @param {FuncDcl} node
     * @returns {any}
     */
    visitFuncDcl(node) {
        throw new Error('Metodo visitFuncDcl no implementado');
    }
    

    /**
     * @param {Ternario} node
     * @returns {any}
     */
    visitTernario(node) {
        throw new Error('Metodo visitTernario no implementado');
    }
    

    /**
     * @param {Switch} node
     * @returns {any}
     */
    visitSwitch(node) {
        throw new Error('Metodo visitSwitch no implementado');
    }
    

    /**
     * @param {DeclaracionArreglo} node
     * @returns {any}
     */
    visitDeclaracionArreglo(node) {
        throw new Error('Metodo visitDeclaracionArreglo no implementado');
    }
    

    /**
     * @param {DeclaracionMatriz} node
     * @returns {any}
     */
    visitDeclaracionMatriz(node) {
        throw new Error('Metodo visitDeclaracionMatriz no implementado');
    }
    

    /**
     * @param {ArrayFunc} node
     * @returns {any}
     */
    visitArrayFunc(node) {
        throw new Error('Metodo visitArrayFunc no implementado');
    }
    

    /**
     * @param {MatrizFunc} node
     * @returns {any}
     */
    visitMatrizFunc(node) {
        throw new Error('Metodo visitMatrizFunc no implementado');
    }
    

    /**
     * @param {parseInt} node
     * @returns {any}
     */
    visitparseInt(node) {
        throw new Error('Metodo visitparseInt no implementado');
    }
    

    /**
     * @param {parseFloat} node
     * @returns {any}
     */
    visitparseFloat(node) {
        throw new Error('Metodo visitparseFloat no implementado');
    }
    

    /**
     * @param {toString} node
     * @returns {any}
     */
    visittoString(node) {
        throw new Error('Metodo visittoString no implementado');
    }
    

    /**
     * @param {toLowerCase} node
     * @returns {any}
     */
    visittoLowerCase(node) {
        throw new Error('Metodo visittoLowerCase no implementado');
    }
    

    /**
     * @param {toUpperCase} node
     * @returns {any}
     */
    visittoUpperCase(node) {
        throw new Error('Metodo visittoUpperCase no implementado');
    }
    

    /**
     * @param {typEof} node
     * @returns {any}
     */
    visittypEof(node) {
        throw new Error('Metodo visittypEof no implementado');
    }
    

    /**
     * @param {StructDcl} node
     * @returns {any}
     */
    visitStructDcl(node) {
        throw new Error('Metodo visitStructDcl no implementado');
    }
    

    /**
     * @param {Instancia} node
     * @returns {any}
     */
    visitInstancia(node) {
        throw new Error('Metodo visitInstancia no implementado');
    }
    

    /**
     * @param {Get} node
     * @returns {any}
     */
    visitGet(node) {
        throw new Error('Metodo visitGet no implementado');
    }
    

    /**
     * @param {Set} node
     * @returns {any}
     */
    visitSet(node) {
        throw new Error('Metodo visitSet no implementado');
    }
    

    /**
     * @param {ObjKey} node
     * @returns {any}
     */
    visitObjKey(node) {
        throw new Error('Metodo visitObjKey no implementado');
    }
    
}

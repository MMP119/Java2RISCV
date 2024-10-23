import { BaseVisitor} from "../compilador/visitor.js"

export class FrameVisitor extends BaseVisitor{

    constructor(baseOffset) {
        super();
        this.frame = [];
        this.localSize = 0;
        this.baseOffset = baseOffset;
    }
    
    visitExpresionStmt(node){    }
    
    
    visitNumero(node){    }
    
    
    visitCadena(node){    }
    
    
    visitBooleano(node){    }
    
    /**
     * @type {BaseVisitor['visitDeclaracionTipoVariable']}
     */
    visitDeclaracionTipoVariable(node){
        this.frame.push({
            id: node.id,
            offset: this.baseOffset + this.localSize,
            type: node.tipo,
        });
        this.localSize += 1;
    }
    

    visitDeclaracionArreglo(node){

    }
    
    
    visitArrayFunc(node){

    }
    
    
    visitOperacionBinaria(node){

    }
    
    
    visitOperacionUnaria(node){

    }
    
    
    visitAgrupacion(node){

    }
    
    
    visitPrint(node){

    }
    
    
    visitAsignacion(node){

    }
    
    
    visitReferenciaVariable(node){

    }
    
    /**
     * @type {BaseVisitor['visitBloque']}
     */
    visitBloque(node){
        node.dcls.forEach(dcl => dcl.accept(this));
    }
    
    /**
     * @type {BaseVisitor['visitIf']}
     */
    visitIf(node){
        node.stmtTrue.accept(this);
        if(node.stmtFalse)node.stmtFalse.accept(this);   
    }
    
    /**
     * @type {BaseVisitor['visitWhile']}
     */
    visitWhile(node){
        node.stmt.accept(this);
    }
    
    /**
     * @type {BaseVisitor['visitFor']}
     */
    visitFor(node){
        node.stmt.accept(this);
    }
    
    /**
     * @type {BaseVisitor['visitSwitch']}
     */
    visitSwitch(node){
        node.cases.forEach(c => c.accept(this));
    }
    
    visitBreak(node){

    }
    
    
    visitContinue(node){

    }

    visitReturn(node){

    }
    
    
    visitFuncDcl(node){

    }

}
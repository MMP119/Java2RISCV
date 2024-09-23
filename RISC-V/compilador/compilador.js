import { registers as r } from "../constantes/constantes.js";
import { Generador } from "../generador/generador.js";
import { BaseVisitor} from "../compilador/visitor.js"


export class CompilerVisitor extends BaseVisitor{

    constructor(){
        super();
        this.code = new Generador();
    }


    /**
     * @type {BaseVisitor['visitExpresionStmt']}
     */
    visitExpresionStmt(node){
        node.exp.accept(this);
        this.code.popObject(r.T0); 
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
        this.code.comment(`Cadena: ${node.valor}`);
        this.code.pushContant({ type: 'string', valor: node.valor });
        this.code.comment(`Fin Cadena: ${node.valor}`);
    }


    /**
     * @type {BaseVisitor['visitBooleano']}
     */
    visitBooleano(node){
        this.code.comment(`Booleano: ${node.valor}`);
        this.code.pushContant({ type: 'int', valor: node.valor ? 1 : 0 });
        this.code.comment(`Fin Booleano: ${node.valor}`);
    }


    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitOperacionBinaria(node){
        this.code.comment(`Operacion: ${node.op}`);
        node.izq.accept(this); // izq |
        node.der.accept(this); // izq | der

        this.code.popObject(r.T0); // der
        this.code.popObject(r.T1); // izq

        switch (node.op) {
            case '+':
                this.code.add(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '-':
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
            case '*':
                this.code.mul(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '/':
                this.code.div(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
            case '%':
                this.code.rem(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
        }
        this.code.pushObject({ type: 'int', length: 4 });
    }


    
    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    visitOperacionUnaria(node){

        node.exp.accept(this);

        this.code.popObject(r.T0);

        switch (node.op) {
            case '-':
                this.code.li(r.T1, 0);
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
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
        });
    
        // Pop object y luego decidir el tipo
        const object = this.code.popObject(r.A0);
    
        const tipoPrint = {
            'int': () => this.code.printInt(),
            'string': () => this.code.printString()
        };
    
        // Llama a la función correcta según el tipo de objeto
        if (tipoPrint[object.type]) {
            tipoPrint[object.type]();
        } else {
            throw new Error(`Tipo de dato no soportado para imprimir: ${object.type}`);
        }
    }



    /**
     * @type {BaseVisitor['visitDeclaracionTipoVariable']}
     */

    visitDeclaracionTipoVariable(node){
        this.code.comment(`Declaracion de variable: ${node.id}`);
        node.exp.accept(this);
        this.code.tagObject(node.id);

        this.code.comment(`Fin Declaracion de variable: ${node.id}`);
    }



    /**
     * @type {BaseVisitor['visitAsignacion']}
     */
    visitAsignacion(node){
        this.code.comment(`Asignacion de variable: ${node.id}`);

        node.asgn.accept(this);
        const valueObject = this.code.popObject(r.T0);
        const [offset, variableObject] = this.code.getObject(node.id);

        this.code.addi(r.T1, r.SP, offset);
        this.code.sw(r.T0, r.T1);

        variableObject.type = valueObject.type;

        this.code.push(r.T0);
        this.code.pushObject(valueObject);

        this.code.comment(`Fin Asignacion de variable: ${node.id}`);

    }



    /**
     * @type {BaseVisitor['visitReferenciaVariable']}
     */
    visitReferenciaVariable(node){
        this.code.comment(`Referencia a variable ${node.id}: ${JSON.stringify(this.code.objectStack)}`);


        const [offset, variableObject] = this.code.getObject(node.id);
        this.code.addi(r.T0, r.SP, offset);
        this.code.lw(r.T1, r.T0);
        this.code.push(r.T1);
        this.code.pushObject({ ...variableObject, id: undefined });

        // this.code.comment(`Fin Referencia Variable: ${node.id}`);
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



}
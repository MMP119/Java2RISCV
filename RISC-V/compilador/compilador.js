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

        //Generar etiquetas únicas
        let labelTrue = this.code.newEtiquetaUnica('set_true');
        let labelFalse = this.code.newEtiquetaUnica('set_false');
        let end_comparison = this.code.newEtiquetaUnica('end_comparison');

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
            case '==':
                this.code.comment('Comparación igualdad');
                // Si son iguales, setear a true (1)
                this.code.beq(r.T1, r.T0, labelTrue);
                this.code.j(labelFalse);
                this.code.label(labelTrue);
                this.code.li(r.T0, 1); // se agina true a t0
                this.code.j(end_comparison)
                this.code.label(labelFalse);
                this.code.li(r.T0, 0); // se asigna false a t1
                this.code.label(end_comparison);
                this.code.push(r.T0);
                this.code.comment('Fin Comparación igualdad');
                break;
            case '!=':
                this.code.comment('Comparación desigualdad');
                // Si son diferentes, setear a true (1)
                this.code.bne(r.T1, r.T0, labelTrue);
                this.code.j(labelFalse);
                this.code.label(labelTrue);
                this.code.li(r.T0, 1); // se agina true a t0
                this.code.j(end_comparison)
                this.code.label(labelFalse);
                this.code.li(r.T0, 0); // se asigna false a t1
                this.code.label(end_comparison);
                this.code.push(r.T0);
                this.code.comment('Fin Comparación desigualdad');
                break;
            case '>':
                this.code.comment('Comparación mayor que');
                // Si es mayor, setear a true (1)
                this.code.bgt(r.T1, r.T0, labelTrue);
                this.code.j(labelFalse);
                this.code.label(labelTrue);
                this.code.li(r.T0, 1); // se agina true a t0
                this.code.j(end_comparison)
                this.code.label(labelFalse);
                this.code.li(r.T0, 0); // se asigna false a t1
                this.code.label(end_comparison);
                this.code.push(r.T0);
                this.code.comment('Fin Comparación mayor que');
                break;
            case '<':
                this.code.comment('Comparación menor que');
                // Si es menor, setear a true (1)
                this.code.blt(r.T1, r.T0, labelTrue);
                this.code.j(labelFalse);
                this.code.label(labelTrue);
                this.code.li(r.T0, 1); // se agina true a t0
                this.code.j(end_comparison)
                this.code.label(labelFalse);
                this.code.li(r.T0, 0); // se asigna false a t1
                this.code.label(end_comparison);
                this.code.push(r.T0);
                this.code.comment('Fin Comparación menor que');
                break;
            case '>=':
                this.code.comment('Comparación mayor o igual que');
                // Si es mayor o igual, setear a true (1)
                this.code.bge(r.T1, r.T0, labelTrue);
                this.code.j(labelFalse);
                this.code.label(labelTrue);
                this.code.li(r.T0, 1); // se agina true a t0
                this.code.j(end_comparison)
                this.code.label(labelFalse);
                this.code.li(r.T0, 0); // se asigna false a t1
                this.code.label(end_comparison);
                this.code.push(r.T0);
                this.code.comment('Fin Comparación mayor o igual que');
                break;
            case '<=':
                this.code.comment('Comparación menor o igual que');
                // Si es menor o igual, setear a true (1)
                this.code.ble(r.T1, r.T0, labelTrue);
                this.code.j(labelFalse);
                this.code.label(labelTrue);
                this.code.li(r.T0, 1); // se agina true a t0
                this.code.j(end_comparison)
                this.code.label(labelFalse);
                this.code.li(r.T0, 0); // se asigna false a t1
                this.code.label(end_comparison);
                this.code.push(r.T0);
                this.code.comment('Fin Comparación menor o igual que');
                break;
            case '&&':
                this.code.comment('Comparación AND');
                this.code.and(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.comment('Fin Comparación AND');
                break;
            case '||':
                this.code.comment('Comparación OR');
                this.code.or(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.comment('Fin Comparación OR');
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
                this.code.comment('Operación negación');
                this.code.li(r.T1, 0);
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
                this.code.comment('FIN Operación negación');
                break;
            case '!':
                this.code.comment('Comparación NOT');
                this.code.li(r.T1, 1); //cargar 1 en t1(true)
                this.code.xor(r.T0, r.T0, r.T1); //xor para negar t0 = t0 xor t1 (invierte el valor de t0)
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
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
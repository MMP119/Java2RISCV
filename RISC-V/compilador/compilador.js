import { registers as r } from "../constantes/constantes.js";
import { Generador } from "../generador/generador.js";
import { BaseVisitor} from "../compilador/visitor.js"
import {ExcepcionBrake, ExcepcionContinue, ExcepcionReturn} from "../../interprete/expresiones/operaciones/transferencia.js";


export class CompilerVisitor extends BaseVisitor{

    constructor(){
        super();
        this.code = new Generador();
        this.labelBreak = null;
        this.labelContinue = null;



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



    /**
     * @type {BaseVisitor['visitIf']}
     */
    visitIf(node) {
        this.code.comment('Inicio de If');

        // Visitar la condición y generar el código correspondiente
        node.cond.accept(this);
        
        // Pop the result of the condition into a register
        this.code.popObject(r.T0); // El resultado de la condición está en T0 (1 o 0)

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
        this.code.popObject(r.T0); // El resultado de la condición está en T0 (1 o 0)

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
        this.code.popObject(r.T0); // El resultado de la condición está en T0 (1 o 0)

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

        // Saltar al inicio para reevaluar la condición
        this.code.j(labelStart);

        // Restaurar las etiquetas anteriores
        this.labelBreak = oldLabelBreak;
        this.labelContinue = oldLabelContinue;

        // Etiqueta final
        this.code.label(labelEnd);

        this.code.comment('Fin de For');
    }

    

    /**
     * @type {BaseVisitor['visitSwitch']}
     */
    visitSwitch(node) {
        this.code.comment('Inicio de Switch');

        // Evaluar la expresión del switch y guardar el valor en T0
        node.exp.accept(this);
        this.code.popObject(r.T0); // El valor del switch está en T0

        // Copiar el valor de la expresión en t1
        this.code.comment('Copiar el valor de la expresión en t1');
        this.code.mv(r.T1, r.T0); // t1 = t0

        const labelEnd = this.code.newEtiquetaUnica('switch_end');
        let labelDefault = null; // Etiqueta para el bloque default
        const caseLabels = node.cases.map(() => this.code.newEtiquetaUnica('case')); // Etiquetas para cada case

        let defaultJumpAdded = false; // Para evitar saltar al default innecesariamente

        // Comparar el valor del switch con cada case
        node.cases.forEach((caseNode, index) => {
            this.code.comment(`Caso ${index + 1}`);

            caseNode.exp.accept(this);
            this.code.popObject(r.T0); // El valor del case está en T0

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
                try {
                    stmt.accept(this);
                } catch (e) {
                    if (e instanceof ExcepcionBrake) {
                        this.code.j(labelEnd); // Saltar al final si hay un break
                        return;
                    } else {
                        throw e;
                    }
                }
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
            throw new Error("Error: 'continue' usado fuera de un bucle.");
        }
    }



}
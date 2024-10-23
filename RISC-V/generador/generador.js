import { registers as r ,  floatRegisters as f} from "../constantes/constantes.js";
import { stringTo1ByteArray, numberToF32 } from "../utils/utils.js";
import { builtins } from "../utils/builtins.js";

class Instruction {

    constructor(instruccion, rd, rs1, rs2) {
        this.instruccion = instruccion;
        this.rd = rd;
        this.rs1 = rs1;
        this.rs2 = rs2;
    }

    toString() {
        const operandos = []
        if (this.rd !== undefined) operandos.push(this.rd)
        if (this.rs1 !== undefined) operandos.push(this.rs1)
        if (this.rs2 !== undefined) operandos.push(this.rs2)
        return `${this.instruccion} ${operandos.join(', ')}`
    }

}

export class Generador {

    constructor() {
        this.instrucciones = []
        this.objectStack = []
        this.instruccionesDeFunciones = [];
        this.depth = 0
        this.etiquetaUnica = 0
        this._usedBuiltins = new Set()
    }


    //Generador de etiquetas únicas
    newEtiquetaUnica(nombre){
        return `${nombre}_${this.etiquetaUnica++}`
    }


    //-----------------------------------------------------------------------------------------------

    //aritméticas: operaciones matemáticas entre registros

    add(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('add', rd, rs1, rs2))
    }
    
    addi(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('addi', rd, rs1, inmediato))
    }

    neg(rd, rs2){
        this.instrucciones.push(new Instruction('neg', rd, rs2))
    }

    sub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('sub', rd, rs1, rs2))
    }

    mul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('mul', rd, rs1, rs2))
    }

    mulh(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('mulh', rd, rs1, rs2))
    }    

    mulhu(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('mulhu', rd, rs1, rs2))
    }

    mulhsu(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('mulhsu', rd, rs1, rs2))
    }

    div(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('div', rd, rs1, rs2))
    }
    
    rem(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('rem', rd, rs1, rs2))
    }
    

    //-----------------------------------------------------------------------------------------------

    //lógicas: operaciones lógicas entre bits

    and(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('and', rd, rs1, rs2))
    }

    andi(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('andi', rd, rs1, inmediato))
    }

    not(rd, rs1) {
        this.instrucciones.push(new Instruction('not', rd, rs1))
    }

    or(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('or', rd, rs1, rs2))
    }

    ori(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('ori', rd, rs1, inmediato))
    }

    xor(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('xor', rd, rs1, rs2))
    }

    xori(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('xori', rd, rs1, inmediato))
    }


    //-------------------------------------------------------------------------------------------------------

    //shifts: son para desplazar bits de un registro a la izquiera o a la derecha
    sll(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('sll', rd, rs1, rs2))
    }

    slli(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('slli', rd, rs1, inmediato))
    }

    srl(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('srl', rd, rs1, rs2))
    }

    srli(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('srli', rd, rs1, inmediato))
    }

    sra(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('sra', rd, rs1, rs2))
    }
    
    srai(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('srai', rd, rs1, inmediato))
    }
    
    
    //-------------------------------------------------------------------------------------------------------
    
    //loab inmediate: carga un valor inmediato en un registro
    
    li(rd, inmediato) {
        this.instrucciones.push(new Instruction('li', rd, inmediato))
    }

    lui(rd, inmediato) {
        this.instrucciones.push(new Instruction('lui', rd, inmediato))
    }
    
    auipc(rd, inmediato) {
        this.instrucciones.push(new Instruction('auipc', rd, inmediato))
    }
    
    
    //-------------------------------------------------------------------------------------------------------

    //load ans store: cargar y almacenar valores en memoria
    
    lw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lw', rd, `${inmediato}(${rs1})`))
    }

    lh(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lh', rd, `${inmediato}(${rs1})`))
    }

    lhu(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lhu', rd, `${inmediato}(${rs1})`))
    }

    lb(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lb', rd, `${inmediato}(${rs1})`))
    }

    lbu(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lbu', rd, `${inmediato}(${rs1})`))
    }

    la(rd, symbol) { //para cargar la dirección de una etiqueta
        this.instrucciones.push(new Instruction('la', rd, symbol))
    }

    sw(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sw', rs1, `${inmediato}(${rs2})`))
    }

    sh(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sh', rs1, `${inmediato}(${rs2})`))
    }

    sb(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sb', rs1, `${inmediato}(${rs2})`))
    }


    //-------------------------------------------------------------------------------------------------------

    //Jump and Function: saltos y llamadas a funciones

    j(label) {
        this.instrucciones.push(new Instruction('j', label))
    }
    
    jal(label) {
        this.instrucciones.push(new Instruction('jal', label))
    }

    jalr(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('jalr', rd, rs1, inmediato))
    }

    call(label) {
        this.instrucciones.push(new Instruction('call', label))
    }

    ret() {
        this.instrucciones.push(new Instruction('ret'))
    }


    //-------------------------------------------------------------------------------------------------------


    //Branch: saltos condicionales
    beq(rs1, rs2, inmediato) { //branch if equal
        this.instrucciones.push(new Instruction('beq', rs1, rs2, inmediato))
    }
    
    beqz(rs1, label) { //branch if equal zero
        this.instrucciones.push(new Instruction('beqz', rs1, label));
    }

    bne(rs1, rs2, inmediato) {//branch if not equal
        this.instrucciones.push(new Instruction('bne', rs1, rs2, inmediato))
    }

    bnez(rs1, rs2, inmediato) {
        this.instrucciones.push(new Instruction('bnez', rs1, rs2, inmediato))
    }

    blt(rs1, rs2, inmediato) {
        this.instrucciones.push(new Instruction('blt', rs1, rs2, inmediato))
    }

    bltu(rs1, rs2, inmediato) {
        this.instrucciones.push(new Instruction('bltu', rs1, rs2, inmediato))
    }

    bltz(rs1, inmediato) {
        this.instrucciones.push(new Instruction('bltz', rs1, inmediato))
    }

    bgt(rs1, rs2, inmediato) {
        this.instrucciones.push(new Instruction('bgt', rs1, rs2, inmediato))
    }

    bgtu(rs1, rs2, inmediato) {
        this.instrucciones.push(new Instruction('bgtu', rs1, rs2, inmediato))
    }

    bgtz(rs1, inmediato) {
        this.instrucciones.push(new Instruction('bgtz', rs1, inmediato))
    }

    ble(rs1, rs2, inmediato) {
        this.instrucciones.push(new Instruction('ble', rs1, rs2, inmediato))
    }

    bleu(rs1, rs2, inmediato) {
        this.instrucciones.push(new Instruction('bleu', rs1, rs2, inmediato))
    }

    blez(rs1, inmediato) {
        this.instrucciones.push(new Instruction('blez', rs1, inmediato))
    }

    bge(rs1, rs2, inmediato) {
        this.instrucciones.push(new Instruction('bge', rs1, rs2, inmediato))
    }

    bgeu(rs1, rs2, inmediato) {
        this.instrucciones.push(new Instruction('bgeu', rs1, rs2, inmediato))
    }

    bgez(rs1, inmediato) {
        this.instrucciones.push(new Instruction('bgez', rs1, inmediato))
    }


    //-------------------------------------------------------------------------------------------------------

    //Set: asignar un valor a un registro

    slt(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('slt', rd, rs1, rs2))
    }

    slti(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('slti', rd, rs1, inmediato))
    }

    sltu(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('sltu', rd, rs1, rs2))
    }

    sltiu(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('sltiu', rd, rs1, inmediato))
    }

    seqz(rd, rs1) {
        this.instrucciones.push(new Instruction('seqz', rd, rs1))
    }

    snez(rd, rs1) {
        this.instrucciones.push(new Instruction('snez', rd, rs1))
    }

    sltz(rd, rs1) {
        this.instrucciones.push(new Instruction('sltz', rd, rs1))
    }

    sgtz(rd, rs1) {
        this.instrucciones.push(new Instruction('sgtz', rd, rs1))
    }


    //-------------------------------------------------------------------------------------------------------

    //Counters: incrementar o decrementar un registro

    //SE REQUIERE ZICSR EXTENSION

    rdcycle(rd) {
        this.instrucciones.push(new Instruction('rdcycle', rd))
    }

    rdcycleh(rd) {
        this.instrucciones.push(new Instruction('rdcycleh', rd))
    }

    rdtime(rd) {
        this.instrucciones.push(new Instruction('rdtime', rd))
    }

    rdtimeh(rd) {
        this.instrucciones.push(new Instruction('rdtimeh', rd))
    }

    rdinstret(rd) {
        this.instrucciones.push(new Instruction('rdinstret', rd))
    }

    rdinstreth(rd) {
        this.instrucciones.push(new Instruction('rdinstreth', rd))
    }


    //-------------------------------------------------------------------------------------------------------


    //Misc

    ebreak() {
        this.instrucciones.push(new Instruction('ebreak'))
    }

    ecall() {
        this.instrucciones.push(new Instruction('ecall'))
    }

    fence() {
        this.instrucciones.push(new Instruction('fence'))
    }

    mv(rd, rs1) {
        this.instrucciones.push(new Instruction('mv', rd, rs1))
    }

    nop() {
        this.instrucciones.push(new Instruction('nop'))
    }


    //-------------------------------------------------------------------------------------------------------

    label(label) {
        this.instrucciones.push(new Instruction(`${label}:`))
    }

    //-------------------------------------------------------------------------------------------------------


    // operaciones con flotantes
    fadd(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fadd.s', rd, rs1, rs2))
    }

    fsub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fsub.s', rd, rs1, rs2))
    }

    fmul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fmul.s', rd, rs1, rs2))
    }

    fdiv(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fdiv.s', rd, rs1, rs2))
    }

    frem(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('frem.s', rd, rs1, rs2))
    }

    fli(rd, inmediato) {
        this.instrucciones.push(new Instruction('fli.s', rd, inmediato))
    }

    fmv(rd, rs1) {
        this.instrucciones.push(new Instruction('fmv.s', rd, rs1))
    }

    flw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('flw', rd, `${inmediato}(${rs1})`))
    }

    fsw(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('fsw', rs1, `${inmediato}(${rs2})`))
    }

    fcvtsw(rd, rs1) { //convertir de entero a float
        this.instrucciones.push(new Instruction('fcvt.s.w', rd, rs1))
    }

    feqs(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('feq.s', rd, rs1, rs2))
    }

    flts(rd, rs1, rs2) { //menor que floats
        this.instrucciones.push(new Instruction('flt.s', rd, rs1, rs2))
    }

    fles(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fle.s', rd, rs1, rs2))
    }

    printFloat(rd = f.FA0) {

        if (rd !== f.FA0) {
            this.pushFloat(f.FA0)
            this.fmv(f.FA0, rd)
        }else{
            this.fmv(f.FA0, rd)
        }

        this.li(r.A7, 2)
        this.ecall()

        if (rd !== f.FA0) {
            this.popFloat(f.FA0)
        }
        
    }

    fmvxw(rd, rs1) { //pasar el float en su representacion en binario
        this.instrucciones.push(new Instruction('fmv.x.w', rd, rs1))
    }

    //---------------------------------------------------------------------------------------------------------


    push(rd = r.T0) {
        this.addi(r.SP, r.SP, -4) // 4 bytes = 32 bits
        this.sw(rd, r.SP)
    }

    pushFloat(rd = r.FT0) {
        this.addi(r.SP, r.SP, -4) // 4 bytes = 32 bits
        this.fsw(rd, r.SP)
    }

    pop(rd = r.T0) {
        this.comment(`Pop`);
        this.lw(rd, r.SP)
        this.addi(r.SP, r.SP, 4)
        this.comment(`fin Pop`);
    }
    
    popFloat(rd = r.FT0) {
        this.flw(rd, r.SP)
        this.addi(r.SP, r.SP, 4)
    }


    printInt(rd = r.A0) {

        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        this.li(r.A7, 1)
        this.ecall()

        if (rd !== r.A0) {
            this.pop(r.A0)
        }
    }


    printString(rd = r.A0) {

        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        this.li(r.A7, 4)
        this.ecall()

        if (rd !== r.A0) {
            this.pop(r.A0)
        }
    }


    printChar(rd = r.A0) {
            
        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        this.li(r.A7, 11)
        this.ecall()

        if (rd !== r.A0) {
            this.pop(r.A0)
        }
    
    }

    printNull(rd = r.A0) {
        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        this.li(r.A7, 4)
        this.ecall()

        if (rd !== r.A0) {
            this.pop(r.A0)
        }
    }

    
    printArray(arrayObject) {
        const length = arrayObject.length / 4; // Número de elementos
        const {typeObjects} = arrayObject;

        this.comment(`Imprimiendo arreglo de longitud ${length}`);

        this.li(r.A0, 91); // ASCII para '['
        this.printChar();
    
        // T0 ya tiene la dirección base del arreglo; no hace falta hacer pop.
    
        for (let i = 0; i < length; i++) {
            const offset = i * 4; // Offset del elemento en bytes
    
            if(typeObjects === 'float'){

                // Cargar el elemento desde la memoria relativa a T0
                this.flw(f.FT1, r.T0, offset);
                this.printFloat(f.FT1);

            }else{

                // Acceder al valor del elemento usando la dirección base en T0
                this.lw(r.T1, r.T0, offset);

                // Imprimir el valor como entero
                this.printPrimitive({ type: typeObjects, valor: r.T1 });

            }
    
            if(i < length - 1){
                this.li(r.A0, 44); // ASCII para ',' 
                this.printChar();
                this.li(r.A0, 32); // ASCII para ' '
                this.printChar();
            }
        }

        this.li(r.A0, 93); // ASCII para ']'
        this.printChar();
    }


    printPrimitive(object) {
        const tipoPrint = {
            'int': () => this.printInt(object.valor),
            'string': () => this.printString(object.valor),
            'boolean': () => this.callBuiltin('printBool'),
            'char': () => this.printChar(object.valor),
            'null': () => this.printNull(object.valor),
        };
    
        // Llamamos a la función de impresión según el tipo del objeto
        if (tipoPrint[object.type]) {
            tipoPrint[object.type]();
        } else {
            throw new Error(`Tipo de dato no soportado para imprimir: ${object.type}`);
        }
    }



    printArregloJoin(arreglo) {
        
        const length = arreglo.length / 4; // Número de elementos
        const {typeObjects} = arreglo;

        this.comment(`Imprimiendo join ${length}`);

        // T0 ya tiene la dirección base del arreglo; no hace falta hacer pop.
    
        for (let i = 0; i < length; i++) {
            const offset = i * 4; // Offset del elemento en bytes
    
            if(typeObjects === 'float'){

                // Cargar el elemento desde la memoria relativa a T0
                this.flw(f.FT1, r.T0, offset);
                this.printFloat(f.FT1);

            }else{

                // Acceder al valor del elemento usando la dirección base en T0
                this.lw(r.T1, r.T0, offset);

                // Imprimir el valor como entero
                this.printPrimitive({ type: typeObjects, valor: r.T1 });

            }
    
            if(i < length - 1){
                this.li(r.A0, 44); // ASCII para ',' 
                this.printChar();
                this.li(r.A0, 32); // ASCII para ' '
                this.printChar();
            }
        }
    }


    callBuiltin(builtinName) {
        if (!builtins[builtinName]) {
            throw new Error(`Builtin ${builtinName} not found`)
        }
        this._usedBuiltins.add(builtinName)
        this.jal(builtinName)
    }


    endProgram() {
        this.li(r.A7, 10)
        this.ecall()
    }

    comment(text) {
        this.instrucciones.push(new Instruction(`# ${text}`))
    }

    callBuiltin(builtinName) {
        if (!builtins[builtinName]) {
            throw new Error(`Builtin ${builtinName} not found`)
        }
        this._usedBuiltins.add(builtinName)
        this.jal(builtinName)
    }

    pushContant(object) {
        let length = 0;

        switch (object.type) {
            case 'int':
                this.li(r.T0, object.valor);
                this.push()
                length = 4;
                break;

            case 'float':
                const ieee754 = numberToF32(object.valor);
                this.li(r.T0, ieee754);
                this.push(r.T0);
                length = 4;
                break;

            case 'string':
                const stringArray = stringTo1ByteArray(object.valor);

                this.comment(`Pushing string ${object.valor}`);
                this.push(r.HP);

                stringArray.forEach((charCode) => {
                    this.li(r.T0, charCode);
                    this.sb(r.T0, r.HP);
                    this.addi(r.HP, r.HP, 1);
                });

                length = 4;
                break;

            case 'boolean':
                this.li(r.T0, object.valor ? 1 : 0);
                this.push(r.T0);
                length = 4;
                break;

            case 'char':
                this.li(r.T0, object.valor.charCodeAt(0));
                this.push(r.T0);
                length = 4;
                break;
            
            case 'null':
                const nullString = stringTo1ByteArray(object.valor);
                this.comment(`Pushing string ${object.valor}`);
                this.push(r.HP);

                nullString.forEach((charCode) => {
                    this.li(r.T0, charCode);
                    this.sb(r.T0, r.HP);
                    this.addi(r.HP, r.HP, 1);
                });

                length = 4;
                break;
            
            case 'arreglo':
                
                this.comment(`Pushing arreglo`);

                // Guardar la dirección inicial del arreglo en T0
                this.add(r.T0, r.SP, r.ZERO);

                // Empujar la dirección del arreglo en el stack para referencias futuras
                this.push(r.T0);

                length = object.length; // Guardar el tamaño del arreglo completo
                this.pushObject({ type: object.type, length, depth: this.depth, typeObjects: object.typeObjects });
                return;

            default:
                break;
        }

        this.pushObject({ type: object.type, length, depth: this.depth });
    }

    pushObject(object) {
        //this.objectStack.push(object);
        this.objectStack.push({
            ...object,
            depth: this.depth
        });
    }

    popObject(rd = r.T0) {
        const object = this.objectStack.pop();
        
        switch (object.type) {
            case 'int':
                this.comment(`Poping int`);
                this.pop(rd);
                this.comment(`fin Poped int `);
                break;

            case 'float':
                this.comment(`Poping float`);
                this.popFloat(rd);
                this.comment(`fin Poped float`);
                break;

            case 'string':
                this.comment(`Poping string`);
                this.pop(rd);
                this.comment(`fin Poped string`);
                break;

            case 'boolean':
                this.comment(`Poping boolean`);
                this.pop(rd);
                this.comment(`fin Poped boolean`);
                break;

            case 'char':
                this.comment(`Poping char`);
                this.pop(rd);
                this.comment(`fin Poped char`);
                break;
            
            case 'null':
                this.comment(`Poping null`);
                this.pop(rd);
                this.comment(`fin Poped nul`);
                break;
            
            case 'arreglo':
                this.comment(`Poping arreglo`);
                this.pop(rd);
                this.comment(`fin Poped arreglo`);
                break;

            default:
                break;
        }

        return object;
    }

    getTopObject(){
        return this.objectStack[this.objectStack.length - 1];
    }

    /*
    FUNCIONES PARA ENTORNOS
    */

    newScope() {
        this.depth++
    }

    endScope() {
        let byteOffset = 0;

        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].depth === this.depth) {
                byteOffset += this.objectStack[i].length;
                this.objectStack.pop();
            } else {
                break;
            }
        }
        this.depth--

        return byteOffset;
    }


    tagObject(id) {
        this.objectStack[this.objectStack.length - 1].id = id;
    }

    getObject(id) {
        let byteOffset = 0;
        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].id === id) {
                return [byteOffset, this.objectStack[i]];
            }
            byteOffset += this.objectStack[i].length;
        }

        throw new Error(`Variable ${id} not found`);
    }

    toString() {
        this.endProgram()
        this.comment('Builtins')

        this.comment('funciones foraneas')
        this.instruccionesDeFunciones.forEach(instruccion => this.instrucciones.push(instruccion))

        Array.from(this._usedBuiltins).forEach(builtinName => {
            this.label(builtinName)
            builtins[builtinName](this)
            this.ret()
        })

        return `
.data
        heap:
.text

# inicializando el heap pointer
    la ${r.HP}, heap

main:
    ${this.instrucciones.map(instruccion => `${instruccion}`).join('\n')}
`
    }


}





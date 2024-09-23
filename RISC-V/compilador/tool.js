
// import fs from 'fs';
const fs = require('fs')

const types = [
    `
/**
 * @typedef {Object} Location
 * @property {Object} start
 * @property {number} start.offset
 * @property {number} start.line
 * @property {number} start.column
 * @property {Object} end
 * @property {number} end.offset
 * @property {number} end.line
 * @property {number} end.column
*/
    `
]

const configuracionNodos = [
    // Configuracion del nodo inicial
    {
        name: 'Expresion',
        base: true,
        props: [
            {
                name: 'location',
                type: 'Location|null',
                description: 'Ubicacion del nodo en el codigo fuente',
                default: 'null'
            }
        ]
    },
    // Configuracion de los nodos secundarios
    {
        name: 'OperacionBinaria',
        extends: 'Expresion',
        props: [
            {
                name: 'izq',
                type: 'Expresion',
                description: 'Expresion izquierda de la operacion'
            },
            {
                name: 'der',
                type: 'Expresion',
                description: 'Expresion derecha de la operacion'
            },
            {
                name: 'op',
                type: 'string',
                description: 'Operador de la operacion'
            }
        ]
    },
    {
        name: 'OperacionUnaria',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion de la operacion'
            },
            {
                name: 'op',
                type: 'string',
                description: 'Operador de la operacion'
            }
        ]
    },
    {
        name: 'Agrupacion',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion agrupada'
            }
        ]
    },
    {
        name: 'Numero',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de dato'
            },
            {
                name: 'valor',
                type: 'entero',
                description: 'Valor del numero'
            }
        ]
    },

    // Cadena (secuencias de escape)
    {
        name: 'Cadena',
        extends: 'Expresion',
        props: [
            {
                name:'tipo',
                type: 'string',
                description: 'Tipo de dato'
            },
            {
                name: 'valor',
                type: 'String',
                description: 'Valor de la cadena'
            }
        ]
    },

    // booleano
    {
        name: 'Booleano',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de dato'
            },
            {
                name: 'valor',
                type: 'Boolean',
                description: 'Valor del booleano'
            }
        ]
    },


    // Declaracion tipo variable
    {
        name: 'DeclaracionTipoVariable',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de la variable'
            },
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            },
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion de la variable'
            }
        ]
    },
    
    // ReferenciaVariable
    {
        name: 'ReferenciaVariable',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            }
        ]
    },
    // Print
    {
        name: 'Print',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a imprimir'
            }
        ]
    },

    {
        name: 'ExpresionStmt',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },
    // Asignacion
    {
        name: 'Asignacion',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            },
            {
                name: 'asgn',
                type: 'Expresion',
                description: 'Expresion a asignar'
            }
        ]
    },
    // Bloque
    {
        name: 'Bloque',
        extends: 'Expresion',
        props: [
            {
                name: 'dcls',
                type: 'Expresion[]',
                description: 'Sentencias del bloque'
            }
        ]
    },
    {
        name: 'If',
        extends: 'Expresion',
        props: [
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del if'
            },
            {
                name: 'stmtTrue',
                type: 'Expresion',
                description: 'Cuerpo del if'
            },
            {
                name: 'stmtFalse',
                type: 'Expresion|undefined',
                description: 'Cuerpo del else'
            }
        ]
    },
    // While
    {
        name: 'While',
        extends: 'Expresion',
        props: [
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del while'
            },
            {
                name: 'stmt',
                type: 'Expresion',
                description: 'Cuerpo del while'
            }
        ]
    },

    // For
    {
        name: 'For',
        extends: 'Expresion',
        props: [
            {
                name: 'init',
                type: 'Expresion',
                description: 'Inicializacion del for'
            },
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del for'
            },
            {
                name: 'inc',
                type: 'Expresion',
                description: 'Incremento del for'
            },
            {
                name: 'stmt',
                type: 'Expresion',
                description: 'Cuerpo del for'
            }
        ]
    },

    {
        name: 'Foreach',
        extends: 'Expresion',
        props:[
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de dato'
            },
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            },
            {
                name:'id2',
                type: 'Expresion',
                description: 'Identificador del arreglo'
            },
            {
                name: 'stmt',
                type: 'Expresion',
                description: 'Cuerpo del foreach'
            }
        ]
    },

    // break 
    {
        name: 'Break',
        extends: 'Expresion',
        props: []
    },

    // continue
    {
        name: 'Continue',
        extends: 'Expresion',
        props: []
    },

    // return
    {
        name: 'Return',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion | undefined',
                description: 'Expresion a retornar'
            }
        ]
    },

    // llamada a funcion
    {
        name: 'Llamada',
        extends: 'Expresion',
        props: [
            {
                name: 'callee',
                type: 'Expresion',
                description: 'Expresion a llamar'
            },
            {
                name: 'args',
                type: 'Expresion[]',
                description: 'Argumentos de la llamada'
            }
        ]
    },
    //DecFuncion = tipos:(TiposDatosPrimitivos/"void")  _ id:Identificador _ "(" _ params:Parametros? _ ")" _ bloque:Bloque { return crearNodo('dclFunc', { id, params: params || [], bloque }) }
    {
        name: 'FuncDcl',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de dato'
            },
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la funcion'
            },
            {
                name: 'params',
                type: 'string[]',
                description: 'Parametros de la funcion'
            },
            {
                name: 'bloque',
                type: 'Bloque',
                description: 'Cuerpo de la funcion'
            }
        ]
    },

    {
        name: 'Ternario',
        extends: 'Expresion',
        props: [
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del ternario'
            },
            {
                name: 'expTrue',
                type: 'Expresion',
                description: 'Expresion si la condicion es verdadera'
            },
            {
                name: 'expFalse',
                type: 'Expresion',
                description: 'Expresion si la condicion es falsa'
            }
        ]
    },
    {
        name: 'Switch',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            },
            {
                name: 'cases',
                type: 'Expresion []',
                description: 'Casos del switch'
            },
            {
                name: 'defaultClause',
                type: 'Expresion [] | undefined | null',
                description: 'default del switch'
            }
        ]
    },
    {
        name: 'DeclaracionArreglo',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo del arreglo'
            },
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del arreglo'
            },
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion del arreglo'
            },
            {
                name: 'tipo2',
                type: 'string',
                description: 'Tipo del arreglo 2'
            },
            {
                name: 'id2',
                type: 'Expresion',
                description: 'Identificador del arreglo 2'
            }

        ]
    },
    {
        name: 'DeclaracionMatriz',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de la matriz'
            },
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la matriz'
            },
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion de la matriz1'
            },
            {
                name: 'expN',
                type: 'Expresion',
                description: 'Expresion de la matrizN, arreglo de arreglos'
            },
            {
                name: 'tipo2',
                type: 'string',
                description: 'Tipo de la matriz2'
            }

        ]
    },
    {
        name:'ArrayFunc',
        extends: 'Expresion',
        props:[
            {
                name: 'id',
                type: 'Expresion',
                description: 'Identificador del arreglo'
            },
            {
                name: 'method',
                type: 'string',
                description: 'método que se va a ejecutar'
            },
            {
                name: 'exp',
                type: 'Expresion',
                description: 'expresion, indice o valor'
            }
        ]
    },
    {
        name:'MatrizFunc',
        extends: 'Expresion',
        props:[
            {
                name: 'id',
                type: 'Expresion',
                description: 'Identificador de la matriz'
            },
            {
                name: 'method',
                type: 'string',
                description: 'método que se va a ejecutar'
            },
            {
                name: 'indexs',
                type: 'Expresion',
                description: 'expresion, indice o valor'
            },
            {
                name: 'value',
                type: 'Expresion',
                description: 'expresion que se va a asignar'
            }

        ]
    },
    {
        name: 'typEof',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },

    //"struct" _ id:Identificador _ "{" _ dcls:ClassStruct*  _ "}" {return crearNodo('dclStruct', {id, dcls})}
    {
        name: 'StructDcl',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del struct'
            },
            {
                name: 'dcls',
                type: 'Expresion[]',
                description: 'Declaraciones del struct'
            }
        ]
    },
    {
        name: 'Instancia',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de la instancia del struct'
            },
            {
                name: 'id',
                type: 'string',
                description: 'identificador de la instancia'
            },
            {
                name: 'args',
                type: 'Expresion[]',
                description: 'Argumentos de la instancia'
            }
        ]
    },
    {
        name: 'Get',
        extends: 'Expresion',
        props: [
            {
                name: 'objetivo',
                type: 'Expresion',
                description: 'Objeto de la propiedad'
            },
            {
                name: 'propiedad',
                type: 'string',
                description: 'Identificador de la propiedad'
            }
        ]
    },
    {
        name: 'Set',
        extends: 'Expresion',
        props: [
            {
                name: 'objetivo',
                type: 'Expresion',
                description: 'Objeto de la propiedad'
            },
            {
                name: 'propiedad',
                type: 'string',
                description: 'Identificador de la propiedad'
            },
            {
                name: 'valor',
                type: 'Expresion',
                description: 'Valor de la propiedad'
            }
        ]
    },
    {
        // "Object.keys" _ "(" _ exp:Datos _ ")" { return crearNodo('ObjKey', { exp }) }
        name: 'ObjKey',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    }

]

let code = ''

// Tipos base
types.forEach(type => {
    code += type + '\n'
})


// // Tipos de nodos
// configuracionNodos.forEach(nodo => {
//     code += `
// /**
//  * @typedef {Object} ${nodo.name}
//  * ${nodo.props.map(prop => `@property {${prop.type}} ${prop.name} ${prop.description}`).join('\n * ')}
// */
//     `
// })

// Tipos del visitor
code += `
/**
 * @typedef {import('./visitor').BaseVisitor} BaseVisitor
 */
`

const baseClass = configuracionNodos.find(nodo => nodo.base)

configuracionNodos.forEach(nodo => {


    code += `
export class ${nodo.name} ${baseClass && nodo.extends ? `extends ${nodo.extends}` : ''} {

    /**
    * @param {Object} options
    * ${nodo.props.map(prop => `@param {${prop.type}} options.${prop.name} ${prop.description}`).join('\n * ')}
    */
    constructor(${!nodo.base && nodo.props.length>0 && `{ ${nodo.props.map(prop => `${prop.name}`).join(', ')} }` || ''}) {
        ${baseClass && nodo.extends ? `super();` : ''}
        ${nodo.props.map(prop => `
        /**
         * ${prop.description}
         * @type {${prop.type}}
        */
        this.${prop.name} = ${prop.default || `${prop.name}`};
`).join('\n')}
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visit${nodo.name}(this);
    }
}
    `
})

code += `
export default { ${configuracionNodos.map(nodo => nodo.name).join(', ')} }
`


fs.writeFileSync('./nodos.js', code)
console.log('Archivo de clases de nodo generado correctamente')


// Visitor
// @typedef {import('./nodos').Expresion} Expresion
code = `
/**
${configuracionNodos.map(nodo => `
 * @typedef {import('./nodos').${nodo.name}} ${nodo.name}
`).join('\n')}
 */
`

code += `

/**
 * Clase base para los visitantes
 * @abstract
 */
export class BaseVisitor {

    ${configuracionNodos.map(nodo => `
    /**
     * @param {${nodo.name}} node
     * @returns {any}
     */
    visit${nodo.name}(node) {
        throw new Error('Metodo visit${nodo.name} no implementado');
    }
    `).join('\n')
    }
}
`

fs.writeFileSync('./visitor.js', code)
console.log('Archivo de visitor generado correctamente')
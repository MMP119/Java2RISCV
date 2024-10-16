// module.exports = {
//     format: 'es',
//     input: './analizador/analizador.pegjs',
//     dependencies:{
//         'nodos': '../patron/nodos.js'
//     }
// }


module.exports = {
    format: 'es',
    input: './RISC-v/analizador/analizador.pegjs',
    dependencies:{
        'nodos': '../compilador/nodos.js'
    }
}

// corre con el comando npx peggy -c ./config.js

//npx peggy .\analizador.pegjs --format=es --dependencies='{\"nodos\": \"../compilador/nodos.js\"}'
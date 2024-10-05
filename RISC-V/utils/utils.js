export const stringTo32BitsArray = (str) => {

    const resultado = [];
    let elementIndex = 0;
    let intRepresentation = 0;
    let shift = 0;


    while (elementIndex < str.length){
        intRepresentation = intRepresentation | (str.charCodeAt(elementIndex) << shift)
        shift += 8
        if (shift >= 32) {
            resultado.push(intRepresentation)
            intRepresentation = 0
            shift = 0
        }
        elementIndex++
    }

    if (shift > 0) {
        resultado.push(intRepresentation);
    }

    return resultado;

}


export const stringTo1ByteArray = (str) => {
    const resultado = []
    let elementIndex = 0

    while (elementIndex < str.length) {
        resultado.push(str.charCodeAt(elementIndex))
        elementIndex++
    }
    resultado.push(0)
    return resultado;
}
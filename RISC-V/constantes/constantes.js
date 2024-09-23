export const registers = {
    // registros de RISC-V
    ZERO: 'zero',   // siempre contiene el valor 0 (constante)
    RA: 'ra',       // registro para guardar la dirección de retorno
    SP: 'sp',       // puntero de pila (stack pointer)
    GP: 'gp',       // puntero global (global pointer)
    TP: 'tp',       // puntero de tabla (thread pointer)
    T0: 't0',       // registro temporal (no preservado entre llamadas)
    T1: 't1',       // registro temporal (no preservado entre llamadas)
    T2: 't2',       // registro temporal (no preservado entre llamadas)
    S0_FP: 's0/fp', // s0: registro guardado (a veces usado como frame pointer)
    S1: 's1',       // registro guardado (preservado entre llamadas)
    A0: 'a0',       // argumento (primer parámetro y valor de retorno)
    A1: 'a1',       // argumento (segundo parámetro)
    A2: 'a2',       // argumento (tercer parámetro)
    A3: 'a3',       // argumento (cuarto parámetro)
    A4: 'a4',       // argumento (quinto parámetro)
    A5: 'a5',       // argumento (sexto parámetro)
    A6: 'a6',       // argumento (séptimo parámetro)
    A7: 'a7',       // argumento (octavo parámetro)
    S2: 's2',       // registro guardado (preservado entre llamadas)
    S3: 's3',       // registro guardado (preservado entre llamadas)
    S4: 's4',       // registro guardado (preservado entre llamadas)
    S5: 's5',       // registro guardado (preservado entre llamadas)
    S6: 's6',       // registro guardado (preservado entre llamadas)
    S7: 's7',       // registro guardado (preservado entre llamadas)
    S8: 's8',       // registro guardado (preservado entre llamadas)
    S9: 's9',       // registro guardado (preservado entre llamadas)
    S10: 's10',     // registro guardado (preservado entre llamadas)
    S11: 's11',     // registro guardado (preservado entre llamadas)
    T3: 't3',       // registro temporal (no preservado entre llamadas)
    T4: 't4',       // registro temporal (no preservado entre llamadas)
    T5: 't5',       // registro temporal (no preservado entre llamadas)
    // T6: 't6',    // registro temporal (no preservado entre llamadas)

    // pseudo-registro
    HP: 't6',       // registro temporal o pseudo-registro 'HP'
};

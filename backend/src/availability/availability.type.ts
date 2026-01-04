//------------------
// Retorno do Banco  
//------------------

export type AvailabilityRow = {
    dia_semana: number,
    hora_inicio: number,
    hora_fim: number,
}

//--------------
// Response DTO 
//--------------

export type AvailabilityResponseDTO = {
    availability: {
        diaSemana: number;
        horaInicio: number;
        horaFim: number;
    }[]
}
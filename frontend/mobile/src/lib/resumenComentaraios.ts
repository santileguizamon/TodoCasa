export function obtenerResumenComentarios(
    valoraciones: any[],
    max = 2
  ) {
    const conComentario = valoraciones.filter(
      (v) => v.comentario && v.comentario.trim().length > 0
    )
  
    // Mezcla simple
    const mezcladas = conComentario.sort(
      () => 0.5 - Math.random()
    )
  
    return mezcladas.slice(0, max)
  }
  
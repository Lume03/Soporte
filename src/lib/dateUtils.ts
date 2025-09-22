/**
 * Formatea una fecha ISO a formato legible en español (Perú)
 * @param dateString - String de fecha en formato ISO
 * @returns String formateado como "dd/mm/yyyy HH:mm" o "-" si no es válido
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return "-";
    
    // Formatear a formato peruano: dd/mm/yyyy HH:mm
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Lima' // Zona horaria de Perú
    });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "-";
  }
}

/**
 * Formatea una fecha ISO a solo fecha sin hora
 * @param dateString - String de fecha en formato ISO
 * @returns String formateado como "dd/mm/yyyy" o "-" si no es válido
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return "-";
    
    // Formatear solo la fecha
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Lima'
    });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "-";
  }
}
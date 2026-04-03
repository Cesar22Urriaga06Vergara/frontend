/**
 * Convierte el campo `imagenes` de la entidad Habitacion al formato de array de URLs.
 *
 * El backend almacena las imágenes como un string CSV:
 *   "https://res.cloudinary.com/...,https://res.cloudinary.com/..."
 *
 * Esta función es la única fuente de verdad para parsear ese campo.
 * Acepta string CSV, array ya procesado, o undefined/null.
 */
export const parseImagenes = (imagenes?: string | string[] | null): string[] => {
  if (!imagenes) return []
  if (Array.isArray(imagenes)) return imagenes.filter(Boolean)
  const trimmed = imagenes.trim()
  if (!trimmed) return []
  return trimmed.split(',').map(u => u.trim()).filter(Boolean)
}

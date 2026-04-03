export const getErrorMessage = (error: any, fallback = 'Error inesperado'): string => {
  const directMessage = error?.message
  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage
  }

  const dataMessage = error?.data?.message
  if (typeof dataMessage === 'string' && dataMessage.trim()) {
    return dataMessage
  }

  if (Array.isArray(dataMessage) && dataMessage.length > 0) {
    return String(dataMessage[0])
  }

  return fallback
}

export const isUnavailableError = (error: any): boolean => {
  const statusCode = Number(error?.statusCode || error?.data?.statusCode || 0)
  return [404, 501, 502, 503].includes(statusCode)
}

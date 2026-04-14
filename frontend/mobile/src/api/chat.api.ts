import { apiFetch } from '../lib/api'

export function obtenerChatPorTrabajo(trabajoId: number) {
  return apiFetch(`/chats/trabajo/${trabajoId}`)
}

export function obtenerMensajes(chatId: number) {
  return apiFetch(`/chats/${chatId}/mensajes`)
}

export function enviarMensaje(chatId: number, contenido: string) {
  return apiFetch(`/chats/${chatId}/mensaje`, {
    method: 'POST',
    body: JSON.stringify({ contenido }),
  })
}

export function obtenerChats(options?: { archivados?: boolean }) {
  const params = options?.archivados ? '?archivados=true' : ''
  return apiFetch(`/chats${params}`)
}

export const marcarChatLeido = (chatId: number) =>
  apiFetch(`/chats/${chatId}/leer`, { method: 'POST' })

export const archivarChat = (chatId: number) =>
  apiFetch(`/chats/${chatId}/archivar`, { method: 'POST' })

export const restaurarChat = (chatId: number) =>
  apiFetch(`/chats/${chatId}/restaurar`, { method: 'POST' })

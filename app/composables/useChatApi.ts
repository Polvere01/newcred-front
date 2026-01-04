// ~/composables/useChatApi.ts
import type { Conversa, Mensagem } from '~/types/chat'
import { useSoundGuard } from '~/composables/useSoundGuard'


type EnviarReq = {
  conversaId: number
  waIdDestino: string
  texto: string
}

type EnviarResp = { mensagemId: string, wamid: string }

export function useChatApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  const api = $fetch.create({
    baseURL,

    onRequest({ options }) {
      // SSR não tem localStorage
      if (import.meta.server) return

      const token = localStorage.getItem('token')
      if (!token) return

      // garante que headers é um Headers e seta Authorization
      const h = new Headers(options.headers as HeadersInit | undefined)
      h.set('Authorization', `Bearer ${token}`)
      options.headers = h
    },
    onResponseError({ response }) {
      if (import.meta.server) return

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // NÃO navega aqui
      }
    },
  })

  return {
    listarConversas: () => api<Conversa[]>('/conversas'),

    listarMensagens: (conversaId: number) =>
      api<Mensagem[]>(`/conversas/${conversaId}/mensagens`),

    enviarMensagem: async (conversa: Conversa, texto: string) => {

      const payload: EnviarReq = {
        conversaId: conversa.id,
        waIdDestino: conversa.nome, // aqui é o número (sem 55 você pode guardar outro campo depois)
        texto,
      }

      const resp = await api<EnviarResp>('/conversas/mensagens/enviar', {
        method: 'POST',
        body: payload,
      })

      const msg: Mensagem = {
        id: resp.mensagemId,
        texto,
        direcao: 'SAIDA',
        createdAt: new Date().toISOString(),
        wamid: resp.wamid, // se teu type tiver isso (opcional)
      } as any

      return msg
    },

    enviarAudio: async (conversa: Conversa, blob: Blob, mime: string) => {
      const fileExt = mime.includes('ogg') ? 'ogg' : 'webm'
      const file = new File([blob], `audio.${fileExt}`, { type: mime })

      const fd = new FormData()
      fd.append('waIdDestino', conversa.nome) // @RequestParam
      fd.append('audio', file)               // @RequestPart("audio")

      const resp = await api<{ mensagemId: string, wamid: string; mediaId: string }>(
        `/conversas/${conversa.id}/mensagens/audio`,
        { method: 'POST', body: fd }
      )

      // mensagem otimista pra aparecer na hora
      const msg: Mensagem = {
        id: resp.mensagemId,
        texto: null,
        tipo: 'audio',
        direcao: 'SAIDA',
        createdAt: new Date().toISOString(),
        wamid: resp.wamid,
        mediaId: resp.mediaId, // se você tiver no type, ótimo. se não tiver, deixa como any
      } as any

      return msg
    },

    enviarVideo: async (conversa: Conversa, file: File) => {
      const fd = new FormData()
      fd.append('waIdDestino', conversa.nome) // @RequestParam
      fd.append('video', file)               // @RequestPart("video")

      const resp = await api<{ mensagemId: string, wamid: string; mediaId: string }>(
        `/conversas/${conversa.id}/mensagens/video`,
        { method: 'POST', body: fd }
      )

      // mensagem otimista pra aparecer na hora
      const msg: Mensagem = {
        id: resp.mensagemId,
        texto: null,
        tipo: 'video',
        direcao: 'SAIDA',
        createdAt: new Date().toISOString(),
        wamid: resp.wamid,
        mediaId: resp.mediaId,
      } as any

      return msg
    },

    enviarImagem: async (conversa: Conversa, file: File) => {
      const fd = new FormData()
      fd.append('waIdDestino', conversa.nome)
      fd.append('imagem', file) // ou "imagem" — tem que bater com o @RequestPart

      const resp = await api<{ mensagemId: string, wamid: string; mediaId: string }>(
        `/conversas/${conversa.id}/mensagens/imagem`,
        { method: 'POST', body: fd }
      )

      const msg: Mensagem = {
        id: resp.mensagemId,
        texto: null,
        tipo: 'imagem',
        direcao: 'SAIDA',
        createdAt: new Date().toISOString(),
        wamid: resp.wamid,
        mediaId: resp.mediaId,
      } as any

      return msg
    },

    enviarPdf: async (conversa: Conversa, file: File) => {
      const fd = new FormData()
      fd.append('waIdDestino', conversa.nome)
      fd.append('pdf', file)

      const resp = await api<{ mensagemId: string, wamid: string; mediaId: string }>(
        `/conversas/${conversa.id}/mensagens/pdf`,
        { method: 'POST', body: fd }
      )

      const msg: Mensagem = {
        id: resp.mensagemId,
        texto: null,
        tipo: 'pdf',
        direcao: 'SAIDA',
        createdAt: new Date().toISOString(),
        wamid: resp.wamid,
        mediaId: resp.mediaId,
      } as any

      return msg
    },

    disparoTemplate: async (template: string, file: File, phoneNumberId: string) => {
      const fd = new FormData()
      fd.append('template', template)
      fd.append('phoneNumberId', phoneNumberId)
      fd.append('file', file)

      // se teu backend retornar JSON com total/enviados/falhas, tipa aqui
      return await api<{
        total: number
        enviados: number
        falhas: number
        erros?: { telefone: string; nome: string; motivo: string }[]
      }>('/disparos/template', {
        method: 'POST',
        body: fd,
      })
    },
    baixarMedia: async (conversaId: number, mediaId: string) => {
      // importante: responseType blob
      const blob = await api<Blob>(`/conversas/${conversaId}/media/${mediaId}`, {
        method: 'GET',
        responseType: 'blob',
      } as any)

      return URL.createObjectURL(blob)
    },
  }
}

// ~/composables/useChatApi.ts
import type { Conversa, Mensagem } from '~/types/chat'

type EnviarReq = {
  conversaId: number
  waIdDestino: string
  texto: string
}

type EnviarResp = { wamid: string }

export function useChatApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string
  const api = $fetch.create({ baseURL })

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

      // cria uma Mensagem “otimista” pra já aparecer no chat
      const msg: Mensagem = {
        id: Date.now(),
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

      console.log('[enviarAudio] start', conversa.id, mime, blob.size)

      const fd = new FormData()
      fd.append('waIdDestino', conversa.nome) // @RequestParam
      fd.append('audio', file)               // @RequestPart("audio")

      const resp = await api<{ wamid: string; mediaId: string }>(
        `/conversas/${conversa.id}/mensagens/audio`,
        { method: 'POST', body: fd }
      )

      console.log('[enviarAudio] ok', resp)

      // mensagem otimista pra aparecer na hora
      const msg: Mensagem = {
        id: Date.now(),
        texto: null,
        tipo: 'audio',
        direcao: 'SAIDA',
        createdAt: new Date().toISOString(),
        wamid: resp.wamid,
        mediaId: resp.mediaId, // se você tiver no type, ótimo. se não tiver, deixa como any
      } as any

      return msg
    },
    
  }
}

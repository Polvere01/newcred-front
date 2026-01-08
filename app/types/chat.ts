export type Direcao = 'ENTRADA' | 'SAIDA'
export type MensagemTipo = 'text' | 'audio' | 'image' | 'video' | 'document' | 'pdf'

export interface Conversa {
  id: number
  nome: string
  ultimaMensagem: string
  operadorNome: string | null
  ultimaDirecao?: 'ENTRADA' | 'SAIDA' | '' | null
  ultimaTipo?: string | null
  phoneNumberId: string
}

export interface Mensagem {
  id: number
  texto: string
  tipo: MensagemTipo
  direcao: Direcao
  createdAt: string
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'played'
  wamid?: string
  mediaId?: string
  phoneNumberId: string
}
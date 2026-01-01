export type Direcao = 'ENTRADA' | 'SAIDA'
export type MensagemTipo = 'text' | 'audio' | 'image' | 'video' | 'document' | 'pdf'

export interface Conversa {
  id: number
  nome: string
  ultimaMensagem: string
}

export interface Mensagem {
  id: number
  texto: string
  tipo: MensagemTipo
  direcao: Direcao
  createdAt: string
}
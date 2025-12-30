export type Direcao = 'ENTRADA' | 'SAIDA'

export interface Conversa {
  id: number
  nome: string
  ultimaMensagem: string
}

export interface Mensagem {
  id: number
  texto: string
  direcao: Direcao
  createdAt: string
}
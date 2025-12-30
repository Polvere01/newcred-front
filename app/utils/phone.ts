export function formatarTelefone(valor: string) {
  if (!valor) return ''

  // remove tudo que não é número
  const digits = valor.replace(/\D/g, '')

  // remove DDI 55 se existir
  const semDDI = digits.startsWith('55') ? digits.slice(2) : digits

  // celular com DDD
  if (semDDI.length === 11) {
    return semDDI.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  // fixo com DDD
  if (semDDI.length === 10) {
    return semDDI.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return semDDI
}
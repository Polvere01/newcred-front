export const useSoundGuard = () => {
  return useState<Record<number, string>>(
    'soundGuard',
    () => ({})
  )
}
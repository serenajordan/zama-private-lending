export function hasFn(abi: any[], name: string): boolean {
  return abi.some((item: any) => item?.type === 'function' && item?.name === name)
}

export function inputTypes(abi: any[], name: string): string[] | null {
  const item = abi.find((i: any) => i?.type === 'function' && i?.name === name)
  if (!item || !Array.isArray(item.inputs)) return null
  return item.inputs.map((inp: any) => String(inp?.type || ''))
}

export function expectsBytes(abi: any[], name: string, index = 0): boolean {
  const types = inputTypes(abi, name)
  if (!types || !types[index]) return false
  const t = types[index]
  return t === 'bytes' || t === 'bytes32'
}

export function expectsUint(abi: any[], name: string, index = 0): boolean {
  const types = inputTypes(abi, name)
  if (!types || !types[index]) return false
  const t = types[index]
  return t.startsWith('uint')
}

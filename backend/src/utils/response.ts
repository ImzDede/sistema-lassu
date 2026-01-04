export function response(data: any, meta: any = {}) {
  return {
    data,
    meta,
    error: null
  }
}

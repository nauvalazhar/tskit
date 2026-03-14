export function apiError(code: string, message: string, status = 400) {
  return Response.json({ error: { code, message } }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ data }, { status });
}

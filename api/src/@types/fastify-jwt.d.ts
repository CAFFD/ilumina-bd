import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { name: string; avatarUrl: string | null }
    user: {
      sub: string
      name: string
      avatarUrl: string | null
      iat: number
      exp: number
    }
  }
}

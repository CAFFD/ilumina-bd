import { FastifyInstance } from 'fastify'
import { db } from '../../db/connection.js'
import { poles } from '../../db/schema.js'

export async function polesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const allPoles = await db
      .select({
        id: poles.id,
        externalId: poles.externalId,
        latitude: poles.latitude,
        longitude: poles.longitude,
        lampType: poles.lampType,
        powerW: poles.powerW,
        ips: poles.ips,
      })
      .from(poles)

    return allPoles
  })
}

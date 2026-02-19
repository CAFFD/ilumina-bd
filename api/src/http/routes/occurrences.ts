import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../../db/connection.js'
import { occurrences, categories, poles } from '../../db/schema.js'
import { eq } from 'drizzle-orm'

export async function occurrencesRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createOccurrenceBody = z.object({
      poleId: z.string(),
      description: z.string().optional(),
      category: z.string(), // frontend sends 'LAMPADA_QUEIMADA'
      phone: z.string(),
      location: z.tuple([z.number(), z.number()]).optional(), // [lat, lng]
    })

    const { poleId, description, category, phone, location } = createOccurrenceBody.parse(request.body)

    let categoryRecord = await db.query.categories.findFirst({
        where: eq(categories.name, category)
    })

    if (!categoryRecord) {
        const [newCategory] = await db.insert(categories).values({
            name: category,
            description: 'Categoria criada automaticamente',
            active: true
        }).returning()
        categoryRecord = newCategory
    }

    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    const protocol = `ZU-${year}-${random}`

    const [occurrence] = await db.insert(occurrences).values({
        protocol,
        title: category,
        description: description || 'Relato via App',
        status: 'open',
        priority: 'medium',
        categoryId: categoryRecord.id,
        poleId: poleId,
        userId: null, // Anonymous
        reporterPhone: phone,
        latitude: location ? location[0] : null,
        longitude: location ? location[1] : null,
    }).returning()

    return reply.status(201).send({ 
        id: occurrence.id, 
        protocol: occurrence.protocol 
    })
  })
}

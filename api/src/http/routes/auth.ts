import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../../db/connection.js'
import { users, profiles, userRoles } from '../../db/schema.js'
import { eq } from 'drizzle-orm'
import { compare, hash } from 'bcryptjs'

export async function authRoutes(app: FastifyInstance) {
  // --- POST /register ---
  app.post('/register', async (request, reply) => {
    const registerBodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string(),
      phone: z.string().optional(),
    })

    const { email, password, name, phone } = registerBodySchema.parse(request.body)

    const userExists = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (userExists) {
      return reply.status(409).send({ message: 'Email already exists.' })
    }

    const passwordHash = await hash(password, 6)

    const [user] = await db.insert(users).values({
      email,
      password: passwordHash,
      name,
    }).returning()

    // Create profile
    await db.insert(profiles).values({
      userId: user.id,
      fullName: name,
      phone,
    })
    
    // Assign default role
    await db.insert(userRoles).values({
      userId: user.id,
      role: 'citizen',
    })

    return reply.status(201).send()
  })

  // --- POST /login ---
  app.post('/login', async (request, reply) => {
    const loginBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = loginBodySchema.parse(request.body)

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      return reply.status(400).send({ message: 'Invalid credentials.' })
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return reply.status(400).send({ message: 'Invalid credentials.' })
    }

    // Generate JWT
    const token = app.jwt.sign(
      { name: user.name, avatarUrl: null }, // payload
      {
        sub: user.id,
        expiresIn: '7d',
      },
    )

    return reply
      .setCookie('token', token, {
        path: '/',
        secure: true, // Always true since we use SameSite
        sameSite: 'strict',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      .status(200)
      .send({
        token, // Optional: return token to client if needed for other things, but cookie is primary
      })
  })

  // --- GET /me ---
  app.get('/me', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { sub } = request.user // user is populated by jwtVerify

    const user = await db.query.users.findFirst({
      where: eq(users.id, sub),
    })

    if (!user) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    
    // Get roles
    const roles = await db.query.userRoles.findMany({
        where: eq(userRoles.userId, user.id),
        columns: {
            role: true
        }
    })

    return reply.send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: null, // Fetch from profile later
        roles: roles.map(r => r.role)
      },
    })
  })
  
  // --- POST /logout ---
  app.post('/logout', async (request, reply) => {
      return reply
        .clearCookie('token')
        .send({ message: 'Logged out successfully' })
  })
}

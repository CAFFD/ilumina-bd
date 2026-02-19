import fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import 'dotenv/config'

import { authRoutes } from './routes/auth.js'
import { polesRoutes } from './routes/poles.js'
import { occurrencesRoutes } from './routes/occurrences.js'

const app = fastify()

// --- Plugins ---

// CORS: Permitir frontend (web) com credenciais (cookies)
app.register(cors, {
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'], // Ajustar conforme Vite
  credentials: true, 
})

// JWT: Secure Sign
app.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret', // Mover para .env
  cookie: {
    cookieName: 'token',
    signed: false, // JWT já é assinado
  },
})

// Cookies
app.register(cookie)

// --- Routes ---
app.register(authRoutes, { prefix: '/api/auth' })
app.register(polesRoutes, { prefix: '/api/poles' })
app.register(occurrencesRoutes, { prefix: '/api/occurrences' })

// --- Server Start ---
app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP Server Running on http://localhost:3333')
})

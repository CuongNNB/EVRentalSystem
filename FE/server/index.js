import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const client = new OAuth2Client(CLIENT_ID)

async function verifyIdToken(idToken) {
  const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID })
  return ticket.getPayload()
}

app.post('/api/auth/google', async (req, res) => {
  const { id_token } = req.body
  console.log('/api/auth/google request body:', Object.keys(req.body))
  if (!id_token) {
    console.warn('Missing id_token in request')
    return res.status(400).json({ error: 'Missing id_token' })
  }
  try {
    const payload = await verifyIdToken(id_token)
    // payload contains email, name, picture, sub (google id)
    // Create or find user in DB here (omitted)
    const user = { id: payload.sub, name: payload.name, email: payload.email, picture: payload.picture }
    // Sign a server JWT for session
    const token = jwt.sign({ uid: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ user, token })
  } catch (err) {
    console.error(err)
    return res.status(401).json({ error: 'Invalid token' })
  }
})

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', clientIdConfigured: !!CLIENT_ID })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Auth server listening on ${PORT}`))

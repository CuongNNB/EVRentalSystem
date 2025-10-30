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

// ============================================================
// ADMIN VEHICLES API ENDPOINTS
// ============================================================

/**
 * GET /api/admin/vehicles/models
 * Returns list of distinct vehicle models from database
 * 
 * NOTE: Replace with actual database query
 * Example SQL: SELECT DISTINCT model FROM vehicles ORDER BY model
 */
app.get('/api/admin/vehicles/models', async (req, res) => {
  try {
    // TODO: Replace with actual database query
    // Example using MySQL/PostgreSQL:
    // const result = await db.query('SELECT DISTINCT model FROM vehicles ORDER BY model')
    // const models = result.rows.map(row => row.model)
    
    // TEMPORARY: Mock data - Replace this with actual database query
    const models = [
      'VinFast VF 8',
      'VinFast VF 9', 
      'VinFast VF e34',
      'VinFast VF 5 Plus',
      'Tesla Model 3',
      'Tesla Model S Plaid',
      'Tesla Model Y',
      'Hyundai Ioniq 5',
      'Hyundai Ioniq 6',
      'Kia EV6 GT-Line',
      'Kia EV9 GT-Line',
      'Mercedes-Benz EQE 350+',
      'BMW iX xDrive50',
      'Audi Q8 e-tron',
      'Porsche Taycan Turbo S'
    ].sort()
    
    console.log('[GET /api/admin/vehicles/models] Returning', models.length, 'models')
    res.json(models)
  } catch (error) {
    console.error('[GET /api/admin/vehicles/models] Error:', error)
    res.status(500).json({ error: 'Failed to fetch vehicle models' })
  }
})

/**
 * GET /api/admin/vehicles/stats
 * Returns vehicle statistics for KPI dashboard
 */
app.get('/api/admin/vehicles/stats', async (req, res) => {
  try {
    // TODO: Replace with actual database query
    // Example SQL:
    // SELECT 
    //   COUNT(*) as total,
    //   SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
    //   SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) as rented,
    //   SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
    // FROM vehicles
    
    // TEMPORARY: Mock data
    const stats = {
      total: 28,
      available: 15,
      rented: 10,
      maintenance: 3
    }
    
    console.log('[GET /api/admin/vehicles/stats] Returning stats:', stats)
    res.json(stats)
  } catch (error) {
    console.error('[GET /api/admin/vehicles/stats] Error:', error)
    res.status(500).json({ error: 'Failed to fetch vehicle stats' })
  }
})

/**
 * GET /api/admin/vehicles
 * Returns list of vehicles with optional filters
 * Query params: status, model, stationId, search
 */
app.get('/api/admin/vehicles', async (req, res) => {
  try {
    const { status, model, stationId, search } = req.query
    
    // TODO: Replace with actual database query with filters
    // Example SQL with filters:
    // SELECT * FROM vehicles 
    // WHERE (status = ? OR ? IS NULL)
    //   AND (model = ? OR ? IS NULL)
    //   AND (station_id = ? OR ? IS NULL)
    //   AND (license_plate LIKE ? OR ? IS NULL)
    
    // TEMPORARY: Mock data
    let vehicles = [
      { 
        id: 'VF001', 
        model: 'VinFast VF 8', 
        status: 'available', 
        battery: 85, 
        stationId: 1,
        stationName: 'Trạm Quận 1',
        licensePlate: '51A-12345',
        lastMaintenance: '2024-01-15'
      },
      { 
        id: 'VF002', 
        model: 'VinFast VF 5 Plus', 
        status: 'rented', 
        battery: 62, 
        stationId: 2,
        stationName: 'Trạm Quận 3',
        licensePlate: '51B-67890',
        lastMaintenance: '2024-01-10'
      },
      { 
        id: 'TM001', 
        model: 'Tesla Model 3', 
        status: 'available', 
        battery: 95, 
        stationId: 1,
        stationName: 'Trạm Quận 1',
        licensePlate: '51C-11111',
        lastMaintenance: '2024-01-20'
      }
    ]
    
    // Apply filters
    if (status) vehicles = vehicles.filter(v => v.status === status)
    if (model) vehicles = vehicles.filter(v => v.model === model)
    if (stationId) vehicles = vehicles.filter(v => v.stationId === parseInt(stationId))
    if (search) {
      const term = search.toLowerCase()
      vehicles = vehicles.filter(v => 
        v.licensePlate.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        v.id.toLowerCase().includes(term)
      )
    }
    
    console.log('[GET /api/admin/vehicles] Returning', vehicles.length, 'vehicles')
    res.json(vehicles)
  } catch (error) {
    console.error('[GET /api/admin/vehicles] Error:', error)
    res.status(500).json({ error: 'Failed to fetch vehicles' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Auth server listening on ${PORT}`))

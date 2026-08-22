import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './src/routes/auth.js'
import consoleRoutes from './src/routes/consoles.js'
import { notFound, errorHandler } from './src/middleware/errorHandler.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/consoles', consoleRoutes)

// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use(notFound)
app.use(errorHandler)

// Server
const PORT = process.env.PORT || 4000

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    })
})

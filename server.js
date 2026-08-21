import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from "./config/db.js"
import consoleRoutes from './src/routes/consoles.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/consoles", consoleRoutes)

// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Start server
const PORT = process.env.PORT || 4000

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    })
})

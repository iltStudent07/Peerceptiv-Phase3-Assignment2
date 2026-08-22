import express from 'express'
import Console from "../models/Console.js"
import authenticate from "../middleware/auth.js"
import { authorizeConsoleOwnerOrAdmin } from "../middleware/authorize.js";

const router = express.Router()

// GET /api/consoles - List with filtering, sorting, pagination
router.get("/", async (req, res) => {
    try {
        const { brand, minPrice, maxPrice, search, sort, page = 1, limit = 10 } = req.query

        // Filter Object
        const filter = {}
        if (brand) filter.brand = brand
        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) filter.price.$gte = parseFloat(minPrice)
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
        }
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            filter.name = { $regex: escaped, $options: "i" }
        }

        // Sort Object
        const allowedSortFields = ["name", "brand", "price", "createdAt"]
        let sortObj = { createdAt: -1 } // default: newest first
        if (sort) {
            const [field, order] = sort.split(":")
            if (allowedSortFields.includes(field)) {
                sortObj = { [field]: order === "desc" ? -1 : 1 }
            }
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit)
        const total = await Console.countDocuments(filter)
        const consoles = await Console.find().populate("owner", "name")
          .sort(sortObj)
          .skip(skip)
          .limit(limit)

        res.json({
            data: consoles,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /api/consoles/:id - Get one console
router.get("/:id", async (req, res) => {
    try {
        const consoleDoc = await Console.findById(req.params.id)
          .populate("owner", "username");
        if (!consoleDoc) {
            return res.status(404).json({ error: "Console not found" })
        }
        res.json(consoleDoc)
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid console ID format" })
        }
        res.status(500).json({ error: err.message })
    }
})

// POST /api/consoles - Create a console (protected)
router.post("/", authenticate, async (req, res) => {
  try {
    const console = await Console.create({ ...req.body, owner: req.user._id })
    res.status(201).json(console)
  } catch (err) {
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message)
        return res.status(400).json({ error: "Validation failed", details: messages })
    }
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/consoles/:id - Update a console (protected)
router.put("/:id", authenticate, authorizeConsoleOwnerOrAdmin, async (req, res) => {
  try {
    const console = await Console.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true }
    )
    if (!console) {
        return res.status(404).json({ error: "Product not found" })
    }
    res.json(console)
  } catch (err) {
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message)
        return res.status(400).json({ error: "Validation failed", details: messages })
    }
    if (err.name === "CastError") {
        return res.status(400).json({ error: "Invalid console ID format" })
    }
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/consoles/:id - Delete a console (protected)
router.delete("/:id", authenticate, authorizeConsoleOwnerOrAdmin, async (req, res) => {
  try {
    const console = await Console.findByIdAndDelete(req.params.id)
    if (!console) {
        return res.status(404).json({ error: "Console not found" })
    }
    res.status(204).send()
  } catch (err) {
    if (err.name === "CastError") {
        return res.status(400).json({ error: "Invalid product ID format" })
    }
    res.status(500).json({ error: err.message })
  }
})

export default router
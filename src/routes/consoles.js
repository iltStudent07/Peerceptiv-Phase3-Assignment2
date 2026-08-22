import express from 'express'
import Console from "../models/Console.js"
import authenticate from "../middleware/auth.js"
import { authorizeConsoleOwnerOrAdmin } from "../middleware/authorize.js";
import AppError from '../utils/AppError.js'

const router = express.Router()

// GET /api/consoles - List with filtering, sorting, pagination
router.get("/", async (req, res, next) => {
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
        const consoles = await Console.find(filter).populate("owner", "name")
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
      next(err)
    }
})

// GET /api/consoles/:id - Get one console
router.get("/:id", async (req, res, next) => {
    try {
        const consoleDoc = await Console.findById(req.params.id)
          .populate("owner", "username");
        if (!consoleDoc) {
      throw new AppError('Console not found', 404)
        }
        res.json(consoleDoc)
    } catch (err) {
    next(err)
    }
})

// POST /api/consoles - Create a console (protected)
router.post("/", authenticate, async (req, res, next) => {
  try {
    const console = await Console.create({ ...req.body, owner: req.user._id })
    res.status(201).json(console)
  } catch (err) {
    next(err)
  }
})

// PUT /api/consoles/:id - Update a console (protected)
router.put("/:id", authenticate, authorizeConsoleOwnerOrAdmin, async (req, res, next) => {
  try {
    const console = await Console.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true }
    )
    if (!console) {
        throw new AppError('Console not found', 404)
    }
    res.json(console)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/consoles/:id - Delete a console (protected)
router.delete("/:id", authenticate, authorizeConsoleOwnerOrAdmin, async (req, res, next) => {
  try {
    const console = await Console.findByIdAndDelete(req.params.id)
    if (!console) {
        throw new AppError('Console not found', 404)
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
import express from 'express'
import { body, validationResult } from 'express-validator'
import Console, { CONSOLE_BRANDS } from "../models/Console.js"
import authenticate from "../middleware/auth.js"
import { authorizeConsoleOwnerOrAdmin } from "../middleware/authorize.js";
import AppError from '../utils/AppError.js'

const router = express.Router()

const consoleCreateValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Console name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('brand')
    .isIn(CONSOLE_BRANDS).withMessage(`Brand must be one of: ${CONSOLE_BRANDS.join(', ')}`),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a number greater than or equal to 0'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be an integer greater than or equal to 0'),
]

const consoleUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Console name cannot be empty')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('brand')
    .optional()
    .isIn(CONSOLE_BRANDS).withMessage(`Brand must be one of: ${CONSOLE_BRANDS.join(', ')}`),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price cannot be a negative number'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Price cannot be a negative number'),
]

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()))
  }
  next()
}

// GET /api/consoles - List with filtering, sorting, pagination
router.get("/", async (req, res, next) => {
    try {
        const { brand, minPrice, maxPrice, search, sort, page = 1, limit = 10 } = req.query

        const pageNumber = Number.parseInt(page, 10)
        const limitNumber = Number.parseInt(limit, 10)
        if (Number.isNaN(pageNumber) || pageNumber < 1) {
          throw new AppError('page must be an integer greater than 0', 400)
        }
        if (Number.isNaN(limitNumber) || limitNumber < 1) {
          throw new AppError('limit must be an integer greater than 0', 400)
        }
        if (brand && !CONSOLE_BRANDS.includes(brand)) {
          throw new AppError('Invalid brand value', 400)
        }

        // Filter Object
        const filter = {}
        if (brand) filter.brand = brand
        if (minPrice || maxPrice) {
            const min = minPrice ? Number.parseFloat(minPrice) : undefined
            const max = maxPrice ? Number.parseFloat(maxPrice) : undefined
            if (minPrice && Number.isNaN(min)) {
              throw new AppError('minPrice must be a valid number', 400)
            }
            if (maxPrice && Number.isNaN(max)) {
              throw new AppError('maxPrice must be a valid number', 400)
            }
            if (min !== undefined && max !== undefined && min > max) {
              throw new AppError('minPrice cannot be greater than maxPrice', 400)
            }
            filter.price = {}
            if (min !== undefined) filter.price.$gte = min
            if (max !== undefined) filter.price.$lte = max
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
            } else {
                throw new AppError('Invalid sort field', 400)
            }
        }

        // Pagination
        const skip = (pageNumber - 1) * limitNumber
        const total = await Console.countDocuments(filter)
        const consoles = await Console.find(filter).populate("owner", "name")
          .sort(sortObj)
          .skip(skip)
          .limit(limitNumber)

        res.json({
            data: consoles,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber),
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
          .populate("owner", "name");
        if (!consoleDoc) {
      throw new AppError('Console not found', 404)
        }
        res.json(consoleDoc)
    } catch (err) {
    next(err)
    }
})

// POST /api/consoles - Create a console (protected)
router.post("/", authenticate, consoleCreateValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { name, brand, price, stock } = req.body
    const console = await Console.create({ name, brand, price, stock, owner: req.user._id })
    res.status(201).json(console)
  } catch (err) {
    next(err)
  }
})

// PUT /api/consoles/:id - Update a console (protected)
router.put("/:id", authenticate, authorizeConsoleOwnerOrAdmin, consoleUpdateValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { name, brand, price, stock } = req.body
    const updatePayload = { name, brand, price, stock }

    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key]
      }
    })

    const console = await Console.findByIdAndUpdate(
      req.params.id,
      updatePayload,
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
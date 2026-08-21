import 'dotenv/config'
import connectDB from '../config/db.js'
import Console from '../src/models/Console.js'

async function seed() {
    await connectDB()
    await Console.deleteMany({})

    await Console.insertMany([
        { name: "Xbox Series S", brand: "Microsoft", price: 299.99, stock: 25 },
        { name: "Xbox Series X", brand: "Microsoft", price: 499.99, stock: 15 },
        { name: "PS5", brand: "Sony", price: 499.99, stock: 25 },
        { name: "PS5 Pro", brand: "Sony", price: 799.99, stock: 7 },
        { name: "Switch 2", brand: "Nintendo", price: 499.99, stock: 43 }, 
    ])

    console.log("Seeded 5 consoles")
    process.exit(0)
}

seed()
import 'dotenv/config'
import connectDB from '../config/db.js'
import Console from '../src/models/Console.js'
import User from '../src/models/User.js'

async function seed() {
  await connectDB()
  await Console.deleteMany({})
  await User.deleteMany({})

  const admin = await User.create({
    name: "admin",
    email: "admin@example.com",
    password: "Admin123!",
    role: "admin"
  })

  await Console.insertMany([
    { name: "Xbox Series S", brand: "Microsoft", price: 299.99, stock: 25, owner: admin._id },
    { name: "Xbox Series X", brand: "Microsoft", price: 499.99, stock: 15, owner: admin._id },
    { name: "PS5", brand: "Sony", price: 499.99, stock: 25, owner: admin._id },
    { name: "PS5 Pro", brand: "Sony", price: 799.99, stock: 7, owner: admin._id },
    { name: "Switch 2", brand: "Nintendo", price: 499.99, stock: 43, owner: admin._id },
  ])

  console.log("Seeded 5 consoles")
  process.exit(0)
}

seed()
import mongoose from 'mongoose'

const consoleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Console name is required"],
            trim: true,
            maxLength: [50, "Name cannot exceed 50 characters"],
        },
        brand: {
            type: String,
            required: [true, "Brand name is required"],
            enum: {
                values: ["Nintendo", "Sony", "Microsoft", "Valve"],
                message: "{VALUE} is not a valid brand option",
            },
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.model("Console", consoleSchema)
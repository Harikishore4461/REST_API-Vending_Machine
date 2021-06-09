const mongoose = require('mongoose')
const schema = mongoose.Schema

const Products = new schema(
    {
        id:{ 
            type: Number,
            unique: true,
            index: true,
            required: true,
        },
        product:String, 
        price:Number, 
        quanity:Number
    }
)

module.exports = mongoose.model('Products', Products) 
const mongoose = require('mongoose')
const schema = mongoose.Schema

const vending_machine = new schema(
    {
        total_amount :{
            type:Number,
            default:0
        },
        penny:{
            type:Number,
            default:0
        },
        nickel:{
            type:Number,
            default:0
        },
        dime:{
            type:Number,
            default:0
        },
        quarter:{
            type:Number,
            default:0
        },
        // available_products:[{type: schema.Types.ObjectId, ref: 'Products'}]
    }
)




module.exports = mongoose.model('vending_machine', vending_machine) 
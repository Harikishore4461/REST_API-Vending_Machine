const express = require('express')
const router = express.Router()

// Models
const Vending_Machine = require('../model/vending_machine')
const Products = require('../model/Products');

// Current User Money Stores here  
class User_Money
{
    constructor(penny, nickel, dime, quarter) 
    {
        this.penny = penny;
        this.nickel = nickel;
        this.dime = dime;
        this.quarter = quarter;
        this.total = penny+nickel+dime+quarter;
    }
}   

// Initialize the class object with 0 values
var user_money = new User_Money(0,0,0,0)

// Return balance in terms of respective coins
function Balance(balance, coins_value, coins_available) {
    balance_coins = {}

    for (let i = 0; i < coins_value.length; i++) {
        var coin_balance = 0
        if(balance>=coins_value[i] && coins_available[i]!=0)
        {
            coin_balance = Math.floor(balance/coins_value[i])
            if(coin_balance>coins_available[i])
            {
                coin_balance = coins_available[i]
            }
            coins_available[i] =coins_available[i]-coin_balance
            balance =balance-(coin_balance*coins_value[i])
        }
        // balance_coins.push([coins_value[i], coin_balance])
        balance_coins[coins_value[i]] = coin_balance
    }
    return balance_coins

}

// User pay the amount first (gives coins details) and it show the product available for user money
router.post("/user/pay",(req,res)=>{
    var penny = req.body.penny*1
    var nickel = req.body.nickel*5
    var dime = req.body.dime*10
    var quarter = req.body.quarter*25
    user_money = new User_Money(penny,nickel,dime,quarter)
    var total = penny+nickel+dime+quarter
 
    Products.find((err, results)=>
    {
        if(err)
            res.send({"OOPS!":"Something went wrong"})
        else
        {
            product_list = []
            results.forEach(result=>{
                if(result.price<=total)
                    product_list.push({'id':result.id,'name':result.product, 
                    'price':result.price, 'quanity':result.quanity})
            })
            if (product_list.length==0)
                res.send({"OOPS!":"Your Money is not sufficient to buy any items :(" ,
                "Amount Return" : total})
            else
                res.send({"select the pproduct id":"Use this /user/buy (PUT REQUEST)" ,
                "To cancel":"use /refund (GET)",
                Products : product_list})
        }
    })

})


// User buy the product using product id and enter no of quantity he required
router.put('/user/buy',(req,res)=>{
    var product_id = req.body.id
    var product_quanity = req.body.quanity

    Products.findOne({id:product_id},(err,result)=>
    {
        if(err)
            res.send({"OOPS!":"Something went wrong"})
        else
        {
            console.log(user_money.total)
            // console.log(result)
            if(result.quanity < product_quanity)
            {
                res.send({"OOPS!":"Insuffienct", "Available quanity":result.quanity});
            }
            else if(result.price*product_quanity >= user_money.total)
            {
                res.send({"OOPS!":"Money is not enough"})
            }
            else
            {
                var change = user_money.total-(result.price*product_quanity)
                Vending_Machine.find((err,result1)=>
                {
                    // console.log(user_money.dime)
                    var items = result1[0]
                    if(change>0)
                        {
                            coins_available =[ result1[0].quarter, result1[0].dime, result1[0].nickel, result1[0].penny]
                            var balance_list = Balance(change,[25,10,5,1],coins_available)
                            // console.log(balance_list)
                            // Update the money in the vending machine and update respective coins record
                            items.penny =  parseInt(items.penny) + parseInt(user_money.penny)-parseInt(balance_list[1])
                            items.nickel = parseInt(items.nickel) + parseInt(user_money.nickel/5)-parseInt(balance_list[5])
                            items.dime = Number(items.dime)-Number(balance_list[10])+Number(user_money.dime/10) 
                            items.quarter = Number(items.quarter) + Number(user_money.quarter/25)-parseInt(balance_list[25])
                            items.total_amount = parseInt(items.total_amount)+parseInt(result.price*product_quanity)
                        }
                    else
                        {
                            items.penny =  parseInt(items.penny) + parseInt(user_money.penny) 
                            items.nickel = parseInt(items.nickel) + parseInt(user_money.nickel) 
                            items.dime = parseInt(items.dime) + parseInt(user_money.dime) 
                            items.quarter = parseInt(items.quarter) + parseInt(user_money.quarter) 
                            items.total_amount = parseInt(items.total_amount)+parseInt(result.price*product_quanity)
                        }
                    Vending_Machine.updateOne({_id:items._id},{$set:items},(error,result2)=>
                    {
                        if(error)
                            console.log("err")
                        else
                        {
                            user_money = new User_Money(0,0,0,0)
                            res.send({ "Enjoy Your " : result.product, "balance" : change})
                        }
    
                    })
                })

            }
        }
    })

})

// Supllier add new product
router.post('/product/add',(req,res)=>{
    var product = new Products()

    product.id = req.body.product_id
    product.product = req.body.product
    product.price = req.body.product_price
    product.quanity = req.body.product_quanity

    product.save((err,result)=>
    {
        if(err)
        {
            // console.log(err)
            res.send({"OOPS!":"Something went wrong"})
        }
        else
        {
            res.send(result)
        }
    })
})
// Supplier update existing product price or quantity
router.put('/product/update',(req,res)=>{
    var product_id = req.body.product_id
    var product_price = req.body.product_price
    var product_quanity = req.body.product_quanity

    Products.findOne({id:product_id},(err, result)=>
    {
        if(err)
        {
            res.send({"OOPS!":"No Such Product Found"})
        }
        else
        {
            result.price = product_price
            result.quanity = product_quanity
            Products.updateOne({id:product_id},{$set:result},(err,result)=>
            { 
                if(err)
                    res.send({"OOPS!":"Something went wrong"})
                else
                    res.send(result)
            })
        }
    })

})

// Supplier can check amount of coins avaliable in vending machine
router.get('/machine/details',(req,res)=>{
    Vending_Machine.find((err,result)=>{
        if(err)
            res.send({"OOPS!":"Something went wrong"})
        else
        {
            res.send(result[0])
        } 
    })
})

// If user want yo cancel the transaction , it will refund the user money
router.get('/refund',(err,res)=>
{
    if(user_money.total==0)
    {
        res.send({"OOPS!":"There is no money to refund"})
    }
    else
    {
        var temp = user_money.total
        user_money = new User_Money(0,0,0,0)
        res.send({"refund Amount":temp})
    }
})


module.exports = router 
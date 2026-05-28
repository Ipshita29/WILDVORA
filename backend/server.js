const express=require("express")
const dotenv=require("dotenv")
const mongoose=require("mongoose")
const cors=require("cors")
dotenv.config()
const app=express()
app.use(express.json())
app.use(cors())
mongoose.connect(process.env.mongo_uri)
.then(()=>{
    console.log("Connected to DB")
}).catch((err)=>{
    console.log(err)
})
app.listen(process.env.PORT,()=>{
    console.log("Server is running")
})
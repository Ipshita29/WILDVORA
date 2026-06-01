
const signupmiddleware= (req,res,next)=>{
    const {name,email,password,role}=req.body
    if (!name || !email || !password || !role){
        return res.status(400).send("All credentials required")
    }
    if (!email.includes("@")){
        return res.status(400).send("Invalid email")
    }
    next()
}
const loginmiddleware=(req,res,next)=>{
    const {email,password}=req.body
    if (!email || !password){
        return res.status(400).send("All credentials required")
    }
    if (! email.includes("@")){
        return res.status(400).send("Invalid email")
    }
    next()
}
module.exports={signupmiddleware,loginmiddleware}
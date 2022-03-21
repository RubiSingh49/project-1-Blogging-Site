const AutherModel= require("../models/autherModel")
let jwt = require('jsonwebtoken')
const validator = require('email-validator')


const createauther= async function (req, res) {
    try{
    let data= req.body
    let email = data.email;
    if(validator.validate(email.trim())== false)
    {
        return res.status(400).send({status:false, msg: "Please input a valid email"})
    }
    let duplicateEmail=await AutherModel.findOne({email});
    if(duplicateEmail)
    {
        return res.status(400).send({status:false, msg: "Email is already in use"})
    }
    let savedData= await AutherModel.create(data);
    return  res.status(201).send({status:true,data:savedData})
}
catch(error){
    return res.status(500).send({msg: "Error", error:error.message})
}
}



const loginAuther = async function (req, res) {
    try {
      let autherName = req.body.email;
      let password = req.body.password;
      if(!autherName || !password)
      {
          return res.status(400).send({status:false, msg:"email and password must be present"})
        }
  
  
      let auther = await AutherModel.findOne({ email: autherName, password: password });
      if (!auther)
        return res.status(400).send({
          status: false,
          msg: "auther name or the password is not corerct",
        });
        
      let token = jwt.sign(
        { autherID: auther._id.toString() }, 'shubham-thorium'
      );
      res.setHeader("x-api-key", token);
      return res.status(201).send({ status: true, data: token });
    }
    catch (err) {

      return res.status(500).send({ msg: "Error", error: err.message })
    }
  }




module.exports.createauther= createauther
module.exports.loginAuther= loginAuther


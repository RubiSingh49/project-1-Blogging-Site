const AutherModel = require("../models/autherModel")
let jwt = require('jsonwebtoken')
// const validator = require('email-validator')

// define valid function---------------------
const { isValid, isValidTitle } = require("../isValid/validator.js")


const createAuthor = async function (req, res) {

  try {
    let x = req.query
    if (Object.keys(x).length > 0) {
      return res.status(400).send({ status: false, message: "please don't provide params " })
    }

    let data = req.body

    let { firstName, lastName, title, email, password } = data  //destructuring method


    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "BAD REQUEST" })

    }
    // validation start---------------

    if (!isValid(firstName)) {
      return res.status(400).send({ status: false, msg: "firstName is required" })

    }
    if (!isValid(lastName)) {
      return res.status(400).send({ status: false, msg: "lastname is required" })

    }

    //title validation------
    if (!isValid(title)) {
      return res.status(400).send({ status: false, msg: "title is required" })

    }
    if (!isValidTitle(title)) {
      res.status(400).send({ status: false, message: 'title should be among [Mr,Mrs,Miss]' })
      return
    }

    // validate email------------------
    if (!isValid(email)) {
      res.status(400).send({ status: false, msg: "email is required" })
      return
    }
    if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
      res.status(400).send({ status: false, msg: "email is not a valid email" })
      return
    }
    // valiate password---------------
    if (!isValid(password)) {
      res.status(400).send({ status: false, msg: "password is required" })
      return
    }
    if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password))) {
      res.status(400).send({ status: false, msg: "password is not  valid" })
      return
    }

    let isemailAlreadyUsed = await AutherModel.findOne({ email })
    if (isemailAlreadyUsed) {
      res.status(400).send({ status: false, msg: "this email is already used, please provide another email" })
      return
    }


    // create Author-------------------
    let author = await AutherModel.create(data)

    res.status(201).send({ status: true, msg: "Success", data: author })

  } catch (error) {
    console.log(error)
    res.status(500).send({ msg: error.message })
  }

}


const loginAuthor = async function (req, res) {
  try {
    let authorName = req.body.email;
    let password = req.body.password;
    if (!authorName || !password) {
      return res.status(400).send({ status: false, msg: "email and password must be present" })
    }

    let author = await AutherModel.findOne({ email: authorName, password: password });
    if (!author)
      return res.status(400).send({
        status: false,
        msg: "author name or the password is not corerct",
      });

    //token generate------
    let token = jwt.sign(
      { userID: user._id.toString() }, 'shubham-thorium', { expiresIn: "300 m" }
    );

    res.setHeader("x-api-key", token);
    return res.status(201).send({ status: true, msg: "success", data: token });
  }

  catch (err) {

    return res.status(500).send({ msg: "Error", error: err.message })
  }
}


module.exports.createAuthor = createAuthor;
module.exports.loginAuthor = loginAuthor;





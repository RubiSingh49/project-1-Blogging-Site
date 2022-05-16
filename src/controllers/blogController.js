const BlogModel = require("../models/blogModel")
const AutherModel = require("../models/autherModel")

// define valid function---------------------
const { isValid, isValidObjectId } = require("../isValid/validator.js")

const createblog = async function (req, res) {
  try {
    if (Object.keys(req.query).length > 0) {
      return res.status(400).send({ status: false, message: "please don't provide value on params " })
    }

    let data = req.body

    let { title, body, autherID, category } = data  //destructuring method used

    if (Object.keys(data).length == 0) {
      res.status(400).send({ status: false, msg: "Please provide Data" })
      return
    }

    //validation start------
    if (!isValid(title)) {
      return res.status(400).send({ status: false, msg: "title is required" })

    }

    if (!isValid(body)) {
      return res.status(400).send({ status: false, msg: "body is required" })

    }
    ///autherID validation-----
    if (!isValid(autherID)) {
      return res.status(400).send({ status: false, msg: "authorId is required" })

    }
    if (!isValidObjectId(autherID)) {
      return res.status(400).send({ status: false, msg: "autherID is not valid ID" })
    }

    if (!isValid(category)) {
      return res.status(400).send({ status: false, msg: "category is required" })

    }
    //validation ends-----------

    let author = data.autherID
    let authorValid = await AutherModel.findById({ _id: author })

    if (!authorValid) {
      return res.status(404).send({ status: false, msg: "authorId doesn't exist" })
    }
    else {
      let blogCreated = await BlogModel.create(data)
      return res.status(201).send({ status: true, msg: "Success", data: blogCreated })
    }

  } catch (err) {
    return res.status(500).send({ statue: false, msg: err.message })
  }

}


let getBlog = async function (req, res) {
  try {
    let query = req.query
    let filter = {
      isdeleted: false,
      ispublished: true,
      ...query                                   //spread operator
    };

    let filterByquery = await BlogModel.find(filter)
    if (filterByquery.length == 0) {
      return res.status(400).send({ msg: "Blog Not Found" })
    }
    else {
      return res.status(200).send({ msg: filterByquery })
    }
  } catch (err) {
    return res.status(500).send({ statue: false, msg: err.message })
  }


}



const updateblog = async function (req, res) {
  try {
    let updateblog = req.params.blogId
    let body = req.body

    let updateAuth = await BlogModel.findById(updateblog)
    if(!isValidObjectId(updateAuth)){
      return res.status(400).send({status:false,message:`${updateAuth} is not a valid blog id`})
    }
    if (req.user != updateAuth.autherID) {
      return res.status(401).send({ msg: "You are not authorised" })
    }

    if (!updateAuth) {
      return res.status(404).send({ msg: "Invalid Blog" })
    }

    if (Object.keys(body).length === 0) {
      return res.status(400).send({ status: false, msg: "Enter Data to update." })
    }

    let blogValid = await BlogModel.findOne({ $and: [{ _id: updateblog }, { isdeleted: false }, {deletedAt: null}] })
    if (!blogValid) {
      return res.status(404).send({ status: false, msg: "given value is deleted" })
    }

    //update blog-------
    let updatedata = req.body;
    let updatedUser = await BlogModel.findOneAndUpdate({ _id: updateblog }, { title: updatedata.title, body: updatedata.body, tags: updatedata.tags, subcategory: updatedata.subcategory, ispublished: true }, { new: true, upsert: true });
    return res.status(200).send({ status: true, msg: "blog updated successfully", data: updatedUser })

  } catch (err) {
    return res.status(500).send({ Error: err.message })
  }

}



const deletebyId = async function (req, res) {
  try {
    let blogId = req.params.blogID
    const validId = await BlogModel.findById(blogId)

    if (req.user != validId.autherID) {
      return res.status(401).send({ status: false, msg: "You are not authoorised" })
    }
    console.log(validId)
    if (!validId) {
      return res.status(404).send({ msg: "blog ID is Invalid" })
    }

    const deleteData = await BlogModel.findOneAndUpdate({ _id: blogId, isdeleted: false }, { $set: { isdeleted: true, deletedAt: Date.now() } }, { new: true });
    console.log(deleteData)
    if (!deleteData) {
      return res.status(404).send({ status: false, msg: "no such blog exist" })
    }
    return res.status(200).send({ status: true, msg: "blog deleted" })

  } catch (err) {
    return res.status(500).send({ Error: err.message })
  }
}


const deletebyQuery = async function (req, res) {
  try {


    let { blogId, AutherID, category, tags, subcategory, ispublished } = req.query
    if (!req.query) {
      return res.status(400).send({ status: false, msg: "bad request" })
    }


    let updateDelete = await BlogModel.find({ $and: [{ isdeleted: false, autherID: AutherID }, { $or: [{ autherID: AutherID }, { blogId: blogId }, { category: category }, { tags: tags }, { subcategory: subcategory }, { ipublished: ispublished }] }] })

    if (updateDelete.length <= 0) {
      return res.status(404).send({ status: false, msg: "data not found" })
    }


    for (let i = 0; i < updateDelete; i++) {
      let blogId = updateDelete[i]._id

      const result = await BlogModel.findByIdAndUpdate(blogId, { $set: { isdeleted: true, deletedAt: Date.now() } }, { new: true })
      return res.status(200).send({ status: true, blogdata: result })

    }

  } catch (error) {
    res.status(500).send({ msg: "Error", error: error.message })
  }
}




module.exports.createblog = createblog
module.exports.getBlog = getBlog
module.exports.updateblog = updateblog
module.exports.deletebyId = deletebyId
module.exports.deletebyQuery = deletebyQuery
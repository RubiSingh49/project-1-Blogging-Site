const BlogModel = require("../models/blogModel")
const AutherModel = require("../models/autherModel")


const createblog = async function (req, res) {
  try {
    let data = req.body
    let auther = data.autherID
    let autherValid = await AutherModel.find({_id:auther})

    if(Object.keys(autherValid).length===0){
      return res.status(400).send({status:false, msg:"Enter a valid author"})
    }

    let savedData = await BlogModel.create(data);

    if(savedData.ispublished==true){
      let blogUpdated = await BlogModel.findOneAndUpdate({_id:savedData._id},{publishedAt: Date.now()},{new:true})
      return res.status(201).send({status: true, data:blogUpdated})
    }
    return res.status(201).send({status: true, data: savedData})

  }

  catch (err) {
    return res.status(500).send({ statue: false, msg: err.message })
  }


}


let getBlog = async function (req, res) {
  try {
    let query = req.query
    let filter = {
      isdeleted: false,
      ispublished: true,
      ...query
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

    if(Object.keys(body).length===0){
      return res.status(400).send({status: false, msg: "Enter Data to update."})
    }

    let updateAuth = await BlogModel.findById(updateblog)
    if (req.user != updateAuth.autherID) {
      return res.status(401).send({ msg: "You are not authorised" })
    }

    if (!updateAuth) {
      return res.status(404).send({ msg: "Invalid Blog" })
    }


    // validation starts
    if(!isValidObjectId(updateblog)){
      return res.status(400).send({status:false,message:`${updateblog} is not a valid blog id`})
    }
    if(!isValidObjectId(authorIdFromToken)){
      return res.status(400).send({status:false,message:`${authorIdFromToken} is not a valid token id`})
    }
    const blog = await BlogModel.findOne({_id:updateblog,isdeleted:false,deletedAt:null})
    
    if(!blog){
      return res.status(404).send({status:false,message:'blog not found'})
    }
    
    if(blog.authorId.toString() !== authorIdFromToken){
      return res.status(401).send({status:false,message:'unauthorised access! owner info does not match'})
    }
    
    if(!isValidRequestBody(requestBody)){
      return res.status(200).send({status:true,message:'no parameter passed Blog unmodified',data:blog})
    }

  /// extract params
  const {title,tags, category,subCategory,isPublished} = requestBody;
  const updateBlogData ={}

  if(isValid(title)) {
    if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set']={}
    updateBlogData['$set']['title']= title
  }


  // if(isValid(body)) {
  //   if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set']={}
  //   updateBlogData['$set']['body']= body
  // }

  if(isValid(category)) {
    if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set']={}
    updateBlogData['$set']['category']= category
  }


  if(isPublished !== undefined) {
    if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set']={}
    updateBlogData['$set']['isPublished']= isPublished
    updateBlogData['$set']['isPublishedAt']= isPublished ? new Date():null
  }


  if(tags) {
    if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$addToSet')) updateBlogData['$addToSet']={}
      
    if(Array.isArray(tags)){
      updateBlogData['$addToSet']['tags'] = {$each: [...tags]}
    }
    if(typeof tags === "string") {
      updateBlogData['addToSet']['tags'] =tags
    }
  }


  if(subCategory) {
    if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$addToSet')) updateBlogData['$addToSet']={}
      
    if(Array.isArray(subCategory)){
      updateBlogData['$addToSet']['subCategory'] = {$each: [...subCategory]}
    }
    if(typeof subCategory === "string") {
      updateBlogData['addToSet']['subCategory'] =subCategory
    }
  }


  const updatedBlog = await BlogModel.findOneAndUpdate({_id:BlogId}, updateBlogData, {new:true})
  return res.status(200).send({status:true,message:'blog updated successfully', data: updatedBlog});


}catch (err) { 
  return res.status(500).send({status: false, message: err.message })
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

    const deleteData = await BlogModel.findOneAndUpdate({ _id: blogId, isdeleted:false}, {$set:{ isdeleted: true ,deletedAt: Date.now()}}, { new: true });
    console.log(deleteData)
    if(!deleteData){
      return res.status(404).send({status: false, msg: "no such blog exist"})
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
  return res.status(200).send({status:true , blogdata:result })

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
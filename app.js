// Configuration
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require('path');
require('dotenv').config()


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

//Connecting to MongoDB Atlas database using mongoose
let link = "mongodb+srv://" + process.env.MONGODB_USERNAME + ":" + process.env.MONGODB_PASSWORD + "@" + process.env.MONGODB_CLUSTER + "/inventory"
mongoose.connect(link, {'useNewUrlParser': true, 'useUnifiedTopology': true});
mongoose.set("useCreateIndex", true);

const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  totalq: Number,
  quantities: [{
    quantity: Number,
    status: String,
    location: String
    }
  ]
});

const deletedSchema = new mongoose.Schema({
  id: String,
  name: String,
  totalq: Number,
  deletedDate: Date,
  reason: String,
  quantities: [{
    quantity: Number,
    status: String,
    location: String
    }
  ]
});

const productModel = mongoose.model("products", productSchema);
const deletedModel = mongoose.model("deleted", deletedSchema);

/* Sample record as in database
const newproduct = new productModel({
  id: "P1",
  name: "Pencils",
  totalq: 100,
  quantities: [{
    quantity: 50,
    status: "at",
    location: "New York"
  },
  {
    quantity: 50,
    status: "at",
    location: "Toronto"
  }
  ]
});
*/


 app.get("/", async function(req, res){
  // Retrieve id, name and total from products collection
  const productsdata = await productModel.find().select({ name: 1, id: 1, totalq:1 });
  return res.render("productspage", {products: productsdata });
 });
 //Code for on-screen back buttons
 app.get("/backtohome", async function(req, res){
  return res.redirect("/");
 });
 app.get("/back", function(req, res){
  return res.redirect("/read?item="+req.query.back);
 });
 app.get("/create", function(req, res){
   //Render Create Record which displays form
  return res.render("createrecord");
 });
 app.get("/restore", async function(req, res){
   //Getting deleted records from deleteds table
  const deleteddata = await deletedModel.find();
  return res.render("deletedpage", {products: deleteddata });
 });
 
 app.get("/read?", async function(req, res){
   //Retrieve all product info based on product id
  const productdata = await productModel.findOne({id: req.query.item});
  if(productdata == null){
    return res.render("notfound");
  }
  return res.render("productdetails", {product: productdata});
 });
 app.get("/update?", async function(req, res){
   //Retrieve all (old) info for update
  const productdata = await productModel.findOne({id: req.query.item});
  if(productdata == null){
    return res.render("notfound");
  }
  return res.render("productdetailsupdate", {product: productdata});
 });
 //Storing product data for deletion to prevent re-retrieval of data
 let producttodelete = {}
 app.get("/delete?", async function(req, res){
  const productdata = await productModel.findOne({id: req.query.item});
  producttodelete = productdata
  //console.log(productdata)
  if(productdata == null){
    return res.render("notfound");
  }
  return res.render("areyousure", {product: productdata});
});
 app.post("/create", function(req, res){
  // data stored in multiple textboxes: quantity_0, status_0, location_0, quantity_1 and so on..
  let count = 0
  let quantity_count = 0
   let temp = []
   //Light validation to ensure values not null. Further validation could be done, but I was short on time.
   while(typeof req.body["quantity_"+count]!=="undefined" && req.body["quantity_"+count].length>0){
     let tempobj = {quantity: parseInt(req.body["quantity_"+count]), status: req.body["status_"+count], location: req.body["location_"+count]}
     quantity_count += parseInt(req.body["quantity_"+count])
     temp.push(tempobj)
     count++
   }
   //Total quantity = Sum of quantities at locations
   if(quantity_count!==parseInt(req.body.ptotalq)){
    return res.render("erroroccured", {msg: "Quantities don't add up"});
   }
  //write to database
  productModel.create({id: req.body.pid, name: req.body.pname, totalq: parseInt(req.body.ptotalq), quantities: temp}, function(err) {
    if(err){
      return res.render("erroroccured", {msg: err });
    }
    else{
      return res.redirect("/");
    }
   });
 });
 app.post("/delete", function(req, res){
  //Adding deleted record to 'deleteds' Collection
  //Deleting record from 'products' Collection
  deletedModel.create({id: producttodelete.id, name: producttodelete.name, quantities: producttodelete.quantities, totalq: producttodelete.totalq, reason: req.body.reasonfordeletion, deletedDate: Date.now()}, function(err) {
    if(err){
      return res.render("erroroccured", {msg: err});
    }
    else{

       //Find document based on ID and delete
        productModel.findOneAndDelete({id: req.body.item}, function(err) {
        if(err){
          return res.render("erroroccured", {msg: err });
        }
        else{
          return res.redirect("/");
        }
         });
     
    }
   });
  
 });

 app.post("/update", function(req, res){
  //Light validation. Creating temporary objects and adding to temporary array to create updated quantities array.
   let count = 0
   let quantity_count = 0
   let temp = []
   while(typeof req.body["quantity_"+count]!=="undefined" && req.body["quantity_"+count].length>0){
     let tempobj = {quantity: parseInt(req.body["quantity_"+count]), status: req.body["status_"+count], location: req.body["location_"+count]}
     temp.push(tempobj)
     quantity_count += parseInt(req.body["quantity_"+count])
     count++
   }
   if(quantity_count!==parseInt(req.body.ptotalq)){
    return res.render("erroroccured", {msg: "Quantities don't add up"});
  }
   //updating based on id (id does not change)
  productModel.findOneAndUpdate({id: req.body.pid}, {$set:{name: req.body.pname, totalq: parseInt(req.body.ptotalq), quantities: temp}}, {useFindAndModify: false},  function(err) {
    if(err){
      return res.render("erroroccured", {msg: err });
    }
    else{
      return res.redirect("/read?item="+req.body.pid);
    }
   });
});
app.post("/restore", async function(req, res){
  //Getting deleted records from deleteds table
 const deleteddata = await deletedModel.findOne({id: req.body.item})
 productModel.create({id: deleteddata.id, name: deleteddata.name, totalq: deleteddata.totalq, quantities: deleteddata.quantities}, function(err) {
  if(err){
    return res.render("erroroccured", {msg: err });
  }
  else{
    
    deletedModel.findOneAndDelete({id: deleteddata.id}, function(err) {
      if(err){
        return res.render("erroroccured", {msg: err });
      }
      else{
        return res.redirect("/");
      }
       });
    
  }
 });
});
app.post("/deletepermanently", async function(req, res){
  //Option to delete permanently on restore screen
    
    deletedModel.findOneAndDelete({id: req.body.item}, function(err) {
      if(err){
        return res.render("erroroccured", {msg: err });
      }
      else{
        return res.redirect("/");
      }
       });
    
  
});




// Configuration of port for local and server
let port=process.env.PORT;
if(port==null||port==""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const ejs = require("ejs");
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/airData",{useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

//mongo schema.
const planeSchema = new mongoose.Schema({
  from: String,
  to: String,
  nos_total: Number,
  nos_avail: Number,
  date: Date
});

//mongo model.
const Plane = new mongoose.model("Plane",planeSchema);


app.get("/",function(req,res){
  res.render("home");
});

app.post("/",function(req,res){
  console.log(req.body.date);
  let today = new Date();
  let bookeddate = new Date(req.body.date);
  console.log(today);
  console.log(bookeddate);
  if(today > bookeddate){
    res.render("failure",{message : "recheck the date you entered."});
  }
  console.log(parseInt(toString(req.body.nos),10));
  if(req.body.nos <= 0 || parseInt(toString(req.body.nos),10)==NaN){
    res.render("failure",{message: "number is not valid"});
  }
  if(req.body.from !== req.body.to){
    Plane.findOne({from: req.body.from,to: req.body.to,date: req.body.date},function(err,result){
      if(result){
        if(result.nos_avail >= req.body.nos){
          let a = result.nos_avail;
          let b = req.body.nos;
          Plane.findOneAndUpdate({from: req.body.from,to: req.body.to,date: req.body.date},{nos_avail: a-b},function(err1,result1){
            if(!err1){
              res.render("success");
            }
            else{
              res.send(err1);
            }
          });
        }
        else{
          res.render("failure",{message: "sorry , available seats are only " + result.nos_avail + " "});
        }
      }
      else{
        if(req.body.nos <= 200 && req.body.nos>0){
          const plane = new Plane({
            from: req.body.from,
            to: req.body.to,
            nos_total: 200,
            nos_avail: 200-(req.body.nos),
            date: req.body.date
          });
          plane.save();
          res.render("success");
        }
        else{
          res.render("failure",{message: "sorry , available seats are only 200"});
        }
      }
    });
  }
  else{
    res.render("failure",{message: "both from and to should not be same."});
  }
});


app.listen(3000,function(){
  console.log("Server is running on port 3000");
});

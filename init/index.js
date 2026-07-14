const mongoose = require('mongoose');

const initData = require("./data.js")
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/travelbuzz";
main().then(()=>{console.log("DATABASE CONNECTED")}).catch((err)=>{console.log(err)});

console.log(initData.data);

async function main(){
    await mongoose.connect(MONGO_URL);
}


async function init(){
    await Listing.deleteMany({});
    //...obj is spread operator that copies the properties of object into new object
    initData.data=initData.data.map((obj)=>({...obj,owner:'697a2d3c8715ee0c31aaef37'}));
   await Listing.insertMany(initData.data);
}
init();
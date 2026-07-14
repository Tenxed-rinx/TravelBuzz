const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
});

let fileFilter = (req,file,cb)=>{
    const allowedTypes = ["image/png","image/jpg","image/jpeg"];
    if(allowedTypes.includes(file.mimetype)){
        cb(null,true);//accept the file
    }
    else{
        req.fileValidationError = true;
        cb(null,false);
    }
};

module.exports = {
    cloudinary,fileFilter
}
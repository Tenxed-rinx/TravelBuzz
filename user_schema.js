const Joi = require("joi");

module.exports.userSchema = Joi.object({
  user: Joi.object({
    username:Joi.string().required(),
    email:Joi.string().email().required(), 
    password:Joi.string().required()
  }).required(),
});

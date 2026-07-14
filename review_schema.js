const Joi = require("joi");

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required(),
    created_at: Joi.alternatives().try(
      Joi.date(),
      Joi.valid(null),
      Joi.string().allow("").strip(),
    ),
  }).required(),
});

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const propertySchema = new Schema(
  {
    property_id: { type: String, unique: true },
    property_name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

const property = mongoose.model("property", propertySchema);

module.exports = property;

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const profileSchema = new Schema(
  {
    profile_id: { type: String, unique: true },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    profile_picture: { type: String },
    id_image: { tyoe: String },
  },
  {
    timestamps: true,
  }
);

const profile = mongoose.model("profile", profileSchema);

module.exports = profile;

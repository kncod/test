const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const finantialSchema = new Schema(
  {
    f_id: { type: String, unique: true },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const finantial = mongoose.model("property", finantialSchema);

module.exports = finantial;

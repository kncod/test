const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    booking_id: { type: String, unique: true },
    property_id: {
      type: Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const booking = mongoose.model("booking", bookingSchema);

module.exports = booking;

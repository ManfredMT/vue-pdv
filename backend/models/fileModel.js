const mongoose = require("mongoose");

const fileSchema = mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    md5: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("File", fileSchema);
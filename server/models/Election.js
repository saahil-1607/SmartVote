const mongoose = require("mongoose");

const ElectionSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    candidates: [
        {
            name: { type: String, required: true },
            // image: { type: String, required: true }
        }
    ]
});

module.exports = mongoose.model("Election", ElectionSchema);

const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  time: { type: String, required: true },
});

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
    name: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    }
});

mongoose.model("users", User);
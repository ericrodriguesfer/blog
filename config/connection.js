const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blog", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connection to database was started success...');
}).catch((error) => {
    console.log('Connection to database was fail: ' + error);
});

module.exports = mongoose;
var mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
var connect = function() {
    return new Promise((resolve, reject) => {
        var url = 'mongodb://localhost:27017/cleatstreet';
        mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false}, (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve('Db successfully connected!');
        });
    });
};

autoIncrement.initialize(mongoose);
module.exports = {
    connect: connect
};

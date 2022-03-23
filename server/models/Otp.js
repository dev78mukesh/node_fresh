const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OtpModel = new Schema({
    otpCode: {
        type: String
    },
    userId:  { type: Schema.ObjectId, ref: 'User' },
    eventType: {
        type: String
    },
    phoneNo : {
        type : String
    },
    countryCode:{
        type : String
    }
}, {
    timestamps: true
});
const Otp = mongoose.model('Otp', OtpModel);
module.exports = Otp;

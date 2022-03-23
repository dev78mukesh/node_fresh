const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const encrypt = require('bcrypt');
const AdminModel = new Schema({
    firstName: {
        type: String
    },
    lasttName: {
        type: String
    },
    email: {
        type: String,index:true
    },
    password: {
        type: String,index:true
    },
    phoneNo: {
        type: String
    },
    countryCode: {
        type: String,default:''
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    zipCode: {
        type: String
    },
    state:{ type: String},
    access: {
        read: {
            type: Boolean,
            default: true
        },
        write: {
            type: Boolean,
            default: true
        },
        edit: {
            type: Boolean,
            default: true
        },
        delete: {
            type: Boolean,
            default: true
        }
    },
    role: {
        type: String,
        enum: ['SuperAdmin','SubAdmin']
    },
    accessToken : {
        type:String,index:true,default:null
    },
    passwordResetToken:{type:String,default:''},
    passwordResetTokenDate:{type:Date,default:''},
    isBlocked: {
        type: Boolean,
        default: false
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});
AdminModel.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret, options) {
        delete ret.password;
        delete ret.__v;
    }
});
const Admin = mongoose.model('Admin', AdminModel);
module.exports = Admin;

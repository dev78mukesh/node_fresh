const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const encrypt = require('bcrypt');
const UserModel = new Schema({
    firstName: {
        type: String,default:''
    },
    lastName: {
        type: String,default:''
    },
    userName: {
        type: String,index:true,default:''
    },
    email: {
        type: String,index:true,default:''
    },
    phoneNo: {
        type: String,index:true,default:''
    },
    countryCode: {
        type: String,index:true,default:''
    },
    password: {
        type: String,index:true,default:''
    },
    country: {
        type: String,default:''
    },
    state: {
        type: String,default:''
    },
    gender:{
        type: String,
        enum: ['MALE','FEMALE','NO_PREFRENCE'],
        default: 'NO_PREFRENCE'
    },
    userType:{
        type: String,
        enum: ['ANALYST','ENTHUSIAST'],
        default: 'ENTHUSIAST'
    },
    bankRoll:{type:Number,default:0},
    city: {
        type: String,default:''
    },
    image: {
        type: String,default:''
    },
    address: {
        type: String,default:''
    },
    userLocation: {
        type: {
            type: String, default: "Point"
        },
        coordinates: [Number]
    },
    latitude: { type: Number,default:0 },
    longitude: { type: Number,default:0},
    walletAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    isNotification:{type:Boolean,default:true},
    isEamilVerified: {
        type: Boolean,
        default: true
    },
    isPhoneVerified: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    providerId: { type: String ,index:true,default:''},
    provider: {
        type: String,
        enum: ['GOOGLE','TWITTER','LINKDIN','FACEBOOK','DEFAULT'],
        default: 'DEFAULT'
    },
    isSocialLogin:{type:Boolean,default:false},
    description: {
        type: String,
        default: ''
    },
    accessToken : {
        type:String,index:true,default:null
    },
    passwordResetToken:{type:String,default:''},
    passwordResetTokenDate:{type:Date,default:''},
}, {
    timestamps: true,
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});
UserModel.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret, option) {
        delete ret.password;
        delete ret.__v;
    }
});
UserModel.pre('save', function (next) {
    encrypt.genSalt(10, (error, salt) => {
        if (error) 
        return console.log(error);
        else if(this.password){
            encrypt.hash(this.password, salt, (err, hash) => {
                if (err) return console.log(err);
                this.password = hash;
                next();
            });
        }
        else{
            next();
        }
    });
});
UserModel.methods.comparePassword = function (password, cb) {
    encrypt.compare(password, this.password, (error, match) => {
        if (error) return cb(false);
        if (match) return cb(true);
        return cb(false);
    });
};
UserModel.methods.updatePassword = function (password) {
    return new Promise((resolve, reject) => {
        encrypt.genSalt(10, (error, salt) => {
            if (error) 
            return console.log(error);
            encrypt.hash(password, salt, (err, hash) => {
                if (err) return console.log(err);
                return resolve(hash);
            });
        });
    });
};
const User = mongoose.model('User', UserModel);
module.exports = User;

const multer = require('multer');
const userUpload = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'server/uploads/user')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
    }
});
const adminUpload = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'server/uploads/admin')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
    }
});

const admin = multer({ storage: adminUpload });
const user = multer({ storage: userUpload });
module.exports = {
    admin: admin,
    user: user
};

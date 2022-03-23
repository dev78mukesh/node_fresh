const nodeMailer = require('nodemailer');
const sendGrid = require('@sendgrid/mail');
sendGrid.setApiKey('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');
const Model = require('../models/index');
let transporter = nodeMailer.createTransport({
    host: "",
    port: 0,
    secure: false, // true for 465, false for other ports
    auth: {
        user: '', // generated ethereal user
        pass: '' // generated ethereal password
    }
});
const fromMail = 'mukesh@apptunix.com';
module.exports = {
    sendUserVerifyMail: (payload, otp) => {
        const msg = {
            from: fromMail,
            to: payload.phone || payload.email,
            subject: 'cleatstreet taxi - Welcome',
            html: ''
        };

        const html = `
            <h3>Thank you for register on cleatstreet taxi</h3>
            <p>You verification code is ${otp.otp}.</p>
        `;
        msg.html = html;
        sendGrid.send(msg).then(info => {
            console.log('Email Sent successfully!');
        }).catch(error => {
            console.log('Email not sent.', error);
        });
},
    AdminForgotEmail: payload => {
        return new Promise((resolve, reject) => {
            const msg = {
                from: fromMail,
                to: payload.email,
                subject: 'cleatstreet Admin - Reset Password',
                html: ''
            };
            const passwordResetToken=payload.passwordResetToken || '';
            const html = `
                <p><a href="http://appgrowthcompany.com/cleatstreetadmin/#/reset-password/?passwordResetToken=${passwordResetToken}">Click here to reset your password.</a></p>
                `;
                    msg.html = html;
                    sendGrid.send(msg).then(info => {
                        return resolve(info);
                    }).catch(error => {
                        return reject(error);
                    });
                });
    },
    UserForgotEmail: payload => {
        return new Promise((resolve, reject) => {
            const msg = {
                from: fromMail,
                to: payload.email,
                subject: 'cleatstreet Customer - Reset Password',
                html: ''
            };
            const passwordResetToken=payload.passwordResetToken || '';
            const html = `
                <p><a href="http://appgrowthcompany.com/cleatstreetadmin/#/reset-password/?passwordResetToken=${passwordResetToken}">Click here to reset your password.</a></p>
                `;
                    msg.html = html;
                    sendGrid.send(msg).then(info => {
                        return resolve(info);
                    }).catch(error => {
                        return reject(error);
                    });
                });
    },
    test() {
        return new Promise((resolve, reject) => {
            const msg = {
                from: fromMail,
                to: 'manish@apptunix.com',
                subject: 'Rupee Driver - Reset Password',
                html: getTemplate()
            };
            sendGrid.send(msg).then(info => {
                resolve(msg);
            }).catch(error => {
                reject(error);
            })
        })
    }
};

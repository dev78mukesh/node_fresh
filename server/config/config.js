const port = 3082;
const jwtSecretKey = 'iAmSecretKey';
const cryptSecretKey = 'cleatstreet&&^^(())';
const fcmKey={
    userFcmKey:'AIzaSyCadZ'
};
const jwtOption={
    jwtSecretKey:'iAmSecretKey',
    issuer:'cleetstreet',
    subject:'cleetstreet',
    audience:'cleetstreet',
    algorithm:'SHA256',
    expiresIn:"7d"
}
const apnCertificate={
    apnUserCertificate:'/Certs/basefile.pem',
    gateway:'gateway.push.apple.com',
    sandBoxGateway:'gateway.sandbox.push.apple.com'
}
const twilioCredentials={
    accountSid:"AC",
    authToken:"AC",
    senderNumber:"+91-99834343"
};


module.exports = {
    port: port,
    jwtOption:jwtOption,
    SecretKey: jwtSecretKey,
    cryptHash: cryptSecretKey,
    fcmKey:fcmKey,
    apnCertificate:apnCertificate,
    twilioCredentials:twilioCredentials
};

const FCM = require('fcm-node');
const apns = require('apn');
const Path = require('path');
const apnDriver=require('../config/config').apnDriver;
const apnCertificate=require('../config/config').apnCertificate;
const Handlebars = require('handlebars');
const Model = require('../models/index');

exports.sendAndroidPushNotifiction=sendAndroidPushNotifiction;
exports.renderMessageFromTemplateAndVariables=renderMessageFromTemplateAndVariables;
exports.sendIosPushNotification=sendIosPushNotification;

async function renderMessageFromTemplateAndVariables(templateData, variablesData) {
    return Handlebars.compile(templateData)(variablesData);
}
async function sendAndroidPushNotifiction(payload){

    if(payload.isCompiled && payload.templateData && payload.templateData){
        payload.message =await renderMessageFromTemplateAndVariables(payload.templateData,payload.variablesData);
    }
    let fcm = new FCM(require('../config/config').fcmKey.userFcmKey);
    
    var message = {
        to: payload.token || '',
        collapse_key:'cleatstreet',
        data:payload || {}
    };
  //   notification: {
  //     title: payload.title || '',
  //     body: payload.message || ''
  // },
    
    
    if(payload.isUserNotification && payload.isNotificationSave){
      new Model.UserNotification(payload).save();
    }
    
    fcm.send(message, (err, response) => {
        if (err) {
      console.log('Something has gone wrong!', message,err);
        } else {
            console.log('Push successfully sent!');
        }
    });
}
/*
     ==========================================================
     Send the notification to the iOS device for User
     ==========================================================
*/

async function sendIosPushNotification(payload) {
  
  if(payload.isCompiled && payload.templateData && payload.templateData){
      payload.message =await renderMessageFromTemplateAndVariables(payload.templateData,payload.variablesData);
  }
  let fcm = new FCM(require('../config/config').fcmKey.userFcmKey);
 
  var message = {
      to: payload.token || '',
      collapse_key:'CleatStreet',
      notification: {
        title: payload.title || 'CleatStreet',
        body: payload.message || '',
        sound:'default'
      },
      data:payload || {}
  };
  
  if(payload.isUserNotification && payload.isNotificationSave){
    new Model.UserNotification(payload).save();
  }
  fcm.send(message, (err, response) => {
      if (err) {
    console.log('Something has gone wrong! IOS', payload.token,err);
      } else {
          console.log('Push successfully sent! IOS');
      }
  });
}
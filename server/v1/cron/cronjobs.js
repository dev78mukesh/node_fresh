
const appConstant = require('../../constant');
const moment=require('moment');
const Model = require('../../models/index');
const Service = require('../../services/index');
const mongoose = require('mongoose');
const request = require('request');
const statusCodeList = require("../../statusCodes");
const constant = appConstant.constant;
const statusCode = statusCodeList.statusCodes.STATUS_CODE;

const Agenda = require('agenda');
exports.startCronJobs=startCronJobs;

const agenda = new Agenda({db: {address:'mongodb://localhost:27017/cleatstreet',collection: 'scheduledevents'}});
async function  bulkInsertEvents(data){
    let finalData=[];
    if(data && data.length){
        for(let i=0;i<data.length;i++){
            finalData.push(
                { updateOne: { 
                    filter: {url:data[i].url},
                    update: {
                        $set:data[i]
                    }, 
                    upsert:true }
                })
        }
        await Model.CashControl.bulkWrite(finalData);
    }
    return true;
}
async function customRequest(options){
    console.log("hit by cron..");
    return new Promise((resolve, reject)=>{
    request(options,function (error, response, body) {
        if(error){
            return resolve(null);
        }else{
            if(response && response.statusCode && response.statusCode==statusCode.SUCCESS && 
                typeof JSON.parse(body) =='object'){
                return resolve(JSON.parse(body));
            }else{
                return resolve(null);
            }
        }
    });
});
}
async function requestSend(options){
    let apiName=options.apiName || 0;
    if(options && options.apiName){
        delete options.apiName;
    }
    let data=null;
    let dateDifference=null;
    let sportsData=null;
    let dateDifferencePast=null;
    let dateDifferenceFuture=null;
    let isDateBetween=false;
    let finalData=[];
    let eventDate=null;
    let isCompleted=false;
    let dataCheck= await Model.CashControl.findOne({url:options.url});
    if(dataCheck && dataCheck.response){
        switch(apiName){
            case constant.RUNDOWN_API_NAME.EVENT:
                isCompleted=false;
                dateDifference=moment().diff(dataCheck.updatedAt,constant.RUNDOWN_API_TIME_PARAM.HOURS);
                sportsData =dataCheck.response || null;
                if(sportsData && sportsData.event_date){
                    eventDate=sportsData.event_date;
                }
                if(dateDifference>constant.RUNDOWN_API_TIME.CRON_CHECK_TIME && !dataCheck.isCompleted){
                    data=await customRequest(options);
                    if(data && data.score 
                        && data.score.event_status 
                        && data.score.event_status=='STATUS_FINAL'){
                        isCompleted=true;
                    }
                }else if(sportsData && sportsData.score 
                    && sportsData.score.event_status 
                    && sportsData.score.event_status=='STATUS_FINAL'){
                    isCompleted=true;
                }
                await Model.CashControl.findOneAndUpdate({
                    url:options.url
                },{response:data || dataCheck.response,url:options.url,eventDate:eventDate,isCompleted:isCompleted},{upsert:true});
                break;
            default:
                break;
        }
        return data || dataCheck.response;
    }else{
        console.log("else")
        let data=await customRequest(options);
        let eventDate=null;
        switch(apiName){
            case constant.RUNDOWN_API_NAME.EVENT:
                isCompleted=false;
                    if(data && data.score 
                            && data.score.event_status 
                            && data.score.event_status=='STATUS_FINAL'){
                        isCompleted=true;
                    }
            await Model.CashControl.findOneAndUpdate({
                url:options.url
            },{response:data,url:options.url,eventDate:eventDate,isCompleted:isCompleted},{upsert:true});
                break;
            default:
                break;
        }
        return data;
    }
}
async function getEventById(betObj) {
    let dataToSend = {};
    if(betObj && betObj.eventId){
        var options = {
            method: 'GET',
            url: `${constant.RUNDOWN_API_URL}/events/${betObj.eventId}?include=all_periods&include=scores`,
            headers: {
                'x-rapidapi-key': constant.RUNDOWN_API_TOKEN
            },
            apiName:constant.RUNDOWN_API_NAME.EVENT
        };
        dataToSend = await requestSend(options);
        if (dataToSend && dataToSend.lines) {
            dataToSend.lines = Object.values(dataToSend.lines)
        }
        if (dataToSend && dataToSend.line_periods) {
            dataToSend.line_periods = Object.values(dataToSend.line_periods)
            let line_periods = dataToSend.line_periods || [];
            let final_line_periods = [];
            for (let i = 0; i < line_periods.length; i++) {
                if (line_periods[i].period_full_game && line_periods[i].period_full_game.affiliate) {
                    let affiliate_id = line_periods[i].period_full_game.affiliate.affiliate_id || 0;
                    switch (affiliate_id) {
                        case constant.AFFILIATED_LIST.DIMES_5:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.BOVADA:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.PINNACLE:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.BET_ONLINE:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.BOOKMARKER:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                    }
                }
            }
            dataToSend.line_periods = final_line_periods || [];
        }
    }
    return dataToSend;
};
async function updateBetData (betData){
    console.log("bet id",betData);
    let betDataCheck=await Model.Bet.findOne({_id:mongoose.Types.ObjectId(betData.betId),
        isEventComplete:false},{isDeleted:1,isEventComplete:1,toWin:1,risk:1,userId:1});
    if(!betDataCheck){
        return true;
    }
    else if(betDataCheck && betDataCheck.isDeleted){
        return true;
    }else{
     let betEventData =await Model.BetEvent.countDocuments({betId:mongoose.Types.ObjectId(betData.betId),
        isDeleted:false});
     let betEventDataWithCheck=await Model.BetEvent.countDocuments({betId:mongoose.Types.ObjectId(betData.betId),
     isDeleted:false,isEventComplete:true});
     let betEventDataWithWinCheck=await Model.BetEvent.countDocuments({betId:mongoose.Types.ObjectId(betData.betId),
        isDeleted:false,isEventComplete:true,isWin:true});
    let betEventDataWithDrawCheck=await Model.BetEvent.countDocuments({betId:mongoose.Types.ObjectId(betData.betId),
        isDeleted:false,isEventComplete:true,isDraw:true});
    let userData=await Model.User.findOne({
        _id:mongoose.Types.ObjectId(betDataCheck.userId),
        isDeleted:false
    },{bankRoll:1})
     if(betEventData !=betEventDataWithCheck){
        return false;
     }else{
         if(betEventDataWithWinCheck==betEventDataWithCheck){
            await Model.Bet.update({_id:mongoose.Types.ObjectId(betData.betId)},{
                $set:{isWin:true,profit:betDataCheck.toWin,isEventComplete:true}
            });
            await Model.User.updateOne({
                _id:mongoose.Types.ObjectId(betDataCheck.userId)
            },{$inc:{bankRoll:betDataCheck.toWin}})
         }else if(betEventDataWithDrawCheck==betEventDataWithCheck){
            await Model.Bet.update({_id:mongoose.Types.ObjectId(betData.betId)},{
                $inc:{isDraw:true,profit:0,isEventComplete:true}
            });
         }else{
            await Model.Bet.update({_id:mongoose.Types.ObjectId(betData.betId)},{
                $set:{islose:true,loss:betDataCheck.risk,isEventComplete:true}
            });
            await Model.User.updateOne({
                _id:mongoose.Types.ObjectId(betDataCheck.userId)
            },{$inc:{bankRoll:-(betDataCheck.risk)}})
         }
         return true;
     }
    }
}
async function winLose(bet,betEvent,eventObj){
    if(bet,betEvent && eventObj){
        let isWin=false,islose=false,isDraw=false;
        switch(betEvent.line){
            case 'SPREAD':
                if(betEvent.SelectedBet.isHomeSpreadSelected){
                    if((eventObj.score_home+betEvent.spread)>eventObj.score_away){
                        isWin=true;
                    }else if((eventObj.score_home+betEvent.spread)==eventObj.score_away){
                        isDraw=true;
                    }else{
                        islose=true
                    }
                }
                if(betEvent.SelectedBet.isAwaySpreadSelected){
                    if((eventObj.score_away+betEvent.spread)>eventObj.score_home){
                        isWin=true;
                    }else if((eventObj.score_away+betEvent.spread)==eventObj.score_home){
                        isDraw=true;
                    }else{
                        islose=true
                    }
                }
                await Model.BetEvent.update({_id:mongoose.Types.ObjectId(betEvent._id)},{
                    $set:{isWin:isWin,islose:islose,isDraw:isDraw,isEventComplete:true}
                });
                break;
            case 'MONEYLINE':
                if(eventObj.score_away== eventObj.score_home){
                    isDraw=true;
                }else if(betEvent.SelectedBet.isHomeMoneySelected && eventObj.winner_home){
                    isWin=true;
                }else if(betEvent.SelectedBet.isAwayMoneySelected && eventObj.winner_away){
                    isWin=true;
                }else{
                    islose=true;
                }
                await Model.BetEvent.update({_id:mongoose.Types.ObjectId(betEvent._id)},{
                    $set:{isWin:isWin,islose:islose,isDraw:isDraw,isEventComplete:true}
                });
                break;
            case 'TOTAL':
                if(betEvent.SelectedBet.isHomeTotalSelected){
                    if(betEvent.total>eventObj.total_score){
                        isWin=true;
                    }
                    else if(betEvent.total==eventObj.total_score){
                        isDraw=true;
                    }else{
                        islose=true;
                    }
                }else if(betEvent.SelectedBet.isAwayTotalSelected){
                    if(betEvent.total<eventObj.total_score){
                        isWin=true;
                    }else if(betEvent.total==eventObj.total_score){
                        isDraw=true;
                    }else{
                        islose=true;
                    }
                }else{
                    islose=true;
                }
                await Model.BetEvent.update({_id:mongoose.Types.ObjectId(betEvent._id)},{
                    $set:{isWin:isWin,islose:islose,isDraw:isDraw,isEventComplete:true}
                });
                break;
        }
        return true;
    }else{
        return false;
    }
}
async function updateBetEventData (betEventData){
    console.log("bet event id",betEventData);
    let betEvent=await Model.BetEvent.findOne({_id:mongoose.Types.ObjectId(betEventData.betEventId),
        isEventComplete:false});
    if(!betEvent){
        return true;
    }
    if(betEvent && betEvent.isDeleted){
        return true;
    }
    let bet=await Model.Bet.findOne({_id:mongoose.Types.ObjectId(betEvent.betId)});
    let eventData=await getEventById(betEvent);
    let finalObj=null;
    if(eventData && eventData.score && eventData.score.event_status &&
         eventData.score.event_status=='STATUS_FINAL'){
            finalObj={};
            finalObj.event_status=eventData.score.event_status;//STATUS_FINAL
            finalObj.total_score=eventData.score.score_away+eventData.score.score_home;
            finalObj.score_away=eventData.score.score_away;
            finalObj.score_home=eventData.score.score_home
            finalObj.winner_away=eventData.score.winner_away;
            finalObj.winner_home=eventData.score.winner_home;
            finalObj.line=eventData.line_periods?eventData.line_periods[0]:null;
         }
    let bool=await winLose(bet,betEvent,finalObj);
    return bool;
}
agenda.define('scheduledBet', async job => {
    const betData=job.attrs.data;
    if(betData && betData.betId){
        let bool=await updateBetData({betId:betData.betId});
        if(bool){
            job.remove(function(err) {
                if(!err) console.log("Successfully removed bet from collection");
            })
        }
    }
  });
  agenda.define('scheduledBetEvent', async job => {
    const betEventData=job.attrs.data;
    if(betEventData && betEventData.betEventId){
        let bool=await updateBetEventData({betEventId:betEventData.betEventId});
        if(bool){
            job.remove(function(err) {
                if(!err) console.log("Successfully removed bet event from collection");
            })   
        }
    }
  });
async function startCronJobs(){
    await agenda.start();
    
}
//23 hours 5 seconds
process.on('scheduledBet',async(betData)=>{
    const repeat =await agenda.create('scheduledBet',{betId:betData._id});
    repeat.repeatEvery('5 seconds').save();
})
process.on('scheduledBetEvent',async(betEventData)=>{
    const repeat=await agenda.create('scheduledBetEvent',{betEventId:betEventData._id});
    repeat.repeatEvery('5 seconds').save();
})
//isaway totalover ||| ishome -->totalunder
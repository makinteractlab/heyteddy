/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a sample skill built with Amazon Alexa Skills nodejs
 * skill development kit.
 * This sample supports multiple languages (en-US, en-GB, de-GB).
 * The Intent Schema, Custom Slot and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-howto
 **/

'use strict';

const Alexa = require('alexa-sdk');
const http = require('http');
const space = " ";

var elicitSlotForIntent = {};
var data = {};
//var intentNameforAction = "";
var actionFor = {};
var countId = 1;

var commandArray = [];

var ifObj = {};
var doAfterObj = {};

const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'HeyTeddy',
            WELCOME_MESSAGE: "Hi, this is %s.",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: 'HeyTeddy',
            HELP_MESSAGE: "You can say write pin 5 high or just start the word if, then or reset... ",
            HELP_REPROMPT: "You can say things like, write high to pin 5, or you can say exit... Now, what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
            PROTALK_REPROMPT: "Next?",
        },
    },
};

function clearArray(array) {
  while (array.length) {
    array.pop();
  }
}

function handleResponse(response) {
  var serverData = '';
  response.on('data', function (chunk) {
    serverData += chunk.replaceWith("\n", " ");
  });
  response.on('end', function () {
    console.log("received server data:");
    console.log(serverData);
    return serverData;
  });
}

/*
function readFileFromWeb(urlhost, urlpath){
    var http = require('http');
    var options = {
        host: 'www.artecasa.co.kr',
        path: '/white/yj/backup/src/countId.txt'
    };

    http.request(options, function(response){
        handleResponse(response);
    }).end();
}*/

function httpGetSaveId(countId, callback) {
    var options = {
        host: 'www.artecasa.co.kr',
        path: '/white/yj/backup/src/saveId.php?id=' + countId,
        method: 'GET'   // voiceControl.json will be created
    };

    var req = http.request(options, (res) => {
            res.on('data', (d) => {
            process.stdout.write(d);
            });
    });

    req.on('error', (e) => {
        console.error(e);
    });
    req.end();
}

function httpGetSaveHistory(jsonResult, callback) {
    var options = {
        host: 'www.artecasa.co.kr',
        path: '/white/yj/backup/src/saveHistory.php?json=' + jsonResult,
        method: 'GET'   // voiceControl.json will be created
    };

    var req = http.request(options, (res) => {
            res.on('data', (d) => {
            process.stdout.write(d);
            });
    });

    req.on('error', (e) => {
        console.error(e);
    });
    req.end();
}

function httpGetSaveResult(jsonResult, callback) {
    var options = {
        //http://www.artecasa.co.kr/white/yj/backup/src/saveResultAlexa.php?json=
        host: 'www.artecasa.co.kr',
        path: '/white/yj/backup/src/saveResultAlexa.php?json=' + jsonResult,
        method: 'GET'   // voiceControl.json will be created
    };

    var req = http.request(options, (res) => {
            res.on('data', (d) => {
            process.stdout.write(d);
            });
    });

    req.on('error', (e) => {
        console.error(e);
    });
    req.end();
}

function httpGetClearResult(jsonResult, callback) {
    var options = {
        //http://www.artecasa.co.kr/white/yj/backup/src/saveResultAlexa.php?json=
        host: 'www.artecasa.co.kr',
        path: '/white/yj/backup/src/clearJson.php?json=' + jsonResult,
        method: 'GET'   // voiceControl.json will be created
    };

    var req = http.request(options, (res) => {
            res.on('data', (d) => {
            process.stdout.write(d);
            });
    });
    
    req.on('error', (e) => {
        console.error(e);
    });
    req.end();
}

function handleObj(intentObj, intentName, itemData, speechOutput) {
    var jsonFormatString = "";
    var arduinoData = {};
    if(actionFor.ifIntent) {
        actionFor.ifIntent = false;
        if(actionFor.doAfterIntent) {
            actionFor.doAfterIntent = false;
            intentObj.attributes.speechOutput = "I talked to the Arduino ... then do ";
            intentObj.attributes.speechOutput += speechOutput;
            intentObj.attributes.speechOutput += " after " + doAfterObj.params["time"]/1000 + " seconds";
            doAfterObj.params.command = itemData;
            ifObj.params.command = doAfterObj;
        } else {
            intentObj.attributes.speechOutput = "I talked to the Arduino ... then ";
            intentObj.attributes.speechOutput += speechOutput;
            ifObj.params.command = itemData;
        }
        commandArray.push(ifObj);
    } else if(actionFor.doAfterIntent) {
        actionFor.doAfterIntent = false;
        intentObj.attributes.speechOutput = "I talked to the Arduino ... do ";
        intentObj.attributes.speechOutput += speechOutput;
        intentObj.attributes.speechOutput += " after " + doAfterObj.params["time"]/1000 + " seconds";
        doAfterObj.params.command = itemData;
        commandArray.push(doAfterObj);
    } else {
        if(itemData ["action"] == "read") {
            intentObj.attributes.speechOutput = speechOutput;
        } else if(itemData ["action"] == "show") {
            intentObj.attributes.speechOutput = speechOutput;
        } else {
            intentObj.attributes.speechOutput = "I talked to the Arduino ... ";
            intentObj.attributes.speechOutput += speechOutput;
        }
        commandArray.push(itemData);
    }
    
    arduinoData.commands = commandArray;
    jsonFormatString = JSON.stringify(arduinoData, null, 2);
    
    //jsonFormatString = JSON.stringify(commandArray, null, 2);
    jsonFormatString = encodeURIComponent(jsonFormatString);
    httpGetSaveResult(jsonFormatString, function (response) {});
    httpGetSaveHistory(jsonFormatString, function (response) {});
    
    data = {};
    elicitSlotForIntent = {};
    clearArray(commandArray);
}

function parseTimes(time) {
    var start = 2;
    var end = time.length - 1;
    var unit = time.charAt(end);
    var timeUnit = "";

    var _time = time.substring(start, end);

    var secToMs = 1000;
    var minToMs = secToMs*60;
    var hourToMs = minToMs*60;
    var msecTime = 0;

    switch(unit) {
        case "S":
            timeUnit = "seconds";
            msecTime = _time * secToMs;
            break;
        case "M":
            timeUnit = "minutes";
            msecTime = _time * minToMs;
            break;
        case "H":
            timeUnit = "hours";
            msecTime = _time * hourToMs;
            break;
    }
    return msecTime.toString();
}

function handlePipeException(pinId, pinType) {
    var tempPin = pinId;
    var toPin = pinId.substring(pinId.length-1, pinId.length);
    tempPin = tempPin.substring(tempPin.length-2, tempPin.length);
    
    if(parseInt(toPin) != parseInt(tempPin)) {
        toPin = tempPin;
    }
    if(pinType == "digital") {
        switch (toPin) {
            case "0":
            case "1":
            case "2":
            case "4":
            case "7":
            case "8":
            case "12":
            case "13":
                return false;
        }
    }
    return true;
}

function handleDescribeIntent(intentObj, component) {
    var speechOutput = "";
    
    switch(component) {
    case "step 1":
        speechOutput = "First, Plug in the L.E.D.  <break time=\"0.1s\" /> Try to write the high value on the pin 12 for L.E.D.  <break time=\"0.1s\" /> Does L.E.D. turn on? <break time=\"0.1s\" />";
        speechOutput += "If so, Plug in the button. <break time=\"0.1s\" /> Then read the value of pin 7 for the button and press the button. <break time=\"0.1s\" /> Is the rectangle of pin 7 on the screen filled with the green rectangle? <break time=\"0.1s\" />";
        speechOutput += "Then connect the L.E.D. and button with if commands. <break time=\"0.1s\" />";
        intentObj.attributes.repromptSpeech = "Next?";
        break;
    case "step 2":
        speechOutput = "First, Plug in the L.E.D. <break time=\"0.1s\" /> Try to write the high value on the pin 11 for L.E.D. <break time=\"0.1s\" /> Does L.E.D. turn on? <break time=\"0.1s\" />";
        speechOutput += "If so, Plug in the photoresistor. <break time=\"0.1s\" /> Then read the value of analog pin 2. <break time=\"0.1s\" /> Is the value of pin 2 changing beside of green rectangle? <break time=\"0.1s\" />";
        speechOutput += "Then connect the L.E.D. and photoresistor with pipe commands. <break time=\"0.1s\" />";
        intentObj.attributes.repromptSpeech = "Next?";
        break;
    case "step 3":
        speechOutput = "First, Plug in the motor. <break time=\"0.1s\" />";
        speechOutput += "Second, Plug in the potentiometer. <break time=\"0.1s\" /> Then read the value of analog pin 3. <break time=\"0.1s\" /> Is the value of pin 3 changing beside of green rectangle? <break time=\"0.1s\" />";
        speechOutput += "Then connect the motor and photoresistor with pipe commands. <break time=\"0.1s\" />";
        intentObj.attributes.repromptSpeech = "Next?";
        break;
    }
    intentObj.response.speak(speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');
}

function handleHowtoIntent (intentObj, component) {
        //var jsonFormatString = "";
    var speechOutput = "";
    var itemData = {};
    var params = {};
    
    var dt = new Date();
    var utcDate = dt.toUTCString();
        
    if(intentObj.attributes.stage == "hw_debug") {
        speechOutput += intentObj.attributes.speechOutput + "<break time=\"0.5s\" />";
    }
    intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
    switch(component) {
        /* DO NOT REMOVE THIS COMMENT: function handleHowtoIntent - user define test will be added here */
        case "rotary encoder":
        case "rotaryencoder":
        case "potentiometer":
            component = "potentiometer";
            speechOutput += "Here is an example of using a " + component + ". <break time=\"0.1s\" />";
            speechOutput += "First, you need to connect the third leg of the sensor to the ground rail on the breadboard. <break time=\"10s\" /> ";
            speechOutput += "Second, connect the middle leg to an analog input pin on the Arduino. There are six analog input pins on the left side of the Arduino. <break time=\"10s\" /> ";
            speechOutput += "Last, connect the first leg of the sensor to power rail on the breadboard. <break time=\"10s\" /> ";
            speechOutput += "Just say, \" Check " + component + " \" or \"Test " + component + " \" if you want to test your component. <break time=\"10s\" />";
            //intentObj.attributes.repromptSpeech = "If you want to know about the potentiometer in detail, just say \"Explain the potentiometer.\" or \"Tell me about the potentiometer.\".";
            break;
        case "photoresistor":
        case "photo resistor":
        case "photo conductive cell":
        case "light dependent resistor":
        case "photo cell":
        case "cds":
            component = "photoresistor";
            speechOutput += "Here is an example of using a " + component + ". <break time=\"0.1s\" />";
            speechOutput += "First, you need to connect the first leg of the sensor to the power rail on the breadboard. <break time=\"10s\" /> ";
            speechOutput += "Second, connect the second leg to an analog input pin on the Arduino. There are six analog input pins on the left side of the Arduino. <break time=\"10s\" /> ";
            speechOutput += "Last, connect a 1k Ohms resistor to the second leg of the sensor and the ground rail of the breadboard. <break time=\"10s\" /> ";
            speechOutput += "Just say, \" Check " + component + " \" or \"Test " + component + " \" if you want to test your component. <break time=\"10s\" />";
            //intentObj.attributes.repromptSpeech = "If you want to know about the photoresistor in detail, just say \"Explain the photoresistor.\" or \"Tell me about the photoresistor.\".";
            break;
        case "servo motor":
        case "motor":
            component = "motor";
            speechOutput += "Here is an example of using a " + component + ". <break time=\"0.1s\" />";
            speechOutput += "First, you need to connect the third leg of the motor to the ground rail on the breadboard. <break time=\"5s\" /> ";
            speechOutput += "Second, connect the third leg to an analog input pin on the Arduino. There are six analog input pins on the left side of the Arduino. <break time=\"10s\" /> ";
            speechOutput += "Last, connect the middle leg of the motor to power rail on the breadboard. <break time=\"10s\" /> ";
            speechOutput += "Just say, \" Check " + component + " \" or \"Test " + component + " \" if you want to test your component. <break time=\"10s\" />";
            //intentObj.attributes.repromptSpeech = "If you want to know about the motor in detail, just say \"Explain the motor.\" or \"Tell me about the motor.\".";
            break;
        case "temperature sensor":
        case "temperature":
            component = "temperature";
            speechOutput += "Here is an example of using a " + component + " sensor. <break time=\"0.1s\" />";
            speechOutput += "First, you need to connect the third leg of the sensor to the ground rail on the breadboard. <break time=\"5s\" /> ";
            speechOutput += "Second, connect the middle leg to an analog input pin on the Arduino. There are six analog input pins on the left side of the Arduino. <break time=\"10s\" /> ";
            speechOutput += "Last, connect the first leg of the sensor to power rail on the breadboard. <break time=\"10s\" /> ";
            speechOutput += "Just say, \" Check temperature sensor\" or \"Test temperature sensor \", if you want to test your component. <break time=\"10s\" />";
            //intentObj.attributes.repromptSpeech = "If you want to know about the temperature sensor in detail, just say \"Explain the temperature sensor.\" or \"Tell me about the temperature sensor.\".";
            break;
        case "l.e.d.":
        case "light":
        case "light emitting diode":
            component = "l.e.d.";
            speechOutput += "Here is an example of using a " + component + ". <break time=\"0.1s\" />";
            speechOutput += "First, you need to put L.E.D. on the breadboard. <break time=\"10s\" /> ";
            speechOutput += "Second, connect the short leg L.E.D. to the Ground rail on breadboard. <break time=\"10s\" /> ";
            speechOutput += "Third, put a resistor beside of the long leg of L.E.D. <break time=\"10s\" /> ";
            speechOutput += "Last, wire from the 330 Ohms resistor to an output pin of Arduino. There are output pins on the right side of the Arduino. <break time=\"10s\" /> ";
            speechOutput += "Just say, \" Check " + component + " \" or \"Test " + component + " \" if you want to test your component. <break time=\"10s\" />";
            //intentObj.attributes.repromptSpeech = "If you want to know about the L.E.D in detail, just say \"Explain the L.E.D.\" or \"Tell me about the L.E.D.\".";
            break;
        case "color light":
            component = "color light";
            speechOutput += "Here is an example of using a color light. <break time=\"0.1s\" />";
            speechOutput += "First, you need to put light on the breadboard. <break time=\"10s\" /> ";
            speechOutput += "Second, connect the long leg of light to the Ground rail on breadboard. <break time=\"10s\" /> ";
            speechOutput += "Third, put 220 Ohms resistors beside of the shot legs of light. <break time=\"10s\" /> ";
            speechOutput += "Last, wire from the 220 Ohms resistors to output pins of Arduino. There are output pins on the right side of the Arduino. <break time=\"10s\" /> ";
            speechOutput += "Just say, \" Check " + component + " \" or \"Test " + component + " \" if you want to test your component. <break time=\"10s\" />";
            //intentObj.attributes.repromptSpeech = "If you want to know about the L.E.D in detail, just say \"Explain the L.E.D.\" or \"Tell me about the L.E.D.\".";
            break;
        case "board":
            speechOutput += "Here is the initial board.";
            //intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
            break;
        case "task":
            speechOutput += "Here is the task.";
            //intentObj.attributes.repromptSpeech = "If you want to know about this task in detail, just say \"Explain the task.\" or \"Tell me about the task.\".";
            break;
        case "button":
            speechOutput +=  "Here is an example of using a " + component + ". <break time=\"0.1s\" />";
            speechOutput += "Just say, \" Check Button \" or \"Test Button \", if you want to test your component. <break time=\"5s\" />";
            //intentObj.attributes.repromptSpeech = "If you want to know about the button in detail, just say \"Explain the button.\" or \"Tell me about the button.\".";
            break;
        case "wind sensor":
        case "anemometer":
            speechOutput +=  "Here is an example of using a " + component + ". <break time=\"0.1s\" />";
            speechOutput += "Just say, \" Check anemometer \" or \"Test anemometer \", if you want to test your component. <break time=\"5s\" />";
            //intentObj.attributes.repromptSpeech = "If you want to know about the button in detail, just say \"Explain the button.\" or \"Tell me about the button.\".";
            break;
        case "hall sensor":
        case "hall effect sensor":
            speechOutput +=  "Here is an example of using a " + component + ". <break time=\"0.1s\" />";
            break;
        case "flex sensor":
            speechOutput +=  "Here is an example of using a " + component + ". <break time=\"0.1s\" />";
            break;
        case "piezo":
            speechOutput +=  "Here is an example of using a " + component + ". <break time=\"0.1s\" />";
            speechOutput += "You need an 1k Ohms resistor for piezo. <break time=\"10s\" /> ";
            break;
        case "tilt sensor":
            speechOutput +=  "Here is an example of using a " + component + ". <break time=\"0.1s\" />";
            break;
        default:
            component = "board";
            speechOutput = "I am not sure what to show you. I will just show you the initial board for now.";
            //intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
            break;
    }
    
    if(intentObj.attributes.stage == "howto") {
        intentObj.attributes.prevComponent = intentObj.attributes.component;
        intentObj.attributes.component = component;
        speechOutput = "Before move on, Do you want me to check the hardware is properly installed and working?";
        intentObj.attributes.repromptSpeech = "Do you want me to check the hardware is properly installed and working?";
        intentObj.emit(':ask', speechOutput);
    }
    
    intentObj.attributes.component = component;
    intentObj.attributes.stage = "howto";
    
    params["component"] = component;

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "show";
    itemData ["params"] = params;

    handleObj(intentObj, "howto", itemData, speechOutput);
    
    //intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
    intentObj.response.speak(speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady'); 
}

function handleProtalkResetIntent (intentObj, pinType, pinId, intentName) {
    //var jsonFormatString = "";
    var speechOutput = "";
    var itemData = {};
    var params = {};

    var dt = new Date();
    var utcDate = dt.toUTCString();

    if(pinType == "analog") {
        params ["pin"] = "A" + pinId;
    } else if (pinType == "digital") {
        params ["pin"] = "D" + pinId;
    }

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "reset";
    itemData ["params"] = params;
    
    speechOutput = "pin " + pinId + " is reset.";
    handleObj(intentObj, intentName, itemData, speechOutput);

    intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
    intentObj.response.speak(intentObj.attributes.speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');
}

function handleProtalkDoAfterIntent(intentObj, time) {
    //var jsonFormatString = "";
    var dt = new Date(); 
    var utcDate = dt.toUTCString();
    var itemData = {};
    var params = {};

    var msecTime = parseTimes(time);
    
    params["time"] = msecTime;
    
    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "doafter";
    itemData ["params"] = params;

    doAfterObj = itemData;
    actionFor.doAfterIntent = true;

    data = {};
    elicitSlotForIntent = {};
        
    intentObj.attributes.speechOutput = "After " +  msecTime/1000 + "seconds, What is the desired action?";
    intentObj.attributes.repromptSpeech = intentObj.attributes.speechOutput;
    intentObj.response.speak(intentObj.attributes.speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');
}

function handleProtalkPulseIntent(intentObj, pinId, repetitions, period, intentName) {
    //var jsonFormatString = "";
    var speechOutput = "";
    var itemData = {};
    var params = {};
    
    var dt = new Date(); 
    var utcDate = dt.toUTCString();

    var _pinId = pinId;
    var tempPin = pinId;
    
    _pinId = _pinId.substring(_pinId.length-1, _pinId.length);
    tempPin = tempPin.substring(tempPin.length-2, tempPin.length);
    if(parseInt(_pinId) != parseInt(tempPin)) {
        _pinId = tempPin;
    }
    
    var msecTime = parseTimes(period);

    params ["pin"] = "D" + _pinId;
    params ["period"] = msecTime;
    params ["repetitions"] = repetitions;

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "pulse";
    itemData ["params"] = params;
    
    speechOutput = "Pulse ";
    speechOutput += "pin " + _pinId + " for ";
    speechOutput += params ["period"]/1000 + " seconds ";
    speechOutput += params ["repetitions"] + " times";
    
    handleObj(intentObj, intentName, itemData, speechOutput);

    intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
    intentObj.response.speak(intentObj.attributes.speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');
}

function handleProtalkIfIntent(intentObj, pinType, pinId, compare, value) { 
    //var jsonFormatString = "";
    var itemData = {};
    var params = {};
    
    var dt = new Date(); 
    var utcDate = dt.toUTCString();
    
    if(pinType == "analog") {
        params ["pin"] = "A" + pinId;
    } else if (pinType == "digital") {
        params ["pin"] = "D" + pinId;
    }

    params ["comparison"] = compare;
    params ["value"] = value; 

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "condition";
    itemData ["params"] = params;

    ifObj = itemData;
    actionFor.ifIntent = true;
    
    data = {};
    elicitSlotForIntent = {};

    intentObj.attributes.speechOutput = "I talked to the Arduino ... if pin " + pinId + space + compare + space + value + ". Then?";
    intentObj.attributes.repromptSpeech = intentObj.t('Then?');
    
    intentObj.response.speak(intentObj.attributes.speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');
}

function handleProtalkIfBetweenIntent(intentObj, pinId, sValue, eValue) { 
    //var jsonFormatString = "";
    var itemData = {};
    var params = {};
    
    var dt = new Date(); 
    var utcDate = dt.toUTCString();
    
    params ["pin"] = "A" + pinId;
    params ["comparison"] = "is between";
    params ["startValue"] = sValue; 
    params ["endValue"] = eValue; 

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "condition";
    itemData ["params"] = params;

    ifObj = itemData;
    actionFor.ifIntent = true;
    
    data = {};
    elicitSlotForIntent = {};

    intentObj.attributes.speechOutput = "I talked to the Arduino ... if pin " + pinId + " is between " + sValue + " and " + eValue + ". Then?";
    intentObj.attributes.repromptSpeech = intentObj.t('Then?');
    
    intentObj.response.speak(intentObj.attributes.speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');
}

function handleProtalkSetIntent(intentObj, pinType, pinId, value, intentName) {
    //var jsonFormatString = "";
    var speechOutput = "";
    var itemData = {};
    var params = {};
    
    var dt = new Date();
    var utcDate = dt.toUTCString();
    
    if(pinType == "analog") {
        params ["pin"] = "A" + pinId;
    } else if (pinType == "digital") {
        params ["pin"] = "D" + pinId;
    }
    params ["value"] = value;
    
    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "set";
    itemData ["params"] = params;
    
    speechOutput = "Set ";
    speechOutput += "pin " + pinId + " as ";
    speechOutput += params ["value"];
    handleObj(intentObj, intentName, itemData, speechOutput);
    
    intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
    intentObj.response.speak(intentObj.attributes.speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');   
}

function handleProtalkPipeIntent(intentObj, fromPin, fromPinType, toPin, toPinType, intentName) {
    //var jsonFormatString = "";
    var speechOutput = "";
    var itemData = {};
    var params = {};
    
    var dt = new Date();
    var utcDate = dt.toUTCString();
    var tempPin = fromPin;
    var _fromPin = fromPin;
    var _toPin = toPin;
    
    _fromPin = _fromPin.substring(_fromPin.length-1, _fromPin.length);
    tempPin = tempPin.substring(tempPin.length-2, tempPin.length);
    if(parseInt(_fromPin) != parseInt(tempPin)) {
        _fromPin = tempPin;
    }
    
    tempPin = _toPin;
    _toPin = _toPin.substring(_toPin.length-1, _toPin.length);
    tempPin = tempPin.substring(tempPin.length-2, tempPin.length);
    if(parseInt(_toPin) != parseInt(tempPin)) {
        _toPin = tempPin;
    }
    
    if(fromPinType == "analog") {
        params ["fromPin"] = "A" + _fromPin;
    } else if (fromPinType == "digital") {
        params ["fromPin"] = "D" + _fromPin;
    }
    
    if(toPinType == "analog") {
        params ["toPin"] = "A" + _toPin;
    } else if (toPinType == "digital") {
        params ["toPin"] = "D" + _toPin;
    }
    
    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "pipe";
    itemData ["params"] = params;
    
    speechOutput = "Pipe ";
    speechOutput += "pin " + _fromPin + " to ";
    speechOutput += "pin " + _toPin;
    handleObj(intentObj, intentName, itemData, speechOutput);
    
    intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
    intentObj.response.speak(intentObj.attributes.speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');   
}

function handleProtalkActionIntent(intentObj, action, pinType, pinId, value, intentName) {
    //var jsonFormatString = "";
    var speechOutput = "";
    var itemData = {};
    var params = {};
    
    var dt = new Date();
    var utcDate = dt.toUTCString();
    
    if(pinType == "analog") {
        params ["pin"] = "A" + pinId;
    } else if (pinType == "digital") {
        params ["pin"] = "D" + pinId;
    }
    params ["value"] = value;
    
    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = action;
    itemData ["params"] = params;  

    speechOutput = action + space;
    speechOutput += params ["value"] + space;
    if(action == "read") speechOutput = "Here is the value of pin " + pinId + " on the screen";
    else speechOutput += "to pin " + pinId;
    handleObj(intentObj, intentName, itemData, speechOutput);
    
    intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
    intentObj.response.speak(intentObj.attributes.speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');  
}
/*
function handleIndexNumber() {
    var host = "http://www.artecasa.co.kr";
    var path = "/white/yj/backup/src/voiceControl.json";
    var contents = "test";//readFileFromWeb(host, path);
    var stringToFind = "id\":";
    var startPos = "";
    var endPos = "";
    
    if(contents.match(stringToFind)) {
        while(contents.match(stringToFind)) {
            startPos = contents.indexOf(stringToFind) + stringToFind.length() + 1;
            endPos = contents.length();
            contents = contents.substring(startPos, endPos);
        }

        endPos = contents.indexOf(",") - 1;
        var index = contents.substring(startPos, endPos);
        index = parseInt(index);
    }
    console.log("index" + index);
}
*/

function handleGuideIntent(intentObj, step) {
    var speechOutput = "";
    handleDisplay(intentObj, step);
    
    switch(step) {
    case 1:
        speechOutput = "There are five steps for this task. Here is step 1. Connecting the ground from Arduino to the ground rail of Breadboard. <break time=\"5s\" />";
        speechOutput += "Then, Connect the power from arduino to the power rail of breadboard.<break time=\"5s\" />";
        intentObj.attributes.step = 1;
        intentObj.attributes.repromptSpeech = "Done?";
        break;
    case 2:
        speechOutput = "Step 2. Let's put a temperature sensor. ";
        speechOutput += "First, you need to connect the third leg of the sensor to the ground rail on the breadboard. <break time=\"5s\" /> ";
        speechOutput += "Second, connect the middle leg to an analog input pin on the Arduino. There are six analog input pins on the left side of the Arduino. <break time=\"5s\" /> ";
        speechOutput += "Last, connect the first leg of the sensor to power rail on the breadboard. <break time=\"5s\" /> ";
        intentObj.attributes.step = 2;
        intentObj.attributes.repromptSpeech = "Done?";
        break;
    case 3:
        speechOutput = "Step 3. Let's put the blue L.E.D. ";
        speechOutput += "First, you need to put blue L.E.D. on the breadboard. <break time=\"5s\" /> ";
        speechOutput += "Second, connect the short leg L.E.D. to the Ground rail on breadboard. <break time=\"5s\" /> ";
        speechOutput += "Third, put a resistor beside of the long leg of L.E.D. <break time=\"5s\" /> ";
        speechOutput += "Last, connect the resistor to an output pin of Arduino. There are output pins on the right side of the Arduino. <break time=\"5s\" /> ";
        intentObj.attributes.step = 3;
        intentObj.attributes.repromptSpeech = "Done?";
        break;
    case 4:
        speechOutput = "Step 4. Let's put the yellow L.E.D. ";
        speechOutput += "First, you need to put yellow L.E.D. on the breadboard. <break time=\"5s\" /> ";
        speechOutput += "Second, connect the short leg L.E.D. to the Ground rail on breadboard. <break time=\"5s\" /> ";
        speechOutput += "Third, put a resistor beside of the long leg of L.E.D. <break time=\"5s\" /> ";
        speechOutput += "Last, connect the resistor to an output pin of Arduino. There are output pins on the right side of the Arduino. <break time=\"5s\" /> ";
        intentObj.attributes.step = 4;
        intentObj.attributes.repromptSpeech = "Done?";
        break;
    case 5:
        speechOutput = "Step 5. Let's put the red L.E.D. ";
        speechOutput += "First, you need to put red L.E.D. on the breadboard. <break time=\"5s\" /> ";
        speechOutput += "Second, connect the short leg L.E.D. to the Ground rail on breadboard. <break time=\"5s\" /> ";
        speechOutput += "Third, put a resistor beside of the long leg of L.E.D. <break time=\"5s\" /> ";
        speechOutput += "Last, connect the resistor to an output pin of Arduino. There are output pins on the right side of the Arduino. <break time=\"5s\" /> ";
        intentObj.attributes.step = 5;
        intentObj.attributes.repromptSpeech = "Done?";
        break;
    }
    intentObj.response.speak(speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');
}

function handleFinishedTask(intentObj) {
    var speechOutput = "Everything is done. If you want to restart the task, just say \"restart\" <break time=\"10s\" />";
    intentObj.attributes.step = 1;
    intentObj.attributes.repromptSpeech = "Task is done. If you want to restart the task, just say \"restart\"";
    intentObj.response.speak(speechOutput).listen(intentObj.attributes.repromptSpeech);
    intentObj.emit(':responseReady');
}

function handleDisplay(intentObj, step){
    showInformationJson(step);
}

function showInformationJson(step) {
    var jsonFormatString = "";
    var arduinoData = {};
    
    var itemData = {};
    var params = {};

    var dt = new Date(); 
    var utcDate = dt.toUTCString();
    
    params["component"] = "step " + step;

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "show";
    itemData ["params"] = params;

    commandArray.push(itemData);
    arduinoData.commands = commandArray;
    jsonFormatString = JSON.stringify(arduinoData, null, 2);
    jsonFormatString = encodeURIComponent(jsonFormatString);
    httpGetSaveResult(jsonFormatString, function (response) {});
    httpGetSaveHistory(jsonFormatString, function (response) {});
    
    data = {};
    elicitSlotForIntent = {};
    clearArray(commandArray);
}

function pulseLedJson(intentObj) {
    var jsonFormatString = "";
    var arduinoData = {};
    var itemData = {};
    var params = {};
    var dt = new Date(); 
    var utcDate = dt.toUTCString();

    params ["pin"] = "D" + intentObj.attributes.pin;
    params ["period"] = "500";
    params ["repetitions"] = "3";

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "pulse";
    itemData ["params"] = params;
    
    commandArray.push(itemData);
    arduinoData.commands = commandArray;
    jsonFormatString = JSON.stringify(arduinoData, null, 2);
    jsonFormatString = encodeURIComponent(jsonFormatString);
    httpGetSaveResult(jsonFormatString, function (response) {});
    httpGetSaveHistory(jsonFormatString, function (response) {});
    
    data = {};
    elicitSlotForIntent = {};
    clearArray(commandArray);
}

function writeMotorJson(intentObj) {
    var jsonFormatString = "";
    var arduinoData = {};
    var itemData = {};
    var params = {};
    var dt = new Date(); 
    var utcDate = dt.toUTCString();

    params ["pin"] = "D" + intentObj.attributes.pin;
    params ["value"] = "50";

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "write";
    itemData ["params"] = params;
    
    commandArray.push(itemData);
    arduinoData.commands = commandArray;
    jsonFormatString = JSON.stringify(arduinoData, null, 2);
    jsonFormatString = encodeURIComponent(jsonFormatString);
    httpGetSaveResult(jsonFormatString, function (response) {});
    httpGetSaveHistory(jsonFormatString, function (response) {});
    
    data = {};
    elicitSlotForIntent = {};
    clearArray(commandArray);
}

function writeLedJson(intentObj) {
    var jsonFormatString = "";
    var arduinoData = {};
    var itemData = {};
    var params = {};
    var dt = new Date(); 
    var utcDate = dt.toUTCString();

    params ["pin"] = "D" + intentObj.attributes.pin;
    params ["value"] = "high";

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "write";
    itemData ["params"] = params;
    
    commandArray.push(itemData);
    arduinoData.commands = commandArray;
    jsonFormatString = JSON.stringify(arduinoData, null, 2);
    jsonFormatString = encodeURIComponent(jsonFormatString);
    httpGetSaveResult(jsonFormatString, function (response) {});
    httpGetSaveHistory(jsonFormatString, function (response) {});
    
    data = {};
    elicitSlotForIntent = {};
    clearArray(commandArray);
}

function writePiezoJson(intentObj) {
    var jsonFormatString = "";
    var arduinoData = {};
    var itemData = {};
    var params = {};
    var dt = new Date(); 
    var utcDate = dt.toUTCString();

    params ["pin"] = "D" + intentObj.attributes.pin;
    params ["value"] = "100";

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "write";
    itemData ["params"] = params;
    
    commandArray.push(itemData);
    arduinoData.commands = commandArray;
    jsonFormatString = JSON.stringify(arduinoData, null, 2);
    jsonFormatString = encodeURIComponent(jsonFormatString);
    httpGetSaveResult(jsonFormatString, function (response) {});
    httpGetSaveHistory(jsonFormatString, function (response) {});
    
    data = {};
    elicitSlotForIntent = {};
    clearArray(commandArray);
}

function readPinJson(intentObj) {
    var jsonFormatString = "";
    var arduinoData = {};
    var itemData = {};
    var params = {};
    var dt = new Date();
    var utcDate = dt.toUTCString();

    if(intentObj.attributes.pinType == "digital") params ["pin"] = "D" + intentObj.attributes.pin;
    else params ["pin"] = "A" + intentObj.attributes.pin;
    
    //params ["pin"] = "A" + intentObj.attributes.pin;
    params ["value"] = "";

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "read";
    itemData ["params"] = params;
    
    commandArray.push(itemData);
    arduinoData.commands = commandArray;
    jsonFormatString = JSON.stringify(arduinoData, null, 2);
    jsonFormatString = encodeURIComponent(jsonFormatString);
    httpGetSaveResult(jsonFormatString, function (response) {});
    httpGetSaveHistory(jsonFormatString, function (response) {});
    
    data = {};
    elicitSlotForIntent = {};
    clearArray(commandArray);
}

function resetPinJson(intentObj, pinType) {
    var jsonFormatString = "";
    var arduinoData = {};
    var itemData = {};
    var params = {};
    var dt = new Date();
    var utcDate = dt.toUTCString();

    if(pinType == "analog") {
        params ["pin"] = "A" + intentObj.attributes.pin;
    } else if (pinType == "digital") {
        params ["pin"] = "D" + intentObj.attributes.pin;
    }

    itemData ["id"] = countId++;
    itemData ["timestamp"] = utcDate;
    itemData ["action"] = "reset";
    itemData ["params"] = params;
    
    commandArray.push(itemData);
    arduinoData.commands = commandArray;
    jsonFormatString = JSON.stringify(arduinoData, null, 2);
    jsonFormatString = encodeURIComponent(jsonFormatString);
    httpGetSaveResult(jsonFormatString, function (response) {});
    httpGetSaveHistory(jsonFormatString, function (response) {});
    
    data = {};
    elicitSlotForIntent = {};
    clearArray(commandArray);
}

function handleHardwareDebug(intentObj) {
    var speechOutput = "";
    var repromptSpeech = "";
    var component = intentObj.attributes.component;
    
    if(intentObj.attributes.action == "write") {
        if(intentObj.attributes.state == "hw_debug") component = intentObj.attributes.prevComponent;
        switch(component) {
            /* DO NOT REMOVE THIS COMMENT: function handleHardwareDebug - user define test will be added here */
            case "servo motor":
            case "motor":
                writeMotorJson(intentObj);
                intentObj.attributes.pinType = "digital";
                speechOutput = "Now, I'm writing the output pin. ";
                speechOutput += "Does the motor move?";
                repromptSpeech = "Does the motor move?";
                break;
            case "l.e.d.":
            case "light":
            case "light emitting diode":
                writeLedJson(intentObj);
                intentObj.attributes.pinType = "digital";
                speechOutput = "Now, I'm writing the output pin. ";
                speechOutput += "Does the L.E.D. turn on?";
                repromptSpeech = "Does the L.E.D. turn on?";
                break;
            case "color light":
                writeLedJson(intentObj);
                intentObj.attributes.pinType = "digital";
                speechOutput = "Now, I'm writing the pin for red color. ";
                speechOutput += "Does the light on?";
                repromptSpeech = "Can you see the red light on?";
                break;
            case "piezo":
            case "speaker":
                writePiezoJson(intentObj);
                intentObj.attributes.pinType = "digital";
                speechOutput = "Now, I'm writing the output pin. ";
                speechOutput += "Can you hear the sound?";
                repromptSpeech = "Does the piezo make a sound?";
                break;
            default:
                speechOutput = "I am not sure what " + component + " is.";
                intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
                intentObj.response.speak(speechOutput).listen(intentObj.attributes.repromptSpeech);
                intentObj.emit('responseReady');
                break;
        }        
    } else if(intentObj.attributes.action == "read") {
        readPinJson(intentObj);
        intentObj.attributes.pinType = "analog";
        speechOutput = "Now, I'm reading the input pin to see the value of the input. ";
        speechOutput += "Is the value of pin " + intentObj.attributes.pin + " changing when you change the input?";
        repromptSpeech = "Is the value of pin " + intentObj.attributes.pin + " changing when you change the input?";
        //resetPinJson(intentObj, "analog");
    }
    
    if(intentObj.attributes.stage != "hw_test")
        intentObj.attributes.stage = "hw_debug";
    intentObj.response.speak(speechOutput).listen(repromptSpeech);
    intentObj.emit(':responseReady'); 
}

// function handleSoftwareDebug(intentObj, speechOutput, repromptSpeech) {
//     intentObj.attributes.state = "sw_debug";
// }

function helpHardwareDebug(intentObj) {
    var speechOutput = "";
    var component = intentObj.attributes.component;
    resetPinJson(intentObj, intentObj.attributes.pinType);

    switch(component) {
        /* DO NOT REMOVE THIS COMMENT: function helpHardwareDebug - user define test will be added here */
        case "temperature sensor":
        case "temperature":
            speechOutput = "How about putting the temperature sensor in opposite way?  <break time=\"10s\" /> ";
            break;
        case "l.e.d.":
        case "light":
        case "light emitting diode":
            speechOutput = "How about checking L.E.D. legs? There are different length of legs for L.E.D. <break time=\"1s\" /> ";
            speechOutput += "The L.E.D. should be connected from long leg of L.E.D to output pin of Arduino. <break time=\"10s\" /> ";
            break;
        case "color light":
            speechOutput = "How about checking L.E.D. legs? There are different length of legs for color L.E.D. <break time=\"1s\" /> ";
            break;
        // case "button":
        // case "servo motor":
        case "motor":
            speechOutput = "How about checking wires for ground, voltage and output? <break time=\"1s\" />"
            speechOutput += "The red is for voltage, the dark brown is for grounad, and the orange is for output. <break time=\"10s\" /> ";
            break;
        case "photoresistor":
        case "photo resistor":
        case "photo conductive cell":
        case "light dependent resistor":
        case "photo cell":
        case "cds":
        case "rotary encoder":
        case "rotaryencoder":
        case "potentiometer":
        default:
            speechOutput = "Is the wire connected from ground rail to ground pin of arduino correctly? <break time=\"10s\" /> ";
            speechOutput += "Is the wire connected from power rail to 5 volt pin of arduino correctly? <break time=\"10s\" /> ";
            break;
    }

    // if(intentObj.attributes.prevComponent == "l.e.d.") {
        // speechOutput = "How about checking L.E.D. legs? There are different length of legs for L.E.D. <break time=\"1s\" /> ";
        //     speechOutput += "The resistor should be connected from long leg of L.E.D to output pin of Arduino. <break time=\"10s\" /> ";
    // } else if(intentObj.attributes.prevComponent == "temperature") {
    //     speechOutput = "How about putting the temperature sensor in opposite way?  <break time=\"10s\" /> ";
    // } else if(intentObj.attributes.prevComponent == "temperature") {
    //     speechOutput = "How about putting the temperature sensor in opposite way?  <break time=\"10s\" /> ";
    // } else {
    //     speechOutput = "Is the wire connected from ground rail to ground pin of arduino correctly? <break time=\"1s\" /> ";
    //     speechOutput += "Is the wire connected from power rail to 5 volt pin of arduino correctly? <break time=\"10s\" /> ";
    // }

    intentObj.attributes.stage = "hw_help";
    speechOutput += "Are you ready to check again?";
    intentObj.attributes.repromptSpeech = "Are you ready to check again?";
    intentObj.emit(':ask', speechOutput);
}

function helpSoftwareDebug(intentObj) {
    var speechOutput = "";
    
    // 먼저 해당 핀의 커맨드를 리셋하겠는지 물어본다.
    // yes: 핀번호 물어본다. reset command json 업로드 한 다음 helpSoftwareDebug로 돌아오기 sw_help_reset로 스테이트 셋팅하기
    // no: 해당 핀을 다시 프로그래밍 하기 전에 꼭 리셋하라고 얘기해주고 helpSoftwareDebug로 돌아오기 sw_help_reset로 스테이트 셋팅하기
    if(intentObj.attributes.state == "sw_help_reset"){
        if(intentObj.attributes.reset == "no") {
            speechOutput = "In prototyping mode, before reprogramming the pin, please reset the pin first.";
        }
        switch(intentObj.attributes.step){
            case 3:
            case 4:
            case 5:
                speechOutput += "Did you say if commands for turn on and turn off? ";
                speechOutput += "When you make the condition statement, you need to make a couple of if statements. ";
                speechOutput += "For example, if you want to turn on the L.E.D only when the input is greater than 200, you need another if statement turns off the L.E.D when the input is less than 200. ";
                break;
        }
        speechOutput += "Are you ready to software prototyping again?";
        intentObj.attributes.repromptSpeech = "Are you ready to software prototyping again?";
        intentObj.emit(':ask', speechOutput);
    } else {
        intentObj.attributes.state = "sw_help";
        speechOutput = "You need to reset the pin you used for reprogramming. ";
        speechOutput += "I can reset the pin for you or you can reset the pin yourself in prototyping mode. ";
        speechOutput += "Do you want me to reset the pin?";
        intentObj.attributes.repromptSpeech = "Are you ready to software prototyping again?";
        intentObj.emit(':ask', speechOutput);
    }
}

function softwarePrototyping(intentObj) {
    var speechOutput = "";
    
    if(intentObj.attributes.state == "prototyping_done") {
        speechOutput = "Is the " + intentObj.attributes.color + " L.E.D working as you intended?";
        intentObj.attributes.repromptSpeech = speechOutput;
        intentObj.emit(':ask', speechOutput);
    } else {
        //speechOutput = intentObj.attributes.state;
        speechOutput = "Before move on to next hardware component, "
        speechOutput += "Do you want to prototype software for turning on the L.E.D depends on temperature?";
        intentObj.attributes.state = "prototyping";
        intentObj.attributes.repromptSpeech = "Or, do you want to skip the software prototyping?";
        intentObj.emit(':ask', speechOutput);
    }
}

function handleHWTest(intentObj, component) {
    var speechOutput = "";
    
    if(component == null) { component = "not specified"; }
    
    switch(component) {
        /* DO NOT REMOVE THIS COMMENT: function handleHWTest - user define test will be added here */
        case "tilt sensor":
            component = "tilt sensor";
            intentObj.attributes.action = "read";
            intentObj.attributes.pinType = "analog";
            speechOutput = "Let's check the tilt sensor is working. ";
            speechOutput += "Tell me the analog input pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        case "flex sensor":
            component = "flex sensor";
            intentObj.attributes.action = "read";
            intentObj.attributes.pinType = "analog";
            speechOutput = "Let's check the flex sensor is working. ";
            speechOutput += "Tell me the analog input pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        case "hall sensor":
        case "hall effect sensor":
            component = "flex sensor";
            intentObj.attributes.action = "read";
            intentObj.attributes.pinType = "analog";
            speechOutput = "Let's check the hall effect sensor is working. ";
            speechOutput += "Tell me the analog input pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        case "rotary encoder":
        case "rotaryencoder":
        case "potentiometer":
            component = "potentiometer";
            intentObj.attributes.action = "read";
            intentObj.attributes.pinType = "analog";
            speechOutput = "Let's check the potentiometer is working. ";
            speechOutput += "Tell me the analog input pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        case "photoresistor":
        case "photo resistor":
        case "photo conductive cell":
        case "light dependent resistor":
        case "photo cell":
        case "cds":
            component = "photoresistor";
            intentObj.attributes.action = "read";
            intentObj.attributes.pinType = "analog";
            speechOutput = "Let's check the photoresistor is working. ";
            speechOutput += "Tell me the analog input pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        case "temperature sensor":
        case "temperature":
            intentObj.attributes.action = "read";
            intentObj.attributes.pinType = "analog";
            speechOutput = "Let's check the temperature sensor is working. ";
            speechOutput += "Tell me the analog input pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        case "button":
        case "switch":
            intentObj.attributes.action = "read";
            intentObj.attributes.pinType = "digital";
            speechOutput = "Let's check the button is working. ";
            speechOutput += "Tell me the pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        case "l.e.d.":
        case "light":
        case "light emitting diode":
            component = "l.e.d.";
            intentObj.attributes.action = "write";
            intentObj.attributes.pinType = "digital";
            speechOutput = "Let's check the L.E.D. is working. ";
            speechOutput += "Tell me the pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        case "color light":
            component = "color light";
            intentObj.attributes.action = "write";
            intentObj.attributes.pinType = "digital";
            speechOutput = "Let's check the L.E.D. is working. ";
            speechOutput += "Tell me the pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        case "servo motor":
        case "motor":
            component = "motor";
            //component = "l.e.d.";
            intentObj.attributes.action = "write";
            intentObj.attributes.pinType = "analog";
            speechOutput = "Let's check the motor is working. ";
            speechOutput += "Tell me the pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        case "piezo":
        case "speaker":
            component = "piezo";
            intentObj.attributes.action = "write";
            intentObj.attributes.pinType = "analog";
            speechOutput = "Let's check the piezo is working. ";
            speechOutput += "Tell me the pin number of Arduino you used.";
            intentObj.emit(':ask', speechOutput);
            break;
        default:
            speechOutput = "I am not sure what " + component;
            intentObj.attributes.repromptSpeech = intentObj.t('PROTALK_REPROMPT');
            intentObj.response.speak(speechOutput).listen(intentObj.attributes.repromptSpeech);
            intentObj.emit('responseReady');
            break;
    }
    data = {};
    elicitSlotForIntent = {};
}

const taskHandler = {
    'LaunchRequest': function () {
        var speechOutput = "Hi, this is HeyTeddy. ";
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');
        this.response.speak(speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'ProtalkChangeMode': function() {
        this.response.speak("prototyping mode is started").listen(this.attributes.repromptSpeech);
        
        if(this.attributes.mode == "prototyping") {
            this.attributes.mode = "guide";
            this.emitWithState('ProtalkGuideIntent');
        } else if(this.attributes.mode == "guide") {
            this.attributes.mode = "prototyping";
            this.emitWithState(':responseReady');
        }
    },
    'ProtalkSelectModeIntent': function(){
        const selectModeSlot = this.event.request.intent.slots.mode;
        this.response.speak("prototyping mode is started").listen(this.attributes.repromptSpeech);
        
        if(selectModeSlot.value == "task guide") {
            this.attributes.mode = "guide";
            this.emit('ProtalkGuideIntent');
        }
        else if(selectModeSlot.value == "prototyping") {
            this.attributes.mode = "prototyping";
            this.emit(':responseReady');
        } else this.emit('Unhandled');
    },
    'ProtalkGuideIntent': function () {
        handleGuideIntent(this, this.attributes.step);
        // this.response.speak("Let's start the task.").listen("If you want to change the mode, just say \"change mode\".");
        // this.emit(':responseReady');
    },
    'ProtalkHandleStepsIntent': function () {
        const controlSlot = this.event.request.intent.slots.control;
        if(controlSlot.value == "next") {
            this.emit('ProtalkDebugIntent');
        } else if(controlSlot.value == "back") {
            if(this.attributes.step == 1) handleGuideIntent(this, 1);
            if(this.attributes.step == 2) handleGuideIntent(this, 1);
            if(this.attributes.step == 3) handleGuideIntent(this, 2);
            if(this.attributes.step == 4) handleGuideIntent(this, 3);
            if(this.attributes.step == 5) handleGuideIntent(this, 4);
        } else if(controlSlot.value == "restart") {
            handleGuideIntent(this, 1);
        }
    },
    'ProtalkHWTestIntent':function() {
        const componentSlot = this.event.request.intent.slots.component;
        this.attributes.stage = "hw_test";
        
        if(componentSlot.value) {
            data.component = componentSlot.value;
        }
        if(data.component) {
            this.attributes.component = data.component;
            this.attributes.prevComponent = data.component;
            handleHWTest(this, this.attributes.component);
        } else {
            elicitSlotForIntent.target = "hwTestIntent";
            if (!data.component) {
                elicitSlotForIntent.component = true;
            }
            this.emit('ProtalkGetMoreInfoIntent');
        }
    },
    'ProtalkDebugIntent': function() {
        var speechOutput = "";
        //var prevComponent = this.attributes.prevComponent;
        this.attributes.stage = "hw_debug";
        
        handleHWTest(this, this.attributes.prevComponent);

        // if(this.attributes.prevComponent == "l.e.d.") {
        //     this.attributes.action = "write";
        //     this.attributes.pinType = "digital";
        //     speechOutput = "Let's check the L.E.D. is working. ";
        //     speechOutput += "Tell me the output pin number of Arduino you used.";
        //     this.emit(':ask', speechOutput);
        // } else if(this.attributes.prevComponent == "temperature") {
        //     this.attributes.action = "read";
        //     this.attributes.pinType = "analog";
        //     speechOutput = "Let's check the temperature sensor is working. ";
        //     speechOutput += "Tell me the analog input pin number of Arduino you used.";
        //     this.emit(':ask', speechOutput);
        // } else {
        //     speechOutput = this.attributes.component;
        //     this.emit(':ask', speechOutput);
        // }

        // switch(prevComponent) {
        //     case "rotary encoder":
        //     case "rotaryencoder":
        //     case "potentiometer":
        //         this.attributes.action = "read";
        //         this.attributes.pinType = "analog";
        //         speechOutput = "Let's check the potentiometer is working. ";
        //         speechOutput += "Tell me the analog input pin number of Arduino you used.";
        //         this.emit(':ask', speechOutput);
        //         break;
        //     case "photoresistor":
        //     case "photo resistor":
        //     case "photo conductive cell":
        //     case "light dependent resistor":
        //     case "photo cell":
        //     case "cds":
        //         this.attributes.action = "read";
        //         this.attributes.pinType = "analog";
        //         speechOutput = "Let's check the photoresistor is working. ";
        //         speechOutput += "Tell me the analog input pin number of Arduino you used.";
        //         this.emit(':ask', speechOutput);
        //         break;
        //     case "servo motor":
        //     case "motor":
        //         this.attributes.action = "write";
        //         this.attributes.pinType = "analog";
        //         speechOutput = "Let's check the motor is working. ";
        //         speechOutput += "Tell me the output pin number of Arduino you used.";
        //         this.emit(':ask', speechOutput);
        //         break;
        //     case "temperature sensor":
        //     case "temperature":
        //         this.attributes.action = "read";
        //         this.attributes.pinType = "analog";
        //         speechOutput = "Let's check the temperature sensor is working. ";
        //         speechOutput += "Tell me the analog input pin number of Arduino you used.";
        //         this.emit(':ask', speechOutput);
        //         break;
        //     case "l.e.d.":
        //     case "light":
        //     case "light emitting diode":
        //         this.attributes.action = "write";
        //         this.attributes.pinType = "digital";
        //         speechOutput = "Let's check the L.E.D. is working. ";
        //         speechOutput += "Tell me the output pin number of Arduino you used.";
        //         this.emit(':ask', speechOutput);
        //         break;
        //     case "color light":
        //     case "r.g.b. l.e.d.":
        //         this.attributes.action = "write";
        //         this.attributes.pinType = "digital";
        //         speechOutput = "Let's check the R.G.B. L.E.D. is working. ";
        //         speechOutput += "Tell me the arduino pin number you used for red color light.";
        //         this.emit(':ask', speechOutput);
        //         break;
        //     case "button":
        //         this.attributes.action = "read";
        //         this.attributes.pinType = "digital";
        //         speechOutput = "Let's check the button is working. ";
        //         speechOutput += "Tell me the digital input pin number of Arduino you used.";
        //         this.emit(':ask', speechOutput);
        //         break;
        //     default:
        //         speechOutput = "I am not sure what to test.";
        //         break;
        // }
    },
    'ProtalkAskNumberIntent': function() {
        //var speechOutput = "";
        //var repromptSpeech = "";
        
        const pinSlot = this.event.request.intent.slots.number;
        const aValueSlot = this.event.request.intent.slots.aValue;
        var value = 0;
        
        if(pinSlot.value) {
            value = pinSlot.value;
        } else if(aValueSlot.value) {
            value = aValueSlot.value;
        }
        
        this.attributes.pin = value;
        
        // if from get more intent
        if(this.attributes.stage == "get_info") {
            if(elicitSlotForIntent.pinId) {
                data.pinId = "pin " + value;
                elicitSlotForIntent.pinId = false;
            } else if(elicitSlotForIntent.fromPin) {
                data.fromPin = "pin " + value;
                elicitSlotForIntent.fromPin = false;
            } else if(elicitSlotForIntent.toPin) {
                data.toPin = "pin " + value;
                elicitSlotForIntent.toPin = false;
            } else {
                data.value = value;
                elicitSlotForIntent.value = false;
            }
            this.emit('ProtalkGetMoreInfoIntent');
        } else {
            if(this.attributes.state == "sw_help") {
                //reset command json 업로드 한 다음 helpSoftwareDebug로 돌아오기 sw_help_reset로 스테이트 셋팅하기
                resetPinJson(this, "digital");
                this.attributes.state = "sw_help_reset";
                helpSoftwareDebug(this);
            } else {
                handleHardwareDebug(this);
            }
        }
    },
    'ProtalkDescribeIntent': function () {
        const componentSlot = this.event.request.intent.slots.component;
        
        if(componentSlot.value) {
            data.component = componentSlot.value;
        }
        if(data.component) {
            handleDescribeIntent(this, data.component);
        } else {
            elicitSlotForIntent.target = "GuideIntent";
            if (!data.component) {
                elicitSlotForIntent.component = true;
            }
            this.emit('ProtalkGetMoreInfoIntent');
        }
    },
    'ProtalkHowToIntent': function () {
        //const componentSlot = "";// = this.event.request.intent.slots.component;
        if(this.attributes.stage == "howto_no" || this.attributes.stage == "hw_debug") {
            if(this.attributes.component) {
                data.component = this.attributes.component;
            }
            if(data.component) {
                handleHowtoIntent(this, data.component);
            } else {
                elicitSlotForIntent.target = "howtoIntent";
                if (!data.component) {
                    elicitSlotForIntent.component = true;
                }
                this.emit('ProtalkGetMoreInfoIntent');
            }
        } else {
            const componentSlot = this.event.request.intent.slots.component;
            if(componentSlot.value) {
                data.component = componentSlot.value;
            }
            if(data.component){
                handleHowtoIntent(this, componentSlot.value);
            } else {
                elicitSlotForIntent.target = "howtoIntent";
                if(!data.component) {
                    elicitSlotForIntent.component = true;
                }
                this.emit('ProtalkGetMoreInfoIntent');
            }
        }
        // if(this.attributes.stage == "howto_no" || this.attributes.stage == "hw_debug") {
        //     if(this.attributes.component) {
        //         handleHowtoIntent(this, this.attributes.component);
        //     }
        // } else {
        //     const componentSlot = this.event.request.intent.slots.component;
        //     if(componentSlot.value) {
        //         handleHowtoIntent(this, componentSlot.value);
        //     }
        // }
    },
    'ProtalkWaitIntent': function () {
        this.attributes.speechOutput = "OK, I will wait. <break time=\"10s\" />";
        this.attributes.repromptSpeech = this.t('PROTALK_REPROMPT');
        if(this.attributes.state == "sw_help_reset") {
            this.attributes.mode = "prototyping";
            this.attributes.repromptSpeech = "I am in prototyping mode, now. If you want to return to task, just say \"done.\".";
        }
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'ProtalkRestartIntent': function () {
        countId = 1;
        //arduinoData = new Object();
        
        var dt = new Date();
        var utcDate = dt.toUTCString();

        var itemData = {};
        itemData ["id"] = countId++;
        itemData ["timestamp"] = utcDate;
        itemData ["action"] = "restart";
        commandArray.push(itemData);
        
        var arduinoData = {};
        arduinoData.commands = commandArray;
        var jsonFormatString = JSON.stringify(arduinoData, null, 2);

        jsonFormatString = encodeURIComponent(jsonFormatString);
        httpGetSaveResult(jsonFormatString, function (response) {});
        httpGetSaveHistory(jsonFormatString, function (response) {});
        httpGetSaveId(countId, function (response) {});
        
        clearArray(commandArray);
        elicitSlotForIntent = {};
        data = {};
        
        var jsonFormatString = "";
        jsonFormatString = encodeURIComponent(jsonFormatString);

        /*httpGet(jsonFormatString, function (response) {
        });*/
    
        //httpGetClearResult(jsonFormatString, function (response) {});
        //httpGetSaveId("clear", function (response) {});
        
        this.attributes.speechOutput = "Restarted.";
        this.attributes.repromptSpeech = this.t('next?');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
        //this.emit('LaunchRequest');
    },
    'ProtalkResetAllIntent': function () {
        this.attributes.speechOutput = "Everything is reset.";
        this.attributes.repromptSpeech = this.t('PROTALK_REPROMPT');

        //handleIndexNumber();
        
        var dt = new Date();
        var utcDate = dt.toUTCString();

        var itemData = {};
        itemData ["id"] = countId++;
        itemData ["timestamp"] = utcDate;

        var params = {};
        params["pin"] = "all";
        itemData ["action"] = "resetall";
        itemData ["params"] = params;

        commandArray.push(itemData);
        
        var arduinoData = {};
        arduinoData.commands = commandArray;
        var jsonFormatString = JSON.stringify(arduinoData, null, 2);

        //var jsonFormatString = JSON.stringify(commandArray, null, 2);
        jsonFormatString = encodeURIComponent(jsonFormatString);
        httpGetSaveResult(jsonFormatString, function (response) {});
        httpGetSaveHistory(jsonFormatString, function (response) {});
        httpGetSaveId(countId, function (response) {});

        data = {};
        elicitSlotForIntent = {};
        clearArray(commandArray);

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'ProtalkResetIntent': function () {
        const pinIdSlot = this.event.request.intent.slots.pinId;
        const pinTypeSlot = this.event.request.intent.slots.pinType;
        
        var pinId = "";
        
        if(pinIdSlot.value) {
            data.pinId = pinIdSlot.value;
            pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
            var tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
            if(parseInt(pinId) != parseInt(tempId)) {
                pinId = tempId;
            }
            if(parseInt(pinId) > 5) {
                data.pinType = "digital";
            }
        }
        if(pinTypeSlot.value) {
            data.pinType = pinTypeSlot.value;
        }
        
        if(data.pinId && data.pinType) {
            pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
            var tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
            if(parseInt(pinId) != parseInt(tempId)) {
                pinId = tempId;
            }
            handleProtalkResetIntent(this, data.pinType, pinId, actionFor);
        } else {
            elicitSlotForIntent.target = "resetIntent";
            if (!data.pinId) {
                elicitSlotForIntent.pinId = true;
            }
            if (!data.pinType) {
                elicitSlotForIntent.pinType = true;
            }
            this.emit('ProtalkGetMoreInfoIntent');
        }
    },
    'ProtalkIfBetweenIntent': function () {
        //handleProtalkIfBetweenIntent
        const pinIdSlot = this.event.request.intent.slots.pinId;    // pin #
        const startValueSlot = this.event.request.intent.slots.aValue;
        const endValueSlot = this.event.request.intent.slots.endValue;

        var pinId = ""; // pin number from 0 to 13 (3,5,6,9,10,11 can be analog)
        var tempId = "";

        if(startValueSlot.value) {
            data.startValue = startValueSlot.value;
            data.pinType = "analog";
        }
        if(endValueSlot.value) {
            data.endValue = endValueSlot.value;
            data.pinType = "analog";
        }
        if(pinIdSlot.value) {
            data.pinId = pinIdSlot.value;
            pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
            tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
            if(parseInt(pinId) != parseInt(tempId)) {
                pinId = tempId;
            }
        }
        
        data.condition = "if";
        data.compare = "is between";
        data.pinType = "analog";
        
        if(data.pinId && data.startValue && data.endValue) {
            pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
            tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
            if(parseInt(pinId) != parseInt(tempId)) {
                pinId = tempId;
            }
            handleProtalkIfBetweenIntent(this, pinId, data.startValue, data.endValue);
        } else {
            elicitSlotForIntent.target = "ifBetweenIntent";
            if (!data.pinId) {
                elicitSlotForIntent.pinId = true;
            }
            if (!data.startValue) {
                elicitSlotForIntent.startValue = true;
            }
            if (!data.endValue) {
                elicitSlotForIntent.endValue = true;
            }
            this.emit('ProtalkGetMoreInfoIntent');
        }
    },
    'ProtalkIfIntent': function () {
        const typeSlot = this.event.request.intent.slots.pinType;  // analog, digital
        const pinIdSlot = this.event.request.intent.slots.pinId;    // pin #
        const dValueSlot = this.event.request.intent.slots.dValue;  // high, low
        const aValueSlot = this.event.request.intent.slots.aValue;  // numbers  0~255
        const compareSlot = this.event.request.intent.slots.compare;

        var pinId = ""; // pin number from 0 to 13 (3,5,6,9,10,11 can be analog)
        var tempId = "";

        if(compareSlot.value) {
            data.compare = compareSlot.value;
        }
        if(aValueSlot.value) {
            data.value = aValueSlot.value;
            data.pinType = "analog";
        }
        if(dValueSlot.value) {
            data.value = dValueSlot.value;
            data.pinType = "digital";
        }
        if(pinIdSlot.value) {
            data.pinId = pinIdSlot.value;
            pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
            tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
            if(parseInt(pinId) != parseInt(tempId)) {
                pinId = tempId;
            }
            if(parseInt(pinId) > 5) {
                data.pinType = "digital";
            }
        }
        if(typeSlot.value) {
            data.pinType = typeSlot.value;
        }

        data.condition = "if";
        
        if(data.pinId && data.compare && data.value && data.pinType) {
            pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
            tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
            if(parseInt(pinId) != parseInt(tempId)) {
                pinId = tempId;
            }
            handleProtalkIfIntent(this, data.pinType, pinId, data.compare, data.value);
        } else {
            elicitSlotForIntent.target = "ifIntent";
            if (!data.pinId) {
                elicitSlotForIntent.pinId = true;
            }
            if (!data.compare) {
                elicitSlotForIntent.compare = true;
            }
            if (!data.value) {
                elicitSlotForIntent.value = true;
            }
            if (!data.pinType) {
                elicitSlotForIntent.pinType = true;
            }
            this.emit('ProtalkGetMoreInfoIntent');
        }
    },
    'ProtalkActionIntent': function () {
        const pinTypeSlot = this.event.request.intent.slots.pinType;  // analog, digital
        const pinIdSlot = this.event.request.intent.slots.pinId;   // numbers
        const actionSlot = this.event.request.intent.slots.action;  // read, write
        const dValueSlot = this.event.request.intent.slots.dValue;  // high, low
        const aValueSlot = this.event.request.intent.slots.aValue;  // numbers  0~255

        var pinId = "";
        var tempId = "";
        
        if(aValueSlot.value) {
            data.value = aValueSlot.value;
            data.pinType = "analog";
        }
        if(dValueSlot.value) {
            data.value = dValueSlot.value;
            data.pinType = "digital";
        }
        /*
        if(pinTypeSlot.value) {
            data.pinType = pinTypeSlot.value;
        }*/
        if(pinIdSlot.value) {
            data.pinId = pinIdSlot.value;
            pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
            tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
            if(parseInt(pinId) != parseInt(tempId)) {
                pinId = tempId;
            }
            if(parseInt(pinId) > 5) {
                data.pinType = "digital";
            }
        }
        if(actionSlot.value) {
            data.action = actionSlot.value;
            if(data.action == "read") {
                data.value = "pin";
            } if(data.action == "write") {
                data.pinType = "digital";
            }
        }

        if(data.pinId && data.action && data.value && data.pinType) {
            pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
            tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
            if(parseInt(pinId) != parseInt(tempId)) {
                pinId = tempId;
            }

            handleProtalkActionIntent(this, data.action, data.pinType, pinId, data.value, actionFor);
        } else {
            elicitSlotForIntent.target = "actionIntent";
            if (!data.action) {
                elicitSlotForIntent.action = true;
            }
            if (!data.pinId) {
                elicitSlotForIntent.pinId = true;
            }
            if (!data.value) {
                elicitSlotForIntent.value = true;
            }
            if (!data.pinType) {
                elicitSlotForIntent.pinType = true;
            }
            this.emit('ProtalkGetMoreInfoIntent');
        }
    },
    'ProtalkDoAfterIntent': function () {
        const timeSlot = this.event.request.intent.slots.time;
        
        if(timeSlot.value) {
            data.time = timeSlot.value;
            data.needAction = true;
            handleProtalkDoAfterIntent(this, data.time);
        } else {
            elicitSlotForIntent.target = "doAfterIntent";
            if (!data.time) {
                elicitSlotForIntent.time = true;
            }
            this.emit('ProtalkGetMoreInfoIntent');
        }
    },
    'ProtalkSetIntent': function () {
        const pinIdSlot = this.event.request.intent.slots.pinId;   // pin #
        const ioTypeSlot = this.event.request.intent.slots.ioType; // input, output
        const pinTypeSlot = this.event.request.intent.slots.pinType; //digital, analog
        
        var pinId = "";
        var tempId = "";
        
        if(pinIdSlot.value) {
            data.pinId = pinIdSlot.value;
            pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
            tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
            if(parseInt(pinId) != parseInt(tempId)) {
                pinId = tempId;
            }
            if(parseInt(pinId) > 6) {
                data.pinType = "digital";
            }
        }
        if(ioTypeSlot.value) {
            data.ioType = ioTypeSlot.value;
        }
        if(pinTypeSlot.value) {
            data.pinType = pinTypeSlot.value;
        }
        
        if(data.pinId && data.ioType && data.pinType) {
            pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
            tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
            if(parseInt(pinId) != parseInt(tempId)) {
                pinId = tempId;
            }
            handleProtalkSetIntent(this, data.pinType, pinId, data.ioType, actionFor);
        } else {
            elicitSlotForIntent.target = "setIntent";
            if (!data.pinId) {
                elicitSlotForIntent.pinId = true;
            }
            if (!data.ioType) {
                elicitSlotForIntent.ioType = true;
            }
            if (!data.pinType) {
                elicitSlotForIntent.pinType = true;
            }
            this.emit('ProtalkGetMoreInfoIntent');
        }
    },
    'ProtalkPipeIntent': function () {
        const fromPinSlot = this.event.request.intent.slots.fromPin;   // pin #
        const toPinSlot = this.event.request.intent.slots.toPin; // input, output
        const fromPinTypeSlot = this.event.request.intent.slots.fromPinType;
        const toPinTypeSlot = this.event.request.intent.slots.toPinType;
        
        var fromPin = "";
        var toPin = "";
        var temp = "";
        
        if(fromPinSlot) {
            if(fromPinSlot.value) {
                data.fromPin = fromPinSlot.value;
                fromPin = data.fromPin.substring(data.fromPin.length-1, data.fromPin.length);
                temp = data.fromPin.substring(data.fromPin.length-2, data.fromPin.length);
                if(parseInt(fromPin) != parseInt(temp)) {
                    fromPin = temp;
                }

                if(parseInt(fromPin) > 5) {
                    data.fromPinType = "digital";
                }
            }
        }
        if(toPinSlot) {
            if(toPinSlot.value) {
                data.toPin = toPinSlot.value;

                toPin = data.toPin.substring(data.toPin.length-1, data.toPin.length);
                temp = data.toPin.substring(data.toPin.length-2, data.toPin.length);
                if(parseInt(toPin) != parseInt(temp)) {
                    toPin = temp;
                }

                if(parseInt(toPin) > 5) {
                    data.toPinType = "digital";
                }
            }
        }
        if(fromPinTypeSlot) {
            if(fromPinTypeSlot.value) {
                data.fromPinType = fromPinTypeSlot.value;
            }
        }
        if(toPinTypeSlot) {
            if(toPinTypeSlot.value) {
                data.toPinType = toPinTypeSlot.value;
            }
        }
        
        if(data.fromPin && data.toPin && data.fromPinType && data.toPinType) {
            if(!handlePipeException(data.toPin, data.toPinType)) {
                data.toPin = "";
                data.toPinType = "";
                data.exception = "pinId";
                elicitSlotForIntent.target = "pipeIntent";
                elicitSlotForIntent.toPin = true;
                elicitSlotForIntent.toPinType = true;
                this.emit('ProtalkGetMoreInfoIntent');
            } else {
                handleProtalkPipeIntent(this, data.fromPin, data.fromPinType, data.toPin, data.toPinType, actionFor);
            }
        } else {
            elicitSlotForIntent.target = "pipeIntent";
                   
            if (!data.toPinType) {
                elicitSlotForIntent.toPinType = true;
            }
            if (!data.toPin) {
                elicitSlotForIntent.toPin = true;
            }
            if (!data.fromPinType) {
                elicitSlotForIntent.fromPinType = true;
            }
            if (!data.fromPin) {
                elicitSlotForIntent.fromPin = true;
            }
            
            this.emit('ProtalkGetMoreInfoIntent');
        }
    },
    'ProtalkPulseIntent': function () {
        const pinIdSlot = this.event.request.intent.slots.pinId;   // Pin + numbers
        const repetitionsSlot = this.event.request.intent.slots.repetitions;
        const periodSlot = this.event.request.intent.slots.period;
        const periodMsecSlot = this.event.request.intent.slots.periodMsec;
        
        if(pinIdSlot.value) {
            data.pinId = pinIdSlot.value;
        }
        if(repetitionsSlot) {
            if(repetitionsSlot.value) {
                data.repetitions = repetitionsSlot.value;
            }
        }
        if(periodSlot) {
            if(periodSlot.value) {
                data.period = periodSlot.value;
            }
        } else if (periodMsecSlot) {
            if(periodMsecSlot.value) {
                data.period = periodMsecSlot.value;
            }
        }
        
        if(data.pinId && data.repetitions && data.period) {
            handleProtalkPulseIntent(this, data.pinId, data.repetitions, data.period, actionFor);
        } else {
            elicitSlotForIntent.target = "pulseIntent";
            if (!data.period) {
                elicitSlotForIntent.period = true;
            }
            if (!data.repetitions) {
                elicitSlotForIntent.repetitions = true;
            }
            if (!data.pinId) {
                elicitSlotForIntent.pinId = true;
            }
            this.emit('ProtalkGetMoreInfoIntent');
        }
    },
    'ProtalkGetMoreInfoIntent': function () {
        const pinIdSlot = this.event.request.intent.slots.pinId;   // Pin + numbers
        const actionSlot = this.event.request.intent.slots.action;  // read, write
        const dValueSlot = this.event.request.intent.slots.dValue;  // high, low
        const aValueSlot = this.event.request.intent.slots.aValue;  // numbers  0~255
        const ioTypeSlot = this.event.request.intent.slots.ioType; // input, output
        const compareSlot = this.event.request.intent.slots.compare; // input, output
        const pinTypeSlot = this.event.request.intent.slots.pinType;  // analog, digital
        const timeSlot = this.event.request.intent.slots.time;  // analog, digital
        const cancelSlot = this.event.request.intent.slots.cancel;
        const endValueSlot = this.event.request.intent.slots.endValue;
        const componentSlot = this.event.request.intent.slots.component;
        
        this.attributes.stage = "get_info";
        
        if(cancelSlot) {
            if(cancelSlot.value == "cancel") {
                elicitSlotForIntent = {};
                data = {};
                this.attributes.speechOutput = "Command canceled";
                this.attributes.repromptSpeech = this.t('PROTALK_REPROMPT');
                this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                this.emit(':responseReady');
            }
        }
        
        //check which intent request for getMoreInfo
        var whoCalled = elicitSlotForIntent.target;
        switch (whoCalled) {
            case "howtoIntent":
                if(componentSlot.value) {
                    data.component = componentSlot.value;
                    elicitSlotForIntent.component = false;
                }
                if (elicitSlotForIntent.component) {
                    this.attributes.speechOutput = "What is the component to know?";
                    this.attributes.repromptSpeech = "Tell me the component name.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else {
                    this.emit('ProtalkHowToIntent');
                }
                break;
            case "hwTestIntent":
                if(componentSlot.value) {
                    data.component = componentSlot.value;
                    elicitSlotForIntent.component = false;
                }
                if (elicitSlotForIntent.component) {
                    this.attributes.speechOutput = "What is the component to test?";
                    this.attributes.repromptSpeech = "Tell me the component name.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else {
                    this.emit('ProtalkHWTestIntent');
                }
                break;
            case "resetIntent":
                if(pinIdSlot.value) {
                    data.pinId = pinIdSlot.value;
                    elicitSlotForIntent.pinId = false;
                }
                if(pinTypeSlot.value) {
                    data.pinType = pinTypeSlot.value;
                    elicitSlotForIntent.pinType = false;
                }
                
                if(elicitSlotForIntent.pinId) {
                    this.attributes.speechOutput = "Please say the pin number.";
                    this.attributes.repromptSpeech = this.attributes.speechOutput;
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if(elicitSlotForIntent.pinType){
                    this.attributes.speechOutput = "Analog or Digital?";
                    this.attributes.repromptSpeech = this.attributes.speechOutput;
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else {
                    this.emit('ProtalkResetIntent');
                }
                break;
            case "ifIntent":
                if(pinIdSlot.value) {
                    data.pinId = pinIdSlot.value;
                    elicitSlotForIntent.pinId = false;
                    if (elicitSlotForIntent.pinType) {
                        var pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
                        var tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
                        if(parseInt(pinId) != parseInt(tempId)) {
                            pinId = tempId;
                        }
                        if(parseInt(pinId) > 5) {
                            data.pinType = "digital";
                            elicitSlotForIntent.pinType = false;
                        }
                    }
                }
                if(compareSlot.value) {
                    data.compare = compareSlot.value;
                    elicitSlotForIntent.compare = false;
                }
                if(aValueSlot.value) {
                    data.startValue = aValueSlot.value;
                    data.endValue = 0;
                    elicitSlotForIntent.value = false;
                    if (elicitSlotForIntent.pinType) {
                        data.pinType = "analog";
                        elicitSlotForIntent.pinType = false;
                    }
                } else if(dValueSlot.value) {
                    data.startValue = dValueSlot.value;
                    data.endValue = 0;
                    elicitSlotForIntent.value = false;
                    if (elicitSlotForIntent.pinType) {
                        data.pinType = "digital";
                        elicitSlotForIntent.pinType = false;
                    }
                }
                if(pinTypeSlot.value) {
                    data.pinType = pinTypeSlot.value;
                    elicitSlotForIntent.pinType = false;
                }
                
                if (elicitSlotForIntent.pinId) {
                    this.attributes.speechOutput = "What is the pin number.";
                    this.attributes.repromptSpeech = "For example, Pin 5 or Pin 6.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.compare) {
                    this.attributes.speechOutput = "What is the comparison?";
                    this.attributes.repromptSpeech = "is greater than? or less than? or equal to?";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');       
                } else if (elicitSlotForIntent.value) {
                    this.attributes.speechOutput = "What is the value?";
                    this.attributes.repromptSpeech = "High, Low or Numbers.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.pinType) {
                    this.attributes.speechOutput = "Analog or Digital?";
                    this.attributes.repromptSpeech = this.attributes.speechOutput;
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else {
                    this.emit('ProtalkIfIntent');
                }
                break;
            case "ifBetweenIntent":
                if(pinIdSlot.value) {
                    data.pinId = pinIdSlot.value;
                    elicitSlotForIntent.pinId = false;
                    if (elicitSlotForIntent.pinType) {
                        var pinId = data.pinId.substring(data.pinId.length-1, data.pinId.length);
                        var tempId = data.pinId.substring(data.pinId.length-2, data.pinId.length);
                        if(parseInt(pinId) != parseInt(tempId)) {
                            pinId = tempId;
                        }
                        if(parseInt(pinId) > 5) {
                            data.pinType = "digital";
                            elicitSlotForIntent.pinType = false;
                        }
                    }
                }
                if(aValueSlot.value) {
                    if (elicitSlotForIntent.startValue) {
                        data.startValue = aValueSlot.value;
                        elicitSlotForIntent.startValue = false;
                    } else {
                        data.endValue = aValueSlot.value;
                        elicitSlotForIntent.endValue = false;
                    }
                } else if(endValueSlot.value) {
                    data.endValue = endValueSlot.value;
                    elicitSlotForIntent.endValue = false;
                }
                if (elicitSlotForIntent.pinId) {
                    this.attributes.speechOutput = "What is the pin number.";
                    this.attributes.repromptSpeech = "For example, Pin 5 or Pin 6.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.startValue) {
                    this.attributes.speechOutput = "What is the start of range?";
                    this.attributes.repromptSpeech = "between..";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.endValue) {
                    this.attributes.speechOutput = "What is the end of range?";
                    this.attributes.repromptSpeech = "between " + data.startValue + " and?";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else {
                    this.emit('ProtalkIfBetweenIntent');
                }
                break;
            case "actionIntent":
                if(actionSlot.value) {
                    data.action = actionSlot.value;
                    elicitSlotForIntent.action = false;
                }
                if(pinIdSlot.value) {
                    data.pinId = pinIdSlot.value;
                    elicitSlotForIntent.pinId = false;
                }
                if(aValueSlot.value) {
                    data.value = aValueSlot.value;
                    elicitSlotForIntent.value = false;
                } else if(dValueSlot.value) {
                    data.value = dValueSlot.value;
                    elicitSlotForIntent.value = false;
                }
                if(pinTypeSlot.value) {
                    data.pinType = pinTypeSlot.value;
                    elicitSlotForIntent.pinType = false;
                }
                
                if (elicitSlotForIntent.action) {
                    this.attributes.speechOutput = "What is the action?";
                    this.attributes.repromptSpeech = "Write, Pipe, Pulse, or Set?";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.pinId) {
                    this.attributes.speechOutput = "What is the pin number?";
                    this.attributes.repromptSpeech = "For example, Pin 5 or Pin 6.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.value) {
                    this.attributes.speechOutput = "What is the value?";
                    this.attributes.repromptSpeech = "High, Low or Numbers.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.pinType) {
                    this.attributes.speechOutput = "Analog or Digital?";
                    this.attributes.repromptSpeech = this.attributes.speechOutput;
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else {
                    this.emit('ProtalkActionIntent');
                }
                break;
            case "setIntent":
                if(pinIdSlot.value) {
                    data.pinId = pinIdSlot.value;
                    elicitSlotForIntent.pinId = false;
                }
                if(ioTypeSlot.value) {
                    data.ioType = ioTypeSlot.value;
                    elicitSlotForIntent.ioType = false;
                }
                if(pinTypeSlot.value) {
                    data.pinType = pinTypeSlot.value;
                    elicitSlotForIntent.pinType = false;
                }
                
                if (elicitSlotForIntent.pinId) {
                    this.attributes.speechOutput = "What is the pin number?";
                    this.attributes.repromptSpeech = "For example, Pin 5 or Pin 6.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.ioType) {
                    this.attributes.speechOutput = "Input or Output?";
                    this.attributes.repromptSpeech = this.attributes.speechOutput;
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.pinType) {
                    this.attributes.speechOutput = "Analog or Digital?";
                    this.attributes.repromptSpeech = this.attributes.speechOutput;
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else {
                    this.emit('ProtalkSetIntent');
                }
                break;
            case "pipeIntent":
                if(pinIdSlot) {
                    if(pinIdSlot.value) {
                        if(elicitSlotForIntent.fromPin) {
                            data.fromPin = pinIdSlot.value;
                            elicitSlotForIntent.fromPin = false;

                            if (elicitSlotForIntent.fromPinType) {
                                var pinId = data.fromPin.substring(data.fromPin.length-1, data.fromPin.length);
                                var tempId = data.fromPin.substring(data.fromPin.length-2, data.fromPin.length);
                                if(parseInt(pinId) != parseInt(tempId)) {
                                    pinId = tempId;
                                }
                                if(parseInt(pinId) > 5) {
                                    data.fromPinType = "digital";
                                    elicitSlotForIntent.fromPinType = false;
                                }
                            } 
                        } else if(elicitSlotForIntent.toPin) {
                            data.toPin = pinIdSlot.value;
                            elicitSlotForIntent.toPin = false;

                            if (elicitSlotForIntent.toPinType) {
                                var pinId = data.toPin.substring(data.toPin.length-1, data.toPin.length);
                                var tempId = data.toPin.substring(data.toPin.length-2, data.toPin.length);
                                if(parseInt(pinId) != parseInt(tempId)) {
                                    pinId = tempId;
                                }
                                if(parseInt(pinId) > 5) {
                                    data.toPinType = "digital";
                                    elicitSlotForIntent.toPinType = false;
                                }
                            }  
                        }
                    }
                }
                if(pinTypeSlot) {
                    if(pinTypeSlot.value) {
                        if(elicitSlotForIntent.fromPinType) {
                            data.fromPinType = pinTypeSlot.value;
                            elicitSlotForIntent.fromPinType = false;
                        } else if(elicitSlotForIntent.toPinType) {
                            data.toPinType = pinTypeSlot.value;
                            elicitSlotForIntent.toPinType = false;
                        }
                    }
                }
                if (elicitSlotForIntent.fromPin) {
                    this.attributes.speechOutput = "What is the source pin number?";
                    this.attributes.repromptSpeech = "For example, Pin 5 or Pin 6.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.fromPinType) {
                    this.attributes.speechOutput = "What is the source pin type? Analog or Digital?";
                    this.attributes.repromptSpeech = "Analog or Digital?";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.toPin) {
                    if(data.exception == "pinId") {
                        data.exception = "";
                        data.pinId = "";
                        data.pinType = "";
                        elicitSlotForIntent.toPinType = true;
                        this.attributes.speechOutput = "Tell me the target pin number that can be used for analog.";
                        this.attributes.repromptSpeech = "You can use A0 to 5 or D3, 5, 6, 9, 10, 11.";
                    } else {
                        this.attributes.speechOutput = "Say the target pin id.";
                        this.attributes.repromptSpeech = this.attributes.speechOutput;
                    }
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.toPinType) {
                    this.attributes.speechOutput = "What is the target pin type? Analog or Digital?";
                    this.attributes.repromptSpeech = "Analog or Digital?";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else {
                    this.emit('ProtalkPipeIntent');
                }
                break;
            case "doAfterIntent":
                if(timeSlot.value) {
                    data.time = timeSlot.value;
                    elicitSlotForIntent.time = false;
                }
                if (elicitSlotForIntent.time) {
                    this.attributes.speechOutput = "What is the interval?";
                    this.attributes.repromptSpeech = "Time unit can be in seconds, minutes or hours.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else {
                    this.emit('ProtalkDoAfterIntent');
                }
                break;
            case "pulseIntent":
                if(pinIdSlot.value) {
                    data.pinId = pinIdSlot.value;
                    elicitSlotForIntent.pinId = false;
                }
                if(timeSlot) {
                    if(timeSlot.value) {
                        data.period = timeSlot.value;
                        elicitSlotForIntent.period = false;
                    }
                }
                if(aValueSlot) {
                    if(aValueSlot.value) {
                        data.repetitions = aValueSlot.value;
                        elicitSlotForIntent.repetitions = false;
                    }
                }
                
                if (elicitSlotForIntent.pinId) {
                    this.attributes.speechOutput = "What is the pin number?";
                    this.attributes.repromptSpeech = "For example, Pin 5 or Pin 6.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.period) {
                    this.attributes.speechOutput = "What is the interval?";
                    this.attributes.repromptSpeech = "Time unit can be in seconds, or minutes.";
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else if (elicitSlotForIntent.repetitions) {
                    this.attributes.speechOutput = "How many times to repeat?";
                    this.attributes.repromptSpeech = this.attributes.speechOutput;
                    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                    this.emit(':responseReady');
                } else {
                    this.emit('ProtalkPulseIntent');
                }
                break;
            default:
                this.attributes.speechOutput = "You can say help to get examples of commands";
                this.attributes.repromptSpeech = this.attributes.speechOutput;
                this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
                this.emit(':responseReady');
                break;
        }
    },
    'AMAZON.YesIntent': function () {
        if(this.attributes.stage == "howto") this.emit('ProtalkDebugIntent');
        else if(this.attributes.stage == "hw_debug") {
            resetPinJson(this, this.attributes.pinType);
            this.attributes.speechOutput = this.t('PROTALK_REPROMPT');
            this.attributes.repromptSpeech = this.t('PROTALK_REPROMPT');
            this.emit('ProtalkHowToIntent');
            //this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
            //this.emit(':responseReady');
        } else if(this.attributes.stage == "hw_test") {
            resetPinJson(this, this.attributes.pinType);
            this.attributes.speechOutput = this.t('PROTALK_REPROMPT');
            this.attributes.repromptSpeech = this.t('PROTALK_REPROMPT');
            this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
            this.emit(':responseReady');
        } else if(this.attributes.stage == "hw_help") {
            //this.emit(':ask', "hw_help_yesintent");
            this.emit('ProtalkDebugIntent');
        } else if(this.attributes.state == "prototyping") {
            this.emit('ProtalkChangeMode');
        } else if(this.attributes.state == "prototyping_done") {
            handleGuideIntent(this, this.attributes.step+1);
        } else if(this.attributes.state == "sw_help") {
            var speechOutput = "Tell me the pin number to reset.";
            this.attributes.repromptSpeech = "Tell me the pin number to reset.";
            this.emit(':ask', speechOutput);
        } else if(this.attributes.state == "sw_help_reset") this.emit('ProtalkChangeMode');
    },
    'AMAZON.NoIntent': function () {
        if(this.attributes.stage == "howto") {
            this.attributes.stage = "howto_no";
            this.emit('ProtalkHowToIntent');
        } else if(this.attributes.stage == "hw_debug") helpHardwareDebug(this);
        else if(this.attributes.stage == "hw_test") helpHardwareDebug(this);
        else if(this.attributes.stage == "hw_help") helpHardwareDebug(this);
        else if(this.attributes.state == "prototyping") handleGuideIntent(this, this.attributes.step+1);
        else if(this.attributes.state == "prototyping_done") helpSoftwareDebug(this);
        else if(this.attributes.state == "sw_help") { 
            this.attributes.state = "sw_help_reset";
            this.attributes.reset = "no";
            helpSoftwareDebug(this);
        } else if(this.attributes.state == "sw_help_reset") this.emit('ProtalkWaitIntent');
        else this.emit('ProtalkWaitIntent');
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    }
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    //alexa.registerHandlers(handlers);
    alexa.registerHandlers(
        //startSessionHandler,
        taskHandler
        //prototypingHandler
    );
    alexa.execute();
};

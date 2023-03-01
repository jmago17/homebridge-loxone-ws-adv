"use strict";

var request = require("request");

var Alarm = function(widget, platform, homebridge) {

    this.platform = platform;
    this.uuidAction = widget.uuidAction;
    this.stateUuid = widget.states.armed;
    this.stateLevel = widget.states.level;
    this.stateDisableMove = widget.states.disabledMove;



    
    this.armedState = 0;
    this.triggeredState = 0;
    this.targetState = 0;
    

    Alarm.super_.call(this, widget, platform, homebridge);
};

Alarm.prototype.initListener = function() {
    this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateLevel, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateDisableMove, this.callBack.bind(this));
};

Alarm.prototype.callBack = function(value, uuid) {
    // console.log("Funtion value " + value + " " + uuid);
    if (this.stateLevel == uuid) {
        console.log("stateLevel " + value + " " + uuid);
        if (this.triggeredState > 0) {
            this.armedtState = 4;                       
        } else {
            this.triggeredState = value;
        }
        this.otherService.getCharacteristic(Characteristic.SecuritySystemTargetState).updateValue(this.armedtState);
    }

    if (this.stateDisableMove == uuid) {
        console.log("away mode " + value + " " + uuid);
        this.moveDisabled = value;
    }
    if (this.stateUuid == uuid) {
        console.log("state armed " + value + " " + uuid);
       
        if (!value) {
            this.armedtState = 3;
        } else if (value && this.moveDisabled && this.triggeredState == 0) {
            this.armedState = 0;
        } else if (value && !this.moveDisabled && this.triggeredState == 0) {
            this.armedState = 1;
        } else if (this.triggeredState > 0) {
            this.armedState = 4;
        }

        

        if (this.armedtState == 3) {
            this.targetState = 3;
            this.otherService.setCharacteristic(Characteristic.SecuritySystemTargetState, Characteristic.SecuritySystemTargetState.DISARM);
            
        }
        if (this.armedtState == 0) {
            this.targetState = 0;
            this.otherService.setCharacteristic(Characteristic.SecuritySystemTargetState, Characteristic.SecuritySystemTargetState.STAY_ARM);
         
        }
        if (this.armedtState == 1) {
            this.targetState = 1;
            this.otherService.setCharacteristic(Characteristic.SecuritySystemTargetState, Characteristic.SecuritySystemTargetState.AWAY_ARM);
         
        }
        this.otherService.getCharacteristic(Characteristic.SecuritySystemCurrentState).updateValue(this.armedState);
        
        

    }
};

Alarm.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.SecuritySystem();
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.SecuritySystemCurrentState)
        .on("get", this.getCurrentState.bind(this));
    

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.SecuritySystemTargetState)
        .on('set', this.setItemTargetState.bind(this))
        .on('get', this.getItemTargetState.bind(this))
        .setProps({
            validValues: [0, 1, 3]
        })
    
    return otherService;
};

Alarm.prototype.getCurrentState = function(callback) {
   callback(undefined, this.armedState);
};

Alarm.prototype.getItemTargetState = function(callback) {
   callback(undefined, this.targetState);
};

Alarm.prototype.getItemAlarmType = function(callback) {
   callback(undefined, this.AlarmType);
};


Alarm.prototype.onCommand = function() {
    return 'On';
};

Alarm.prototype.setItemTargetState = function(value, callback) {
    //  this.log("Setting state to %s", value);
   
        var self = this;
        this.targetState = value;
        //var command = (value == '1') ? this.onCommand() : 'Off';
        if (value == '0') {
            var command = 'on/0';
        } else if (value == '1') {
            var command = 'on/1';
        } else if (value == '3') {
            var command = 'Off';
        } else if (value == '2') {
            var command = 'on/0';
        }
        // this.log("[Alarm] iOS - send message to " + this.name + ": " + command);
        this.platform.ws.sendCommand(this.uuidAction, command);
        if (command == 'Off') {
            //this.log("[Alarm] iOS - send message to " + this.name + ": " + "quit");
            this.platform.ws.sendCommand(this.uuidAction, 'quit');
        }
    

    callback();
};

module.exports = Alarm;

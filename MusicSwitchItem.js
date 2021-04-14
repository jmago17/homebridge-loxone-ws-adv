"use strict";

var request = require("request");

var MusicSwitchItem = function(widget,platform,homebridge) {

    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a Musik, use the uuidAction
    this.stateUuid = widget.states.volume; //a Musik always has a state called volume, which is the uuid which will receive the event to read
    this.statePlay = widget.states.playState;
    this.currentStateVolume = undefined; //will be a Value between 0 and 100 for Volume
    this.currentStatePower = undefined; //will be a Value between 0 and 100 for Powerstate
    MusicSwitchItem.super_.call(this, widget,platform,homebridge);
};

// Register a listener to be notified of changes in this items Value
MusicSwitchItem.prototype.initListener = function() {
    this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.statePlay, this.callBack.bind(this));
};

MusicSwitchItem.prototype.callBack = function(Value, uuid) {
    //function that gets called by the registered ws listener
   
    
    if(!this.inControl) {
         
         
         if(this.stateUuid == uuid){
        	 console.log("Got new state for Volume " + Value);
        this.currentStateVolume = Value;
         }
         if(this.statePlay == uuid){
        	 	if(Value == 2){
        	 		this.log("Got new State for Power " + Value);
             this.currentStatePower = 1;
             this.log("Got new State for Power is On");
        	 	}else{
        	 		this.currentStatePower = 0;
        	 		this.log("Got new State for Power is Off");
              } 
    }
       
    }    
    //also make sure this change is directly communicated to HomeKit
    this.setFromLoxone = true;
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.On)
        //.setValue(this.currentStateVolume > 0);
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.RotationSpeed)
        .setValue(this.currentStateVolume,
            function() {
                this.setFromLoxone = false;
            }.bind(this)
        );
}
    
MusicSwitchItem.prototype.getOtherServices = function() {

    //setting variable to skip update for intial Value
    this.setInitialState = true;

    var otherService = new this.homebridge.hap.Service.Fan();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemPowerState.bind(this))
        .on('get', this.getItemPowerState.bind(this))
        .setValue(this.currentStatePower)
        //.setValue(this.currentStateVolume > 0);

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.RotationSpeed)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        .setValue(this.currentStateVolume);

    return otherService;
};

MusicSwitchItem.prototype.getItemState = function(callback) {
    //returns RotationSpeed Value
    callback(undefined, this.currentStateVolume);
};

MusicSwitchItem.prototype.getItemPowerState = function(callback) {
    //returns true if currentStateVolume is > 0
    callback(undefined, this.currentStatePower > 0);
};

MusicSwitchItem.prototype.setItemPowerState = function(Value, callback) {

    //sending new state (on/off) to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback

    var self = this;

    if (this.setInitialState) {
        this.setInitialState = false;
        callback();
        return;
    }

    if (this.setFromLoxone) {
        callback();
        return;
    }

    if(Value == undefined) {
        //happens at initial load
        callback();
        return;
    }

    this.log("[Musik] iOS - send on/off message to " + this.name + ": " + Value + " UUIDAction: " + this.uuidAction);
    var command = (Value == '1') ? 'On' : 'Off';
    this.log("StatePower: " + this.currentStatePower + " Value: " + Value)
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();
    
};

MusicSwitchItem.prototype.setItemState = function(Value, callback) {

    //sending new state (Value) to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback

    var self = this;

    
    if (this.setInitialState) {
        this.setInitialState = false;
        callback();
        return;
    }

    if (this.setFromLoxone) {
        callback();
        return;
    }

    if(Value == undefined) {
        //happens at initial load
        callback();
        return;
    }
    
    if(Value == 100) {
        //happens after restart homebridge music with 100% Value
        Value=25;
    }

   this.log("[Musik] iOS - send Value message to " + this.name + ": " + Value);
    var command = "volume/" + Value; //Loxone expects a Value between 0 and 100
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();
};

module.exports = MusicSwitchItem;

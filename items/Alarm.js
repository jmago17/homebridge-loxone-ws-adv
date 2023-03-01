"use strict";

var request = require("request");

var Alarm = function (widget, platform, homebridge) {

  this.platform = platform;
  this.uuidAction = widget.uuidAction;
  this.stateUuid = widget.states.armed;	
  this.stateLevel = widget.states.level;
  this.stateDisableMove = widget.states.disableMove;	
  
	
	
	
  this.armedState = 0;
  this.triggeredState = 0;
 
	
  Alarm.super_.call(this, widget, platform, homebridge);
};

Alarm.prototype.initListener = function () {
  this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
  this.platform.ws.registerListenerForUUID(this.stateLevel, this.callBack.bind(this));
  this.platform.ws.registerListenerForUUID(this.stateDisableMove, this.callBack.bind(this));	
};

Alarm.prototype.callBack = function (value, uuid) {
 // console.log("Funtion value " + value + " " + uuid);
   	if (this.stateLevel == uuid) {
	   console.log("stateLevel " + value + " " + uuid);
   	this.triggeredState = value;
	   if(this.triggeredState > 0){
		   this.otherService.getCharacteristic(Characteristic.LockCurrentState).updateValue(4);}
	   else { this.otherService.getCharacteristic(Characteristic.LockCurrentState).updateValue(this.armedtState);}
   
   
   
   }
	
	if (this.stateDisableMove == uuid) {
	   console.log("away mode " + value + " " + uuid);
	   this.moveDisabled = value;
   	}
	
	if (this.stateUuid == uuid) {
	   console.log("state armed " + value + " " + uuid);
   	   
		if (!value){
			this.armedtState = 3;
		} else if (value && this.moveDisabled){
			this.armedState = 1;
		} else {	this.armedState = 0; }
		
		
   	
	   if(this.triggeredState == 0){
   	         this.otherService.getCharacteristic(Characteristic.LockCurrentState).updateValue(this.armedtState);
	   }
			
	if (this.armedtState == 0){
        this.otherService.setCharacteristic(Characteristic.SecuritySystemTargetState, Characteristic.SecuritySystemTargetState.DISARM
        
   }   
	   
	   
   }
	
   
	
	
	
	
};

Alarm.prototype.getOtherServices = function () {
  var otherService = new this.homebridge.hap.Service.SecuritySystem();
	otherService.getCharacteristic(this.homebridge.hap.Characteristic.SecuritySystemCurrentState)
		.on("get", this.getCurrentState.bind(this));
	
	otherService.getCharacteristic(this.homebridge.hap.Characteristic.SecuritySystemTargetState)
		.on('set', this.setItemTargetState.bind(this))
		.on('get', this.getItemTargetState.bind(this))
		

  return otherService;
};

Alarm.prototype.getCurrentState = function(callback) {
	/* // this.log("Getting current state");
	var status = this.currentState;
	// this.log("callbackc current status : " + status);
	if(status== '0'){
		var state = 3;
	}
	if(status == '1'){
		var state = 1;
	}
	if(status == '2'){
		var state = 0;
	}
	if(status == '4'){
		var state = 4;
	}
	// this.log("callbackc current: " + state);	
	callback(undefined, state); //de aqui hasta la } es nuevo */
	callback(undefined, this.currentState);
};

//  static readonly STAY_ARM = 0;
 // static readonly AWAY_ARM = 1;
 // static readonly NIGHT_ARM = 2;
 // static readonly DISARMED = 3;
 // static readonly ALARM_TRIGGERED = 4;

Alarm.prototype.getItemTargetState = function (callback) {
  //callback(undefined, this.currentState == '1'); //de aqui hasta la } es nuevo
  // this.log("Getting item level");
/*	var status = this.currentState;
	// this.log("callbackc current status : " + status);
	if(status== '0'){
		var state = 3;
	}
	if(status == '1'){
		var state = 1;
	}
	if(status == '2'){
		var state = 0;
	}
	if(status == '4'){
		var state = 4;
	}
	// this.log("callbackc item: " + state);	
	callback(undefined, state); //de aqui hasta la } es nuevo*/
	callback(undefined, this.targetState);
};

Alarm.prototype.onCommand = function () {
  return 'On';
};

Alarm.prototype.setItemState = function (value, callback) {
//  this.log("Setting state to %s", value);
  var self = this;

  //var command = (value == '1') ? this.onCommand() : 'Off';
	if (value == '0') {
		var command = 'on/0';}
	else if (value == '1') {
		var command = 'on/1';}
	else if (value == '3') {
		var command = 'Off';}
	else if (value == '2') {
		var command = 'on/0';}
	
  // this.log("[Alarm] iOS - send message to " + this.name + ": " + command);
  this.platform.ws.sendCommand(this.uuidAction, command);
  if (command == 'Off') {
		 //this.log("[Alarm] iOS - send message to " + this.name + ": " + "quit");
  	this.platform.ws.sendCommand(this.uuidAction, 'quit');
  }
	
  callback();
	

};



module.exports = Alarm;

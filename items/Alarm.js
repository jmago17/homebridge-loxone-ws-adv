"use strict";

var request = require("request");

var Alarm = function (widget, platform, homebridge) {

  this.platform = platform;
  this.uuidAction = widget.uuidAction;
  this.stateUuid = widget.states.armed;
  this.levelUuid = widget.states.level;
  this.currentState = undefined;
  this.targetState = undefined;	
  this.currentLevel = undefined;
	
  Alarm.super_.call(this, widget, platform, homebridge);
};

Alarm.prototype.initListener = function () {
  this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
  this.platform.ws.registerListenerForUUID(this.levelUuid, this.callBack.bind(this));
};

Alarm.prototype.callBack = function (value, uuid) {
  console.log("Funtion value " + value + " " + uuid);
  if(this.stateUuid == uuid){    
     this.currentState = value;
}
 if(this.levelUuid == uuid){
      this.currentLevel = value;
}
}
Alarm.prototype.getOtherServices = function () {
  var otherService = new this.homebridge.hap.Service.SecuritySystem();
	otherService.getCharacteristic(this.homebridge.hap.Characteristic.SecuritySystemCurrentState)
		.on("get", this.getCurrentState.bind(this));
	
	otherService.getCharacteristic(this.homebridge.hap.Characteristic.SecuritySystemTargetState)
		.on('set', this.setItemState.bind(this))
		.on('get', this.getItemState.bind(this))
		

  return otherService;
};

Alarm.prototype.getCurrentState = function(callback) {
	this.log("Getting current state");
	var state = this.currentState;
	var level = this.currentLevel;
	this.log("Getting current state: " + state);
	this.log("Getting current level: " + level);
	if ( level == '2') {
		state = '4';
	}
	this.log("callbackc current: " + state);
	callback(state); //de aqui hasta la } es nuevo
};



Alarm.prototype.getItemState = function (callback) {
  //callback(undefined, this.currentState == '1'); //de aqui hasta la } es nuevo
  this.log("Getting item state");
	var state = this.currentState;
	var level = this.currentLevel;
	this.log("Getting item state" + state);
	this.log("Getting item level: " + level);
	if ( level == '2') {
		state = '4';
	}
	this.log("callback:item  " + state);
	callback(state); //de aqui hasta la } es nuevo
};

Alarm.prototype.onCommand = function () {
  return 'On';
};

Alarm.prototype.setItemState = function (value, callback) {
  this.log("Setting state to %s", value);
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
	
  this.log("[Alarm] iOS - send message to " + this.name + ": " + command);
  this.platform.ws.sendCommand(this.uuidAction, command);
  if (command == 'Off') {
	this.log("[Alarm] iOS - send message to " + this.name + ": " + "quit");
  	this.platform.ws.sendCommand(this.uuidAction, 'quit');
  }
	
  callback(command);

};



module.exports = Alarm;

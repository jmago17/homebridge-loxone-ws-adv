"use strict";

var request = require("request");

var Alarm = function (widget, platform, homebridge) {

  this.platform = platform;
  this.uuidAction = widget.uuidAction;
  this.stateUuid = widget.states.armed;
  this.currentState = undefined;
 
	
  Alarm.super_.call(this, widget, platform, homebridge);
};

Alarm.prototype.initListener = function () {
  this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
};

Alarm.prototype.callBack = function (value, uuid) {
  console.log("Funtion value " + value + " " + uuid);
  this.currentState = value;     
};

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
	var status = this.currentState;
	this.log("callbackc current status : " + status);
	if(status== '0'){
		var state = 3;
	}
	if(status == '1'){
		var state = 0;
	}
	if(status == '2'){
		var state = 1;
	}
	if(status == '4'){
		var state = 4;
	}
	this.log("callbackc current: " + state);	
	callback(state); //de aqui hasta la } es nuevo
};

//  static readonly STAY_ARM = 0;
 // static readonly AWAY_ARM = 1;
 // static readonly NIGHT_ARM = 2;
 // static readonly DISARMED = 3;
 // static readonly ALARM_TRIGGERED = 4;

Alarm.prototype.getItemState = function (callback) {
  //callback(undefined, this.currentState == '1'); //de aqui hasta la } es nuevo
  this.log("Getting item level");
	var status = this.currentState;
	this.log("callbackc current status : " + status);
	if(status== '0'){
		var state = 3;
	}
	if(status == '1'){
		var state = 0;
	}
	if(status == '2'){
		var state = 1;
	}
	if(status == '4'){
		var state = 4;
	}
	this.log("callbackc item: " + state);	
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
	
  callback();
	

};



module.exports = Alarm;

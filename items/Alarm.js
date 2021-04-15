"use strict";

var request = require("request");

var Alarm = function (widget, platform, homebridge) {

  this.platform = platform;
  this.uuidAction = widget.uuidAction;
  this.stateUuid = widget.states.armed;
  this.levelUuid = widget.states.level;
  this.currentState = undefined;

  Alarm.super_.call(this, widget, platform, homebridge);
};

Alarm.prototype.initListener = function () {
  this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
  this.platform.ws.registerListenerForUUID(this.levelUuid, this.callBack.bind(this));
};

Alarm.prototype.callBack = function (value) {
  this.currentState = value;
}

Alarm.prototype.getOtherServices = function () {
  var otherService = new this.homebridge.hap.Service.SecuritySystem();
	otherService.getCharacteristic(this.homebridge.hap.Characteristic.SecuritySystemCurrentState)
		.on("get", this.getCurrentState.bind(this));
	
	otherService.getCharacteristic(this.homebridge.hap.Characteristic.SecuritySystemTargetState)
		.on('set', this.setItemState.bind(this))
		.on('get', this.getItemState.bind(this))
		.updateValue(this.targetState == '1');

  return otherService;
};

Alarm.prototype.getCurrentState = function(callback) {
	var self = this;
	self.log("Getting current state");
	this.getOtherServices(this.readCurrentState, function(err, state) {
		if (!err) {
			self.log("Current state is %s", state);
			if (self.previousCurrentState !== state) {
				self.previousCurrentState = state;
				self.log("Current state changed to %s", state);
			}
		}

		callback(err, state);
	});
};



Alarm.prototype.getItemState = function (callback) {
  callback(undefined, this.currentState == '1'); //de aqui hasta la } es nuevo
  
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
  if (command = 'Off') {
	this.log("[Alarm] iOS - send message to " + this.name + ": " + "quit");
  	this.platform.ws.sendCommand(this.uuidAction, 'quit');
  }
  callback();

};

module.exports = Alarm;

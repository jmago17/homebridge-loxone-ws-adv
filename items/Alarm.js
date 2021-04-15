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

Alarm.prototype.callBack = function (value) {
  this.currentState = value;
}

Alarm.prototype.getOtherServices = function () {
  var otherService = new this.homebridge.hap.Service.SecuritySystem();
	otherService.getCharacteristic(this.homebridge.hap.Characteristic.SecuritySystemCurrentState)
		.on("get", this.getCurrentState.bind(this))
		.updateValue(this.currentState == '1');
	
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
  //callback(undefined, this.currentState == '1'); de aqui hasta la } es nuevo
  var self = this;
	self.log("Getting target state");

	this.getOtherServices(this.readTargetState, function(err, state){
		if (!err) {
			self.log("Target state is %s", state);
			if (self.previousTargetState !== state) {
				self.previousTargetState = state;
				self.log("Target state changed to %s", state);
			}
		}

		callback(err, state);
	});
};

Alarm.prototype.onCommand = function () {
  return 'On';
};

Alarm.prototype.setItemState = function (value, callback) {
  this.log("Setting state to %s", value);
  var self = this;

  //var command = (value == '1') ? this.onCommand() : 'Off';
	if (value == 'STAY_ARM') {
		var command = '0';}
	else if (value == 'AWAY_ARM') {
		var command = '1';}
	else if (value == 'DISARM') {
		var command = 'Off';}
	else if (value == 'NIGHT') {
		var command = '0';}
	
  this.log("[Alarm] iOS - send message to " + this.name + ": " + command);
  this.platform.ws.sendCommand(this.uuidAction, command);
  callback();

};

module.exports = Alarm;

"use strict";

var request = require("request");

var Occupancy = function (widget, platform, homebridge) {

  this.platform = platform;
  this.uuidAction = widget.uuidAction;
 //this.stateUuid = widget.states.armed;
  this.stateUuid = widget.states.active;	
  this.currentState = undefined;
  
	
  Occupancy.super_.call(this, widget, platform, homebridge);
};

Occupancy.prototype.initListener = function () {
  this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
};

Occupancy.prototype.callBack = function (value, uuid) {
  console.log("Funtion value " + value + " " + uuid);
  this.currentState = value;     
};

Occupancy.prototype.getOtherServices = function () {
  var otherService = new this.homebridge.hap.Service.OccupancySensor;
	otherService.getCharacteristic(this.homebridge.hap.Characteristic.OccupancyDetected)
		.on("get", this.getItemState.bind(this))
		.on('set', this.setItemState.bind(this));
		
	

		
		

  return otherService;
};



Occupancy.prototype.getItemState = function (callback) {
  //callback(undefined, this.currentState == '1'); //de aqui hasta la } es nuevo
  this.log("triggered GET Occupancy detected");
	var status = this.currentState;
	this.log("callbackc current status : " + status);
	if(status== '0'){
		var state = 0;
	}
	if(status == '1'){
		var state = 1;
	}

	this.log("callbackc item: " + state);	
	callback(state); //de aqui hasta la } es nuevo
};

Occupancy.prototype.setItemState = function (value, callback) {
  this.log("Setting state to %s", value);
  var self = this;

  //var command = (value == '1') ? this.onCommand() : 'Off';
	if (value == '0') {
		var command = 0;}
	else if (value == '1') {
		var command = 1;}
	e
	
  this.log("[Presence] iOS - send message to " + this.name + ": " + command);
  this.platform.ws.sendCommand(this.uuidAction, command);
  
	if (command == 'Off') {
	this.log("[Alarm] iOS - send message to " + this.name + ": " + "quit");
  	this.platform.ws.sendCommand(this.uuidAction, 'quit');
  }
	
  callback(command);
	


Occupancy.prototype.onCommand = function () {
  return 'On';
};




module.exports = Occupancy;

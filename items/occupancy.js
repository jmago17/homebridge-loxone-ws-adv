"use strict";

var request = require("request");

var Occupancy = function (widget, platform, homebridge) {

  this.platform = platform;
  this.uuidAction = widget.uuidAction;
 //this.stateUuid = widget.states.armed;
  this.stateUuid = 'widget.states.occupancy';	
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
		.on('set', this.setItemState.bind(this))
		.on("get", this.getItemState.bind(this));
		
	

		
		

  return otherService;
};



Occupancy.prototype.getItemState = function (callback) {
  //callback(undefined, this.currentState == '1'); //de aqui hasta la } es nuevo
  this.log("Getting item level");
	var status = this.currentState;
	this.log("callbackc current status : " + status);
	if(status== '0'){
		var state = 0;
	}
	if(status == '1'){
		var state = 1;
	}

	this.log("callbackc item: " + state);	
	callback(undefined, state); //de aqui hasta la } es nuevo
};

Occupancy.prototype.onCommand = function () {
  return 'On';
};




module.exports = Occupancy;

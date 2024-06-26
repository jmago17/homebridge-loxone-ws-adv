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
		.on('get', this.getItemState.bind(this))
		
		
		

  return otherService;
};



Occupancy.prototype.getItemState = function (callback) {
  //callback(undefined, this.currentState == '1'); //de aqui hasta la } es nuevo
  // this.log("triggered GET Occupancy detected");
	var status = this.currentState;
	// this.log("callbackc current status : " + status);
	if(status== '0'){
		var state = 0;
	}
	else{
		var state = 1;
	}

	// this.log("callback occupancy item: state" + state + "status " + status);	
	callback(null, state); 
};




module.exports = Occupancy;

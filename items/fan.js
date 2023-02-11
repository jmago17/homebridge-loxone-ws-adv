"use strict";

var request = require("request");

var FanItem = function (widget, platform, homebridge) {

  this.platform = platform;
  this.uuidAction = widget.uuidAction;
 //this.stateUuid = widget.states.armed;
  this.stateUuid = widget.states.active;	
  this.currentState = undefined;
  
	
	
  FanItem.super_.call(this, widget, platform, homebridge);
};

FanItem.prototype.initListener = function () {
  this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
};

FanItem.prototype.callBack = function (value, uuid) {
  console.log("Funtion value " + value + " " + uuid);
  this.currentState = value;     
};

FanItem.prototype.getOtherServices = function () {
  var otherService = new this.homebridge.hap.Service.Fan;
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        .updateValue(this.currentState == '1');

		

  return otherService;
};


FanItem.prototype.getItemState = function (callback) {
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

FanItem.prototype.setItemState = function(value, callback) {

    //sending new state to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback

    const self = this;
	
    const command = (value == '1') ? this.onCommand() : 'Off';
    this.log(`[switch] iOS - send message to ${this.name}: ${command}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();

};


module.exports = FanItem;


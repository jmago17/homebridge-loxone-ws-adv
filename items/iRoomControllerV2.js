"use strict";
var request = require("request");

var iRoomControllerV2 = function(widget,platform,homebridge) {
    this.platform = platform;
    this.uuidAction = widget.uuidAction;
    this.stateActual = widget.states.tempActual;
    this.stateTarget = widget.states.tempTarget;
    this.stateMode = widget.states.activeMode;
    this.operatingMode = widget.states.operatingMode;   

  //  this.targetOperatingState = widget.states.operatingMode;
  //  this.ServiceValue = undefined;
    
    
    iRoomControllerV2.super_.call(this, widget,platform,homebridge);
};

// Register a listener to be notified of changes in this items value

iRoomControllerV2.prototype.initListener = function() {

    this.platform.ws.registerListenerForUUID(this.stateActual, this.callBack.bind(this));

    this.platform.ws.registerListenerForUUID(this.stateTarget, this.callBack.bind(this));

    this.platform.ws.registerListenerForUUID(this.stateMode, this.callBack.bind(this));

    this.platform.ws.registerListenerForUUID(this.operatingMode, this.callBack.bind(this));

    this.platform.ws.registerListenerForUUID(this.targetOperatingState, this.callBack.bind(this));

    

       

};







iRoomControllerV2.prototype.callBack = function(value, uuid) {

    //function that gets called by the registered ws listener

    console.log("Funtion value " + value + " " + uuid);

       

    if(this.stateTarget == uuid){

        this.targetTemperature = value;

        console.log("Got new state for Target Temp " + this.name + ": " + value);

        

        if(this.targetTemperature < "10"){

            // min Value of Thermostat

            this.targetTemperature = 10;

        }

        

        if(this.targetTemperature > "38"){

            // max Value of Thermostat

            this.targetTemperature = 38;

        }

        

        //also make sure this change is directly communicated to HomeKit

        this.setFromLoxone = true;

        console.log("Loxone State tergetTemp (should be true): " + this.setFromLoxone);

        this.otherService

        .getCharacteristic(this.homebridge.hap.Characteristic.TargetTemperature)

        .setValue(this.targetTemperature,

                  function() {

                  this.setFromLoxone = false;

                  }.bind(this)

                  );

        //console.log("Loxone State tergetTemp (should be false): " + this.setFromLoxone);

    }

    

    if(this.stateActual == uuid){

    this.currentTemperature = Math.round(value);

    console.log("Got new state for Temp " + this.name + ": " + this.currentTemperature);

    

    //also make sure this change is directly communicated to HomeKit

    this.otherService

    .getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature)

    .setValue(this.currentTemperature);

    

        // take a look what the valve is doing

        if(this.currentTemperature > this.targetTemperature && this.currentTemperature != undefined && this.targetTemperature != undefined){

            // Current Cooling

            console.log("Valve is cooling: " + this.name + " " + this.currentTemperature + " > " + this.targetTemperature);

            this.otherService

            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)

            .setValue(2);

        }

        

        if(this.currentTemperature < this.targetTemperature && this.currentTemperature != undefined && this.targetTemperature != undefined){

            // Current Heating

            console.log("Valve is heating: " + this.name + " " + this.currentTemperature + " < " + this.targetTemperature);

            this.otherService

            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)

            .setValue(1);

        }

        

        if(this.currentTemperature == this.targetTemperature &&  this.currentTemperature != undefined && this.targetTemperature != undefined){

            // Current Heating and Cooling off

            console.log("Valve is off: " + this.name + " " + this.currentTemperature + " = " + this.targetTemperature);

            this.otherService

            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)

            .setValue(0);

        }

    }

    

    if(this.operatingMode == uuid){

        //console.log("Service Value = " + value);

        this.operatingModeValue == value;

        

        if(value == "1") {

            

           console.log("Service Mode = All off for: " + this.name);

            this.setFromLoxone = true;

            this.otherService

            .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)

            .setValue(0, function() {

                      this.setFromLoxone = false;

                      }.bind(this));

            

            this.otherService

            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)

            .setValue(0);

            

        }

    }

    

    if(this.stateMode == uuid){

        console.log("Got new state for Mode " + this.name + ": " + value)

        switch (value) {

            case 0:

                this.targetHcState = 3;

                this.setFromLoxone = true;

                this.otherService

                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)

                .setValue(this.targetHcState, function() {

                          this.setFromLoxone = false;

                          }.bind(this));

                return;

            case 1:

                this.targetHcState = 3;

                this.setFromLoxone = true;

                this.otherService

                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)

                .setValue(this.targetHcState, function() {

                          this.setFromLoxone = false;

                          }.bind(this));

                return;

            case 2:

                this.targetHcState = 0;

                this.setFromLoxone = true;

                this.otherService

                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)

                .setValue(this.targetHcState, function() {

                          this.setFromLoxone = false;

                          }.bind(this));

                return;

            case 3:

                this.targetHcState = 1;

                this.setFromLoxone = true;

                this.otherService

                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)

                .setValue(this.targetHcState, function() {

                          this.setFromLoxone = false;

                          }.bind(this));

                return;

           

        }

    }

}

iRoomControllerV2.prototype.getOtherServices = function() {

    //setting variable to skip update for intial Value

    this.setInitialState = true;

    

    var otherService = new this.homebridge.hap.Service.Thermostat();

    

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.TargetTemperature)

    .on('set', this.setTergetTemperature.bind(this))

    .on('get', this.getTergetTemperature.bind(this))

    .setValue(this.targetTemperature);

    

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)

    .on('set', this.setTargetHeatingCoolingState.bind(this))

    .on('get', this.getTargetHeatingCoolingState.bind(this))

    .setProps({validValues:[0,1,3]}) // Thermostat working modes: to enable cooling, add a 2)

    .setValue(this.targetHcState);

    

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature)

    .on('get', this.getCurrentTemperature.bind(this))

    .setValue(this.currentTemperature);




    return otherService;

};




iRoomControllerV2.prototype.getTergetTemperature = function(callback) {

   callback(undefined, this.targetTemperature);

};




iRoomControllerV2.prototype.getCurrentTemperature = function(callback) {

    callback(undefined, this.currentTemperature);

};




iRoomControllerV2.prototype.getTargetHeatingCoolingState = function(callback) {

    callback(undefined, this.targetHcState);

};







iRoomControllerV2.prototype.setTargetHeatingCoolingState = function(ValueHc, callback) {

    

    //sending new state (ValueHc) to loxone

    //added some logic to prevent a loop when the change because of external event captured by callback

    

    var self = this;

    

    console.log("TemperatureItem setTargetHcState : " + ValueHc);

    

    

    if (this.setInitialState) {

        this.setInitialState = false;

        callback();

        return;

    }

    

    if (this.setFromLoxone) {

        console.log("setTergetHcState setFromLoxone");

        callback();

        return;

    }

    

    if(ValueHc == undefined) {

        //happens at initial load

        callback();

        return;

    }

    

    if(ValueHc == 1){

        //Deaktivate Service

        //var command = "service/0"; //Loxone expects a Value 0-4

        //this.platform.ws.sendCommand(this.uuidAction, command);

        

        //Command for Mode

        command = "mode/3"; //Loxone expects a Value 0-6

        this.platform.ws.sendCommand(this.uuidAction, command);

       // this.log(this.name + " Command " + command);

        callback();

    }

    

    if(ValueHc == 2){

        //Deaktivate Service

        //var command = "service/0"; //Loxone expects a Value 0-4

        //this.platform.ws.sendCommand(this.uuidAction, command);

        

        //Command for Mode

        command = "mode/3"; //Loxone expects a Value 0-6

        this.platform.ws.sendCommand(this.uuidAction, command);

        this.log(this.name + " Command " + command);

        callback();

    }

    

    if(ValueHc == 3){

        //Deaktivate Service

        //var command = "service/0"; //Loxone expects a Value 0-4

        //this.platform.ws.sendCommand(this.uuidAction, command);

        

        //Command for Mode

        command = "mode/1"; //Loxone expects a Value 0-6

        this.platform.ws.sendCommand(this.uuidAction, command);

        this.log(this.name + " Command " + command);

        callback();

    }

    

    if(ValueHc == 0){

        // Use Service to turn Valve off

        var command = "mode/2"; //Loxone expects a Value 0-4

        this.platform.ws.sendCommand(this.uuidAction, command);

        this.log(this.name + " Command " + command);

        callback();

    }

}







iRoomControllerV2.prototype.setTergetTemperature = function(Value, callback) {

    

    //sending new state (Value) to loxone

    //added some logic to prevent a loop when the change because of external event captured by callback

    

    var self = this;

    

    //console.log("TemperatureItem setTergetTemperature: " + this.targetTemperature + " " + Value + " " + this.currentProfile + " " +this.targetHcState);

    

    if (this.setInitialState) {

        this.setInitialState = false;

        callback();

        return;

    }

    

    if (this.setFromLoxone) {

        //console.log("setTergetTemperature setFromLoxone");

        callback();

        return;

    }

    

    if(Value == undefined) {

        //happens at initial load

        callback();

        return;

    }
    if(this.targetHcState == undefined) {

        //happens at initial load

        callback();

        return;

    }

     var command = "setManualTemperature/" + Value; //Loxone expects a Value between 10 and 38

        this.platform.ws.sendCommand(this.uuidAction, command);

        //this.log(this.name + " Command " + command);

        callback();

  }

module.exports = iRoomControllerV2;

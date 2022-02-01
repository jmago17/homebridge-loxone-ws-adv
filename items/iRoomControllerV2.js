"use strict";

var request = require("request");


var TemperatureItem = function(widget,platform,homebridge) {

    this.platform = platform;
    this.uuidAction = widget.uuidAction;
    this.stateActual = widget.states.tempActual;
    this.stateTarget = widget.states.tempTarget;
    this.stateMode = widget.states.mode;
    this.HeatTempIx = widget.states.currHeatTempIx;
    this.Service = widget.states.serviceMode;
    this.currentTemperature = widget.states.tempActual;
    this.targetTemperature = widget.states.tempTarget;
    this.currentProfile = undefined;
    this.targetHcState = widget.states.mode;
    this.ServiceValue = undefined;
    

    this.ProfileZero = widget.states.temperatures[0];
    this.ProfileOne = widget.states.temperatures[1];
    this.ProfileTwo = widget.states.temperatures[2];
    this.ProfileThree = widget.states.temperatures[3];
    this.ProfileFour = widget.states.temperatures[4];
    this.ProfileFive = widget.states.temperatures[5];
    this.ProfileSix = widget.states.temperatures[6];
    this.ProfileSeven = widget.states.temperatures[7];
    
    this.ProfileTempZero = undefined;
    this.ProfileTempOne = undefined;
    this.ProfileTempTwo = undefined;
    this.ProfileTempThree = undefined;
    this.ProfileTempFour = undefined;
    this.ProfileTempFive = undefined;
    this.ProfileTempSix = undefined;
    this.ProfileTempSeven = undefined;
    
    this.ProfileChanged = undefined;
    this.OldProfileValue = undefined;
    this.OldProfile = undefined;
    
    TemperatureItem.super_.call(this, widget,platform,homebridge);
};
    
// Register a listener to be notified of changes in this items value
TemperatureItem.prototype.initListener = function() {
    this.platform.ws.registerListenerForUUID(this.HeatTempIx, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateActual, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateTarget, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateMode, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.Service, this.callBack.bind(this));
    
    this.platform.ws.registerListenerForUUID(this.ProfileZero, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.ProfileOne, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.ProfileTwo, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.ProfileThree, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.ProfileFour, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.ProfileFive, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.ProfileSix, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.ProfileSeven, this.callBack.bind(this));
    
};


TemperatureItem.prototype.callBack = function(value, uuid) {
    //function that gets called by the registered ws listener
    //console.log("Funtion value " + value + " " + uuid);
    
    if(this.HeatTempIx == uuid){
        this.currentProfile = value;
       //console.log("Got new state for Profile " + this.name + ": " + value)
        
        if(this.currentProfile != this.OldProfile && this.ProfileChanged && this.OldProfile != undefined && this.OldProfileValue != undefined){
            //Funktion to set back Value, if Profile is changed
            //this.log("Profile changed, value is set for: " + this.name + " " + this.OldProfileValue);
            var command = "settemp/1/"+ this.OldProfileValue; //Loxone expects a Value between 0 and 100
            this.platform.ws.sendCommand(this.uuidAction, command);
            this.ProfileChanged = false;
        }
    }
    
    if(this.stateTarget == uuid){
        this.targetTemperature = value;
        //console.log("Got new state for Target Temp " + this.name + ": " + value);
        
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
        //console.log("Loxone State tergetTemp (should be true): " + this.setFromLoxone);
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
    //console.log("Got new state for Temp " + this.name + ": " + this.currentTemperature);
    
    //also make sure this change is directly communicated to HomeKit
    this.otherService
    .getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature)
    .setValue(this.currentTemperature);
    
        // take a look what the valve is doing
        if(this.currentTemperature > this.targetTemperature && this.currentTemperature != undefined && this.targetTemperature != undefined){
            // Current Cooling
            //console.log("Valve is cooling: " + this.name + " " + this.currentTemperature + " > " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(2);
        }
        
        if(this.currentTemperature < this.targetTemperature && this.currentTemperature != undefined && this.targetTemperature != undefined){
            // Current Heating
            //console.log("Valve is heating: " + this.name + " " + this.currentTemperature + " < " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(1);
        }
        
        if(this.currentTemperature == this.targetTemperature &&  this.currentTemperature != undefined && this.targetTemperature != undefined){
            // Current Heating and Cooling off
            //console.log("Valve is off: " + this.name + " " + this.currentTemperature + " = " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(0);
        }
    }
    
    if(this.Service == uuid){
        //console.log("Service Value = " + value);
        this.ServiceValue == value;
        
        if(value == "1") {
            
           // console.log("Service Mode = All off for: " + this.name);
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
    
    if(this.stateMode == uuid && this.ServiceValue != "1"){
        //console.log("Got new state for Mode " + this.name + ": " + value)
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
                this.targetHcState = 3;
                this.setFromLoxone = true;
                this.otherService
                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
                .setValue(this.targetHcState, function() {
                          this.setFromLoxone = false;
                          }.bind(this));
                return;
            case 3:
                this.targetHcState = 3;
                this.setFromLoxone = true;
                this.otherService
                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
                .setValue(this.targetHcState, function() {
                          this.setFromLoxone = false;
                          }.bind(this));
                return;
            case 4:
                this.targetHcState = 3;
                this.setFromLoxone = true;
                this.otherService
                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
                .setValue(this.targetHcState, function() {
                          this.setFromLoxone = false;
                          }.bind(this));
                return;
            case 5:
                this.targetHcState = 1;
                this.setFromLoxone = true;
                this.otherService
                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
                .setValue(this.targetHcState, function() {
                          this.setFromLoxone = false;
                          }.bind(this));
                return;
            case 6:
                this.targetHcState = 2;
                this.setFromLoxone = true;
                this.otherService
                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
                .setValue(this.targetHcState, function() {
                          this.setFromLoxone = false;
                          }.bind(this));
                return;
        }
    }
    
    if(uuid == this.ProfileZero){
        //console.log("Got new state for ProfileTemp 0: " + value + " " + this.name);
        this.ProfileTempZero = value; // Economy Basis - Value
    }
    if(uuid == this.ProfileOne){
        //console.log("Got new state for ProfileTemp 1: " + value + " " + this.name);
        this.ProfileTempOne = value; // Comfort heating Basis
    }
    if(uuid == this.ProfileTwo){
        //console.log("Got new state for ProfileTemp 2: " + value + " " + this.name);
        this.ProfileTempTwo = value; // Comfort Cooling Basis
    }
    if(uuid == this.ProfileThree){
        //console.log("Got new state for ProfileTemp 3: " + value + " " + this.name);
        this.ProfileTempThree = value; // Emty House Value
    }
    if(uuid == this.ProfileFour){
        //console.log("Got new state for ProfileTemp 4: " + value + " " + this.name);
        this.ProfileTempFour = value; // Heat Protection Value
    }
    if(uuid == this.ProfileFive){
        //console.log("Got new state for ProfileTemp 5: " + value + " " + this.name);
        this.ProfileTempFive = value; // Increased Heat Basis + Value
    }
    if(uuid == this.ProfileSix){
        //console.log("Got new state for ProfileTemp 6: " + value + " " + this.name);
        this.ProfileTempSix = value; // Party Basis - Value
    }
    if(uuid == this.ProfileSeven){
        //console.log("Got new state for ProfileTemp 7: " + value + " " + this.name);
        this.ProfileTempSeven = value; // Manual
    }

}



TemperatureItem.prototype.getOtherServices = function() {
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

TemperatureItem.prototype.getTergetTemperature = function(callback) {
   callback(undefined, this.targetTemperature);
};

TemperatureItem.prototype.getCurrentTemperature = function(callback) {
    callback(undefined, this.currentTemperature);
};

TemperatureItem.prototype.getTargetHeatingCoolingState = function(callback) {
    callback(undefined, this.targetHcState);
};


TemperatureItem.prototype.setTargetHeatingCoolingState = function(ValueHc, callback) {
    
    //sending new state (ValueHc) to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback
    
    var self = this;
    
    //console.log("TemperatureItem setTargetHcState : " + ValueHc);
    
    
    if (this.setInitialState) {
        this.setInitialState = false;
        callback();
        return;
    }
    
    if (this.setFromLoxone) {
        //console.log("setTergetHcState setFromLoxone");
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
        var command = "service/0"; //Loxone expects a Value 0-4
        this.platform.ws.sendCommand(this.uuidAction, command);
        
        //Command for Mode
        command = "mode/5"; //Loxone expects a Value 0-6
        this.platform.ws.sendCommand(this.uuidAction, command);
       // this.log(this.name + " Command " + command);
        callback();
    }
    
    if(ValueHc == 2){
        //Deaktivate Service
        var command = "service/0"; //Loxone expects a Value 0-4
        this.platform.ws.sendCommand(this.uuidAction, command);
        
        //Command for Mode
        command = "mode/6"; //Loxone expects a Value 0-6
        this.platform.ws.sendCommand(this.uuidAction, command);
        //this.log(this.name + " Command " + command);
        callback();
    }
    
    if(ValueHc == 3){
        //Deaktivate Service
        var command = "service/0"; //Loxone expects a Value 0-4
        this.platform.ws.sendCommand(this.uuidAction, command);
        
        //Command for Mode
        command = "mode/0"; //Loxone expects a Value 0-6
        this.platform.ws.sendCommand(this.uuidAction, command);
        //this.log(this.name + " Command " + command);
        callback();
    }
    
    if(ValueHc == 0){
        // Use Service to turn Valve off
        var command = "service/1"; //Loxone expects a Value 0-4
        this.platform.ws.sendCommand(this.uuidAction, command);
        //this.log(this.name + " Command " + command);
        callback();
    }
}


TemperatureItem.prototype.setTergetTemperature = function(Value, callback) {
    
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
    
    if(this.currentProfile == undefined) {
        //happens at initial load
        callback();
        return;
    }
    
    if(this.targetHcState == undefined) {
        //happens at initial load
        callback();
        return;
    }
    
        if(this.currentProfile == "3" || this.currentProfile == "4"){
            // Changes in Profile 3,4 and 7 are not allowed
            this.OldProfile = undefined;
            this.OldProfileValue = undefined;
            this.ProfileChanged = false;
            //this.log("Current Profile: " + this.name + " " + Value + " " + this.currentProfile);
           callback();
            return;
   }
    
    if(this.targetHcState == "3" && this.currentProfile != "7"){
    
        if(this.currentProfile == "0") {
            // For Profile 0 we have to add the ProfileValue to the target Value
            this.log("Value original: " + this.name + " " + Value + " " + this.ProfileTempZero);
            this.OldProfileValue = Value;
            this.OldProfile = this.currentProfile;
            Value = Value + this.ProfileTempZero;
            this.ProfileChanged = true;
            // this.log("Value after Offset: " + this.name + " " + Value);
        }
        if(this.currentProfile == "5") {
            // For Profile 5 we have to sub the ProfileValue to the target Value
            this.log("Value original: " + this.name + " " + Value + " " + this.ProfileTempFive);
            this.OldProfileValue = Value;
            this.OldProfile = this.currentProfile;
            Value = Value - this.ProfileTempFive;
            this.ProfileChanged = true;
            //this.log("Value after Offset: " + this.name + " " + Value);
        }
        if(this.currentProfile == "6") {
            // For Profile 6 we have to add the ProfileValue to the target Value
            this.log("Value original: " + this.name + " " + Value + " " + this.ProfileTempSix);
            this.OldProfileValue = Value;
            this.OldProfile = this.currentProfile;
            Value = Value + this.ProfileTempSix;
            this.ProfileChanged = true;
            // this.log("Value after Offset: " + this.name + " " + Value);
        }

        //this.log("[ Target Temperature] iOS - send Value message to " + this.name + " " + "Profile: " + this.currentProfile  + "/" + Value);
        var command = "settemp/1/" + Value; //Loxone expects a Value between 10 and 38
        this.platform.ws.sendCommand(this.uuidAction, command);
        //this.log(this.name + " Command " + command);
        callback();
    }
    
    if(this.currentProfile == "7" && (this.targetHcState == "1" || this.targetHcState == "2")){
        //this.log("[ Target Temperature] iOS - send Value message to " + this.name + " " + "Profile: " + this.currentProfile  + "/" + Value);
        var command = "settemp/" + this.currentProfile + "/" + Value; //Loxone expects a Value between 10 and 38
        this.platform.ws.sendCommand(this.uuidAction, command);
        //this.log(this.name + " Command " + command);
        callback();
    }
}

module.exports = TemperatureItem;

"use strict";

var request = require("request");


var IRCV2Item = function(widget,platform,homebridge) {

    
    this.platform = platform;
    this.uuidAction = widget.uuidAction;
    this.stateActual = widget.states.tempActual;
    this.stateOverride = widget.states.overrideEntries;
    //this.stateMode = widget.states.operatingMode;
    this.stateTarget = widget.states.tempTarget;
    this.stateHeatingOn = widget.states.prepareState;	
    this.stateHeatingTemp = widget.states.comfortTemperature;
    this.stateCoolingTemp = widget.states.comfortTemperatureCool;
    this.stateEcoMinTempOffset = widget.states.absentMinOffset;  
    this.stateEcoMaxTempOffset = widget.states.absentMaxOffset;  
    this.stateActiveMode =  widget.states.activeMode;   
	
    // this.targetOperatingState = widget.states.operatingMode;
    this.ServiceValue = undefined;
       
    IRCV2Item.super_.call(this, widget,platform,homebridge);
};
    
// Register a listener to be notified of changes in this items value
IRCV2Item.prototype.initListener = function() {
    this.platform.ws.registerListenerForUUID(this.stateActual, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateTarget, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateHeatingOn, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateHeatingTemp, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateCoolingTemp, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateEcoMinTempOffset, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateEcoMaxTempOffset, this.callBack.bind(this));	
    this.platform.ws.registerListenerForUUID(this.stateMode, this.callBack.bind(this));
  //  this.platform.ws.registerListenerForUUID(this.stateCurrentMode, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateActiveMode, this.callBack.bind(this));
    //this.platform.ws.registerListenerForUUID(this.operatingMode, this.callBack.bind(this));
 //   this.platform.ws.registerListenerForUUID(this.targetOperatingState, this.callBack.bind(this));
    
       
};


IRCV2Item.prototype.callBack = function(value, uuid) {
    //function that gets called by the registered ws listener
    console.log("Funtion value " + value + " " + uuid);
    
	if(this.stateHeatingOn == uuid){
       this.HeatintOn = value;
       console.log("Got new state for heating                        mode " + this.name + ": " + this.HeatingOn);
	}
    
    if(this.stateActiveMode == uuid){
       this.activeMode = value;
       console.log("Got new state for active mode " + this.name + ": " + this.activeMode);
    
     switch (value) {
	     case 0:
		     this.economymode = true;
		     console.log("economy mode enabled");
		     this.manual = false;     
              this.targetHcState = 3;
		this.heatingTargetTemp = this.heatingTargetTemp - this.EcoMinTempOffset;
		this.coolingTargetTemp = this.coolingTargetTemp + this.EcoMaxTempOffset;
              this.setFromLoxone = true;
                this.otherService
                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
                .setValue(this.targetHcState, function() {
                          this.setFromLoxone = false;
                          }.bind(this));
	         this.otherService
                 .getCharacteristic(this.homebridge.hap.Characteristic.HeatingThresholdTemperature)
       		 .setValue(this.heatingTargetTemp, function() {
                  this.setFromLoxone = false;
                  }.bind(this));
			   this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.CoolingThresholdTemperature)
        .setValue(this.coolingTargetTemp, function() {
                  this.setFromLoxone = false;
                  }.bind(this)); 
		     return;
	     case 1:
              this.economymode = false;
	      this.manual = false;     
              this.targetHcState = 3;
                this.setFromLoxone = true;
                this.otherService
                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
                .setValue(this.targetHcState, function() {
                          this.setFromLoxone = false;
                          }.bind(this));
		      this.otherService
                 .getCharacteristic(this.homebridge.hap.Characteristic.HeatingThresholdTemperature)
       		 .setValue(this.heatingTargetTemp, function() {
                  this.setFromLoxone = false;
                  }.bind(this));
			   this.otherService
             .getCharacteristic(this.homebridge.hap.Characteristic.CoolingThresholdTemperature)
             .setValue(this.coolingTargetTemp, function() {
                  this.setFromLoxone = false;
                  }.bind(this)); 
              return;
             case 2:
                this.targetHcState = 0;
		this.economymode = false;
                this.setFromLoxone = true;
                this.manual = true;
                this.otherService
                .getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
                .setValue(this.targetHcState, function() {
                          this.setFromLoxone = false;
                          }.bind(this));
		     
              return;
             case 3:
                this.manual = true;
		this.economymode = false;
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
 
    if(this.stateEcoMinTempOffset == uuid){
       this.EcoMinTempOffset = value;
    console.log("Got new state for EcoMinTempOffset " + this.name + ": " + this.EcoMinTempOffset );
    
    //also make sure this change is directly communicated to HomeKit
   
}
	if(this.stateEcoMaxTempOffset == uuid){
       this.EcoMaxTempOffset = value;
    console.log("Got new state for EcoMaxTempOffset " + this.name + ": " + this.EcoMaxTempOffset);
    
    //also make sure this change is directly communicated to HomeKit
   
}
    if(this.stateTarget == uuid){
	    if(this.economymode){}
	    else{
        this.targetTemperature = value;
        console.log("Got new state for Target Temp " + this.name + ": " + this.targetTemperature);
        
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
    }
    
    
    if(this.stateHeatingTemp == uuid){
     
    this.heatingTargetTemp = value;
	     console.log("Got new state for Target Heating Temp (withOUT offset) " + this.name + ": " + value);
	     
        
        
        if(this.heatingTargetTemperature < "10"){
            // min Value of Thermostat
            this.heatingTargetTemp = 10;
        }
        
        if(this.heatingTargetTemp > "38"){
            // max Value of Thermostat
            this.heatingTargetTemp = 38;
        }
        
        //also make sure this change is directly communicated to HomeKit
        this.setFromLoxone = true;
     //   console.log("Loxone State heatingTargetTemp (should be true): " + this.setFromLoxone);
        this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.HeatingThresholdTemperature)
        .setValue(this.heatingTargetTemp, function() {
                  this.setFromLoxone = false;
                  }.bind(this)
                  );
      //  console.log("Loxone State tergetTemp (should be false): " + this.setFromLoxone);
                
    }   
    
    if(this.stateCoolingTemp == uuid){
  
       this.coolingTargetTemp = value;

        console.log("Got new state for Target Cooling Temp " + this.name + ": " + value);
        
        if(this.coolingTargetTemp < "10"){
            // min Value of Thermostat
            this.heatingTargetTemp = 10;
        }
        
        if(this.coolingTargetTemp > "38"){
            // max Value of Thermostat
            this.heatingTargetTemp = 38;
        }
        
        //also make sure this change is directly communicated to HomeKit
        this.setFromLoxone = true;
    //    console.log("Loxone State heatingTargetTemp (should be true): " + this.setFromLoxone);
        this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.CoolingThresholdTemperature)
        .setValue(this.coolingTargetTemp, function() {
                  this.setFromLoxone = false;
                  }.bind(this)
                  );
   //     console.log("Loxone State tergetTemp (should be false): " + this.setFromLoxone);
          
     
    }   
        
        
    if(this.stateActual == uuid){
    this.currentTemperature = value;
    console.log("Got new state  " + this.name + ": " + this.currentTemperature);
    
    //also make sure this change is directly communicated to HomeKit
    this.otherService
    .getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature)
    .setValue(this.currentTemperature);
    if(this.economymode){   // take a look what the valve is doing
        if(this.currentTemperature > this.coolingTargetTemp + this.EcoMaxTempOffset && this.currentTemperature != undefined && this.coolingTargetTemp != undefined){
            // Current Cooling
         //   console.log("Valve is cooling: " + this.name + " " + this.currentTemperature + " > " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(2);
        }
        
        if(this.currentTemperature < this.heatingTargetTemp - this.EcoMinTempOffset && this.currentTemperature != undefined && this.heatingTargetTemp != undefined){
            // Current Heating
        //    console.log("Valve is heating: " + this.name + " " + this.currentTemperature + " < " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(1);
        }
        
        if(this.currentTemperature > this.heatingTargetTemp && this.currentTemperature < this.coolingTargetTemp && this.currentTemperature != undefined && this.coolingTargetTemp != undefined  && this.heatingTargetTemp != undefined){
            // Current Heating and Cooling off
          //  console.log("Valve is off: " + this.name + " " + this.currentTemperature + " = " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(0);
        }}
       else if(this.manual){
        // take a look what the valve is doing
        if(this.currentTemperature > this.targetTemperature && this.currentTemperature != undefined && this.targetTemperature != undefined){
            // Current Cooling
         //   console.log("Valve is cooling: " + this.name + " " + this.currentTemperature + " > " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(2);
        }
        
        if(this.currentTemperature < this.targetTemperature && this.currentTemperature != undefined && this.targetTemperature != undefined){
            // Current Heating
        //    console.log("Valve is heating: " + this.name + " " + this.currentTemperature + " < " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(1);
        }
        
        if(this.currentTemperature == this.targetTemperature && this.currentTemperature != undefined && this.targetTemperature != undefined ){
            // Current Heating and Cooling off
          //  console.log("Valve is off: " + this.name + " " + this.currentTemperature + " = " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(0);
        }
    }
       else {
        // take a look what the valve is doing
        if(this.currentTemperature > this.coolingTargetTemp && this.currentTemperature != undefined && this.coolingTargetTemp != undefined){
            // Current Cooling
         //   console.log("Valve is cooling: " + this.name + " " + this.currentTemperature + " > " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(2);
        }
        
        if(this.currentTemperature < this.heatingTargetTemp && this.currentTemperature != undefined && this.heatingTargetTemp != undefined){
            // Current Heating
        //    console.log("Valve is heating: " + this.name + " " + this.currentTemperature + " < " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(1);
        }
        
        if(this.currentTemperature > this.heatingTargetTemp && this.currentTemperature < this.coolingTargetTemp && this.currentTemperature != undefined && this.coolingTargetTemp != undefined  && this.heatingTargetTemp != undefined){
            // Current Heating and Cooling off
          //  console.log("Valve is off: " + this.name + " " + this.currentTemperature + " = " + this.targetTemperature);
            this.otherService
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
            .setValue(0);
        }
    }}
    
     
    
}



IRCV2Item.prototype.getOtherServices = function() {
    //setting variable to skip update for intial Value
    this.setInitialState = true;
    
    var otherService = new this.homebridge.hap.Service.Thermostat();
    
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.TargetTemperature)
    .on('set', this.setTergetTemperature.bind(this))
    .on('get', this.getTergetTemperature.bind(this))
    .setValue(this.targetTemperature);
    
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.CoolingThresholdTemperature)
    .on('set', this.setCoolingTemperature.bind(this))
    .on('get', this.getCoolingTemperature.bind(this))
    .setValue(this.coolingTargetTemp);
    
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.HeatingThresholdTemperature)
    .on('set', this.setHeatingTemperature.bind(this))
    .on('get', this.getHeatingTemperature.bind(this))
    .setValue(this.heatingTargetTemp);
    
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

IRCV2Item.prototype.getTergetTemperature = function(callback) {
   callback(undefined, this.targetTemperature);
};

IRCV2Item.prototype.getCurrentTemperature = function(callback) {
    callback(undefined, this.currentTemperature);
};

IRCV2Item.prototype.getTargetHeatingCoolingState = function(callback) {
    callback(undefined, this.targetHcState);
};

IRCV2Item.prototype.getCoolingTemperature = function(callback) {
    callback(undefined, this.coolingTargetTemp);
};

IRCV2Item.prototype.getHeatingTemperature = function(callback) {
    callback(undefined, this.heatingTargetTemp);
};



IRCV2Item.prototype.setTargetHeatingCoolingState = function(ValueHc, callback) {
    
    //sending new state (ValueHc) to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback
    
    
    //getting seconds since 2009
    var date2009 = new Date("2009-01-01 00:00:00");
    //console.log("date 2010 in seconds" + date2009.getTime())
      
    var datenow = new Date();
    var datetomorrow = new Date();
	datetomorrow.setDate(datenow.getDate()+1)
    datetomorrow.setHours(0,0);
    //console.log("date now in seconds" + datenow.getTime())
    let timer = Math.round((Math.abs(datenow - date2009))/1000 + 6000);
    let timer2 = Math.round((Math.abs(datetomorrow - date2009))/1000);
    var self = this;
    
    console.log("TemperatureItem setTargetHcState : " + ValueHc);
    
    
    if (this.setInitialState) {
        this.setInitialState = false;
        console.log("setManualCoolingTemperature initial state = true");
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
   
        var command = "override/3/"+ timer +"/"+this.targetTemperature; 
        this.platform.ws.sendCommand(this.uuidAction, command);
        this.log(this.name + " Command " + command);
        callback();
    }
    
    if(ValueHc == 2){
        //Deaktivate Service
        //var command = "service/0"; //Loxone expects a Value 0-4
        //this.platform.ws.sendCommand(this.uuidAction, command);
        
        //Command for Mode
        var command = "override/3/"+ timer +"/"+ this.targetTemperature; 
        this.platform.ws.sendCommand(this.uuidAction, command);
        this.log(this.name + " Command valueHc =2 " + command);
        callback();
    }
    
    if(ValueHc == 3){
        //Deaktivate Service
        //var command = "service/0"; //Loxone expects a Value 0-4
        //this.platform.ws.sendCommand(this.uuidAction, command);
        
        //Command for Mode
	    this.ComfortTemperature = 
        command = "stopOverride"; //Loxone expects a Value 0-6
        this.platform.ws.sendCommand(this.uuidAction, command);
        this.log(this.name + " Command " + command);
        callback();
    }
    
    if(ValueHc == 0){
        // Use Service to turn Valve off
        var command = "override/2/"+ timer2 +"/"+ this.targetTemperature; 
        this.platform.ws.sendCommand(this.uuidAction, command);
        this.log(this.name + " Command " + command);
        callback();
    }
}

IRCV2Item.prototype.setTergetTemperature = function(Value, callback) {
    //sending new state (Value) to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback
    
    var self = this;
    
    console.log("TemperatureItem setTergetTemperature: " + this.heatingTargetTemp);
   console.log("TemperatureItem setTergetTemperature: " + Value);  
    if (this.setInitialState) {
        this.setInitialState = false;
        console.log("setManualCoolingTemperature initial state = true");
        callback();
        return;
    }
    
    if (this.setFromLoxone) {
        console.log("setHeatingTemperature setFromLoxone");
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
        this.log(this.name + " Command " + command);
        callback();
    
}



IRCV2Item.prototype.setHeatingTemperature = function(Value, callback) {
    //sending new state (Value) to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback
    
    var self = this;
    
    console.log("TemperatureItem setHeatingTemperature: " + this.heatingTargetTemp);
   console.log("TemperatureItem setHeatingTemperature: " + Value);  
    if (this.setInitialState) {
        this.setInitialState = false;
        console.log("setManualCoolingTemperature initial state = true");
        callback();
        return;
    }
    
    if (this.setFromLoxone) {
        console.log("setHeatingTemperature setFromLoxone");
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
	//to set a new temperature, a timer of 2 hours is started on manual mode at the given new temperature. When timer is finished, loxone will return to default
	
	  //getting seconds since 2009
    		var date2009 = new Date("2009-01-01 00:00:00");
   		 //console.log("date 2010 in seconds" + date2009.getTime())
       		 var datenow = new Date();
		let timer = Math.round((Math.abs(datenow - date2009))/1000 + 6000);
		var command = "override/1/"+ timer ; //+ "/" + this.heatingTargetTemp; 
		this.platform.ws.sendCommand(this.uuidAction, command);
       		 this.log(this.name + " Command " + command);
       		 callback();
	/*
	if(this.economymode){
		//var temperature = Value + this.EcoMaxTempOffset- this.heatingTargetTemp ;
		var temperature = Value - this.heatingTargetTemp
		this.heatingTargetTemp = temperature;
		      this.otherService
                 .getCharacteristic(this.homebridge.hap.Characteristic.HeatingThresholdTemperature)
       		 .setValue(this.heatingTargetTemp, function() {
                  this.setFromLoxone = false;
                  }.bind(this));
		  //getting seconds since 2009
    		var date2009 = new Date("2009-01-01 00:00:00");
   		 //console.log("date 2010 in seconds" + date2009.getTime())
      
   		 var datenow = new Date();
   		 var command = "setComfortModeTemp/" + temperature; //Loxone expects a Value between 10 and 38
    		 this.platform.ws.sendCommand(this.uuidAction, command);
        	this.log(this.name + " Command " + command);
 		   //console.log("date now in seconds" + datenow.getTime())
 		  let timer = Math.round((Math.abs(datenow - date2009))/1000 + 6000);
 		  var command = "override/1/"+ timer ; //+ "/" + this.targetTemperature; 
		//this.platform.ws.sendCommand(this.uuidAction, command);
       		// this.log(this.name + " Command " + command);
	}
	else{ var temperature = Value - this.heatingTargetTemp ; // 
     var command = "setComfortModeTemp/" + temperature; //Loxone expects a Value between 10 and 38
        this.platform.ws.sendCommand(this.uuidAction, command);
        this.log(this.name + " Command " + command);}
        callback();
    */
}

IRCV2Item.prototype.setCoolingTemperature = function(Value, callback) {
    //sending new state (Value) to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback
    
    var self = this;
    
    console.log("TemperatureItem setManualCoolingTemperature: " + this.coolingTargetTemp);
    
    if (this.setInitialState) {
        this.setInitialState = false;
        console.log("setManualCoolingTemperature initial state = true");
        callback();
        return;
    }
    
    if (this.setFromLoxone) {
        console.log("setManualCoolingTemperature setFromLoxone");
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
	
	if(this.economymode){
		var temperature = Value - this.EcoMinTempOffset;
	}
	else{ var temperature = Value ;}
     var command = "setComfortTemperatureCool/" + temperature; //Loxone expects a Value between 10 and 38
        this.platform.ws.sendCommand(this.uuidAction, command);
        this.log(this.name + " Command " + command);
        callback();
    
}

    
  
module.exports = IRCV2Item;

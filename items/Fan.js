const request = require("request");

const Fan = function(widget,platform,homebridge) {

    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a switch, use the uuidAction
    this.currentState = undefined; //will be 0 or 1 for Switch

    Fan.super_.call(this, widget,platform,homebridge);
};

// Register a listener to be notified of changes in this items value
Fan.prototype.initListener = function() {
    //this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.uuidAction, this.callBack.bind(this));
};

Fan.prototype.callBack = function(value) {
    //function that gets called by the registered ws listener
    if (value == -1) {
        //console.log("Got new state for Timed Fan: On");
    } else if (value == 0) {
        //console.log("Got new state for Timed Fan: Off");
    } else if (value > 0) {
        //console.log("Got new state for Timed Fan: Countdown " + value + "s");
    }
    
    this.currentState = (value !== 0);

    //console.log('set currentState to: ' + this.currentState)

    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.On)
        .updateValue(this.currentState);
};

Fan.prototype.getOtherServices = function() {
    const otherService = new this.homebridge.hap.Service.Fan();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        //.updateValue(this.currentState == '1');

    return otherService;
};

Fan.prototype.getItemState = function(callback) {
    //returns true if currentState is 1
    callback(undefined, this.currentState);
};

Fan.prototype.setItemState = function(value, callback) {

    //sending new state to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback



    let command = 0;
    if (value == true) {
        this.log('perm on ***');
        command = 'Pulse';//-1; // perm on
    } else {
        this.log('off ***');
        command = 'Off';//0; // off
    }

    //this.log('setItemState value: ' + value);
    //this.log('setItemState command: ' + command);

    this.log(`[timedswitch] iOS - send message to ${this.name}: ${command}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();

};

module.exports = Fan;


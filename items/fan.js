const request = require("request");

const FanItem = function(widget,platform,homebridge) {

    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a fan, use the uuidAction
    this.currentState = undefined; //will be 0 or 1 for Switch

    FanItem.super_.call(this, widget,platform,homebridge);
};

// Register a listener to be notified of changes in this items value
FanItem.prototype.initListener = function() {
    //this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.uuidAction, this.callBack.bind(this));
};

FanItem.prototype.callBack = function(value) {
    //function that gets called by the registered ws listener
    if (value == -1) {
        //console.log("Got new state for Fan: On");
    } else if (value == 0) {
        //console.log("Got new state for Fan: Off");
    } else if (value > 0) {
        //console.log("Got new state for Fan: Countdown " + value + "s");
    }
    
    this.currentState = (value !== 0);

    //console.log('set currentState to: ' + this.currentState)

    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.On)
        .updateValue(this.currentState);
};

FanItem.prototype.getOtherServices = function() {
    const otherService = new this.homebridge.hap.Service.Fan();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        //.updateValue(this.currentState == '1');

    return otherService;
};

FanItem.prototype.getItemState = function(callback) {
    //returns true if currentState is 1
    callback(undefined, this.currentState);
};

FanItem.prototype.setItemState = function(value, callback) {

    //sending new state to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback



    let command = 0;
    if (value == true) {
        //this.log('perm on ***');
        command = 'On';//-1; // perm on
    } else {
        //this.log('off ***');
        command = 'Off';//0; // off
    }

    //this.log('setItemState value: ' + value);
    //this.log('setItemState command: ' + command);

    this.log(`[fan] iOS - send message to ${this.name}: ${command}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();

};

module.exports = FanItem;


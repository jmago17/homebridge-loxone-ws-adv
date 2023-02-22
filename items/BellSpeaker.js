const request = require("request");

const bellSpeaker = function(widget,platform,homebridge) {

    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a switch, use the uuidAction
    this.stateUuid = widget.states.active; //a switch always has a state called active, which is the uuid which will receive the event to read
    this.mute = undefined; //will be 0 or 1 for speaker

    bellSpeaker.super_.call(this, widget,platform,homebridge);
};

// Register a listener to be notified of changes in this items value
bellSpeaker.prototype.initListener = function() {
    this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
};

bellSpeaker.prototype.callBack = function(value) {
    //function that gets called by the registered ws listener
    //console.log("Got new state for switch: " + value);
    this.currentState = value;

    //also make sure this change is directly communicated to HomeKit
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.On)
        .updateValue(this.currentState == '1');
};

bellSpeaker.prototype.getOtherServices = function() {
    const otherService = new this.homebridge.hap.Service.Speaker();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.Mute)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        .updateValue(this.currentState == '1');

    return otherService;
};

bellSpeaker.prototype.getItemState = function(callback) {
    //returns true if currentState is 1
    callback(undefined, this.currentState == '1');
};

bellSpeaker.prototype.onCommand = () => {
    //function to set the command to be used for On
    //for a switch, this is 'On', but subclasses can override this to eg Pulse
    return 'On';
};

bellSpeaker.prototype.setItemState = function(value, callback) {

    //sending new state to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback

    const self = this;
	
    const command = (value == '1') ? this.onCommand() : 'Off';
    this.log(`[switch] iOS - send message to ${this.name}: ${command}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();

};

module.exports = bellSpeaker;

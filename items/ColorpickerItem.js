const request = require("request");

const ColorItem = function(widget, platform, homebridge) {

    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a colorpicker, use the uuidAction
    this.stateUuid = widget.states.color; //a colorpicker always has a state called color, which is the uuid which will receive the event to read

    this.adaptive = 0;
    this.colorTemperature = 0;
    this.hue = 0;
    this.saturation = 0;
    this.brightness = 0;
    this.power = false;

    this.colorTemperature.minValue = 50; // HAP default values
    this.colorTemperature.maxValue = 400;

    ColorItem.super_.call(this, widget, platform, homebridge);
};

// Register a listener to be notified of changes in this items value
ColorItem.prototype.initListener = function() {
    this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
};

ColorItem.prototype.callBack = function(value, uuid) {
    //function that gets called by the registered ws listener
    console.log("Got new state for color " + value + ", uuid: " + uuid);

    //incoming value is a HSV string that needs to be parsed
    let m;
    if (m = value.match(/^\W*hsv?\(([^)]*)\)\W*$/i)) {
        var params = m[1].split(',');
        const re = /^\s*(\d*)(\.\d+)?\s*$/;
        let mH, mS, mV;
        if (
            params.length >= 3 &&
            (mH = params[0].match(re)) &&
            (mS = params[1].match(re)) &&
            (mV = params[2].match(re))
        ) {
            const h = parseFloat((mH[1] || '0') + (mH[2] || ''));
            const s = parseFloat((mS[1] || '0') + (mS[2] || ''));
            const v = parseFloat((mV[1] || '0') + (mV[2] || ''));

            this.hue = parseInt(h);
            this.saturation = parseInt(s);
            this.brightness = parseInt(v);
            this.power = this.brightness > 0;
        }
    } else if (m = value.match(/^\W*temp?\(([^)]*)\)\W*$/i)) {
        var params = m[1].split(',');

        // could also be a colour temp update in the form: temp(100,4542)
        this.brightness = parseInt(params[0]);
        this.colorTemperature = parseInt(params[1]);
        this.power = this.brightness > 0;

    }

    //also make sure this change is directly communicated to HomeKit
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.On)
        .updateValue(this.power);
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.Brightness)
        .updateValue(this.brightness);
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.Hue)
        .updateValue(this.hue);
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.Saturation)
        .updateValue(this.saturation);
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.ColorTemperature)
        .updateValue(this.colorTemperature);

};

ColorItem.prototype.getOtherServices = function() {

    const otherService = new this.homebridge.hap.Service.Lightbulb();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemPowerState.bind(this))
        .on('get', this.getItemPowerState.bind(this))
        .updateValue(this.power);

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.Brightness)
        .on('set', this.setItemBrightnessState.bind(this))
        .on('get', this.getItemBrightnessState.bind(this))
        .updateValue(this.brightness);

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.Hue)
        .on('set', this.setItemHueState.bind(this))
        .on('get', this.getItemHueState.bind(this))
        .updateValue(this.hue);

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.Saturation)
        .on('set', this.setItemSaturationState.bind(this))
        .on('get', this.getItemSaturationState.bind(this))
        .updateValue(this.saturation);

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.ColorTemperature)
        .on("get", this.getColorTemperature.bind(this))
        .on("set", this.setColorTemperature.bind(this))
        .setProps({
            minValue: this.colorTemperature.minValue,
            maxValue: this.colorTemperature.maxValue
        })
        .updateValue(this.colorTemperature);   
        
    return otherService;
};

ColorItem.prototype.getOtherControllers = function() {
    const otherControllers = new this.homebridge.hap.Service.Lightbulb();
    this.adaptiveLightingController = new this.homebridge.hap.AdaptiveLightingController(otherService);
    return this.adaptiveLightingController;
}


ColorItem.prototype.getItemPowerState = function(callback) {
    callback(undefined, this.power);
};
ColorItem.prototype.getItemBrightnessState = function(callback) {
    callback(undefined, this.brightness);
};
ColorItem.prototype.getItemHueState = function(callback) {
    callback(undefined, this.hue);
};
ColorItem.prototype.getItemSaturationState = function(callback) {
    callback(undefined, this.saturation);
};

ColorItem.prototype.getColorTemperature = function(callback) {
    callback(undefined, this.saturation);
};

ColorItem.prototype.getItemAdaptiveLightingControllerState = function(callback) {
    return [this.adaptiveLightingController];
};


ColorItem.prototype.setColorTemperature = function(value, callback) {
    //compose hsv string
    const command = `temp(${this.colorTemperature},${this.brightness})`; //  temp({brightness},{temperature})
    this.log(`[color] iOS - send message to ${this.name}: ${command} uuid: ${this.uuid}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();
};


ColorItem.prototype.setItemPowerState = function(value, callback) {
    //sending new power state to loxone

    if (!value) {

        //loxone does not understand 'on' or 'off', we interpret Homekit 'off' as setting brightness to 0

        this.brightness = 0;

        this.setColorState(callback);

    } else {

        callback();

    }

};

ColorItem.prototype.setItemHueState = function(value, callback) {
    this.hue = parseInt(value);
    this.setColorState(callback);
};

ColorItem.prototype.setItemAdaptiveLightingControllerState = function(value, callback) {
    this.adaptive = value;
    this.setColorState(callback);
};

ColorItem.prototype.setItemSaturationState = function(value, callback) {
    this.saturation = parseInt(value);
    this.setColorState(callback);
};

ColorItem.prototype.setItemBrightnessState = function(value, callback) {
    this.brightness = parseInt(value);
    this.power = this.brightness > 0;
    this.setColorTemperature(callback);
};

ColorItem.prototype.setColorState = function(callback) {
    //compose hsv string
    const command = `hsv(${this.hue},${this.saturation},${this.brightness})`; //hsv({hue},{saturation},{value})
    this.log(`[color] iOS - send message to ${this.name}: ${command} uuid: ${this.uuid}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();
};

module.exports = ColorItem;

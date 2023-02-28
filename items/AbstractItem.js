const WSListener = require('../libs/WSListener.js');

const AbstractItem = function(widget,platform,homebridge) {
    this.platform = platform;
    this.widget =  widget;
    this.homebridge = homebridge;
    this.log = this.platform.log;
    this.name = widget.name;
    this.UUID = homebridge.hap.uuid.generate(String(widget.uuidAction));
    
    // provide explicit UUID to prevent automatic UUID generation by homebridge (which would fail because of possibly equal item name)
    this.uuid_base = this.UUID;

    //other variables used by child classes
    this.setFromLoxone = false;
    
	// console.log("Generating new homebridge accessory '" + this.name + "' with UUID: " + this.UUID + " from accessory with ID: " + widget.uuidAction);

    //Add as ACCESSORY (parent class)
    //AbstractItem.super_.call(this, this.name, this.UUID);
    new homebridge.platformAccessory(this.name, this.UUID);

};

AbstractItem.prototype.getServices = function() {
    this.informationService = this.getInformationServices();
    this.otherService = this.getOtherServices();
    console.log("before                if");
    if (this.otherService.testCharacteristic(Characteristic.ColorTemperature) && this.otherService.testCharacteristic(Characteristic.Brightness))  {
             console.log("INSIDE.                                                       if");
	    this.adaptiveLightingController = new this.homebridge.hap.AdaptiveLightingController(newService);
    }
    console.log("after                if");
    this.initListener();	
    return [this.informationService, this.otherService];
	
};

AbstractItem.prototype.getOtherServices = () => {

    return null;
};

AbstractItem.prototype.getInformationServices = function() {
    const informationService = new this.homebridge.hap.Service.AccessoryInformation();

    informationService
        .setCharacteristic(this.homebridge.hap.Characteristic.Manufacturer, 'Loxone')
        .setCharacteristic(this.homebridge.hap.Characteristic.Model, this.name)
        .setCharacteristic(this.homebridge.hap.Characteristic.SerialNumber, this.widget.uuidAction)
        .setCharacteristic(this.homebridge.hap.Characteristic.Name, this.name);
    return informationService;
};

AbstractItem.prototype.getControllers = function() {
        if (!this.adaptiveLightingController) {
            return [];
        } else {
            return [this.adaptiveLightingController];
        }
    };

module.exports = AbstractItem;

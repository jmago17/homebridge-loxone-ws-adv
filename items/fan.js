const FanItem = function(widget,platform,homebridge) {
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

FanItem.prototype.getOtherServices = function() {
    const otherService = new this.homebridge.hap.Service.Fan();

    this.item = 'Fan';

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        .updateValue(this.currentState == '1');

    return otherService;
};

module.exports = FanItem;

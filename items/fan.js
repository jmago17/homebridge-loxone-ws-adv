const FanItem = function(widget,platform,homebridge) {
    this.platform = platform;
    this.widget =  widget;
    this.homebridge = homebridge;
    this.log = this.platform.log;
    this.name = widget.name;
    this.UUID = homebridge.hap.uuid.generate(String(widget.uuidAction));
    
   
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

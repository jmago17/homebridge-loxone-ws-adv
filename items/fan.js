const FanItem = function(widget,platform,homebridge) {
    const TimedSwitchItem = function(widget,platform,homebridge) {

    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a switch, use the uuidAction
    this.currentState = undefined; //will be 0 or 1 for Switch

    FanItem.super_.call(this, widget,platform,homebridge);
};
    
   
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

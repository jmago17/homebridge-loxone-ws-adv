const request = require("request");

const OccupancyItem = function(widget,platform,homebridge) {
    OccupancyItem.super_.call(this, widget,platform,homebridge);
};

OccupancyItem.prototype.getOtherServices = function() {
    const otherService = new this.homebridge.hap.Service.Lightbulb();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        .updateValue(this.currentState == '1');

    return otherService;
};

module.exports = OccupancyItem;

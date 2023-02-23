const DaytimerItem = function (widget, platform, homebridge) {
    Characteristic = homebridge.hap.Characteristic;
    
    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a switch, use the uuidAction
    this.stateUuid = widget.states.value; //a
    

    DaytimerItem.super_.call(this, widget, platform, homebridge);
};

// Register a listener to be notified of changes in this items value
DaytimerItem.prototype.initListener = function () {
    this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
};

DaytimerItem.prototype.callBack = function (value) {
    //console.log("Got new state for sprinkler: " + value);

    this.currentState = value;

    this.otherService.getCharacteristic(Characteristic.Active).updateValue(this.currentState == '1');
    this.otherService.getCharacteristic(Characteristic.InUse).updateValue(this.currentState == '1');
};

DaytimerItem.prototype.getOtherServices = function () {
    if (this.uuidAction == '16412643-0387-e5b1-ffff5696e285f4cd'){
    const otherService = new this.homebridge.hap.Service.Valve();
    this.item = 'Caldera';
    
    otherService.getCharacteristic(Characteristic.ValveType).updateValue(0);
      
      // 0 = GENERIC VALVE
      // 1 = IRRIGATION
      // 2 = SHOWER HEAD
      // 3 = WATER FAUCET
    
    otherService.getCharacteristic(Characteristic.Active)
    .on('set', this.setItemState.bind(this))
    }
    return otherService;
};

DaytimerItem.prototype.setItemState = function (value, callback) {
    const command = (value == '1') ? 'On' : 'Off';
    this.log(`[${this.item}] - send message to ${this.name}: ${command}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();
};

module.exports = DaytimerItem;

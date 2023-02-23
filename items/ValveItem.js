const ValveItem = function(widget, platform, homebridge) {
    Characteristic = homebridge.hap.Characteristic;

    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a switch, use the uuidAction
    if (this.uuidAction == '1a9bc5a7-008b-05ef-ffff8795bbcbc15c') {
        this.stateUuid = widget.states.value;
        this.stateUuid = widget.states.override;
    } else {
        this.stateUuid = widget.states.active; //a switch always has a state called active, which is the uuid which will receive the event to read
    }
    this.currentState = undefined; //will be 0 or 1 for Switch
    this.autoTimer = undefined;

    ValveItem.super_.call(this, widget, platform, homebridge);
};

// Register a listener to be notified of changes in this items value
ValveItem.prototype.initListener = function() {
    this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
};

ValveItem.prototype.callBack = function(value) {
    //console.log("Got new state for sprinkler: " + value);

    this.currentState = value;

    this.otherService.getCharacteristic(Characteristic.Active).updateValue(this.currentState == '1');
    this.otherService.getCharacteristic(Characteristic.InUse).updateValue(this.currentState == '1');
};

ValveItem.prototype.getOtherServices = function() {
    const otherService = new this.homebridge.hap.Service.Valve();

    this.item = 'Valve';

    otherService.getCharacteristic(Characteristic.ValveType).updateValue(2);
    // 0 = GENERIC VALVE
    // 1 = IRRIGATION
    // 2 = SHOWER HEAD
    // 3 = WATER FAUCET

    otherService.getCharacteristic(Characteristic.Active)
        .on('set', this.setItemState.bind(this))

    return otherService;
};

ValveItem.prototype.setItemState = function(value, callback) {
        let command = "command";
        this.log(`[${this.item}] ${this.name} ${this.uuidAction} - send message to ${this.name}:` + value + command);
        if (this.uuidAction == '1a9bc5a7-008b-05ef-ffff8795bbcbc15c') {
            if (value == 0) {
                command = 'startOverride/1/7200';
            } else if (this.override == 0) {
                var now = new Date();
                var tomorrow = new Date();
                tomorrow.setDate(datenow.getDate() + 1)
                tomorrow.setHours(0, 0);
                let timer = Math.round((Math.abs(tomorrow - now)) / 1000);
                command = 'startOverride/0/timer';
            } else {
                command = "stopOverride";
            }
        } else {
            command = (value == 1) ? 'On' : 'Off';
        }
        this.log(`[${this.item}] - send message to ${this.name}: ${command}`);
        this.platform.ws.sendCommand(this.uuidAction, command);
        callback();;
}
module.exports = ValveItem;

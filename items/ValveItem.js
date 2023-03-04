const ValveItem = function(widget, platform, homebridge) {
    Characteristic = homebridge.hap.Characteristic;

    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a switch, use the uuidAction

    if (this.platform.Valves.length == 0) {
        this.stateUuid = widget.states.active;
        this.daytimer = false;
    } else {
        for (const item in this.platform.Valves) {

            if (this.uuidAction == item) {
                this.stateUuid = this.platform.Valves[item];
                this.override = false;
                this.daytimer = true;

            }
        }
    }
    /*
    if (this.uuidAction == '1a9bc5a7-008b-05ef-ffff8795bbcbc15c') {
        this.stateUuid = widget.states.value;
        this.override = false;
    } else {
        this.stateUuid = widget.states.active; //a switch always has a state called active, which is the uuid which will receive the event to read

    }*/
    this.currentState = undefined; //will be 0 or 1 for Switch
    this.autoTimer = undefined;

    ValveItem.super_.call(this, widget, platform, homebridge);
};
// Register a listener to be notified of changes in this items value
ValveItem.prototype.initListener = function() {
    this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));


};

ValveItem.prototype.callBack = function(value, uuid) {
    console.log("Funtion value " + value + " " + uuid);
    if (this.stateUuid == uuid) {
        this.currentState = value;

        this.otherService.getCharacteristic(Characteristic.Active).updateValue(this.currentState == '1');
        this.otherService.getCharacteristic(Characteristic.InUse).updateValue(this.currentState == '1');
    }

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
    this.log(`[${this.item}] ${this.name} ${this.uuidAction} - send message to ${this.name}:` + value + command + "override" + this.override);
    if (this.daytimer) {
        if (value == 1) {
            command = 'startOverride/1/7200';
            this.override = true;
        } else if (this.override) {
            command = "stopOverride";
            this.override = false;
        } else {
            var datenow = new Date();
            var datetomorrow = new Date();
            datetomorrow.setDate(datenow.getDate() + 1)
            datetomorrow.setHours(0, 0);
            //console.log("date now in seconds" + datenow.getTime())
            let timer = Math.round((Math.abs(datetomorrow - datenow)) / 1000);
            command = 'startOverride/0/' + timer;
        }
    } else {
        command = (value == 1) ? 'On' : 'Off';
    }
    this.log(`[${this.item}] - send message to ${this.name}: ${command}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();;
}
module.exports = ValveItem;

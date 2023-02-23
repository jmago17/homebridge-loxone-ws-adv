const ValveItem = function (widget, platform, homebridge) {
    Characteristic = homebridge.hap.Characteristic;
    
    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a switch, use the uuidAction
    if (this.uuidAction == '1a9bbf36-016d-daf5-ffff8795bbcbc15c'){    }
    else {
        this.stateUuid = widget.states.active; //a switch always has a state called active, which is the uuid which will receive the event to read
    }
    this.currentState = undefined; //will be 0 or 1 for Switch
    this.autoTimer = undefined;

    ValveItem.super_.call(this, widget, platform, homebridge);
};

// Register a listener to be notified of changes in this items value
ValveItem.prototype.initListener = function () {
    this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
};

ValveItem.prototype.callBack = function (value) {
    //console.log("Got new state for sprinkler: " + value);
 if (this.uuidAction == '1a9bbf36-016d-daf5-ffff8795bbcbc15c'){ 
 if (value == -1) {
        //console.log("Got new state for Timed Switch: On");
    } else if (value == 0) {
        //console.log("Got new state for Timed Switch: Off");
    } else if (value > 0) {
        //console.log("Got new state for Timed Switch: Countdown " + value + "s");
    }
    
    this.currentState = (value !== 0);

    //console.log('set currentState to: ' + this.currentState)

    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.On)
        .updateValue(this.currentState);
 } else {
    this.currentState = value;

    this.otherService.getCharacteristic(Characteristic.Active).updateValue(this.currentState == '1');
    this.otherService.getCharacteristic(Characteristic.InUse).updateValue(this.currentState == '1');
    }
};

ValveItem.prototype.getOtherServices = function () {
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

ValveItem.prototype.setItemState = function (value, callback) {
    let command = "command";
    if (this.uuidAction == '1a9bbf36-016d-daf5-ffff8795bbcbc15c'){ 
        if (value == 1){ 
         command = 'Pulse';
        } else { command = "Off";}
    } else {
        command = (value == 1) ? 'On' : 'Off';
    }
    this.log(`[${this.item}] - send message to ${this.name}: ${command}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();
};

module.exports = ValveItem;


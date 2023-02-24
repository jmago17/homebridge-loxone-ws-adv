const LockItem = function (widget, platform, homebridge) {
    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a switch, use the uuidAction
    this.stateUuid = widget.states.active; //a switch always has a state called active, which is the uuid which will receive the event to read
    this.currentState = widget.states.position; //will be 0 or 1 for Switch
       
    LockItem.super_.call(this, widget, platform, homebridge);
    var setFromLoxone = true;
};

// Register a listener to be notified of changes in this items value
LockItem.prototype.initListener = function () {
    this.platform.ws.registerListenerForUUID(this.currentState, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
     console.log('listeners lock item');
};

LockItem.prototype.callBack = function (value, uuid) {
    console.log("Got new state for lock: " + value + " " + uuid);
    this.setFromLoxone = true;
    if ( this.currentState = uuid){
         console.log("Got new state for lock: " + value + " " + uuid);
        let new_doorstate = value;
        if (value == 1) {
            this.otherService.getCharacteristic(Characteristic.LockTargetState).setValue('1');
            console.log('OPENed');
        } else { this.otherService.getCharacteristic(Characteristic.LockTargetState).setValue('0');
             console.log('closed');
               }    
    }
        
    if ( this.stateUuid = uuid){  
         let new_targetdoorstate = value;
         if (value == 1 || value == 0) {
              console.log('unlocked');
              this.otherService.getCharacteristic(Characteristic.LockCurrentState).setValue('0');
         } else { 
            this.otherService.getCharacteristic(Characteristic.LockCurrentState).setValue('1');
             console.log('locked');
         }
    }
   setFromLoxone = false;  
    
};

LockItem.prototype.getOtherServices = function () {
    const otherService = new this.homebridge.hap.Service.LockMechanism();

    otherService.setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
    otherService.setCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED);

    otherService.getCharacteristic(Characteristic.LockTargetState)
        .on('set', this.setItemState.bind(this))

    return otherService;
};



LockItem.prototype.setItemState = function (value, callback) {
    if(!setFromLoxone) {
    const command = (value != '1') ? 'open' : 'close';
    this.log(`[Lock] - send message to ${this.name}: ${command}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();
    }
    setFromLoxone = false;
};

module.exports = LockItem;

const LockItem = function (widget, platform, homebridge) {
    Characteristic = homebridge.hap.Characteristic;

    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a switch, use the uuidAction
    this.stateUuid = widget.states.active; //a switch always has a state called active, which is the uuid which will receive the event to read
    this.currentState = widget.states.position; //will be 0 or 1 for Switch
    
      
    this.currentdoorstate = homebridge.hap.Characteristic.CurrentDoorState.SECURED;
    this.targetdoorstate = homebridge.hap.Characteristic.CurrentDoorState.SECURED;
    
    LockItem.super_.call(this, widget, platform, homebridge);
};

// Register a listener to be notified of changes in this items value
LockItem.prototype.initListener = function () {
    this.platform.ws.registerListenerForUUID(this.currentState, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
};

LockItem.prototype.callBack = function (value, uuid) {
    console.log("Got new state for lock: " + value + " " + uuid);
    
    if ( this.currentState = uuid){
        let new_doorstate = this.currentdoorstate;
        if (value == 1) {
            new_doorstate = this.otherService.getCharacteristic(Characteristic.LockTargetState).setValue('1');
            //console.log('OPENING');
        } else { new_doorstate = this.otherService.getCharacteristic(Characteristic.LockTargetState).setValue('0');
             
               }    
    }
        
    if ( this.stateUuid = uuid){  
         let new_targetdoorstate = this.targetdoorstate;
         if (value == 1 || value == 0) {
             new_targetdoorstate = this.otherService.getCharacteristic(Characteristic.LockCurrentState).setValue('0');
         } else { 
            new_targetdoorstate = this.otherService.getCharacteristic(Characteristic.LockCurrentState).setValue('1');
         }
    }
     
    
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
    const command = (value != '1') ? 'open' : 'close';
    this.log(`[Lock] - send message to ${this.name}: ${command}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();
};

module.exports = LockItem;

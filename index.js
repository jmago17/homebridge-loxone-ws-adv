let Accessory, Service, Characteristic, UUIDGen;
const request = require("request");
const ItemFactory = require('./libs/ItemFactory.js');
const Utility = require('./libs/Utility.js');
const WSListener = require('./libs/WSListener.js');

module.exports = homebridge => {
    console.log(`homebridge API version: ${homebridge.version}`);

    // Accessory must be created from PlatformAccessory Constructor
    Accessory = homebridge.platformAccessory;

    // Keep refference to the passes API object
    Homebridge = homebridge;

    //Add inheritance of the AbstractItem to the Accessory object
    Utility.addSupportTo(ItemFactory.AbstractItem, Accessory);
        //All other items are child of the abstractItem
	Utility.addSupportTo(ItemFactory.Outlet, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.LightControllerV2MoodSwitch, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.TemperatureSensor, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.HumiditySensor, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.MotionSensor, ItemFactory.AbstractItem);
	Utility.addSupportTo(ItemFactory.Fan, ItemFactory.AbstractItem);
	Utility.addSupportTo(ItemFactory.ContactSensor, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.LightSensor, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.Dimmer, ItemFactory.AbstractItem);
	Utility.addSupportTo(ItemFactory.IRoomControllerV2, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.Colorpicker, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.Gate, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.DoorBell, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.Jalousie, ItemFactory.AbstractItem);
	//Utility.addSupportTo(ItemFactory.MusicSwitch, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.TemperatureItem, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.TemperatureItemActual, ItemFactory.AbstractItem);
	Utility.addSupportTo(ItemFactory.TimedSwitch, ItemFactory.AbstractItem);
	Utility.addSupportTo(ItemFactory.Alarm, ItemFactory.AbstractItem);
        Utility.addSupportTo(ItemFactory.Switch, ItemFactory.AbstractItem);
	 Utility.addSupportTo(ItemFactory.PresenceDetector, ItemFactory.AbstractItem);
            //Add childs of switch
            Utility.addSupportTo(ItemFactory.Lightbulb, ItemFactory.Switch);
            Utility.addSupportTo(ItemFactory.Pushbutton, ItemFactory.Switch);
	    Utility.addSupportTo(ItemFactory.Lock, ItemFactory.AbstractItem);
            Utility.addSupportTo(ItemFactory.Valve, ItemFactory.AbstractItem);
	   
    homebridge.registerPlatform("homebridge-loxoneWs", "LoxoneWs", LoxPlatform);
};

// Platform constructor
// config may be null
function LoxPlatform(log, config) {
    //log("LoxPlatform Init");
    const platform = this;
    this.log = log;
    this.config = config;
    this.protocol = "http";

    if (!this.config['host']) throw new Error("Configuration missing: loxone host (please provide the IP address here)");
    if (!this.config['port']) throw new Error("Configuration missing: loxone port (if default port, specify 7777)");
    if (!this.config['username']) throw new Error("Configuration missing: loxone username");
    if (!this.config['password']) throw new Error("Configuration missing: loxone password");
    if (!this.config['rooms']) this.log("Info: rooms array not configured. Adding every room.");

    this.host           = config["host"];
    this.port           = config["port"];
    this.username       = config["username"];
    this.password       = config["password"];
	
    //* Options *//
    if (!config['options']) {
        config['options'] = "";
    }
    const options = config['options'];

    this.rooms = [];
    if (options['rooms']) {
        this.rooms = options["rooms"];
    }

    this.moodSwitches = 'none';
    if (options['moodSwitches']) {
        this.moodSwitches = options["moodSwitches"];
    }

    this.radioSwitches = 1;
    if (options['radioSwitches'] !== undefined) {
        this.radioSwitches = options["radioSwitches"];
    }

    this.timedswitch_method = "pulse";
    if (options['stairwellSwitch'] == "on") {
        this.timedswitch_method = "on";
    }

    this.alarmsystem_method = "delayedon";
    if (options['alarmSystem'] == "on") {
        this.alarmsystem_method = "on";
    }

    this.alarmsystem_trigger = 5;
    if (options['alarmTrigerLevel']) {
        if (options['alarmTrigerLevel'] > 0 && options['alarmTrigerLevel'] < 7) {
            this.alarmsystem_trigger = options['alarmTrigerLevel'];
        } else {
            this.log("Info: alarmTrigerLevel must be an integer between 1 and 6");
        }
    }

    this.autoLock = 1;
    if (options['autoLock']) {
        this.autoLock = options['autoLock'];
    }

    this.autoLockDelay = 5;
    if (options['autoLockDelay']) {
        this.autoLockDelay = options['autoLockDelay'];
    }
	
    //* IRCV2 *//
    if (!config['IRCV2']) {
        config['IRCV2'] = "";
    }
    const IRCV2 = config['IRCV2'];


    //Also make a WS connection
    this.ws = new WSListener(platform);
}

LoxPlatform.prototype.accessories = function(callback) {
    const that = this;
    //this.log("Getting Loxone configuration.");
    const itemFactory = new ItemFactory.Factory(this,Homebridge);
    const url = itemFactory.sitemapUrl();
    this.log("Platform - Waiting 8 seconds until initial state is retrieved via WebSocket.");
    setTimeout(() => {
        that.log(`Platform - Retrieving initial config from ${url}`);
        request.get({
            url,
            json: true
        }, (err, response, json) => {
            if (!err && response.statusCode === 200) {
                callback(itemFactory.parseSitemap(json));
            } else {
                that.log("Platform - There was a problem connecting to Loxone.");
            }
        })
    },8000);
};





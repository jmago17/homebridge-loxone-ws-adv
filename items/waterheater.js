/**
 * waterheater.js
 * Loxone Water Heater accessory for Homebridge
 */

import Item from './item.js';
import { Service, Characteristic, Categories } from 'hap-nodejs';

export default class WaterHeater extends Item {
  constructor(platform, config, uuid, subtype, category) {
    super(platform, config, uuid, subtype, category);

    this.service =
      this.accessory.getService(Service.HeaterCooler) ||
      this.accessory.addService(Service.HeaterCooler, this.name);

    // Optional: set explicit category (Water Heater)
    this.accessory.category = Categories.WATER_HEATER ?? Categories.HEATER;

    this.service
      .getCharacteristic(Characteristic.Active)
      .onGet(() => (this.state?.active ? 1 : 0))
      .onSet((value) => this.setActive(value));

    this.service
      .getCharacteristic(Characteristic.CurrentTemperature)
      .onGet(() => this.state?.currentTemp ?? 40);

    this.service
      .getCharacteristic(Characteristic.HeatingThresholdTemperature)
      .onGet(() => this.state?.targetTemp ?? 55)
      .onSet((value) => this.setTargetTemperature(value));

    // Display units (Celsius)
    this.service.updateCharacteristic(
      Characteristic.TemperatureDisplayUnits,
      Characteristic.TemperatureDisplayUnits.CELSIUS
    );

    this.log(`WaterHeater [${this.name}] initialized`);
  }

  /**
   * Called by platform when Loxone sends new state.
   */
  updateFromLoxone(state) {
    if (!state) return;

    if ('active' in state) {
      this.state.active = !!state.active;
      this.service.updateCharacteristic(
        Characteristic.Active,
        this.state.active ? 1 : 0
      );
    }

    if ('currentTemp' in state) {
      this.state.currentTemp = state.currentTemp;
      this.service.updateCharacteristic(
        Characteristic.CurrentTemperature,
        this.state.currentTemp
      );
    }

    if ('targetTemp' in state) {
      this.state.targetTemp = state.targetTemp;
      this.service.updateCharacteristic(
        Characteristic.HeatingThresholdTemperature,
        this.state.targetTemp
      );
    }
  }

  /**
   * Called when user toggles ON/OFF from HomeKit.
   */
  async setActive(value) {
    this.state.active = !!value;
    this.log(`WaterHeater ${this.name} → ${this.state.active ? 'ON' : 'OFF'}`);
    await this.sendCommandToLoxone(this.state.active ? 'on' : 'off');
  }

  /**
   * Called when user sets target temperature.
   */
  async setTargetTemperature(value) {
    this.state.targetTemp = value;
    this.log(`WaterHeater ${this.name} → Target ${value}°C`);
    await this.sendCommandToLoxone(`setTemp/${value}`);
  }

  /**
   * Helper to send command to Loxone.
   */
  async sendCommandToLoxone(cmd) {
    if (this.uuidAction) {
      this.platform.ws.sendCommand(this.uuidAction, cmd);
    }
  }
}

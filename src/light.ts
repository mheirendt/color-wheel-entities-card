import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket/dist/types";

export class Light {

    private _domain = 'light';

    get name(): string {
        return this._entity.attributes.friendly_name || this._entity.entity_id.replace(/_/g, ' ');
    }

    get icon(): string {
        return this._entity.attributes.icon || 'mdi:lightbulb';
    }

    get rgb(): number[] {
        return this._entity.attributes.rgb_color || [255, 255, 255];
    }

    get temperature(): number | undefined {
        return this._entity.attributes.color_temp;
    }

    get brightness(): number {
        return Math.round(this._entity.attributes.brightness / 255 * 100);
    }

    get id(): string {
        return this._entity.entity_id;
    }

    get on(): boolean {
        return this._entity.state === 'on';
    }

    private _entity: HassEntity;

    constructor(private _hass: HomeAssistant, eid: string) {
        this._entity = this._hass.states[eid];
    }

    toggle() {
        const service = this.on ? 'turn_off' : 'turn_on';
        this._hass.callService(this._domain, service, { entity_id: this.id });

    }

    setColor(rgb_color: number[]) {
        this._entity.attributes.rgb_color = rgb_color;
        this._hass.callService(this._domain, 'turn_on', {
            entity_id: this.id,
            rgb_color
        });
    }

    setTemperature(temperature: number) {
        this._hass.callService(this._domain, 'turn_on', {
            entity_id: this.id,
            kelvin: temperature
        })
    }

    setBrightness(brightness: number) {
        this._hass.callService(this._domain, 'turn_on', {
            entity_id: this.id,
            brightness: Math.round(brightness * 255 / 100)
        })
    }
}
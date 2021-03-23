import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket/dist/types";

export class Light {

    private startingAngle = 0;
    private endAngle = 2 * Math.PI;

    private _domain = 'light';

    get name(): string {
        return this._entity.attributes.friendly_name || this._entity.entity_id.replace(/_/g, ' ');
    }

    get id(): string {
        return this._entity.entity_id;
    }

    get on(): boolean {
        return this._entity.state === 'on';
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get r(): number {
        return this._r;
    }

    private _x: number = 120;
    private _y: number = 120;
    private _r: number = 15;
    private _selected = false;
    private _entity: HassEntity;

    constructor(
        private _hass: HomeAssistant,
        eid: string,
        private fill = 'white',
        private stroke = 'black') {
        console.log(this._hass);
        this._entity = this._hass.states[eid];
    }

    toggle() {
        console.log(this);
        const service = this.on ? 'turn_off' : 'turn_on';
        this._hass.callService(this._domain, service, { entity_id: this.id });

    }

    color(rgb_color: number[]) {
        this._hass.callService(this._domain, 'turn_on', {
            entity_id: this.id,
            rgb_color
        });
    }

    move(x: number, y: number): void {
        this._x = x;
        this._y = y;
    }

    select() {
        if (!this._selected) this._r += 5;
        this._selected = true;
    }

    deselect() {
        if (this._selected) this._r -= 5;
        this._selected = false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, this.startingAngle, this.endAngle);
        ctx.fillStyle = this.fill;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.strokeStyle = this.stroke;
        ctx.stroke();
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    LitElement,
    html,
    customElement,
    property,
    CSSResult,
    TemplateResult,
    css,
    query,
} from 'lit-element';
import { Light } from './light';


@customElement('light-editor')
export class LightEditor extends LitElement {

    @query('.slider') private _slider!: HTMLElement;
    @property({ attribute: true }) light?: Light;
    // private initialized = false;

    // protected shouldUpdate(changedProps: PropertyValues): boolean {
    //     const should = !this.initialized && changedProps.has('light');
    //     this.initialized = should;
    //     return should;
    // }

    protected render(): TemplateResult | void {
        if (!this.light) return;

        return html`
          <div class="container">
            <ha-icon style="padding-right: 10px; color: ${this._iconColor()}" .icon=${this.light.icon}></ha-icon>
            <div class="label">${this.light.name}</div>
            <paper-slider class="slider" .value=${this.light.brightness} @change=${this._updateBrightness} max="100"></paper-slider>
            <div class="label">${this.light.brightness} %</div>
          </div>
      `;
    }

    private _iconColor() {
        if (!this.light || !this.light.on) return 'darkgray';
        if (this.light.rgb.every(c => c === 255)) return 'rgb(253, 216, 53)';
        return `rgb(${this.light.rgb.join(',')})`;
    }

    private _updateBrightness() {
        const value = this._slider.getAttribute('value');
        if (value) this.light?.setBrightness(parseInt(value));
        else this.light?.toggle();
    }

    static get styles(): CSSResult {
        return css`
            .container {
                padding-left: 15px;
                padding-right: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .label {
                white-space: nowrap;
                font-size: 14px;
            }

            .slider {
                min-width: 100px;
                max-width: 200px;
                width: 100%;
            }
        `;
    }
}

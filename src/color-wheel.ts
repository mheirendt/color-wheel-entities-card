/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    LitElement,
    html,
    customElement,
    property,
    CSSResult,
    TemplateResult,
    css,
    internalProperty,
} from 'lit-element';
import { Light } from './light';
import iro from '@jaames/iro';
import { ColorPickerProps } from '@jaames/iro/dist/ColorPicker';

@customElement('color-wheel')
export class ColorWheel extends LitElement {
    @property({ attribute: true }) lights: Light[] = [];
    @property({ attribute: true }) selected: Light | undefined;

    private _pickerElement!: HTMLElement;
    private _picker!: iro.ColorPicker;
    private _sliding = false;

    protected render(): TemplateResult | void {

        this.initColorPicker();

        return html`<div class='container'>${this._pickerElement}</div>`;
    }

    private initColorPicker() {
        if (this._picker) {
            if (this.selected) this._picker.setActiveColor(this.lights.findIndex(i => i.id === this.selected!.id));
            if (!this._sliding) this._picker.setColors(this.lights.map(l => `rgb(${l.rgb.join(',')})`), this._picker.color.index);
            return;
        }

        const element = document.createElement('div');
        const screenWidth = window.screen.width, minWidth = 200, maxWidth = 325;
        const width = screenWidth > maxWidth ? maxWidth : screenWidth > minWidth ? screenWidth : minWidth;
        const pickerOptions: Partial<ColorPickerProps> = {
            width,
            handleRadius: 15,
            colors: this.lights.map(l => `rgb(${l.rgb.join(',')})`),
            borderWidth: 1,
            borderColor: '#fff',
            layout: [
                {
                    component: iro.ui.Wheel,
                }
            ]
        };
        if (this.selected) pickerOptions.color = `rgb(${this.selected.rgb.join(',')})`
        this._picker = iro.ColorPicker(element, pickerOptions);

        this._picker.on(['mount', 'color:change', 'color:setActive'], () => {
            this.selectLight(this._picker.color.index);
        });

        this._picker.on('color:change', () => this._sliding = true);
        this._picker.on('color:change', this.debounce(() => this._sliding = false, 3000));

        this._picker.on('color:change', this.debounce(() => {
            this.dispatchEvent(new CustomEvent('color', { detail: [this._picker.color.rgb.r, this._picker.color.rgb.g, this._picker.color.rgb.b] }))
        }, 100));

        this._pickerElement = element;
    }

    private debounce(func: { (): void; apply?: any; }, wait: number | undefined): Function {
        let timeout: NodeJS.Timeout | null;
        return () => {
            const context = this, args = arguments;
            const later = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    private selectLight(idx: number) {
        this.dispatchEvent(new CustomEvent('select', { detail: this.lights[idx] }))
    }

    static get styles(): CSSResult {
        return css`
          .container {
              padding-bottom: 10px;
          }

          .IroWheel, .IroSlider {
              margin: auto;
          }

          .IroHandle--isActive circle:first-of-type {
              r: 20;
          }

          .IroHandle--isActive circle:last-of-type {
              r: 18;
          }
      `;
    }
}

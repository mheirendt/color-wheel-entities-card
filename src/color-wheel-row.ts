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
import {
  HomeAssistant,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types

import './editor';
import './color-wheel';
import './light-editor';

import type { ColorWheelRowConfig } from './types';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  COLOR-WHEEL-ROW \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

@customElement('color-wheel-row')
export class ColorWheelRow extends LitElement {

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('color-wheel-row-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private config!: ColorWheelRowConfig;


  @internalProperty() private lights: Light[] = [];
  @internalProperty() private selected?: Light;

  public setConfig(config: ColorWheelRowConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = config;
  }

  protected render(): TemplateResult | void {

    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    this.lights = this.config.entities!.map(eid => new Light(this.hass, eid));

    return html`
      <div class="color-wheel-row">
        ${this.selected
        ? html`
          <button class="selection" style="border-color: ${this._iconColor()}" @click=${this.toggleSelected}>
            <ha-icon style="color: ${this._iconColor()}" .icon=${this.selected.icon}></ha-icon>
            <span>&nbsp;${this.selected?.name}</span>
          </button>`
        : ''}
        <color-wheel .lights=${this.lights} .selected=${this.selected} @select=${this.updateSelected} @color=${this.updateColor} @temperature=${this.updateTemperature}></color-wheel>
      </div>
    `;
  }

  updateSelected({ detail: light }: CustomEvent) {
    this.selected = light;
    const map = new Map();
    map.set('selected', this.selected);
    this.update(map);
  }

  toggleSelected() {
    if (!this.selected) return;
    const selectedIdx = this.lights.findIndex(l => l.id === this.selected!.id);
    const nextIdx = selectedIdx >= this.lights.length - 1 ? 0 : selectedIdx + 1;
    this.updateSelected({ detail: this.lights[nextIdx] } as CustomEvent);
  }

  updateColor({ detail: rgb }: CustomEvent) {
    this.selected?.setColor(rgb);
  }

  updateTemperature({ detail: temp }: CustomEvent) {
    this.selected?.setTemperature(temp);
  }

  updateBrightness({ detail: brightness }: CustomEvent) {
    this.selected?.setBrightness(brightness);
  }

  private _iconColor() {
    if (!this.selected || !this.selected.on) return 'darkgray';
    if (this.selected.rgb.every(c => c === 255)) return 'rgb(253, 216, 53)';
    return `rgb(${this.selected.rgb.join(',')})`;
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  static get styles(): CSSResult {
    return css`
      .selection {
        background: white;
        outline: none;
        margin-bottom: 5px;
        margin-bottom: 5px;
        display: table;
        margin: 5px auto;
        border: solid 1px;
        border-radius: 15px;
        padding: 5px 10px;
      }
    `;
  }
}

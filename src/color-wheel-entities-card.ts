/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  customElement,
  property,
  CSSResult,
  TemplateResult,
  css,
  PropertyValues,
  internalProperty,
} from 'lit-element';
import { Light } from './light';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types

import './editor';
import './color-wheel';
import './light-editor';

import type { ColorWheelEntitiesCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  COLOR-WHEEL-ENTITIES-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'color-wheel-entities-card',
  name: 'Color Wheel Entities Card',
  description: 'Control multiple color lights with ease',
});

@customElement('color-wheel-entities-card')
export class ColorWheelEntitiesCard extends LitElement {

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('color-wheel-entities-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  // https://lit-element.polymer-project.org/guide/properties
  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private config!: ColorWheelEntitiesCardConfig;


  @internalProperty() private lights: Light[] = [];
  @internalProperty() private selected?: Light;

  // https://lit-element.polymer-project.org/guide/properties#accessors-custom
  public setConfig(config: ColorWheelEntitiesCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Color Wheel Entities',
      ...config,
    };
  }

  // https://lit-element.polymer-project.org/guide/lifecycle#shouldupdate
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    if (changedProps.get('selected')) return true;
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit-element.polymer-project.org/guide/templates
  protected render(): TemplateResult | void {

    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    this.lights = this.config.entities!.map(eid => new Light(this.hass, eid));

    return html`
      <ha-card
        .header=${this.config.name}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
      hasHold: hasAction(this.config.hold_action),
      hasDoubleClick: hasAction(this.config.double_tap_action),
    })}
        tabindex="0"
        .label=${`Color Wheel Entities: ${this.config.entities?.join(', ') || 'No Entity Defined'}`}
      >
        <light-editor .light=${this.selected}></light-editor>
        <color-wheel .lights=${this.lights} @select=${this.updateSelection} @color=${this.updateColor}></color-wheel>
      </ha-card>
    `;
  }

  updateSelection(e: CustomEvent) {
    this.selected = e.detail.light;
  }

  updateColor({ detail: rgb }: CustomEvent) {
    this.selected?.color(rgb);
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
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

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 380;
  }

  // https://lit-element.polymer-project.org/guide/styles
  static get styles(): CSSResult {
    return css`
    `;
  }
}

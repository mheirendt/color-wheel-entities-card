/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult,
  CSSResult,
  css,
  internalProperty,
  query
} from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { ColorWheelRowConfig } from './types';

@customElement('color-wheel-row-editor')
export class ColorWheelRowEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @internalProperty() private _config?: ColorWheelRowConfig;
  @internalProperty() private _helpers?: any;
  private _initialized = false;

  public setConfig(config: ColorWheelRowConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _entities(): string[] {
    return this._config?.entities || [];
  }

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    // You can restrict on domain type
    const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'light' && !this._entities.includes(eid));

    // <ha-icon .icon="mdi:close" data-idx="${idx}" @click=${this._removeEntity} />

    return html`
      <div class="card-config">
        <div class="entities">
          <h2>Entities</h2>
          ${this._entities.map((entity, idx) => html`
            <paper-item raised style="display: flex; justify-content: space-between;">
              <div>${entity}</div>
              <button data-idx="${idx}" @click=${this._removeEntity}>Delete</button>
            </paper-item>
          `)}
          <paper-dropdown-menu
            label="Select Entity"
            @value-changed=${this._valueChanged}
            .configValue=${'entities'}
          >
            <paper-listbox slot="dropdown-content">
              ${entities.map(entity => html`
                  <paper-item>${entity}</paper-item>
              `)}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
      </div>
    `;
  }


  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _removeEntity(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    const idx = parseInt(ev.target.dataset.idx);
    const entities = this._config.entities || [];
    this._config = {
      ...this._config,
      entities: [...entities.slice(0, idx), ...entities.slice(idx + 1)]
    };
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.configValue === 'entities') {
        // Only push if there is a value
        if (target.value.length) {
          const entities = this._config.entities || [];
          this._config = {
            ...this._config,
            entities: [...entities, target.value]
          }
          target.value = '';
        }
      } else if (target.value === '') {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static get styles(): CSSResult {
    return css`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
        display: grid;
      }
      ha-formfield {
        padding-bottom: 8px;
      }
    `;
  }
}

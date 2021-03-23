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
} from 'lit-element';
import { Light } from './light';


@customElement('light-editor')
export class LightEditor extends LitElement {

    @property({ attribute: true }) light?: Light;


    // https://lit-element.polymer-project.org/guide/lifecycle#shouldupdate
    protected shouldUpdate(changedProps: PropertyValues): boolean {
        return changedProps.has('light');
    }

    // https://lit-element.polymer-project.org/guide/templates
    protected render(): TemplateResult | void {
        if (!this.light) return;
        return html`
          <div class="container">
            <div class="title">${this.light.name}</div>
            <input type="checkbox" .checked=${this.light.on} @click=${this.toggleLight} />
          </div>
      `;
    }

    private toggleLight() {
        this.light?.toggle();
    }

    static get styles(): CSSResult {
        return css`
            .container {
                padding-left: 15px;
                padding-right: 15px;
                display: flex;
                justify-content: space-between;
            }

            .title {
                font-size: 18px;
            }
        `;
    }
}

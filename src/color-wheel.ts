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
import Hammer from 'hammerjs';
import './editor';


@customElement('color-wheel')
export class ColorWheel extends LitElement {

    @property({ attribute: true }) lights: Light[] = [];
    @internalProperty() private selected: Light | undefined;
    @internalProperty() private panning = false;

    // TODO: listen for entity changes without constantly reloading canvas
    private initialized = false;


    protected shouldUpdate(changedProps: PropertyValues): boolean {

        const result = !(this.initialized) && changedProps.has('lights');
        this.initialized = true;
        return result;
    }

    // https://lit-element.polymer-project.org/guide/templates
    protected render(): TemplateResult | void {

        // Constants
        const size = 300;

        // Draw the color wheel
        const baseCanvas = document.createElement('canvas');
        baseCanvas.height = size;
        baseCanvas.width = size;

        const ctx = baseCanvas.getContext('2d');
        if (!ctx) return;
        this.drawColorWheel(ctx, size, 'white');

        // Draw the lights
        const lightCanvas = document.createElement('canvas');
        lightCanvas.height = size;
        lightCanvas.width = size;

        const lightCtx = lightCanvas.getContext('2d');
        if (!lightCtx) return;
        this.lights.forEach(light => light.draw(lightCtx));

        // Delegate input events
        const mc = new Hammer(lightCanvas);
        const self = this;

        mc.on('hammer.input', function ({ srcEvent, center }) {
            if (srcEvent.type === 'pointerup') self.panning = false;
            if (srcEvent.type === 'pointerdown') self.selectLightAtXY(center.x, center.y, lightCtx);
        });

        mc.add(new Hammer.Pan({ event: 'quick-pan', threshold: 2 }));
        mc.on('quick-pan', function ({ center }) {
            if (!self.panning) return;
            self.moveLightToXY(center.x, center.y, lightCtx, ctx);
        });

        return html`
          <div class="container">
            <div class="pos-absolute">${baseCanvas}</div>
            <div class="pos-absolute">${lightCanvas}</div>
          </div>
      `;
    }

    private pointsIntersect(p1: { x: number, y: number }, p2: { x: number, y: number }, radius: number): boolean {
        const areaX = p1.x - p2.x;
        const areaY = p1.y - p2.y;
        return areaX * areaX + areaY * areaY <= radius * radius;
    }

    private selectLightAtXY(x: number, y: number, ctx: CanvasRenderingContext2D) {
        const buffer = 20;
        const { left, top } = ctx.canvas.getBoundingClientRect();
        const point = {
            x: Math.round(x - left - buffer),
            y: Math.round(y - top - buffer)
        }
        let intersected = false;
        for (let i = 0; i < this.lights.length; i++) {
            if (this.pointsIntersect(this.lights[i], point, buffer)) {
                this.selectLight(i, ctx);
                intersected = true;
            }
        }
        this.panning = intersected;
    }

    private moveLightToXY(x: number, y: number, lightCtx: CanvasRenderingContext2D, baseCtx: CanvasRenderingContext2D) {
        if (!this.selected) return;

        // Find the relative coordinates in the container
        const { left, top } = lightCtx.canvas.getBoundingClientRect();
        const centerX = x - left - this.selected.r;
        const centerY = y - top - this.selected.r;

        const data = baseCtx.getImageData(centerX, centerY, 1, 1);
        // TODO: update light
        // console.info(`%c ${typeof data} ${JSON.stringify(data)} \n%c`, `color: rgba(${data.data[0]}, ${data.data[1]}, ${data.data[2]}, ${data.data[3] / 255})`);
        if (!data.data.every(e => e === 0)) {
            this.selected.move(centerX, centerY);
            this.dispatchEvent(new CustomEvent('color', { detail: Array.from(data.data.slice(0, 3)) }));
        };
        this.drawLights(lightCtx);
    }


    private drawLights(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.lights.forEach(light => {
            light.draw(ctx)
        });
    }

    private drawColorWheel(ctx: CanvasRenderingContext2D, size: number, middleColor: string): void {

        //Generate canvas clone to draw increments on
        const canvasClone = document.createElement("canvas");
        canvasClone.width = canvasClone.height = size;
        const canvasCloneCtx = canvasClone.getContext("2d");
        if (!canvasCloneCtx) throw "Unable to clone canvas";

        //Initiate variables
        let angle = 0;
        const hexCode = [255, 0, 0];
        let pivotPointer = 0;
        const colorOffsetByDegree = 4.322;

        //For each degree in circle, perform operation
        while (angle++ < 360) {

            //find index immediately before and after our pivot
            const pivotPointerbefore = (pivotPointer + 3 - 1) % 3;

            //Modify colors
            if (hexCode[pivotPointer] < 255) {
                //If main points isn't full, add to main pointer
                hexCode[pivotPointer] = (hexCode[pivotPointer] + colorOffsetByDegree > 255 ? 255 : hexCode[pivotPointer] + colorOffsetByDegree);
            }
            else if (hexCode[pivotPointerbefore] > 0) {
                //If color before main isn't zero, subtract
                hexCode[pivotPointerbefore] = (hexCode[pivotPointerbefore] > colorOffsetByDegree ? hexCode[pivotPointerbefore] - colorOffsetByDegree : 0);
            }
            else if (hexCode[pivotPointer] >= 255) {
                //If main color is full, move pivot
                hexCode[pivotPointer] = 255;
                pivotPointer = (pivotPointer + 1) % 3;
            }

            //clear clone
            canvasCloneCtx.clearRect(0, 0, size, size);
            //Generate gradient and set as fillstyle
            const grad = canvasCloneCtx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            grad.addColorStop(0, middleColor);
            grad.addColorStop(1, "rgb(" + hexCode.map(h => Math.floor(h)).join(",") + ")");
            canvasCloneCtx.fillStyle = grad;

            //draw full circle with new gradient
            canvasCloneCtx.globalCompositeOperation = "source-over";
            canvasCloneCtx.beginPath();
            canvasCloneCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            canvasCloneCtx.closePath();
            canvasCloneCtx.fill();

            //Switch to "Erase mode"
            canvasCloneCtx.globalCompositeOperation = "destination-out";

            /**
             * Convert degrees to radians
             * @param degrees - The input degrees
             * @returns The converted radians
             */
            const degreesToRadians = function (degrees: number): number {
                return degrees * (Math.PI / 180);
            }

            //Carve out the piece of the circle we need for this angle
            canvasCloneCtx.beginPath();
            canvasCloneCtx.arc(size / 2, size / 2, 0, degreesToRadians(angle + 1), degreesToRadians(angle + 1));
            canvasCloneCtx.arc(size / 2, size / 2, size / 2 + 1, degreesToRadians(angle + 1), degreesToRadians(angle + 1));
            canvasCloneCtx.arc(size / 2, size / 2, size / 2 + 1, degreesToRadians(angle + 1), degreesToRadians(angle - 1));
            canvasCloneCtx.arc(size / 2, size / 2, 0, degreesToRadians(angle + 1), degreesToRadians(angle - 1));
            canvasCloneCtx.closePath();
            canvasCloneCtx.fill();

            //Draw carved-put piece on main canvas
            ctx.drawImage(canvasClone, 0, 0);
        };
    }

    private selectLight(idx: number, ctx: CanvasRenderingContext2D) {
        // Do not do anything if the light is already selected
        if (this.selected === this.lights[idx]) return;

        // Update state accordingly
        this.selected?.deselect();
        this.selected = this.lights[idx];
        this.selected.select();

        // Update the order of the lights
        this.lights = [...this.lights.slice(0, idx), ...this.lights.slice(idx + 1), this.selected];

        // Clear the canvas & re-render each light
        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);
        this.lights.forEach(light => light.draw(ctx));

        this.dispatchEvent(new CustomEvent('select', { detail: { light: this.selected } }))
    }


    // https://lit-element.polymer-project.org/guide/styles
    static get styles(): CSSResult {
        return css`
        .container {
          height: 360px;
          position: relative;
        }
        canvas {
          display: block;
          margin: auto;
          padding: 10px;
        }
        .pos-absolute {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          left: 0;
        }
      `;
    }
}

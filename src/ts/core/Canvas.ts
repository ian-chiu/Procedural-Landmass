import * as THREE from "three";

type EventCallback = (e: Event) => void;

type Props = {
    width?: number,
    height?: number,
    resized?: boolean,
    elementId?: string
};

export class Canvas {
    public constructor(props: Props = {}) {
        this.eventCallback = () => {};
        let canvasDomElement: HTMLCanvasElement;
        if (props.elementId !== undefined) {
            canvasDomElement = document.getElementById(props.elementId) as HTMLCanvasElement;
            if (canvasDomElement === undefined) {
                throw new Error("Cannot find a canvas element named: " + props.elementId);
            }
        } 
        else {
            canvasDomElement = document.createElement('canvas') as HTMLCanvasElement;
            document.body.appendChild(canvasDomElement);
        }

        if (props.width && props.height) {
            canvasDomElement.width = props.width;
            canvasDomElement.height = props.height;
        }
        else {
            canvasDomElement.width = canvasDomElement.parentElement ? canvasDomElement.parentElement.clientWidth : 300;
            canvasDomElement.height = canvasDomElement.parentElement ? canvasDomElement.parentElement.clientHeight : 150;
        }

        this.renderer = new THREE.WebGLRenderer( { canvas: canvasDomElement });

        canvasDomElement.addEventListener('mousemove', e => {
            this.eventCallback(e);
        });

        canvasDomElement.addEventListener('wheel', e => {
            this.eventCallback(e);
        });

        this.domElement = canvasDomElement;
    }

    public setEventCallback(callback: EventCallback): void {
        this.eventCallback = callback;
    }

    public needResizeOnLoop(): boolean {
        const canvas = this.renderer.domElement;
        const width = canvas.parentElement?.clientWidth;
        const height = canvas.parentElement?.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize && width !== undefined && height !== undefined) {
            this.renderer.setSize(width, height, false);
        }
        return needResize;
    }

    public get aspect(): number {
        return this.domElement.width / this.domElement.height;
    }

    public readonly renderer: THREE.WebGLRenderer;
    public readonly domElement: HTMLCanvasElement;
    private eventCallback: EventCallback;
}

export default Canvas;

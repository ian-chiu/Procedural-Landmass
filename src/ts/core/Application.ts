import * as THREE from "three"
import Canvas from "./Canvas";

class Application
{
    public constructor(canvas = new Canvas) {
        this.renderer = canvas.renderer;
        this._canvas = canvas;
        this._lastFrameTime = 0;

        this.init();
    }

    public run() {
        this.load().catch(err => {
            console.log(err);
        }).finally(() => {
            this._canvas.setEventCallback(this.handleEvent.bind(this));
            this.onReady();
            requestAnimationFrame(this.loop.bind(this));
        });
    }

    public async onLoad() {
        
    }
    public onUpdate(deltaTime: number) {
        
    }
    public onEvent(event: Event) {
        
    }
    public onReady() {
        
    }

    private init() {
        
    }

    private async load() {
        await this.onLoad();
    }
    
    private loop(timeStamp: DOMHighResTimeStamp) {
        if (this._canvas.needResizeOnLoop()) {
            this.handleEvent(new Event("resize"));
        }
        if (this._lastFrameTime === 0) {
            this._lastFrameTime = timeStamp;
        }
        const deltaTime = timeStamp - this._lastFrameTime;
        this._lastFrameTime = timeStamp;
        this.onUpdate(deltaTime);
        requestAnimationFrame(this.loop.bind(this));
    }

    private handleEvent(event: Event) {
        this.onEvent(event);
    }
    
    public readonly renderer: THREE.WebGLRenderer;
    private _canvas: Canvas;
    private _lastFrameTime: number;
}

export default Application;

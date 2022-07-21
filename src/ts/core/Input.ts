const mouseButtonPressed: {
    [k: number]: boolean
} = {};

const keyPressed: {
    [k: string]: boolean
} = {};

const mousePosition = { x: 0, y: 0 };

if (typeof window !== "undefined") {
    window.addEventListener('keydown', e => {
        keyPressed[e.code] = true;
    });
    
    window.addEventListener('keyup', e => {
        keyPressed[e.code] = false;
    });
    
    window.addEventListener('mousemove', e => {
        mousePosition.x = e.clientX;
        mousePosition.y = e.clientY;
    });
    
    window.addEventListener('mousedown', e => {
        mouseButtonPressed[e.button] = true;
    });
    
    window.addEventListener('mouseup', e => {
        mouseButtonPressed[e.button] = false;
    });
}

export enum MouseButton {
    Left = 0, Middle = 1, Right = 2
};

class Input {
    public static isKeyPressed = (key: string) => {
        return keyPressed[key];
    }

    public static isMouseButtonPressed = (button: MouseButton) => {
        return mouseButtonPressed[button];
    }

    public static getMousePosition = (): { x: number, y: number } => {
        return mousePosition;
    }

    public static getMouseX = (): number => {
        return mousePosition.x;
    }

    public static getMouseY = (): number => {
        return mousePosition.y;
    }

    private constructor() {}
}

export default Input;

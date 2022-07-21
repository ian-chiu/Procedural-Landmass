
type EventFunction = (e: Event) => boolean;

class EventDispatcher {
    constructor(e: Event) {
        this._event = e;
    }

    public dispatch(eventType: string, eventFunction: EventFunction) {
        if (eventType === this._event.type) {
            if (eventFunction(this._event)) {
                this._event.stopPropagation();
            }
            return true;
        }
        return false;
    }

    private _event: Event;
}

export default EventDispatcher;

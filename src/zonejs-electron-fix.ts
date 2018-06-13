const originalRemoveEventListener = window.removeEventListener;

function removeEventListener(this: any, eventName: string, listener: () => void) {
    if (needToCallOriginalMethod(eventName, listener.toString())) {
        // calling native/original implementation
        return originalRemoveEventListener.apply(this, arguments);
    } else {
        // calling implementation patched by Zone.js
        return EventTarget.prototype.removeEventListener.apply(this, arguments);
    }
}

function needToCallOriginalMethod(eventName: string, listenerFunctionStringified: string): boolean {
    return eventName === 'readystatechange'
        && listenerFunctionStringified.indexOf('registerBrowserPluginElement()') !== -1
        && listenerFunctionStringified.indexOf('registerWebViewElement()') !== -1;
}

window.removeEventListener = removeEventListener;

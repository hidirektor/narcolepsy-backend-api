const controllers = require('./providers');

class ControllersFactory {
    constructor() {
    }

    static creating(provider, args) {
        const controller = controllers[provider];

        if (!controller) {
            throw new Error(`Controller is not found: ${provider}`);
        }

        if (typeof controller !== 'function') {
            throw new Error(`Controller is not a constructor: ${provider}`);
        }

        return new controller(args);
    }
}

module.exports = ControllersFactory;
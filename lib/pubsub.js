const EventEmitter = require('events');

const eventSubscribe = 'subscribe';
const eventPublish = 'publish';

class Subscriber extends EventEmitter {
}

class Publisher {
    constructor() {
        this.subscribers = [];
    }

    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }

    publish(repository) {
        this.subscribers.forEach(subscriber => {
            subscriber.emit(eventPublish, repository);
        });
    };
}

module.exports = {
    eventSubscribe,
    eventPublish,

    Subscriber,
    Publisher,
};

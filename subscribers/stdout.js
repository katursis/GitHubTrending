const pubsub = require('../lib/pubsub');
const util = require('../lib/util');

const subscriber = new pubsub.Subscriber();

subscriber.on(pubsub.eventSubscribe, config => {
    subscriber.on(pubsub.eventPublish, repo => {
        util.log(`[${repo.lang}] ${repo.topics.map(topic => '#' + topic).join(' ')} ${repo.url} (${repo.description})`);
    });

    util.log('stdout subscribed');
});

module.exports = subscriber;

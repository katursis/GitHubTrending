const knex = require('knex');
const schedule = require('node-schedule');

const util = require('./lib/util');
const RepositoriesContainer = require('./lib/RepositoriesContainter');
const gitHubApi = require('./lib/githubApi');
const pubsub = require('./lib/pubsub');

const config = require('./config');

const repositoriesContainer = new RepositoriesContainer(knex(config.database.sqlite));

repositoriesContainer
    .open()
    .then(() => {
        const publisher = new pubsub.Publisher();

        Object.keys(config.subscribers).forEach(name => {
            const subscriber = require('./subscribers/' + name);

            if (!(subscriber instanceof pubsub.Subscriber)) {
                return util.log(name, 'is a invalid subscriber');
            }

            publisher.subscribe(subscriber);

            subscriber.emit(
                pubsub.eventSubscribe,
                config.subscribers[name].config
            );
        });

        const jobPublishing = schedule.scheduleJob(config.scheduler.publishing, () => {
            repositoriesContainer
                .getNextUnpublished()
                .then(id => {
                    if (!id) {
                        util.log('Repositories container has no unpublished records. Publishing stopped');

                        return jobPublishing.cancel();
                    }

                    return gitHubApi
                        .getRepoById(id)
                        .then(repo => {
                            publisher.publish({
                                lang: util.normalizeLang(repo.language),
                                description: util.normalizeDescription(repo.description),
                                url: repo.html_url,
                            });

                            return repositoriesContainer.markAsPublished(repo.id);
                        });
                })
                .catch(err => {
                    util.log(err);
                });
        });

        const jobUpdatingContainer = schedule.scheduleJob(config.scheduler.updatingContainer, () => {
            jobPublishing.cancel();
            jobUpdatingContainer.cancel();

            util.log('Getting current trending...');

            gitHubApi
                .getCurrentTrending()
                .then(repos => {
                    util.log('Got. Saving new repositories in container...');

                    return repos.reduce((chain, repo) => {
                        return chain
                            .then(() => {
                                return repositoriesContainer
                                    .has(repo.id);
                            })
                            .then(has => {
                                if (has) {
                                    return Promise.resolve();
                                }

                                return repositoriesContainer
                                    .add(repo.id);
                            })
                            .catch(err => {
                                util.log(err);
                            });
                    }, Promise.resolve());
                })
                .then(() => {
                    util.log('Saved');
                })
                .catch(err => {
                    util.log(err);
                });
        });
    })
    .catch(err => {
        util.log(err);
    });

const request = require('request');
const cheerio = require('cheerio');

exports.getRepoById = id => {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.github.com/repositories/' + id,
            headers: {
                'User-Agent': 'GitHubTrending',
                'Accept': 'application/vnd.github.mercy-preview+json',
            }
        }, (err, response, body) => {
            if (!err && response.statusCode === 200) {
                return resolve(JSON.parse(body));
            }

            reject(err || body);
        });
    });
};

exports.getRepoByFullName = fullName => {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.github.com/repos/' + fullName,
            headers: {
                'User-Agent': 'GitHubTrending'
            }
        }, (err, response, body) => {
            if (!err && response.statusCode === 200) {
                return resolve(JSON.parse(body));
            }

            reject(err || body);
        });
    });
};

exports.getCurrentTrending = () => {
    return Promise
        .resolve()
        .then(() => {
            return new Promise((resolve, reject) => {
                request.get('https://github.com/trending?spoken_language_code=en', (err, response, body) => {
                    if (err) {
                        return reject(err);
                    }

                    const $ = cheerio.load(body);

                    const reposNames = [];

                    $('.h3 a')
                        .each((i, e) => {
                            reposNames.push(
                                $(e)
                                    .attr('href')
                                    .trim()
                                    .substr(1)
                            );
                        });

                    resolve(reposNames);
                });
            });
        })
        .then(reposNames => Promise.all(reposNames.map(exports.getRepoByFullName)));
};

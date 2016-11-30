exports.wait = delay => {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
};

exports.log = (...args) => {
    console.log(new Date().toLocaleString(), '|', ...args);
};

exports.normalizeDescription = description => {
    if ((typeof description != 'string') || !description.length) {
        return 'No description';
    }

    return description
        .replace(/:.+?:/g, '') // emoji
        .replace(/\s{2,}/g, ' ') // space character sequence
        .trim();
};

exports.normalizeLang = lang => {
    if ((typeof lang != 'string') || !lang.length) {
        return 'other';
    }

    const langName = lang.toLowerCase();

    if (langName.length < 2) {
        return langName + '_lang';
    }

    return langName
        .replace(/[\s\-]/g, '_')
        .replace(/\+/g, 'plus')
        .replace(/[()]/g, '')
        .replace(/'/g, '')
        .replace(/#/g, 'sharp');
};

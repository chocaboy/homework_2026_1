'use strict';

/**
 * Функция загружает JSON-данные с нескольких URL и объединяет полученные объекты.
 *
 *
 * @param {Array<string>} urls - Список URL для загрузки JSON-данных.
 * @returns {Promise<Object>} - объединённый объект с уникальными ключами.
 *
 * @example
 * fetchAndMerge(['./data1.json', './data2.json']);
 */
const fetchAndMerge = urls => {
    if (!Array.isArray(urls) || urls.length === 0) {
        return Promise.resolve({});
    }

    const requests = urls.map(url =>
        fetch(url).then(response => {
            if (!response.ok) {
                throw new Error('Request failed with status ' + response.status);
            }
            return response.json();
        }).catch(() => null)
    );

    return Promise.all(requests).then(objects => {
        const valuesMap = new Map();

        objects.forEach(obj => {
            if (!obj || typeof obj !== 'object') return;

            Object.keys(obj).forEach(key => {
                const value = obj[key];
                const currentValues = valuesMap.get(key) || [];

                if (!currentValues.some(v => v === value)) {
                    currentValues.push(value);
                }

                valuesMap.set(key, currentValues);
            });
        });

        const result = {};
        valuesMap.forEach((values, key) => {
            result[key] = values;
        });

        return result;
    });
};
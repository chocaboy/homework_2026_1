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
        const result = {};

        objects.forEach(obj => {
            if (!obj || typeof obj !== 'object') return;

            Object.keys(obj).forEach(key => {
                const value = obj[key];

                if (!result[key]) {
                    result[key] = [];
                }

                if (!result[key].includes(value)) {
                    result[key].push(value);
                }
            });
        });

        Object.entries(result).forEach(([key, value]) => {
            if (value.length === 1) {
                result[key] = value[0];
            }
        });

        return result;
    });
};
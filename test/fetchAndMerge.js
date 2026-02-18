/* eslint-disable require-jsdoc */

'use strict';

QUnit.module("Тестируем функцию fetchAndMerge", function() {
    QUnit.test("Возвращает объект при полученных данных", async function(assert) {
        const urls = [
            'https://vk.example.com/vkid',
            'https://mailru.example.com/mailid',
        ];
        const expected = {
            "age": [25, 22],
            "id": [1, 2],
            "name": ["Олег", "Мария"],
            "surname": ["Петров", "Иванова"],
            "status": "Дуров, верни стену!",
        };
        
        window.fetch = (url) => {
            const data = {
                'https://vk.example.com/vkid': { "id": 1, "name": "Олег", "surname": "Петров", "age": 25, "status": "Дуров, верни стену!" },
                'https://mailru.example.com/mailid': { "id": 2, "name": "Мария", "surname": "Иванова", "age": 22 },
            };

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data[url]),
            });
        };

        const result = await fetchAndMerge(urls);
        assert.deepEqual(result, expected, "Должно правильно объединять данные с разных URL");
    });

    QUnit.test("Работает правильно при ошибках fetch", async function(assert) {
        const urls = [
            'https://vk.example.com/mailru',
            'https://vk.example.com/byte'
        ];

        window.fetch = () => Promise.reject(new Error("Network error"));

        const result = await fetchAndMerge(urls);
        assert.deepEqual(result, {}, "Должно возвращать пустой объект при ошибке fetch");
    });

    QUnit.test("Корректно работает с пустым списком URL", async function(assert) {
        const urls = [];
        const expected = {};

        window.fetch = () => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({})
        });

        const result = await fetchAndMerge(urls);

        assert.deepEqual(result, expected,
            "Пустой массив URL должен возвращать пустой объект");
    });


    QUnit.test("Объединяет одинаковые поля и оставляет только уникальные значения", async function(assert) {
        const urls = ['/user1', '/user2', '/user3'];

        const responses = {
            '/user1': { age: 20, city: 'Moscow' },
            '/user2': { age: 20, city: 'London', hobby: 'music' },
            '/user3': { age: 25, hobby: 'music' }
        };

        window.fetch = url => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(responses[url])
        });

        const expected = {
            age: [20, 25],
            city: ["Moscow", "London"],
            hobby: "music",
        };

        const result = await fetchAndMerge(urls);
        assert.deepEqual(result, expected, "Повторяющиеся поля собираются в массив, одиночные остаются значением");
    });
});

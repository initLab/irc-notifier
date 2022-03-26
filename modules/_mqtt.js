'use strict';

const mqtt = require("mqtt");

module.exports = function(config, ircbot) {
    let topics = [];

    ircbot.addListener('mqttSubscribe', function(topic) {
        console.info('mqtt: subscribing for topic', topic);
        topics.push(topic);

        if (mqttClient.connected) {
            mqttClient.subscribe(topic);
        }
    });

    const mqttClient = mqtt.connect(config.serverUrl);

    mqttClient.on('connect', function() {
        console.info('mqtt: client connected');
        mqttClient.subscribe(topics);
    });

    mqttClient.on('message', function(topic, payload) {
        console.info('mqtt: received message for topic', topic);
        ircbot.emit('mqttMessage', topic, payload);
    });
};

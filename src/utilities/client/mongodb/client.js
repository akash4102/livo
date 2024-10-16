const _ = require("lodash")
const mongoose = require('mongoose');

class Client {
    constructor(config, options) {
        this.config = config;
        this.options = options;
    }

    connect() {
        let connString = `mongodb://${this.config.host}/${this.config.db}?${this.config.options}`;
        if (_.size(this.config.user) && _.size(this.config.pass)) {
            connString = `mongodb://${this.config.user}:${this.config.pass}@${this.config.host}/${this.config.db}?${this.config.options}`;
        }
        if (_.size(this.options) == 0) {
            this.options = {}
        }
        const connection =  mongoose.createConnection(connString, this.options);
        connection.on('connected', () => console.log('Mongodb Connected Successfully'));
        connection.on('open', () => console.log('Mongodb Open To CRUD'));
        connection.on('disconnected', () => console.log('Mongodb Is Disconnected'));
        connection.on('reconnected', () => console.log('Mongodb Reconnected'));
        connection.on('disconnecting', () => console.log('Mongodb Disconnecting'));
        connection.on('close', () => console.log('close'));
        return connection;
    }
}

module.exports = Client;
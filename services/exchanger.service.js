"use strict";

const DbService = require("moleculer-db");
const MongoDBAdapter = require("moleculer-db-adapter-mongo");

const request = require('request');
const xml2js = require('xml2js');
const moment = require('moment');

const Promise = require("bluebird");

let adapter;

module.exports = {
    
	name: "exchanger",
    
    logger: console,
	logLevel: "info",
    
    mixins: [DbService],
    
    adapter: new MongoDBAdapter("mongodb://localhost/moleculerTest", {
        useNewUrlParser: true
    }),
    collection: "exchangeRates",
    
    afterConnected: function() {
        this.logger.info("Connected successfully");
        adapter = this.adapter;
    },

	/**
	 * Service settings
	 */
	settings: {
        fields: [ "currency", "rate" ]
	},

	/**
	 * Service dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
        
        get_rate(ctx) {
            
            const currency = ctx.params.currency;
            
            return this.adapter.findOne({
                currency: currency
            })
            .then(doc => {
                return doc.rate;
            });
            
        },
        
        update_rate(ctx){
            
            let logger = this.logger;
            let cleanCache = this.cleanCache;
            
            request('http://www.cbr.ru/scripts/XML_daily.asp?date_req=' + moment().format('DD/MM/YYYY'), function (error, response, body) {
                xml2js.parseString(body, (err, result) => {
                    adapter
                    .clear()
                    .then(() => {
                        adapter.insertMany (
                            result.ValCurs.Valute.map(function(item){
                                return {
                                    currency: item.CharCode[0].toLocaleLowerCase(),
                                    rate: parseFloat(item.Value[0].replace(',', '.'))
                                };
                            })
                        ).then(() => {
                            cleanCache();
                        });
                    });
                });
            });
        }
	},

	/**
	 * Events
	 */
	events: {
        "cache.clean.exchanger"() {
            if (this.broker.cacher) {
                this.broker.cacher.clean("exchanger.**");
            }
        }
	},

	/**
	 * Methods
	 */
	methods: {
        cleanCache(){
            this.broker.broadcast("cache.clean.exchanger");
        }
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {
        this.actions.update_rate();
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};

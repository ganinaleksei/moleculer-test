"use strict";

const DbService = require("moleculer-db");
const MongoDBAdapter = require("moleculer-db-adapter-mongo");

const CacheCleaner = require("../mixins/cache.cleaner.mixin");

// 1. Сервис - генератор для наполнения базы данных тестовыми данными, рандомно ( марка машины, цвет, стоимость в рублях ) + CRUD

let adapter;

module.exports = {
    
	name: "cars",
    
    cacher: "Memory",
    
    logger: console,
	logLevel: "debug",
    
    mixins: [
      DbService,
      CacheCleaner([
        "cars",
        "exchanger"
      ])
    ],
    adapter: new MongoDBAdapter("mongodb://localhost/moleculerTest", {
        useNewUrlParser: true
    }),
    
    collection: "cars",
    
    afterConnected: function() {
        this.logger.info("Connected successfully");
        adapter = this.adapter;
    },
    
	/**
	 * Service settings
	 */
	settings: {
        fields: [ "_id", "mark", "color", "price" ]
	},

	/**
	 * Service dependencies
	 */
	dependencies: [
        "exchanger"
    ],

	/**
	 * Actions
	 */
	actions: {
        
        search: {
            cache: true,
            
            params: {
              cur: { type: "string", optional: true },
              makr: { type: "string", optional: true },
              color: { type: "string", optional: true },
              limit: { type: "number", optional: true, integer: true, convert: true }
            },
            
            async handler(ctx){
                
                let params = this.sanitizeParams(ctx, ctx.params);
                
                const currency = ctx.params.cur;
                const mark = ctx.params.mark;
                const color = ctx.params.color;
                const limit = ctx.params.limit;
                
                let query = {};
                
                if(mark) { query.mark = mark; }
                if(color) { query.color = color; }
                
                let rate = currency ? await this.broker.call("exchanger.get_rate", { currency: currency }) : 1;
                
                return this.adapter.find({
                    query: query
                }).then(function(docs){
                    return docs.map(function(doc){
                        doc.price = parseInt(doc.price / rate);
                        return doc;
                    });
                });
            }
        }
        
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {
        
        async generateCar() {
            const broker = this.broker;
            
            let marks = ["Toyota", "BMW", "Mazda", "Mercedes-Benz"];
            let colors = ["red", "green", "black", "blue", "white"];
            
            let mark = marks[parseInt(Math.random() * 1000 % marks.length)];
            let color = colors[parseInt(Math.random() * 1000 % colors.length)];
            let price = 500000 + parseInt(Math.random() * 1000000);
            
            adapter.insert({ mark: mark, color: color, price: price }, doc => {});
            
        },
        
        generate() {
            
            adapter
            .clear()
            .then(() => {
                for(var i = 0; i < 100; i++){
                    this.generateCar();
                }
            });
            
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
	async started() {
        this.generate();
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};

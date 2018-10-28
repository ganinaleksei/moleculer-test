"use strict";

const MoleculerWeb = require("moleculer-web");

module.exports = {
	name: "gateway",
	mixins: [
	  MoleculerWeb
    ],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,

		routes: [{
			path: "/",
            //mappingPolicy: "restrict",
			whitelist: [
				// Access to any actions in all services under "/api" URL
				"cars.*", // WITH CRUD
                "exchanger.update_rate"
			],
            aliases: {
                "GET car/:color": "cars.search",
                "GET car/:color/:mark": "cars.search"
            }
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public"
		}
	}
};

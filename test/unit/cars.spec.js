"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const ExchangerService = require("../../services/exchanger.service");
const TestService = require("../../services/cars.service");

describe("Test 'cars' service", () => {
	let broker = new ServiceBroker();
    
    broker.createService(ExchangerService);
	broker.createService(TestService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe("Test 'cars.search' action", () => {

		it("should return results of search ", () => {
			expect(broker.call("cars.search", { mark: "BMW", cur: "usd", color: "red" })).resolves.toBeDefined();
		});

	});

});


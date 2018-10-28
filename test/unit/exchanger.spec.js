"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;

const TestService  = require("../../services/exchanger.service");

describe("Test 'exchanger' service", () => {
	let broker = new ServiceBroker();
    
	broker.createService(TestService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe("Test 'exchange.get_rate' action", () => {

		it("should return rate ", () => {
			expect(broker.call("exchanger.get_rate", { cur: "eur" })).resolves.toBeDefined();
		});

	});
    
    describe("Test 'exchange.update_rate' action", () => {

		it("should return rate ", () => {
			expect(broker.call("exchanger.update_rate")).resolves.toBeDefined();
		});

	});

});


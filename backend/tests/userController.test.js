const request = require("supertest");
const { app } = require("../server");
const { appPool } = require("../config/db");

describe("User Controller", () => {
	it("should register a new user", async () => {
		const response = await request(app).post("/api/users/register").send({
			username: "testuser",
			email: "test@example.com",
			password: "password123",
		});

		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty("token");
	});

	it("should login an existing user", async () => {
		const response = await request(app).post("/api/users/login").send({
			email: "test@example.com",
			password: "password123",
		});

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("token");
	});
});

afterAll(async () => {
	await appPool.query("DELETE FROM users WHERE email = $1", ["test@example.com"]);
	await appPool.end();
});

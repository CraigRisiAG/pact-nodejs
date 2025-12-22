"use strict"

const { Matchers } = require("@pact-foundation/pact")
const { getClients, postClient } = require("../../../src/consumer")


describe("Clients Service", () => {
    const GET_EXPECTED_BODY = [{
        "firstName": "Anakin",
        "lastName": "Skywalker",
        "age": 16,
        "profession": "Jedi Padawan",
        "id": 1
    },
    {
        "firstName": "Luke",
        "lastName": "Skywalker",
        "age": 25,
        "profession": "Jedi Master",
        "id": 2
    },
    {
        "firstName": "Obiwan",
        "lastName": "Kenobi",
        "age": 49,
        "profession": "Jedi Master",
        "id": 3
    }]

    afterEach(() => provider.verify())

    describe("GET Clients", () => {
        beforeEach(() => {
            const interaction = {
                state: "I have a list of clients",
                uponReceiving: "A request for all clients",
                withRequest: {
                    method: "GET",
                    path: "/clients",
                    headers: {
                        Accept: "application/json, text/plain, */*",
                    },
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                    body: GET_EXPECTED_BODY,
                },
            }
            return provider.addInteraction(interaction)
        })

        test("returns correct body, header and statusCode", async() => {
            const response = await getClients()
            expect(response.headers['content-type']).toBe("application/json; charset=utf-8")
            expect(response.data).toEqual(GET_EXPECTED_BODY)
            expect(response.status).toEqual(200)
        })
    })

    const POST_BODY = {
        firstName: "Craig",
        lastName: "Risi",
        age: 21 //A person can still dream okay :D
    }

    const POST_EXPECTED_BODY = {
        firstName: POST_BODY.firstName,
        lastName: POST_BODY.lastName,
        age: POST_BODY.age,
        id: 3
    }

    describe("POST Client", () => {
        beforeEach(() => {
            const interaction = {
                state: "I create a new client",
                uponReceiving: "A request to create client with firstname and lastname",
                withRequest: {
                    method: "POST",
                    path: "/clients",
                    headers: {
                        "Content-Type": "application/json;charset=utf-8"
                    },
                    body: POST_BODY,
                },
                willRespondWith: {
                    status: 200,
                    body: Matchers.like(POST_EXPECTED_BODY).contents,
                },
            }

            return provider.addInteraction(interaction)
        })

        test("returns correct body, header and statusCode", async() => {
            const response = await postClient(POST_BODY)
            console.log(response.data)
            expect(response.data.id).toEqual(3)
            expect(response.status).toEqual(200)
        })
    })
})
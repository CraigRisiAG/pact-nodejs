# PactJS Workshop on Cntract Testing


A simple Nodejs + Jest project configuring contract tests with PactJS

If you are running your pact broker locally following these [instructions](https://github.com/pact-foundation/pact_broker#to-have-a-play-around-on-your-local-machine) then you can run the provider and the publish the way it is, otherwise you will need to modify the pactUrls to the local path and if you are using docker as your pact broker than you need to update the publish script accordingly.

## Running via CLI

- Open your terminal on your project's folder

- Install Node packages:
`npm install`

- Run the consumer contract tests (Generate the contracts):
`npm run test:consumer`

- Run the provider contract tests (Verify the contracts):
`npm run test:provider`

- Run the provider server  `http://localhost:8081`  (Client API/Service):
`npm run provider`

- Run the consumer server `http://localhost:8080` (Client API/Service):
`npm run consumer`

- Publish the contracts:
`npm run publish:contract`

## Adding Additional Contracts and Tests

### Overview
To add new contract tests to this application, you need to:
1. Add test data to the provider (backend)
2. Define new interactions in the consumer test
3. Update the pact contract file
4. Verify the provider implementation matches the contract

### Step-by-Step Guide

#### 1. Add Provider Endpoint and Data

First, add a new endpoint to the provider service in `src/provider.js`:

```javascript
// Example: Add a DELETE endpoint for clients
server.delete("/clients/:id", (req, res) => {
  const response = clientRepository.delete(req.params.id)
  if (response) {
    res.json({ message: 'Client deleted successfully' })
  } else {
    res.status(404)
    res.send({ message: 'Client not found!' })
    res.end()
  }
})
```

#### 2. Create Consumer Test (Consumer-Driven Development)

Add a new test in `__tests__/contract/consumer/ClientsConsumer.spec.js`:

```javascript
describe("DELETE Client", () => {
  beforeEach(() => {
    const interaction = {
      state: "I have a client to delete",
      uponReceiving: "A request to delete a client",
      withRequest: {
        method: "DELETE",
        path: "/clients/1",
      },
      willRespondWith: {
        status: 200,
        body: {
          message: "Client deleted successfully"
        },
      },
    }
    return provider.addInteraction(interaction)
  })

  test("returns success message", async () => {
    const response = await deleteClient(1)
    expect(response.data.message).toBe("Client deleted successfully")
    expect(response.status).toEqual(200)
  })
})
```

#### 3. Add Consumer Function

Update `src/consumer.js` to include the new function:

```javascript
const deleteClient = async (id) => {
  const res = await axios
    .delete(`${getApiEndpoint}/clients/${id}`)
    .then((res) => {
      return res
    })
    .catch((err) => {
      return err.response
    })
  return res
}

module.exports = {
  server,
  getClients,
  postClient,
  getClient,
  deleteClient,  // Add this export
}
```

#### 4. Run Consumer Tests

Run the consumer tests to generate/update the pact contract:

```bash
npm run test:consumer
```

This will automatically update `__tests__/contract/pacts/frontend-clientsservice.json` with the new interaction.

#### 5. Update Provider Tests

Add a test in `__tests__/contract/provider/ClientsProvider.spec.js` if needed to verify the new endpoint is implemented and working correctly with the contract.

#### 6. Run Provider Verification

Run the provider tests to verify the provider implements the contract:

```bash
npm run test:provider
```

### Key Points to Remember

- **Consumer-Driven**: Always write the consumer test first, defining what the consumer expects
- **Single Responsibility**: Each interaction should test one specific request/response pair
- **State Management**: Use the `state` field to describe the precondition for the interaction
- **Meaningful Names**: Use clear `uponReceiving` descriptions that describe the interaction
- **Data Consistency**: Ensure test data in consumer tests matches provider implementation
- **Error Cases**: Add interactions for error scenarios (e.g., 404, 400 responses)
- **Timeout**: Interactions use a default timeout of 30 seconds (configurable in `jest.setTimeout()`)

### Example: Adding a GET by ID Test

Consumer test:
```javascript
describe("GET Client by ID", () => {
  beforeEach(() => {
    const interaction = {
      state: "I have a specific client",
      uponReceiving: "A request for client with id 1",
      withRequest: {
        method: "GET",
        path: "/clients/1",
      },
      willRespondWith: {
        status: 200,
        body: {
          "firstName": "Anakin",
          "lastName": "Skywalker",
          "age": 16,
          "profession": "Jedi Padawan",
          "id": 1
        },
      },
    }
    return provider.addInteraction(interaction)
  })

  test("returns correct client", async () => {
    const response = await getClient(1)
    expect(response.data.id).toEqual(1)
    expect(response.data.firstName).toEqual("Anakin")
    expect(response.status).toEqual(200)
  })
})
```

### Troubleshooting

- **"Pact verification failed"**: Check that the consumer test expectations match the actual provider response
- **"Mock server not configured"**: Ensure `pactSetup.js` is running before tests (check `jest` config in `package.json`)
- **"Cannot read properties of undefined"**: Verify the response object is being returned properly in error handling
- **Pact file not updating**: Delete the pact file and run `npm run test:consumer` again to regenerate it


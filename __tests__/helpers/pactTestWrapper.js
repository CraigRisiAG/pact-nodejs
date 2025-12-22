jest.setTimeout(30000)

beforeAll(async () => {
	if (global.provider && typeof global.provider.setup === 'function') {
		await global.provider.setup()
	}
})

afterAll(async () => {
	if (global.provider && typeof global.provider.finalize === 'function') {
		await global.provider.finalize()
	}
})
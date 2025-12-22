jest.setTimeout(30000)

beforeAll(() => global.provider.setup())

afterAll(() => global.provider.finalize())
import middleware from "../../__json_server_mock__/middleware";

type MockRequest = {
    body: Record<string, string>;
    headers: Record<string, string | undefined>;
    path: string;
};

type MockResponse = {
    json: jest.Mock<MockResponse, [unknown]>;
    status: jest.Mock<MockResponse, [number]>;
};

const createRequest = (overrides: Partial<MockRequest> = {}): MockRequest => ({
    body: {},
    headers: {},
    path: "/projects",
    ...overrides
});

const createResponse = (): MockResponse => {
    const response = {} as MockResponse;

    response.status = jest.fn(() => response);
    response.json = jest.fn(() => response);

    return response;
};

const runMiddleware = (request: Partial<MockRequest>) => {
    const req = createRequest(request);
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);

    return { next, res };
};

describe("json-server middleware", () => {
    it("returns a login token when credentials are present", () => {
        const { next, res } = runMiddleware({
            body: { email: "alice@example.com", password: "pw" },
            path: "/login"
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            email: "alice@example.com",
            id: 0,
            token: "alice@example.com"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it.each([
        [{ email: "wrong@example.com", password: "pw" }, "wrong email"],
        [{ email: "alice@example.com" }, "missing password"]
    ])("rejects invalid login credentials for %s", (body) => {
        const { next, res } = runMiddleware({
            body,
            path: "/login"
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid credential, please try again"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("creates users from valid register requests", () => {
        const { next, res } = runMiddleware({
            body: { email: "alice@example.com", password: "pw" },
            path: "/register"
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "User created" });
        expect(next).not.toHaveBeenCalled();
    });

    it.each([
        [{ email: "wrong@example.com", password: "pw" }, "wrong email"],
        [{ email: "alice@example.com" }, "missing password"]
    ])("rejects invalid register requests for %s", (body) => {
        const { next, res } = runMiddleware({
            body,
            path: "/register"
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Register failed, please try again"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("rejects non-auth routes without an authorization header", () => {
        const { next, res } = runMiddleware({ path: "/projects" });

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns user info from a bearer authorization header", () => {
        const { next, res } = runMiddleware({
            headers: { authorization: "Bearer token-1" },
            path: "/userInfo"
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            email: "token-1",
            token: "token-1"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("passes authorized non-special routes through", () => {
        const { next, res } = runMiddleware({
            headers: { authorization: "Bearer token-1" },
            path: "/projects"
        });

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
    });
});

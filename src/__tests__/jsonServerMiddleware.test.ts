import middleware from "../../__json_server_mock__/middleware";

type MockRequest = {
    body: Record<string, string>;
    headers: Record<string, string | undefined>;
    path: string;
};

type MockResponse = {
    json: jest.Mock;
    status: jest.Mock;
};

const createRequest = (overrides: Partial<MockRequest> = {}): MockRequest => ({
    body: {},
    headers: {},
    path: "/projects",
    ...overrides
});

const createResponse = (): MockResponse => {
    const response = {} as MockResponse;

    response.status = jest.fn((_code: number) => response);
    response.json = jest.fn((_body?: unknown) => response);

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
    it.each(["/login", "/api/v1/auth/login"])(
        "returns a login user when credentials are present for %s",
        (path) => {
            const { next, res } = runMiddleware({
                body: { email: "alice@example.com", password: "pw" },
                path
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                _id: "alice@example.com",
                email: "alice@example.com",
                jwt: "alice@example.com",
                likedProjects: [],
                username: "alice"
            });
            expect(next).not.toHaveBeenCalled();
        }
    );

    it("rejects invalid login credentials", () => {
        const { next, res } = runMiddleware({
            body: { email: "wrong@example.com", password: "pw" },
            path: "/login"
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid credential, please try again"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("rejects login requests with a missing password", () => {
        const { next, res } = runMiddleware({
            body: { email: "alice@example.com" },
            path: "/login"
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid credential, please try again"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it.each(["/register", "/api/v1/auth/register"])(
        "creates users from valid register requests for %s",
        (path) => {
            const { next, res } = runMiddleware({
                body: { email: "alice@example.com", password: "pw" },
                path
            });

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: "User created" });
            expect(next).not.toHaveBeenCalled();
        }
    );

    it.each([
        [{ email: "wrong@example.com", password: "pw" }, "wrong email"],
        [{ email: "alice@example.com" }, "missing password"]
    ])("rejects invalid register requests for %s", (body, _label) => {
        const { next, res } = runMiddleware({
            body,
            path: "/register"
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Register failed, please try again"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("rejects non-auth routes without an authorization header", () => {
        const { next, res } = runMiddleware({ path: "/projects" });

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(next).not.toHaveBeenCalled();
    });

    it.each(["/userInfo", "/api/v1/users"])(
        "returns user info from a bearer authorization header for %s",
        (path) => {
            const { next, res } = runMiddleware({
                headers: { authorization: "Bearer alice@example.com" },
                path
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                _id: "alice@example.com",
                email: "alice@example.com",
                jwt: "alice@example.com",
                likedProjects: [],
                username: "alice"
            });
            expect(next).not.toHaveBeenCalled();
        }
    );

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

import { parseFetchBody } from "./parseFetchBody";

const mockResponse = (
    body: string,
    jsonImpl?: () => Promise<unknown>
): Response => {
    const json =
        jsonImpl ??
        jest.fn().mockImplementation(() => {
            try {
                return Promise.resolve(JSON.parse(body || "null"));
            } catch {
                return Promise.reject(new SyntaxError("invalid json"));
            }
        });
    return {
        json,
        text: jest.fn().mockResolvedValue(body)
    } as unknown as Response;
};

describe("parseFetchBody", () => {
    it("returns undefined for empty body", async () => {
        const res = mockResponse("");
        await expect(parseFetchBody(res)).resolves.toBeUndefined();
    });

    it("parses JSON objects", async () => {
        const res = mockResponse('{"a":1}');
        await expect(parseFetchBody(res)).resolves.toEqual({ a: 1 });
    });

    it("returns raw text when JSON is invalid", async () => {
        const res = mockResponse("not json");
        await expect(parseFetchBody(res)).resolves.toBe("not json");
    });

    it("falls back to json() when text is unavailable", async () => {
        const res = {
            json: jest.fn().mockResolvedValue({ ok: true })
        } as unknown as Response;
        await expect(parseFetchBody(res)).resolves.toEqual({ ok: true });
    });

    it("returns undefined when neither text nor json is available", async () => {
        const res = {} as unknown as Response;
        await expect(parseFetchBody(res)).resolves.toBeUndefined();
    });
});

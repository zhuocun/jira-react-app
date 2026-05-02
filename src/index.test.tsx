/* eslint-disable global-require */
import { render, screen } from "@testing-library/react";

describe("index entry", () => {
    beforeEach(() => {
        jest.resetModules();
        document.body.innerHTML = '<div id="root"></div>';
    });

    it("mounts App inside AppProviders and starts web vitals reporting", () => {
        const mockRender = jest.fn();
        const mockCreateRoot = jest.fn(() => ({ render: mockRender }));
        const mockReportWebVitals = jest.fn();

        jest.doMock("react-dom/client", () => ({
            __esModule: true,
            default: {
                createRoot: mockCreateRoot
            }
        }));
        jest.doMock("./App", () => {
            const React = require("react");

            return {
                __esModule: true,
                default: () =>
                    React.createElement("div", { "data-testid": "app" }, "App")
            };
        });
        jest.doMock("./utils/appProviders", () => {
            const React = require("react");

            return {
                __esModule: true,
                default: (props: { children: unknown }) =>
                    React.createElement(
                        "div",
                        { "data-testid": "app-providers" },
                        props.children
                    )
            };
        });
        jest.doMock("./reportWebVitals", () => ({
            __esModule: true,
            default: mockReportWebVitals
        }));

        jest.isolateModules(() => {
            require("./index");
        });

        expect(mockCreateRoot).toHaveBeenCalledWith(
            document.getElementById("root")
        );
        expect(mockRender).toHaveBeenCalledTimes(1);

        render(mockRender.mock.calls[0][0]);

        expect(screen.getByTestId("app-providers")).toContainElement(
            screen.getByTestId("app")
        );
        // In non-production environments we wire the metrics through
        // `console.log` so INP/LCP/CLS show up during local development. The
        // test runner sets NODE_ENV="test", which is not "production", so
        // a callback should be supplied.
        expect(mockReportWebVitals).toHaveBeenCalledWith(expect.any(Function));
    });
});

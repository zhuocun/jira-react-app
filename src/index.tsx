import React from "react";
import ReactDOM from "react-dom/client";

import "antd/dist/reset.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import AppProviders from "./utils/appProviders";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </React.StrictMode>
);

// In dev, log Core Web Vitals (LCP, INP, CLS, FCP, TTFB) to the console so
// regressions are visible during local testing. The dynamic import inside
// reportWebVitals() only fires when a callback is supplied, so production
// builds without an analytics beacon stay zero-cost.
reportWebVitals(
    // eslint-disable-next-line no-console
    process.env.NODE_ENV !== "production" ? console.log : undefined
);

import styled from "@emotion/styled";
import { Spin, Typography } from "antd";

import { fontSize, fontWeight, space } from "../../theme/tokens";

const FullPage = styled.div`
    align-items: center;
    color: var(--ant-color-text, rgba(15, 23, 42, 0.85));
    display: flex;
    flex-direction: column;
    gap: ${space.md}px;
    height: 100vh;
    height: 100dvh;
    justify-content: center;
    padding: ${space.lg}px;
    text-align: center;
    width: 100%;
`;

const PageSpin: React.FC = () => {
    return (
        <FullPage>
            <Spin size="large" />
            <Typography.Text type="secondary">Loading…</Typography.Text>
        </FullPage>
    );
};

const PageError: React.FC<{ error: Error | null }> = ({ error }) => {
    return (
        <FullPage>
            <Typography.Text
                style={{
                    fontSize: fontSize.lg,
                    fontWeight: fontWeight.semibold
                }}
                type="danger"
            >
                {error?.message ||
                    "Page failed to load, please try again later."}
            </Typography.Text>
        </FullPage>
    );
};

export { PageError, PageSpin };

import styled from "@emotion/styled";
import { Spin, Typography } from "antd";

const FullPage = styled.div`
    align-items: center;
    display: flex;
    height: 100vh;
    height: 100dvh;
    justify-content: center;
    padding: 1rem;
    text-align: center;
    width: 100%;
`;

const PageSpin: React.FC = () => {
    return (
        <FullPage>
            <Spin />
        </FullPage>
    );
};

const PageError: React.FC<{ error: Error | null }> = ({ error }) => {
    return (
        <FullPage>
            <Typography.Text type="danger">
                {error?.message ||
                    "Page failed to load, please try again later."}
            </Typography.Text>
        </FullPage>
    );
};

export { PageError, PageSpin };

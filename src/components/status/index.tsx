import styled from "@emotion/styled";
import { Spin, Typography } from "antd";

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
            <Typography.Text type={"danger"}>
                {error?.message ||
                    "Page failed to load, please try again later."}
            </Typography.Text>
        </FullPage>
    );
};

export { PageSpin, PageError };

const FullPage = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
`;

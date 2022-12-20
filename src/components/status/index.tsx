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

export { PageError, PageSpin };

const FullPage = styled.div`
    align-items: center;
    display: flex;
    height: 100vh;
    justify-content: center;
    width: 100vw;
`;

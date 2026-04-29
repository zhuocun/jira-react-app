import styled from "@emotion/styled";
import { Dropdown, MenuProps, Switch, Typography } from "antd";
import { useLocation } from "react-router";

import Logo from "../../assets/logo-software.svg?react";
import useAuth from "../../utils/hooks/useAuth";
import useAiEnabled from "../../utils/hooks/useAiEnabled";
import resetRoute from "../../utils/resetRoute";
import MemberPopover from "../memberPopover";
import { NoPaddingButton } from "../projectList";
import Row from "../row";

const PageHeader = styled(Row)`
    padding: 3.2rem;
`;
const LeftHeader = styled(Row)``;
const RightHeader = styled.div`
    align-items: center;
    display: flex;
    gap: 1.6rem;
`;

const { Text } = Typography;

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const {
        available: aiAvailable,
        enabled: aiEnabled,
        setEnabled: setAiEnabled
    } = useAiEnabled();
    const path = useLocation().pathname;
    const items: MenuProps["items"] = [
        {
            key: "logout",
            label: (
                <NoPaddingButton
                    onClick={() => {
                        logout();
                    }}
                    type="link"
                >
                    Logout
                </NoPaddingButton>
            )
        }
    ];
    return (
        <PageHeader
            between
            style={{ boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.1)" }}
        >
            <LeftHeader gap>
                <NoPaddingButton
                    type="link"
                    onClick={
                        path !== "/projects"
                            ? () => resetRoute(window.location)
                            : undefined
                    }
                >
                    <Logo width="180px" color="rgb(38, 132, 255)" />
                </NoPaddingButton>
                <MemberPopover />
            </LeftHeader>
            <RightHeader>
                {aiAvailable ? (
                    <label
                        style={{
                            alignItems: "center",
                            cursor: "pointer",
                            display: "inline-flex",
                            gap: 8,
                            margin: 0,
                            userSelect: "none"
                        }}
                    >
                        <Text style={{ fontSize: 13 }} type="secondary">
                            Board Copilot
                        </Text>
                        <Switch
                            aria-label="Enable Board Copilot features"
                            checked={aiEnabled}
                            onChange={setAiEnabled}
                            size="small"
                        />
                    </label>
                ) : null}
                <Dropdown menu={{ items }}>
                    <NoPaddingButton
                        onClick={(e) => e.preventDefault()}
                        type="link"
                    >
                        Hi, {user?.username}
                    </NoPaddingButton>
                </Dropdown>
            </RightHeader>
        </PageHeader>
    );
};

export default Header;

import styled from "@emotion/styled";
import { Dropdown, MenuProps } from "antd";
import { useLocation } from "react-router";

import { ReactComponent as Logo } from "../../assets/logo-software.svg";
import useAuth from "../../utils/hooks/useAuth";
import resetRoute from "../../utils/resetRoute";
import MemberPopover from "../memberPopover";
import { NoPaddingButton } from "../projectList";
import Row from "../row";

const PageHeader = styled(Row)`
    padding: 3.2rem;
`;
const LeftHeader = styled(Row)``;
const RightHeader = styled.div``;

const Header: React.FC = () => {
    const { user, logout } = useAuth();
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
                    onClick={path !== "/projects" ? resetRoute : undefined}
                >
                    <Logo width="180px" color="rgb(38, 132, 255)" />
                </NoPaddingButton>
                <MemberPopover />
            </LeftHeader>
            <RightHeader>
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

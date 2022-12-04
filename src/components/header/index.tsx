import styled from "@emotion/styled";
import Row from "../row";
import { ReactComponent as Logo } from "../../assets/logo-software.svg";
import { Dropdown, MenuProps } from "antd";
import Link from "antd/lib/typography/Link";
import useAuth from "../../utils/hooks/useAuth";
import resetRoute from "../../utils/resetRoute";
import MemberPopover from "../memberPopover";
import { useLocation } from "react-router";
import { NoPaddingButton } from "../projectList";

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const path = useLocation().pathname;
    const items: MenuProps["items"] = [
        {
            key: "logout",
            label: (
                <Link
                    onClick={() => {
                        logout();
                    }}
                >
                    Logout
                </Link>
            )
        }
    ];
    return (
        <PageHeader
            between={true}
            style={{ boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.1)" }}
        >
            <LeftHeader gap={true}>
                <NoPaddingButton
                    type={"link"}
                    onClick={path !== "/projects" ? resetRoute : undefined}
                >
                    <Logo width="180px" color={"rgb(38, 132, 255)"} />
                </NoPaddingButton>
                <MemberPopover />
            </LeftHeader>
            <RightHeader>
                <Dropdown menu={{ items }}>
                    <Link onClick={(e) => e.preventDefault()}>
                        Hi, {user?.username}
                    </Link>
                </Dropdown>
            </RightHeader>
        </PageHeader>
    );
};

const PageHeader = styled(Row)`
    padding: 3.2rem;
`;
const LeftHeader = styled(Row)``;
const RightHeader = styled.div``;

export default Header;

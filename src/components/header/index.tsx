import styled from "@emotion/styled";
import Row from "../row";
import { ReactComponent as Logo } from "../../assets/logo-software.svg";
import { Button, Dropdown, MenuProps } from "antd";
import Link from "antd/lib/typography/Link";
import useAuth from "../../utils/hooks/useAuth";
import resetRoute from "../../utils/resetRoute";
import { useNavigate } from "react-router";
import MemberPopover from "../memberPopover";

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const items: MenuProps["items"] = [
        {
            key: "logout",
            label: (
                <Link
                    onClick={() => {
                        logout().then(() => navigate("/login"));
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
                <Button
                    style={{ padding: 0 }}
                    type={"link"}
                    onClick={resetRoute}
                >
                    <Logo width="180px" color={"rgb(38, 132, 255)"} />
                </Button>
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

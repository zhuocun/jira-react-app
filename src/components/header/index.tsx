import styled from "@emotion/styled";
import Row from "../row";
import { ReactComponent as Logo } from "../../assets/logo-software.svg";
import { Dropdown, MenuProps } from "antd";
import Link from "antd/lib/typography/Link";
import { useAuth } from "../../utils/context/authContext";

const Header = () => {
    const { user, logout } = useAuth();
    const items: MenuProps["items"] = [
        {
            key: "logout",
            label: <Link onClick={logout}>Logout</Link>
        }
    ];
    return (
        <PageHeader
            between={true}
            style={{ boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.1)" }}
        >
            <LeftHeader gap={true}>
                <Logo width="180px" color={"rgb(38, 132, 255)"} />
                <h2>Projects</h2>
                <h2>Users</h2>
            </LeftHeader>
            <RightHeader>
                <Dropdown menu={{ items }}>
                    <Link onClick={(e) => e.preventDefault()}>
                        Hi, {user?.email}
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

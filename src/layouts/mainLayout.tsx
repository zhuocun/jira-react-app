import ProjectList from "../components/projectList";
import { useAuth } from "../utils/context/authContext";
import styled from "@emotion/styled";
import Row from "../components/row";
import { ReactComponent as Logo } from "../assets/logo-software.svg";
import { Dropdown, MenuProps } from "antd";
import Link from "antd/lib/typography/Link";

const MainLayout = () => {
    const { user, logout } = useAuth();
    const items: MenuProps["items"] = [
        {
            key: "logout",
            label: <Link onClick={logout}>Logout</Link>
        }
    ];
    return (
        <Container>
            <Header
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
            </Header>
            <Main>
                <ProjectList />
            </Main>
        </Container>
    );
};

export default MainLayout;

const Container = styled.div`
    display: grid;
    grid-template-rows: 6rem 1fr;
    height: 100vh;
`;
const Header = styled(Row)`
    padding: 3.2rem;
`;
const LeftHeader = styled(Row)``;
const RightHeader = styled.div``;
const Main = styled.main``;

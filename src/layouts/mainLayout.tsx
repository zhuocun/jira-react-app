import ProjectList from "../components/projectList";
import { useAuth } from "../utils/context/authContext";
import styled from "@emotion/styled";

const MainLayout = () => {
    const { logout } = useAuth();
    return (
        <>
            <PageHeader>
                <button onClick={logout}>Logout</button>
            </PageHeader>
            <Main><ProjectList /></Main>
        </>
    );
};

export default MainLayout;

const PageHeader = styled.header`
  height: 6rem;
`;

const Main = styled.main`
  height: calc(100vh - 6rem);
`;

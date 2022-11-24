import styled from "@emotion/styled";
import Header from "../components/header";
import { Outlet } from "react-router";
import ProjectModal from "../components/projectModal";

const MainLayout = () => {
    return (
        <Container>
            <Header />
            <Main>
                <Outlet />
            </Main>
            <ProjectModal isOpened={false} onClose={() => []} />
        </Container>
    );
};

export default MainLayout;

const Container = styled.div`
  display: grid;
  grid-template-rows: 6rem 1fr;
  height: 100vh;
`;
const Main = styled.main``;

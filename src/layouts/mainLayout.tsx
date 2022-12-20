import styled from "@emotion/styled";
import { Outlet } from "react-router";

import Header from "../components/header";
import ProjectModal from "../components/projectModal";

const MainLayout = () => {
    return (
        <Container>
            <Header />
            <Main>
                <Outlet />
            </Main>
            <ProjectModal />
        </Container>
    );
};

export default MainLayout;

const Container = styled.div`
    display: grid;
    grid-template-rows: 6rem 1fr;
    height: 100vh;
    max-height: 1440px;
    min-width: 1024px;
`;

const Main = styled.main`
    display: flex;
    overflow: scroll;
`;

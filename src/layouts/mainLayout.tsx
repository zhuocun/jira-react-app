import ProjectList from "../components/projectList";
import styled from "@emotion/styled";
import Header from "../components/header";
import { Route, Routes } from "react-router";
import Project from "../components/project";

const MainLayout = () => {
    return (
        <Container>
            <Header />
            <Main>
                <Routes>
                    <Route path={"/projects"} element={<ProjectList />} />
                    <Route
                        path={"/projects/:projectId/*"}
                        element={<Project />}
                    />
                </Routes>
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
const Main = styled.main``;

import styled from "@emotion/styled";
import { Menu, MenuProps } from "antd";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";

import ProjectPopover from "../components/projectPopover";

const ProjectDetailPage = () => {
    const route = useLocation().pathname.split("/");
    const navigate = useNavigate();
    const items: MenuProps["items"] = [
        {
            key: "board",
            label: (
                <Link to={"board"} style={{ paddingLeft: "1rem" }}>
                    Board
                </Link>
            )
        },
        {
            key: "projects",
            label: <ProjectPopover />
        }
    ];

    useEffect(() => {
        if (!route.includes("board")) {
            navigate("board");
        }
    }, [navigate, route]);

    return (
        <Container>
            <Aside>
                <Menu
                    mode={"inline"}
                    selectedKeys={[route[route.length - 1]]}
                    items={items}
                />
            </Aside>
            <Main>
                <Outlet />
            </Main>
        </Container>
    );
};

export default ProjectDetailPage;

const Aside = styled.aside`
    background-color: rgb(244, 245, 247);
    display: flex;
`;

const Main = styled.div`
    box-shadow: -5px 0 5 px -5px rgba(0, 0, 0, 0.1);
    display: flex;
    overflow: hidden;
`;

const Container = styled.div`
    display: grid;
    grid-template-columns: 16rem 1fr;
    overflow: hidden;
`;

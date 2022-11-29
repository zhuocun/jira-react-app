import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { Outlet, useLocation } from "react-router";
import { Menu, MenuProps } from "antd";

const ProjectDetailPage = () => {
    const route = useLocation().pathname.split("/");
    const items: MenuProps["items"] = [
        {
            key: "kanban",
            label: <Link to={"kanban"}>Kanban</Link>
        },
        {
            key: "epic",
            label: <Link to={"epic"}>Epic</Link>
        }
    ];
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
    display: flex;
    box-shadow: -5px 0 5 px -5px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const Container = styled.div`
    display: grid;
    grid-template-columns: 16rem 1fr;
    overflow: hidden;
`;

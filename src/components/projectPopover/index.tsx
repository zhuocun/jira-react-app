import { Button, Divider, List, Popover, Typography } from "antd";
import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactQuery from "../../utils/hooks/useReactQuery";
import { useNavigate } from "react-router";
import React from "react";

const ProjectPopover = () => {
    const { openModal } = useProjectModal();
    const { data: projects } = useReactQuery<IProject[]>("projects");
    const navigate = useNavigate();

    const content = (
        <div style={{ minWidth: "30rem" }}>
            <Typography.Text type={"secondary"}>Projects</Typography.Text>
            <List>
                {projects?.map((p, index) => (
                    <div key={index} style={{ marginTop: "1rem" }}>
                        <Button
                            type={"text"}
                            style={{ padding: 0 }}
                            key={index}
                            onClick={() => navigate(`/projects/${p._id}`)}
                        >
                            {p.projectName}
                        </Button>
                    </div>
                ))}
            </List>
            <Divider />
            <Button onClick={openModal} type={"link"} style={{ padding: 0 }}>
                Create Project
            </Button>
        </div>
    );

    return (
        <Popover placement={"right"} content={content}>
            <span style={{ padding: "1rem" }}>Projects</span>
        </Popover>
    );
};

export default ProjectPopover;

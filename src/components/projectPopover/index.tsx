import { Divider, List, Popover, Typography } from "antd";
import { useNavigate } from "react-router";

import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactQuery from "../../utils/hooks/useReactQuery";
import { NoPaddingButton } from "../projectList";

const ProjectPopover: React.FC = () => {
    const { openModal } = useProjectModal();
    const { data: projects } = useReactQuery<IProject[]>("projects");
    const navigate = useNavigate();

    const content = (
        <div style={{ minWidth: "30rem" }}>
            <Typography.Text type={"secondary"}>Projects</Typography.Text>
            <List>
                {projects?.map((project) => (
                    <div key={project._id} style={{ marginTop: "1rem" }}>
                        <NoPaddingButton
                            type={"text"}
                            key={project._id}
                            onClick={() => navigate(`/projects/${project._id}`)}
                        >
                            {project.projectName}
                        </NoPaddingButton>
                    </div>
                ))}
            </List>
            <Divider />
            <NoPaddingButton onClick={openModal} type={"link"}>
                Create Project
            </NoPaddingButton>
        </div>
    );

    return (
        <Popover placement={"right"} content={content}>
            <span style={{ padding: "1rem" }}>Projects</span>
        </Popover>
    );
};

export default ProjectPopover;

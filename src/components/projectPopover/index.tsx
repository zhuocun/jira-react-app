import { Button, Divider, List, Popover, Typography } from "antd";
import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactQuery from "../../utils/hooks/useReactQuery";
import { useNavigate } from "react-router";
import { NoPaddingButton } from "../projectList";

const ProjectPopover: React.FC = () => {
    const { openModal } = useProjectModal();
    const { data: projects } = useReactQuery<IProject[]>("projects");
    const navigate = useNavigate();

    const content = (
        <div style={{ minWidth: "30rem" }}>
            <Typography.Text type={"secondary"}>Projects</Typography.Text>
            <List>
                {projects?.map((project, index) => (
                    <div key={index} style={{ marginTop: "1rem" }}>
                        <NoPaddingButton
                            type={"text"}
                            key={index}
                            onClick={() => navigate(`/projects/${project._id}`)}
                        >
                            {project.projectName}
                        </NoPaddingButton>
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

import { Button, Divider, List, Popover, Typography } from "antd";
import { useReduxSelector } from "../../utils/hooks/useRedux";
import useProjectModal from "../../utils/hooks/useProjectModal";

const ProjectPopover = () => {
    const {openModal} = useProjectModal();
    const projects = useReduxSelector((s) => s.project.projects);
    const user = useReduxSelector((s) => s.auth.user);
    const likedProjects = projects.filter((project) =>
        user?.likedProjects.includes(project._id)
    );

    const content = (
        <>
            <Typography.Text type={"secondary"}>Liked Projects</Typography.Text>
            <List>
                {likedProjects.map((p, index) => (
                    <List.Item.Meta key={index} title={p.projectName} />
                ))}
            </List>
            <Divider />
            <Button
                onClick={openModal}
                type={"link"}
            >
                Create Project
            </Button>
        </>
    );

    return (
        <Popover placement={"bottom"} content={content}>
            <span>Projects</span>
        </Popover>
    );
};

export default ProjectPopover;

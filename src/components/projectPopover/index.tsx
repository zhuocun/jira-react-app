import { Button, Divider, List, Popover, Typography } from "antd";
import useProjectModal from "../../utils/hooks/useProjectModal";
import { useQueryClient } from "react-query";
import useReactQuery from "../../utils/hooks/useReactQuery";

const ProjectPopover = () => {
    const { openModal } = useProjectModal();
    const queryClient = useQueryClient();
    const projects = queryClient.getQueryData<IProject[]>(["projects", {}]);
    const { data: user } = useReactQuery<IUser>("users");
    const likedProjects = projects?.filter((project) =>
        user?.likedProjects.includes(project._id)
    );

    const content = (
        <>
            <Typography.Text type={"secondary"}>Liked Projects</Typography.Text>
            <List>
                {likedProjects?.map((p, index) => (
                    <List.Item.Meta key={index} title={p.projectName} />
                ))}
            </List>
            <Divider />
            <Button onClick={openModal} type={"link"}>
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

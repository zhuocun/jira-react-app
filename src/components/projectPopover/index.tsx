import { Popover, Typography } from "antd";

const ProjectPopover = () => {
    const content = (
        <div>
            <Typography.Text type={"secondary"}>Like Project</Typography.Text>
        </div>
    );
    return <Popover placement={"bottom"} content={content}></Popover>;
};

export default ProjectPopover;

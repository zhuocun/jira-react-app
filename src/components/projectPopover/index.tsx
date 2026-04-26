import styled from "@emotion/styled";
import { Divider, Popover, Typography } from "antd";
import { useNavigate } from "react-router";

import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactQuery from "../../utils/hooks/useReactQuery";
import { NoPaddingButton } from "../projectList";

const ContentContainer = styled.div`
    min-width: 30rem;
`;

const ProjectList = styled.div`
    padding-top: 0.5rem;
`;

const ProjectItem = styled.div`
    padding: 0.5rem 0;
`;

const ProjectPopover: React.FC = () => {
    const { openModal } = useProjectModal();
    const { data: projects } = useReactQuery<IProject[]>("projects");
    const navigate = useNavigate();

    const content = (
        <ContentContainer>
            <Typography.Text type="secondary">Projects</Typography.Text>
            <ProjectList>
                {projects?.map((project) => (
                    <ProjectItem key={project._id}>
                        <NoPaddingButton
                            type="text"
                            key={project._id}
                            onClick={() => navigate(`/projects/${project._id}`)}
                        >
                            {project.projectName}
                        </NoPaddingButton>
                    </ProjectItem>
                ))}
            </ProjectList>
            <Divider />
            <NoPaddingButton onClick={openModal} type="link">
                Create Project
            </NoPaddingButton>
        </ContentContainer>
    );

    return (
        <Popover placement="right" content={content}>
            <span style={{ padding: "1rem" }}>Projects</span>
        </Popover>
    );
};

export default ProjectPopover;

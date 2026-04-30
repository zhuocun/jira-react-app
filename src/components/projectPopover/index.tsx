import styled from "@emotion/styled";
import { Divider, Popover, Typography } from "antd";
import { useNavigate } from "react-router";

import { space } from "../../theme/tokens";
import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactQuery from "../../utils/hooks/useReactQuery";
import { NoPaddingButton } from "../projectList";

const ContentContainer = styled.div`
    min-width: 16rem;
`;

const ProjectList = styled.div`
    padding-top: ${space.xs}px;
`;

const ProjectItem = styled.div`
    padding: ${space.xs}px 0;
`;

/**
 * Lightweight project switcher used inside the project detail breadcrumb.
 *
 * The trigger is a real `<button>` (not a bare `<span>`) so it is keyboard
 * focusable and announces correctly to screen readers; popover placement
 * defaults to `bottom` so it does not clip on narrow viewports.
 */
const TriggerButton = styled.button`
    background: transparent;
    border: none;
    border-radius: ${space.xs}px;
    color: inherit;
    cursor: pointer;
    font: inherit;
    padding: ${space.xxs}px ${space.xs}px;

    &:hover,
    &:focus-visible {
        background: var(--ant-color-bg-text-hover, rgba(0, 0, 0, 0.04));
    }
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
            <Divider style={{ margin: `${space.sm}px 0` }} />
            <NoPaddingButton onClick={openModal} type="link">
                Create project
            </NoPaddingButton>
        </ContentContainer>
    );

    return (
        <Popover content={content} placement="bottom">
            <TriggerButton
                aria-haspopup="menu"
                aria-label="Switch project"
                type="button"
            >
                Projects
            </TriggerButton>
        </Popover>
    );
};

export default ProjectPopover;

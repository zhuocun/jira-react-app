import {
    HeartFilled,
    HeartOutlined,
    MoreOutlined,
    TeamOutlined
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Dropdown, MenuProps, Skeleton } from "antd";
import React from "react";
import { Link } from "react-router-dom";

import { microcopy } from "../../constants/microcopy";
import {
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    radius,
    semantic,
    shadow,
    space
} from "../../theme/tokens";
import { getAiSearchStrength } from "../../utils/ai/aiSearchStrength";
import AiMatchStrengthBadge from "../aiMatchStrengthBadge";
import UserAvatar from "../userAvatar";

interface ProjectCardProps {
    project: IProject;
    manager?: IMember;
    liked: boolean;
    onLike: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const Card = styled.article`
    background: var(--ant-color-bg-container, #fff);
    border: 1px solid var(--ant-color-border-secondary, rgba(15, 23, 42, 0.05));
    border-radius: ${radius.lg}px;
    box-shadow: ${shadow.xs};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    transition:
        border-color 180ms ease-out,
        box-shadow 180ms ease-out,
        transform 180ms ease-out;

    &:hover,
    &:focus-within {
        border-color: var(--glass-border-strong);
        box-shadow:
            ${shadow.md},
            0 0 0 1px var(--glass-border-strong),
            0 12px 32px -16px rgba(15, 23, 42, 0.18);
        transform: translateY(-2px);
    }

    /* Disable the lift on touch devices where hover feels janky. */
    @media (hover: none) {
        &:hover,
        &:focus-within {
            box-shadow: ${shadow.xs};
            transform: none;
        }
    }
`;

const Body = styled.div`
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: ${space.sm}px;
    padding: ${space.lg}px ${space.lg}px ${space.md}px;
`;

/**
 * Header row that anchors the card: a small project monogram avatar
 * inline with the title stack. Replaces the previous 72 px gradient
 * cover so the card reads content-first — title and organisation are
 * the visual centre, the avatar is just a small per-project colour cue.
 */
const HeaderRow = styled.div`
    align-items: center;
    display: flex;
    gap: ${space.md}px;
    min-width: 0;
`;

const TitleStack = styled.div`
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
`;

const TitleLink = styled(Link)`
    color: var(--ant-color-text, rgba(15, 23, 42, 0.92));
    font-size: ${fontSize.lg}px;
    font-weight: ${fontWeight.semibold};
    letter-spacing: ${letterSpacing.tight};
    line-height: ${lineHeight.snug};
    overflow: hidden;
    overflow-wrap: break-word;
    text-decoration: none;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    display: -webkit-box;

    /*
     * Stretch the underlying anchor so anywhere on the card body that
     * isn't another interactive control routes to the project. This is
     * the "card-as-link" pattern: keyboard / screen-reader users tab to
     * the title text, sighted users can click the empty space.
     */
    &::after {
        bottom: 0;
        content: "";
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 0;
    }

    &:hover {
        color: var(--ant-color-primary, #ea580c);
    }
`;

const Organization = styled.span`
    color: var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.5));
    font-size: ${fontSize.xs}px;
    font-weight: ${fontWeight.medium};
    letter-spacing: ${letterSpacing.wide};
    text-transform: uppercase;
`;

const ManagerRow = styled.div`
    align-items: center;
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.65));
    display: flex;
    font-size: ${fontSize.sm}px;
    gap: ${space.xs}px;
    margin-top: auto;
    min-width: 0;
    padding-top: ${space.sm}px;
    position: relative;
    z-index: 1;

    > span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const Footer = styled.footer`
    align-items: center;
    border-top: 1px solid
        var(--ant-color-border-secondary, rgba(15, 23, 42, 0.04));
    color: var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.5));
    display: flex;
    font-size: ${fontSize.xs}px;
    gap: ${space.xs}px;
    justify-content: space-between;
    padding: ${space.xs}px ${space.md}px ${space.xs}px ${space.lg}px;
    position: relative;
    z-index: 1;
`;

const ActionsCluster = styled.div`
    align-items: center;
    display: inline-flex;
    gap: 2px;

    /*
     * On touch devices, AntD's small icon buttons collapse to ~24 px, which
     * is below the WCAG 2.5.5 AA recommendation of 44 x 44. Lift each
     * action target so a thumb can land it without zoom; the icon glyph
     * itself stays compact, only the click region grows.
     */
    @media (pointer: coarse) {
        .ant-btn-sm {
            min-height: 44px;
            min-width: 44px;
        }
    }
`;

const formatDate = (raw?: string): string => {
    if (!raw) return microcopy.feedback.noDate;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return microcopy.feedback.noDate;
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit"
    }).format(date);
};

/**
 * Single project card used inside the project list grid.
 *
 * The card is now content-forward: a small per-project monogram avatar
 * sits inline with the title stack (project name + organisation), the
 * manager row floats below, and secondary actions (favorite, edit,
 * delete) live in the footer. The previous gradient "cover" with a
 * standalone first-character badge has been removed — it was decorative
 * weight that competed with the title for attention.
 */
const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    manager,
    liked,
    onLike,
    onEdit,
    onDelete
}) => {
    // Per-result strength badge (P1-2). Null when no AI search is active.
    const strength = getAiSearchStrength("projects", project._id);
    const items: MenuProps["items"] = [
        {
            key: "edit",
            label: (
                <button
                    aria-label={`${microcopy.actions.edit} ${project.projectName}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        font: "inherit",
                        padding: 0,
                        textAlign: "left",
                        width: "100%"
                    }}
                    type="button"
                >
                    {microcopy.actions.edit}
                </button>
            )
        },
        {
            key: "delete",
            label: (
                <button
                    aria-label={`${microcopy.actions.delete} ${project.projectName}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: semantic.error,
                        cursor: "pointer",
                        font: "inherit",
                        padding: 0,
                        textAlign: "left",
                        width: "100%"
                    }}
                    type="button"
                >
                    {microcopy.actions.delete}
                </button>
            )
        }
    ];

    return (
        <Card>
            <Body>
                <HeaderRow>
                    <UserAvatar
                        id={project._id}
                        name={project.projectName}
                        size={44}
                        style={{
                            borderRadius: radius.md,
                            flex: "0 0 auto"
                        }}
                    />
                    <TitleStack>
                        <Organization>
                            {project.organization || "No organization"}
                        </Organization>
                        <TitleLink
                            to={`/projects/${project._id}`}
                            viewTransition
                        >
                            {project.projectName}
                        </TitleLink>
                    </TitleStack>
                </HeaderRow>
                <ManagerRow>
                    {manager ? (
                        <>
                            <UserAvatar
                                id={manager._id}
                                name={manager.username}
                                size="small"
                            />
                            <span>{manager.username}</span>
                        </>
                    ) : (
                        <>
                            <TeamOutlined aria-hidden />
                            <span>{microcopy.feedback.noManager}</span>
                        </>
                    )}
                </ManagerRow>
            </Body>
            <Footer>
                <span
                    style={{
                        alignItems: "center",
                        display: "inline-flex",
                        gap: space.xs
                    }}
                >
                    {strength ? (
                        <AiMatchStrengthBadge strength={strength} />
                    ) : null}
                    {formatDate(project.createdAt)}
                </span>
                <ActionsCluster>
                    <Button
                        aria-label={
                            liked
                                ? `Unlike ${project.projectName}`
                                : `Like ${project.projectName}`
                        }
                        aria-pressed={liked}
                        icon={
                            liked ? (
                                <HeartFilled
                                    style={{ color: semantic.favorite }}
                                />
                            ) : (
                                <HeartOutlined />
                            )
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike();
                        }}
                        size="small"
                        style={{ position: "relative", zIndex: 2 }}
                        type="text"
                    />
                    <Dropdown
                        menu={{ items }}
                        placement="bottomRight"
                        trigger={["click"]}
                    >
                        <Button
                            aria-label={`More actions for ${project.projectName}`}
                            icon={<MoreOutlined />}
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                            style={{ position: "relative", zIndex: 2 }}
                            type="text"
                        />
                    </Dropdown>
                </ActionsCluster>
            </Footer>
        </Card>
    );
};

export const ProjectCardSkeleton: React.FC = () => (
    <Card aria-hidden>
        <Body>
            <HeaderRow>
                <Skeleton.Avatar
                    active
                    shape="square"
                    size={44}
                    style={{ borderRadius: radius.md }}
                />
                <TitleStack>
                    <Skeleton.Input active size="small" style={{ width: 80 }} />
                    <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "80%" }}
                    />
                </TitleStack>
            </HeaderRow>
            <ManagerRow>
                <Skeleton.Avatar active size="small" />
                <Skeleton.Input active size="small" style={{ width: 96 }} />
            </ManagerRow>
        </Body>
        <Footer>
            <Skeleton.Input active size="small" style={{ width: 64 }} />
            <Skeleton.Input active size="small" style={{ width: 48 }} />
        </Footer>
    </Card>
);

export default ProjectCard;

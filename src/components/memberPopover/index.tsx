import { CaretDownOutlined, TeamOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Avatar, List, Popover, Typography } from "antd";

import { microcopy } from "../../constants/microcopy";
import {
    breakpoints,
    fontSize,
    fontWeight,
    radius,
    space
} from "../../theme/tokens";
import useReactQuery from "../../utils/hooks/useReactQuery";
import EmptyState from "../emptyState";

const ContentContainer = styled.div`
    max-height: 60vh;
    max-width: min(30rem, calc(100vw - 32px));
    min-width: min(20rem, calc(100vw - 32px));
    overflow-y: auto;
`;

const TriggerLabel = styled.span`
    @media (max-width: ${breakpoints.sm - 1}px) {
        display: none;
    }
`;

const SectionLabel = styled(Typography.Text)`
    && {
        color: var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.5));
        display: block;
        font-size: ${fontSize.xs}px;
        font-weight: ${fontWeight.semibold};
        letter-spacing: 0.06em;
        margin-bottom: ${space.xs}px;
        text-transform: uppercase;
    }
`;

const TriggerButton = styled.button`
    align-items: center;
    background: transparent;
    border: none;
    border-radius: ${radius.md}px;
    color: var(--ant-color-text, rgba(15, 23, 42, 0.85));
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-weight: ${fontWeight.medium};
    gap: ${space.xs}px;
    min-height: 32px;
    padding: ${space.xxs}px ${space.sm}px;
    transition: background-color 120ms ease-out;
    white-space: nowrap;

    &:hover {
        background: var(--ant-color-bg-text-hover, rgba(15, 23, 42, 0.04));
    }

    @media (pointer: coarse) {
        min-height: 44px;
    }
`;

const MEMBER_GRADIENTS = [
    "linear-gradient(135deg, #7C5CFF 0%, #5E6AD2 100%)",
    "linear-gradient(135deg, #C084FC 0%, #6366F1 100%)",
    "linear-gradient(135deg, #F472B6 0%, #7C5CFF 100%)",
    "linear-gradient(135deg, #38BDF8 0%, #5E6AD2 100%)",
    "linear-gradient(135deg, #34D399 0%, #5E6AD2 100%)",
    "linear-gradient(135deg, #FB923C 0%, #C084FC 100%)"
] as const;

const gradientFor = (id: string): string => {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    return MEMBER_GRADIENTS[Math.abs(hash) % MEMBER_GRADIENTS.length];
};

const initialsOf = (username: string | undefined): string => {
    if (!username) return "?";
    const parts = username.trim().split(/\s+/);
    const head = parts[0]?.[0] ?? "";
    const tail = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (head + tail).toUpperCase() || username[0].toUpperCase();
};

const MemberPopover: React.FC = () => {
    const { data: members, refetch } =
        useReactQuery<IMember[]>("users/members");

    const list = members ?? [];

    const content = (
        <ContentContainer>
            <SectionLabel>Team Members</SectionLabel>
            {list.length === 0 ? (
                <EmptyState
                    title={microcopy.empty.members.title}
                    description={microcopy.empty.members.description}
                />
            ) : (
                <List
                    dataSource={list}
                    itemLayout="horizontal"
                    renderItem={(member) => (
                        <List.Item key={member._id}>
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        size="small"
                                        style={{
                                            background: gradientFor(member._id),
                                            color: "#fff",
                                            fontSize: 11,
                                            fontWeight: 600
                                        }}
                                    >
                                        {initialsOf(member.username)}
                                    </Avatar>
                                }
                                description={member.email}
                                title={member.username}
                            />
                        </List.Item>
                    )}
                    size="small"
                />
            )}
        </ContentContainer>
    );

    return (
        <Popover
            onOpenChange={(open) => {
                if (open) refetch();
            }}
            placement="bottomLeft"
            content={content}
        >
            <TriggerButton aria-label="View team members" type="button">
                <TeamOutlined aria-hidden />
                <TriggerLabel>Members</TriggerLabel>
                <CaretDownOutlined
                    aria-hidden
                    style={{ fontSize: 10, opacity: 0.6 }}
                />
            </TriggerButton>
        </Popover>
    );
};

export default MemberPopover;

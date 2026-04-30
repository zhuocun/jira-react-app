import styled from "@emotion/styled";
import { Avatar, Divider, List, Popover, Typography } from "antd";

import { brand, space } from "../../theme/tokens";
import useReactQuery from "../../utils/hooks/useReactQuery";
import EmptyState from "../emptyState";
import { microcopy } from "../../constants/microcopy";

const ContentContainer = styled.div`
    min-width: min(30rem, 90vw);
`;

const TriggerButton = styled.button`
    align-items: center;
    background: transparent;
    border: none;
    border-radius: ${space.sm}px;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    gap: ${space.xs}px;
    padding: ${space.xxs}px ${space.xs}px;

    &:hover {
        background: var(--ant-color-bg-text-hover, rgba(0, 0, 0, 0.04));
    }
`;

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
            <Typography.Text type="secondary">Team Members</Typography.Text>
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
                                            backgroundColor: brand.primary
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
                    style={{ paddingTop: space.xs }}
                />
            )}
            <Divider style={{ margin: `${space.sm}px 0 0` }} />
        </ContentContainer>
    );

    return (
        <Popover
            onOpenChange={(open) => {
                if (open) refetch();
            }}
            placement="bottom"
            content={content}
        >
            <TriggerButton aria-label="View team members" type="button">
                Members
            </TriggerButton>
        </Popover>
    );
};

export default MemberPopover;

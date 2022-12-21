import styled from "@emotion/styled";
import { Divider, List, Popover, Typography } from "antd";

import useReactQuery from "../../utils/hooks/useReactQuery";

const ContentContainer = styled.div`
    min-width: 30rem;
`;

const MemberPopover: React.FC = () => {
    const { data: members, refetch } =
        useReactQuery<IMember[]>("users/members");

    const content = (
        <ContentContainer>
            <Typography.Text type="secondary">Team Members</Typography.Text>
            <List>
                {members?.map((member) => (
                    <List.Item key={member._id}>
                        <List.Item.Meta title={member.username} />
                    </List.Item>
                ))}
            </List>
            <Divider />
        </ContentContainer>
    );

    return (
        <Popover
            onOpenChange={() => refetch()}
            placement="bottom"
            content={content}
        >
            <span>Members</span>
        </Popover>
    );
};

export default MemberPopover;

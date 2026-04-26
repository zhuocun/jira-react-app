import styled from "@emotion/styled";
import { Divider, Popover, Typography } from "antd";

import useReactQuery from "../../utils/hooks/useReactQuery";

const ContentContainer = styled.div`
    min-width: 30rem;
`;

const MemberList = styled.div`
    padding-top: 0.5rem;
`;

const MemberItem = styled.div`
    padding: 0.5rem 0;
`;

const MemberPopover: React.FC = () => {
    const { data: members, refetch } =
        useReactQuery<IMember[]>("users/members");

    const content = (
        <ContentContainer>
            <Typography.Text type="secondary">Team Members</Typography.Text>
            <MemberList>
                {members?.map((member) => (
                    <MemberItem key={member._id}>
                        <Typography.Text>{member.username}</Typography.Text>
                    </MemberItem>
                ))}
            </MemberList>
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

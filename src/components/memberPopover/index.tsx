import { Divider, List, Popover, Typography } from "antd";
import styled from "@emotion/styled";
import useReactQuery from "../../utils/hooks/useReactQuery";

const MemberPopover: React.FC = () => {
    const { data: members, refetch } =
        useReactQuery<IMember[]>("users/members");

    const content = (
        <ContentContainer>
            <Typography.Text type={"secondary"}>Team Members</Typography.Text>
            <List>
                {members?.map((member, index) => (
                    <List.Item key={index}>
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
            placement={"bottom"}
            content={content}
        >
            <span>Members</span>
        </Popover>
    );
};

export default MemberPopover;

const ContentContainer = styled.div`
    min-width: 30rem;
`;

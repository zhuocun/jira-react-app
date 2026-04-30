import { SearchOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Input, Select } from "antd";
import React from "react";

import { space } from "../../theme/tokens";

export interface ProjectSearchParam {
    projectName: string;
    managerId: string;
    semanticIds?: string;
}

interface Props {
    param: ProjectSearchParam;
    setParam: (params: Partial<ProjectSearchParam>) => void;
    members: IMember[];
    loading: boolean;
    aiSearchSlot?: React.ReactNode;
}

const FilterRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${space.sm}px;
    margin-bottom: ${space.lg}px;

    @media (min-width: 768px) {
        align-items: center;
        flex-direction: row;
        flex-wrap: wrap;
    }
`;

const FlexInput = styled.div`
    flex: 1 1 14rem;
    min-width: 0;

    @media (min-width: 768px) {
        max-width: 22rem;
    }
`;

const FlexSelect = styled.div`
    flex: 1 1 12rem;
    min-width: 0;

    @media (min-width: 768px) {
        max-width: 14rem;
    }
`;

const ProjectSearchPanel: React.FC<Props> = ({
    param,
    setParam,
    members,
    loading,
    aiSearchSlot
}) => {
    const defaultUser = members.find((u) => u._id === param.managerId);

    return (
        <div>
            {aiSearchSlot}
            <FilterRow role="search" aria-label="Filter projects">
                <FlexInput>
                    <Input
                        aria-label="Search projects by name"
                        allowClear
                        onChange={(e) =>
                            setParam({
                                ...param,
                                projectName: e.target.value
                            })
                        }
                        placeholder="Search this list"
                        suffix={<SearchOutlined aria-hidden />}
                        type="search"
                        value={param.projectName}
                    />
                </FlexInput>
                <FlexSelect>
                    <Select
                        allowClear
                        aria-label="Filter by manager"
                        loading={loading}
                        onChange={(value) =>
                            setParam({
                                ...param,
                                managerId: value ?? ""
                            })
                        }
                        placeholder="Manager"
                        style={{ width: "100%" }}
                        value={
                            loading
                                ? undefined
                                : (defaultUser?.username ?? undefined)
                        }
                    >
                        <Select.Option value="">Managers</Select.Option>
                        {members.map((user) => (
                            <Select.Option value={user._id} key={user._id}>
                                {user.username}
                            </Select.Option>
                        ))}
                    </Select>
                </FlexSelect>
            </FilterRow>
        </div>
    );
};

export default ProjectSearchPanel;

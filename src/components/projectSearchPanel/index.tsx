import { SearchOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Input, Select } from "antd";
import React from "react";

import { breakpoints, radius, space } from "../../theme/tokens";

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

const FilterShell = styled.div`
    background: var(--ant-color-bg-container, #fff);
    border: 1px solid var(--ant-color-border-secondary, rgba(15, 23, 42, 0.06));
    border-radius: ${radius.lg}px;
    margin-bottom: ${space.md}px;
    padding: ${space.sm}px;

    @media (min-width: ${breakpoints.md}px) {
        padding: ${space.md}px;
    }
`;

const FilterRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${space.xs}px;

    @media (min-width: ${breakpoints.md}px) {
        align-items: center;
        flex-direction: row;
        flex-wrap: wrap;
        gap: ${space.sm}px;
    }
`;

const FlexInput = styled.div`
    flex: 1 1 14rem;
    min-width: 0;

    @media (min-width: ${breakpoints.md}px) {
        max-width: 22rem;
    }
`;

const FlexSelect = styled.div`
    flex: 1 1 12rem;
    min-width: 0;

    @media (min-width: ${breakpoints.md}px) {
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
        <FilterShell>
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
                        prefix={
                            <SearchOutlined
                                aria-hidden
                                style={{
                                    color: "var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.45))"
                                }}
                            />
                        }
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
                        options={[
                            { label: "Managers", value: "" },
                            ...members.map((user) => ({
                                label: user.username,
                                value: user._id
                            }))
                        ]}
                        placeholder="Manager"
                        style={{ width: "100%" }}
                        value={
                            loading
                                ? undefined
                                : (defaultUser?.username ?? undefined)
                        }
                    />
                </FlexSelect>
            </FilterRow>
        </FilterShell>
    );
};

export default ProjectSearchPanel;

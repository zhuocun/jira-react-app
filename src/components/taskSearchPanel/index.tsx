import { SearchOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Input, Select } from "antd";
import React, { useMemo } from "react";

import { microcopy } from "../../constants/microcopy";
import { space } from "../../theme/tokens";
import useAuth from "../../utils/hooks/useAuth";

export interface TaskSearchParam {
    taskName: string;
    coordinatorId: string;
    type: string;
    semanticIds?: string;
}

interface Props {
    tasks: ITask[];
    param: TaskSearchParam;
    setParam: (params: Partial<TaskSearchParam>) => void;
    members: IMember[] | undefined;
    loading: boolean;
    aiSearchSlot?: React.ReactNode;
}

const FILTER_FORM_GAP = `${space.sm}px ${space.sm}px`;

const FilterRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${space.sm}px;
    margin-bottom: ${space.lg}px;

    @media (min-width: 768px) {
        align-items: center;
        flex-direction: row;
        flex-wrap: wrap;
        gap: ${FILTER_FORM_GAP};
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

const TaskSearchPanel: React.FC<Props> = ({
    tasks,
    param,
    setParam,
    members,
    loading,
    aiSearchSlot
}) => {
    const { user } = useAuth();
    const coordinators = useMemo(() => {
        const result: IMember[] = [];
        const seen = new Set<string>();
        for (const t of tasks ?? []) {
            const member = (members ?? []).find(
                (m) => m._id === t.coordinatorId
            );
            if (member && !seen.has(member._id)) {
                seen.add(member._id);
                result.push(member);
            }
        }
        if (result.length === 0 && user) {
            result.push(user);
        }
        return result;
    }, [tasks, members, user]);

    const types = useMemo(() => {
        const observed: string[] = [];
        for (const t of tasks ?? []) {
            if (!observed.includes(t.type)) observed.push(t.type);
        }
        return observed.length > 1 ? observed : ["Task", "Bug"];
    }, [tasks]);

    const resetParams = () => {
        setParam({
            taskName: undefined,
            coordinatorId: undefined,
            type: undefined,
            semanticIds: undefined
        });
    };

    return (
        <div>
            {aiSearchSlot}
            <FilterRow role="search" aria-label="Filter tasks">
                <FlexInput>
                    <Input
                        aria-label="Search tasks by name"
                        allowClear
                        onChange={(e) =>
                            setParam({
                                ...param,
                                taskName: e.target.value
                            })
                        }
                        placeholder="Search this board"
                        suffix={<SearchOutlined aria-hidden />}
                        type="search"
                        value={param.taskName}
                    />
                </FlexInput>
                <FlexSelect>
                    <Select
                        allowClear
                        aria-label="Filter by coordinator"
                        loading={loading}
                        onChange={(value) =>
                            setParam({
                                ...param,
                                coordinatorId: value ?? ""
                            })
                        }
                        placeholder="Coordinator"
                        style={{ width: "100%" }}
                        value={param.coordinatorId || undefined}
                    >
                        <Select.Option value="">Coordinators</Select.Option>
                        {coordinators.map((member) => (
                            <Select.Option value={member._id} key={member._id}>
                                {member.username}
                            </Select.Option>
                        ))}
                    </Select>
                </FlexSelect>
                <FlexSelect>
                    <Select
                        allowClear
                        aria-label="Filter by type"
                        loading={loading}
                        onChange={(value) =>
                            setParam({
                                ...param,
                                type: value ?? ""
                            })
                        }
                        placeholder="Type"
                        style={{ width: "100%" }}
                        value={param.type || undefined}
                    >
                        <Select.Option value="">Types</Select.Option>
                        {types.map((type) => (
                            <Select.Option value={type} key={type}>
                                {type}
                            </Select.Option>
                        ))}
                    </Select>
                </FlexSelect>
                <Button onClick={resetParams}>
                    {microcopy.actions.resetFilters}
                </Button>
            </FilterRow>
        </div>
    );
};

export default TaskSearchPanel;

import { SearchOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Input, Select } from "antd";
import React, { useMemo } from "react";

import { microcopy } from "../../constants/microcopy";
import {
    breakpoints,
    fontSize,
    fontWeight,
    radius,
    space
} from "../../theme/tokens";
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

/*
 * `flex: 1 1 14rem` only makes sense in row direction where the basis
 * sets the preferred WIDTH. In the mobile column layout the basis is
 * applied vertically and reserves a 14 rem-tall empty slot above each
 * sibling. Start with `auto` and switch to the proportional row basis
 * at the `md` breakpoint where the row reflows.
 */
const FlexInput = styled.div`
    flex: 0 0 auto;
    min-width: 0;
    width: 100%;

    @media (min-width: ${breakpoints.md}px) {
        flex: 1 1 14rem;
        max-width: 22rem;
        width: auto;
    }
`;

const FlexSelect = styled.div`
    flex: 0 0 auto;
    min-width: 0;
    width: 100%;

    @media (min-width: ${breakpoints.md}px) {
        flex: 1 1 12rem;
        max-width: 14rem;
        width: auto;
    }
`;

/*
 * "Reset filters" should sit outside the per-field flex grid because it acts on
 * all of them. On phone widths it stretches full width below the inputs; on
 * tablet+ it shrinks to its natural width and aligns with the filter fields.
 */
const ResetButtonSlot = styled.div`
    align-items: center;
    display: flex;
    gap: ${space.xs}px;

    > .ant-btn {
        width: 100%;
    }

    @media (min-width: ${breakpoints.md}px) {
        flex: 0 0 auto;
        margin-inline-start: auto;

        > .ant-btn {
            width: auto;
        }
    }
`;

/**
 * Tiny pill that surfaces how many filters are currently active. Sits next
 * to the Reset button so users can confirm at a glance whether the list is
 * filtered, and re-uses the brand-tinted background so it visually pairs
 * with primary actions without competing.
 */
const ActiveFilterCount = styled.span`
    align-items: center;
    background: var(--ant-color-primary-bg, rgba(94, 106, 210, 0.1));
    border-radius: ${radius.pill}px;
    color: var(--ant-color-primary, #5e6ad2);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: ${fontSize.xs}px;
    font-weight: ${fontWeight.semibold};
    height: ${space.lg - space.xxs / 2}px;
    justify-content: center;
    min-width: ${space.lg - space.xxs / 2}px;
    padding: 0 ${space.xs}px;
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

    const activeFilterCount = [
        param.taskName,
        param.coordinatorId,
        param.type,
        param.semanticIds
    ].filter((value) => Boolean(value)).length;

    return (
        <FilterShell>
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
                        prefix={
                            <SearchOutlined
                                aria-hidden
                                style={{
                                    color: "var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.45))"
                                }}
                            />
                        }
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
                <ResetButtonSlot>
                    {activeFilterCount > 0 ? (
                        <ActiveFilterCount
                            aria-label={`${activeFilterCount} active filter${
                                activeFilterCount === 1 ? "" : "s"
                            }`}
                        >
                            {activeFilterCount}
                        </ActiveFilterCount>
                    ) : null}
                    <Button
                        disabled={activeFilterCount === 0}
                        onClick={resetParams}
                        type="text"
                    >
                        {microcopy.actions.resetFilters}
                    </Button>
                </ResetButtonSlot>
            </FilterRow>
        </FilterShell>
    );
};

export default TaskSearchPanel;

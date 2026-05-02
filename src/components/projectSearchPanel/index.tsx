import { SearchOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Input, Select } from "antd";
import React from "react";

import {
    breakpoints,
    fontSize,
    fontWeight,
    radius,
    space
} from "../../theme/tokens";

export interface ProjectSearchParam {
    projectName: string | null;
    managerId: string | null;
    semanticIds?: string | null;
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

/*
 * `flex: 1 1 14rem` only makes sense in row direction where the basis
 * sets the preferred WIDTH. In the mobile column layout the basis would
 * be applied vertically and reserve a 14 rem-tall empty slot above each
 * sibling. We start with `auto` and switch to the proportional row
 * basis at the `md` breakpoint where the row reflows.
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

/**
 * Tiny pill that surfaces how many filters are currently active. Pairs with
 * the search input on tablet+ and stays inline at the end of the filter row
 * so users can confirm at a glance whether the list is being filtered.
 *
 * Uses theme tokens for the height (`space.lg` minus 2 px padding) and
 * font-size (`fontSize.xs`) instead of the previous magic numbers.
 */
const ActiveFilterCount = styled.span`
    align-items: center;
    /* In the parent's mobile column layout (align-items: stretch), an
     * inline-flex pill with no align-self stretched to the full row width
     * and produced a tall empty bar with the count floating in the
     * middle. Pin the pill to its content width so it sits neatly under
     * the manager select. */
    align-self: flex-start;
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

    @media (min-width: ${breakpoints.md}px) {
        align-self: auto;
        margin-inline-start: auto;
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

    const activeFilterCount = [
        param.projectName,
        param.managerId,
        param.semanticIds
    ].filter((value) => Boolean(value)).length;

    return (
        <FilterShell>
            {aiSearchSlot}
            <FilterRow role="search" aria-label="Filter projects">
                <FlexInput>
                    <Input
                        aria-label="Search projects by name"
                        allowClear
                        enterKeyHint="search"
                        inputMode="search"
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
                        value={param.projectName ?? ""}
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
                {activeFilterCount > 0 ? (
                    <ActiveFilterCount
                        aria-label={`${activeFilterCount} active filter${
                            activeFilterCount === 1 ? "" : "s"
                        }`}
                    >
                        {activeFilterCount}
                    </ActiveFilterCount>
                ) : null}
            </FilterRow>
        </FilterShell>
    );
};

export default ProjectSearchPanel;

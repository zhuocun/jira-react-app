import {
    BulbOutlined,
    DownOutlined,
    LogoutOutlined,
    MoonOutlined,
    SunOutlined
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { Avatar, Dropdown, MenuProps, Space, Switch, Typography } from "antd";
import { useLocation } from "react-router";

import Logo from "../../assets/logo-software.svg?react";
import { microcopy } from "../../constants/microcopy";
import { brand, space } from "../../theme/tokens";
import useAiEnabled from "../../utils/hooks/useAiEnabled";
import useAuth from "../../utils/hooks/useAuth";
import useColorScheme from "../../utils/hooks/useColorScheme";
import resetRoute from "../../utils/resetRoute";
import MemberPopover from "../memberPopover";
import { NoPaddingButton } from "../projectList";
import Row from "../row";

const PageHeader = styled(Row)`
    background: var(--ant-color-bg-container, #fff);
    border-bottom: 1px solid var(--ant-color-split, rgba(5, 5, 5, 0.06));
    padding: ${space.sm}px ${space.lg}px;
    padding-block: max(${space.sm}px, env(safe-area-inset-top));
    padding-inline-start: max(${space.lg}px, env(safe-area-inset-left));
    padding-inline-end: max(${space.lg}px, env(safe-area-inset-right));
    position: sticky;
    top: 0;
    z-index: 10;
`;

const LeftHeader = styled(Row)``;

const RightHeader = styled.div`
    align-items: center;
    display: flex;
    gap: ${space.md}px;
`;

const TriggerButton = styled.button`
    align-items: center;
    background: transparent;
    border: none;
    border-radius: 999px;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    gap: ${space.xs}px;
    padding: ${space.xxs}px ${space.xs}px;

    &:hover {
        background: var(--ant-color-bg-text-hover, rgba(0, 0, 0, 0.04));
    }
`;

const SettingsRow = styled.div`
    align-items: center;
    display: flex;
    gap: ${space.sm}px;
    justify-content: space-between;
    padding: ${space.xxs}px ${space.xs}px;
    min-width: 240px;
`;

const initialsOf = (username: string | undefined): string => {
    if (!username) return "?";
    const parts = username.trim().split(/\s+/);
    const head = parts[0]?.[0] ?? "";
    const tail = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (head + tail).toUpperCase() || username[0].toUpperCase();
};

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const {
        available: aiAvailable,
        enabled: aiEnabled,
        setEnabled: setAiEnabled
    } = useAiEnabled();
    const { scheme, setPreference } = useColorScheme();
    const path = useLocation().pathname;

    const items: MenuProps["items"] = [
        {
            key: "theme",
            label: (
                <SettingsRow>
                    <Space size={space.xs}>
                        {scheme === "dark" ? <MoonOutlined /> : <SunOutlined />}
                        <Typography.Text>Dark mode</Typography.Text>
                    </Space>
                    <Switch
                        aria-label="Toggle dark mode"
                        checked={scheme === "dark"}
                        onChange={(checked) =>
                            setPreference(checked ? "dark" : "light")
                        }
                        size="small"
                    />
                </SettingsRow>
            )
        },
        ...(aiAvailable
            ? [
                  {
                      key: "ai",
                      label: (
                          <SettingsRow>
                              <Space size={space.xs}>
                                  <BulbOutlined />
                                  <Typography.Text>
                                      Board Copilot
                                  </Typography.Text>
                              </Space>
                              <Switch
                                  aria-label="Enable Board Copilot features"
                                  checked={aiEnabled}
                                  onChange={setAiEnabled}
                                  size="small"
                              />
                          </SettingsRow>
                      )
                  }
              ]
            : []),
        { type: "divider" as const },
        {
            key: "logout",
            label: (
                <NoPaddingButton
                    aria-label="Log out"
                    icon={<LogoutOutlined />}
                    onClick={() => {
                        logout();
                    }}
                    type="link"
                >
                    {microcopy.actions.logOut}
                </NoPaddingButton>
            )
        }
    ];

    return (
        <PageHeader between>
            <LeftHeader gap>
                <NoPaddingButton
                    aria-label="Go to projects"
                    type="link"
                    onClick={
                        path !== "/projects"
                            ? () => resetRoute(window.location)
                            : undefined
                    }
                >
                    <Logo width="160px" color={brand.primary} />
                </NoPaddingButton>
                <MemberPopover />
            </LeftHeader>
            <RightHeader>
                <Dropdown menu={{ items }} trigger={["click", "hover"]}>
                    <TriggerButton
                        aria-label={`Account menu for ${user?.username ?? "user"}`}
                        onClick={(event) => event.preventDefault()}
                        type="button"
                    >
                        <Avatar
                            size="small"
                            style={{ backgroundColor: brand.primary }}
                        >
                            {initialsOf(user?.username)}
                        </Avatar>
                        <Typography.Text>Hi, {user?.username}</Typography.Text>
                        <DownOutlined style={{ fontSize: 10 }} />
                    </TriggerButton>
                </Dropdown>
            </RightHeader>
        </PageHeader>
    );
};

export default Header;

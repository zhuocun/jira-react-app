import {
    BulbOutlined,
    DownOutlined,
    LogoutOutlined,
    MoonOutlined,
    SunOutlined
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { Dropdown, MenuProps, Space, Switch, Typography } from "antd";
import { useLocation } from "react-router";

import { microcopy } from "../../constants/microcopy";
import { breakpoints, radius, space } from "../../theme/tokens";
import useAiEnabled from "../../utils/hooks/useAiEnabled";
import useAuth from "../../utils/hooks/useAuth";
import useColorScheme from "../../utils/hooks/useColorScheme";
import resetRoute from "../../utils/resetRoute";
import BrandMark from "../brandMark";
import LanguageSwitcher from "../languageSwitcher";
import MemberPopover from "../memberPopover";
import { NoPaddingButton } from "../projectList";
import UserAvatar from "../userAvatar";

const PageHeader = styled.header`
    align-items: center;
    /* Transparent chrome for a native-app feel. The header floats over
     * the page's warm peach wash without a frosted pane, border, or
     * shadow — content scrolls under the brand mark and account pill
     * the way it does on a native iOS / iPadOS top bar. The page-level
     * background gradient handles the visual warmth here.
     */
    background: transparent;
    /*
     * Opt the sticky header out of the route cross-fade. With its own
     * view-transition-name the browser keeps it in place while the body
     * cross-fades, which is what makes the page change feel like a native
     * push transition rather than a full-page swap.
     */
    view-transition-name: pulse-header;
    display: flex;
    justify-content: space-between;
    gap: ${space.xs}px;
    padding: ${space.xs}px ${space.sm}px;
    padding-block-start: max(${space.xs}px, env(safe-area-inset-top));
    padding-inline-start: max(${space.sm}px, env(safe-area-inset-left));
    padding-inline-end: max(${space.sm}px, env(safe-area-inset-right));
    position: sticky;
    top: 0;
    z-index: 10;

    @media (min-width: ${breakpoints.sm}px) {
        padding-inline: ${space.md}px;
        padding-inline-start: max(${space.md}px, env(safe-area-inset-left));
        padding-inline-end: max(${space.md}px, env(safe-area-inset-right));
    }

    @media (min-width: ${breakpoints.md}px) {
        padding-inline: ${space.lg}px;
        padding-inline-start: max(${space.lg}px, env(safe-area-inset-left));
        padding-inline-end: max(${space.lg}px, env(safe-area-inset-right));
    }
`;

const LeftCluster = styled.div`
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    gap: ${space.xs}px;
    min-width: 0;

    @media (min-width: ${breakpoints.md}px) {
        gap: ${space.md}px;
    }
`;

const RightCluster = styled.div`
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: ${space.xxs}px;

    @media (min-width: ${breakpoints.md}px) {
        gap: ${space.xs}px;
    }
`;

/**
 * Soft pill-shaped trigger used for the account dropdown and the inline
 * theme toggle. Stays at 36 px on desktop / 44 px on coarse pointers so
 * touch users get an honest WCAG 2.5.8 target.
 *
 * The trigger limits itself to half of the available right-cluster width on
 * narrow viewports so a long username does not push the chevron / icon
 * buttons off-screen. The username text inside truncates with ellipsis.
 */
const PillTrigger = styled.button`
    align-items: center;
    background: transparent;
    border: none;
    border-radius: ${radius.pill}px;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    flex: 0 1 auto;
    font: inherit;
    gap: ${space.xs}px;
    height: 36px;
    max-width: 100%;
    min-width: 0;
    padding: 0 ${space.xs}px;
    transition:
        background-color 120ms ease-out,
        color 120ms ease-out;

    &:hover {
        background: var(--ant-color-bg-text-hover, rgba(15, 23, 42, 0.05));
    }

    @media (min-width: ${breakpoints.sm}px) {
        padding: 0 ${space.sm}px;
    }

    @media (pointer: coarse) {
        height: 44px;
    }
`;

/**
 * Truncated username inside the account pill. `min-width: 0` lets it shrink
 * inside the flex parent, and `max-width` keeps it from monopolising the
 * row when the user has a long name (e.g. `Constance van der Linden`).
 */
const Greeting = styled(Typography.Text)`
    && {
        font-weight: 500;
        max-width: 14ch;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

/**
 * Square icon button (used for the inline theme toggle and other tertiary
 * controls). Keeps a single visual rhythm with the pill trigger.
 */
const IconButton = styled.button`
    align-items: center;
    background: transparent;
    border: none;
    border-radius: ${radius.md}px;
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.65));
    cursor: pointer;
    display: inline-flex;
    height: 36px;
    justify-content: center;
    padding: 0;
    transition:
        background-color 120ms ease-out,
        color 120ms ease-out;
    width: 36px;

    &:hover {
        background: var(--ant-color-bg-text-hover, rgba(15, 23, 42, 0.05));
        color: var(--ant-color-text, rgba(15, 23, 42, 0.9));
    }

    @media (pointer: coarse) {
        height: 44px;
        width: 44px;
    }
`;

const HiddenOnNarrow = styled.span`
    @media (max-width: ${breakpoints.md - 1}px) {
        display: none;
    }
`;

const HiddenOnTiny = styled.span`
    @media (max-width: ${breakpoints.sm - 1}px) {
        display: none;
    }
`;

/**
 * Brand cluster — the shared `BrandMark` component (so a future brand
 * refresh is a single edit) wrapped in a `NoPaddingButton` so it stays
 * keyboard-focusable and announces "Pulse, link" to assistive tech.
 */
const BrandLink = styled(NoPaddingButton)`
    align-items: center;
    display: inline-flex;
    flex: 0 1 auto;
    min-width: 0;

    && {
        height: 36px;
        padding: 0;
    }

    /* On the narrowest viewports there isn't room for the wordmark beside
     * the projects popover; the brand collapses to its glyph. */
    @media (max-width: ${breakpoints.sm - 1}px) {
        > span > span:last-child {
            display: none;
        }
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
                        <Typography.Text>
                            {microcopy.settings.darkMode}
                        </Typography.Text>
                    </Space>
                    <Switch
                        aria-label={microcopy.settings.toggleDarkMode}
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
                                      {microcopy.settings.boardCopilot}
                                  </Typography.Text>
                              </Space>
                              <Switch
                                  aria-label={
                                      microcopy.settings.toggleBoardCopilot
                                  }
                                  checked={aiEnabled}
                                  onChange={setAiEnabled}
                                  size="small"
                              />
                          </SettingsRow>
                      )
                  }
              ]
            : []),
        {
            key: "language",
            label: <LanguageSwitcher />
        },
        { type: "divider" as const },
        {
            key: "logout",
            label: (
                <NoPaddingButton
                    aria-label={microcopy.actions.logOut}
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
        <PageHeader>
            <LeftCluster>
                <BrandLink
                    aria-label={microcopy.a11y.goToProjects}
                    type="link"
                    onClick={
                        path !== "/projects"
                            ? () => resetRoute(window.location)
                            : undefined
                    }
                >
                    <BrandMark size="sm" />
                </BrandLink>
                <MemberPopover />
            </LeftCluster>
            <RightCluster>
                <IconButton
                    aria-label={
                        scheme === "dark"
                            ? microcopy.a11y.useLightMode
                            : microcopy.a11y.useDarkMode
                    }
                    onClick={() =>
                        setPreference(scheme === "dark" ? "light" : "dark")
                    }
                    type="button"
                >
                    {scheme === "dark" ? <SunOutlined /> : <MoonOutlined />}
                </IconButton>
                <Dropdown menu={{ items }} trigger={["click", "hover"]}>
                    <PillTrigger
                        aria-label={`${microcopy.a11y.accountMenu} for ${user?.username ?? "user"}`}
                        onClick={(event) => event.preventDefault()}
                        type="button"
                    >
                        <UserAvatar
                            id={user?._id ?? user?.username ?? "anon"}
                            name={user?.username}
                            size="small"
                        />
                        <HiddenOnTiny>
                            <Greeting>
                                {microcopy.greeting.replace(
                                    "{name}",
                                    user?.username ?? ""
                                )}
                            </Greeting>
                        </HiddenOnTiny>
                        <HiddenOnNarrow>
                            <DownOutlined
                                aria-hidden
                                style={{
                                    color: "var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.45))",
                                    fontSize: 10
                                }}
                            />
                        </HiddenOnNarrow>
                    </PillTrigger>
                </Dropdown>
            </RightCluster>
        </PageHeader>
    );
};

export default Header;

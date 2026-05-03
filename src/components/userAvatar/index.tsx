import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import type { AvatarProps } from "antd";

import { avatarGradients, fontSize, fontWeight } from "../../theme/tokens";

/**
 * Pulls one of the brand-aligned gradients deterministically from a stable
 * id (project id, member id, etc.) so every entity reads as the same color
 * across the app. Uses a small FNV-style hash so a 24-character ObjectId and
 * a 5-character slug both spread evenly across the palette.
 */
export const gradientFor = (id: string): string => {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

/**
 * Initials from a username. Picks the first letter of the first and last
 * whitespace-separated parts (e.g. "Alice Smith" → "AS"). Falls back to
 * the first character of the input or a literal `?` for empty strings.
 */
export const initialsOf = (name: string | undefined | null): string => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const head = parts[0]?.[0] ?? "";
    const tail = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (head + tail).toUpperCase() || name[0].toUpperCase();
};

interface UserAvatarProps extends Omit<AvatarProps, "children"> {
    /** Stable id (member, project, manager) used to pick a brand gradient. */
    id: string;
    /** Display name; first / last initials are derived from it. */
    name?: string | null;
    /** Override the gradient (rare — normally derived from `id`). */
    background?: string;
}

/**
 * Single-source-of-truth avatar.
 *
 * - When a `name` is provided, renders a brand-gradient monogram (initials
 *   on a deterministic per-id colour) — keeps each entity visually distinct.
 * - When `name` is missing or empty, renders the **default profile**
 *   variant: a white tile with the brand-orange `UserOutlined` icon and a
 *   1 px hairline border, mirroring the inverted brand-mark style. This
 *   is the "no manager assigned / unknown user" fallback.
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
    id,
    name,
    background,
    size = "small",
    style,
    ...rest
}) => {
    const compact = size === "small" || size === "default";
    const isDefault = !name || !name.trim();
    if (isDefault) {
        return (
            <Avatar
                icon={<UserOutlined />}
                size={size}
                style={{
                    background: "var(--ant-color-bg-elevated, #ffffff)",
                    border: "1px solid var(--ant-color-border-secondary, rgba(15, 23, 42, 0.08))",
                    color: "var(--ant-color-primary, #ea580c)",
                    ...style
                }}
                {...rest}
            />
        );
    }
    return (
        <Avatar
            size={size}
            style={{
                background: background ?? gradientFor(id),
                color: "#fff",
                fontSize: compact ? fontSize.xs - 1 : fontSize.sm,
                fontWeight: fontWeight.semibold,
                ...style
            }}
            {...rest}
        >
            {initialsOf(name)}
        </Avatar>
    );
};

export default UserAvatar;

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
 * Single-source-of-truth avatar. Replaces four near-identical `Avatar`
 * configurations that previously appeared in the header, kanban card,
 * project list, and member popover. Centralizing the gradient + initials +
 * white text + tabular monogram font keeps the visual language consistent
 * and gives a future palette refresh exactly one edit.
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

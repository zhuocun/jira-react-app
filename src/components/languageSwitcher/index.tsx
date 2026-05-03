import styled from "@emotion/styled";
import { Segmented, Typography } from "antd";

import { microcopy } from "../../constants/microcopy";
import { useLocale, type LocaleCode } from "../../i18n";
import { space } from "../../theme/tokens";

const Row = styled.div`
    align-items: center;
    display: flex;
    gap: ${space.sm}px;
    justify-content: space-between;
    min-width: 240px;
    padding: ${space.xxs}px ${space.xs}px;
`;

/**
 * Compact language switcher for use inside the account dropdown.
 *
 * Renders the localized language label on the left and a Segmented control
 * on the right. Each segment shows the language's *native* name ("English",
 * "中文") so the option you want to switch to is always readable in its own
 * script — a common i18n best practice (no one looking for Chinese knows
 * that "Chinese" is the right English label).
 *
 * Selecting a segment writes through `useLocale().setLocale`, which:
 *   1. Updates the active dictionary singleton synchronously so any error
 *      thrown later in the same tick already speaks the new language.
 *   2. Persists the choice to localStorage and updates `<html lang>`.
 *   3. Forces a remount of the LanguageProvider subtree so static
 *      `microcopy` reads pick up the new strings on the next paint.
 */
const LanguageSwitcher = () => {
    const { locale, availableLocales, setLocale } = useLocale();

    const options = availableLocales.map((entry) => ({
        label: entry.nativeName,
        value: entry.code,
        title: entry.englishName
    }));

    return (
        <Row role="group" aria-label={microcopy.settings.changeLanguage}>
            <Typography.Text>{microcopy.settings.language}</Typography.Text>
            <Segmented
                aria-label={microcopy.settings.changeLanguage}
                options={options}
                size="small"
                value={locale}
                onChange={(value) => setLocale(value as LocaleCode)}
            />
        </Row>
    );
};

export default LanguageSwitcher;

const isVoid = (value: unknown) => {
    return (
        value === undefined ||
        value === null ||
        value === "" ||
        (typeof value === "number" ? Number.isNaN(value) : false)
    );
};

const filterRequest = (object: { [key: string]: unknown }) => {
    const next: { [key: string]: unknown } = {};
    Object.keys(object).forEach((key) => {
        const value = object[key];
        if (!isVoid(value)) {
            next[key] = value;
        }
    });
    return next;
};

export default filterRequest;

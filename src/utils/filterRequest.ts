const isVoid = (value: unknown) => {
    return (
        value === undefined ||
        value === null ||
        value === "" ||
        (typeof value === "number" ? Number.isNaN(value) : false)
    );
};

const filterRequest = (object: { [key: string]: unknown }) => {
    Object.keys(object).forEach((key) => {
        const value = object[key];
        if (isVoid(value)) {
            delete object[key];
        }
    });
    return object;
};

export default filterRequest;

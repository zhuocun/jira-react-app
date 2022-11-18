const filterRequest = (object: { [key: string]: unknown }) => {
    Object.keys(object).forEach((key) => {
        const value = object[key];
        if (isVoid(value)) {
            delete object[key];
        }
    });
    return object;
};

const isVoid = (value: unknown) => {
    return (
        value === undefined ||
        value === null ||
        value === "" ||
        (typeof value === "number" ? isNaN(value) : false)
    );
};

export default filterRequest;

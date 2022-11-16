const filterRequest = (object: object) => {
    const result: { [key: string]: unknown } = { ...object };
    Object.keys(result).forEach((key) => {
        const value = result[key];
        if (isFalsy(value)) {
            delete result[key];
        }
    });
    return result;
};

const isFalsy = (value: unknown) => {
    return value === 0 ? false : !value;
};

export default filterRequest;

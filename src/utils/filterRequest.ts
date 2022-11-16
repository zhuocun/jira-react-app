const filterRequest = (object: any) => {
    const result = {...object};
    Object.keys(result).forEach(key => {
        const value = result[key];
        if (isFalsy(value)) {
            delete result[key];
        }
    })
    return result;
}

const isFalsy = (value: number | string) => {
    return value === 0 ? false : !value;
}

export default filterRequest;

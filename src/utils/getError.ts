const getError = (error: unknown) => {
    if (error instanceof Error) return error;
    return Object(error);
};

export default getError;

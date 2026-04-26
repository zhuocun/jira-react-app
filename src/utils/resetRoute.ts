const resetRoute = (location: Pick<Location, "href" | "origin">) => {
    location.href = `${location.origin}/projects`;
};

export default resetRoute;

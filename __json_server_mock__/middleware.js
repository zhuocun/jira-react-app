const isPath = (req, ...paths) => paths.includes(req.path);

const userFromEmail = (email) => ({
    _id: email,
    email,
    jwt: email,
    likedProjects: [],
    username: email.split("@")[0]
});

module.exports = (req, res, next) => {
    if (isPath(req, "/login", "/api/v1/auth/login")) {
        if (req.body.email && req.body.password) {
            if (req.body.email.includes("wrong")) {
                return res
                    .status(400)
                    .json({ error: "Invalid credential, please try again" });
            }
            return res.status(200).json(userFromEmail(req.body.email));
        }
        return res
            .status(400)
            .json({ error: "Invalid credential, please try again" });
    }
    if (isPath(req, "/register", "/api/v1/auth/register")) {
        if (req.body.email && req.body.password) {
            if (req.body.email.includes("wrong")) {
                return res
                    .status(400)
                    .json({ error: "Register failed, please try again" });
            }
            return res.status(201).json({
                message: "User created"
            });
        }
        return res
            .status(400)
            .json({ error: "Register failed, please try again" });
    }
    if (!req.headers.authorization) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (isPath(req, "/userInfo", "/api/v1/users")) {
        return res
            .status(200)
            .json(userFromEmail(req.headers.authorization.slice(7)));
    }
    return next();
};

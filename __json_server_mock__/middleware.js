module.exports = (req, res, next) => {
    if (req.path === "/login") {
        if (req.body.username && req.body.password) {
            return res.status(200).json({
                id: 0,
                name: req.body.username,
                token: "mock token"
            });
        } else {
            return res.status(400).json({ message: "Invalid credential" });
        }
    } else if (req.path === "/register") {
        if (req.body.username && req.body.password) {
            return res.status(201).json({
                message: "User created"
            });
        } else {
            return res.status(400).json({ message: "Register failed" });
        }
    }
    // if (!req.headers.Authorization) {
    //     return res.status(401).json({ message: "Unauthorized" });
    // }
    if (req.path === "/userInfo") {
        return res.status(200).json({
            id: 0,
            name: "Tim",
            token: "mock token"
        });
    }
    next();
};

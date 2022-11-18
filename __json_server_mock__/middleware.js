module.exports = (req, res, next) => {
    if (req.path === "/login") {
        if (req.body.email && req.body.password) {
            if (req.body.email.includes("wrong")) {
                return res
                    .status(400)
                    .json({ message: "Invalid credential, please try again" });
            }
            return res.status(200).json({
                id: 0,
                email: req.body.email,
                token: req.body.email
            });
        } else {
            return res
                .status(400)
                .json({ message: "Invalid credential, please try again" });
        }
    } else if (req.path === "/register") {
        if (req.body.email && req.body.password) {
            if (req.body.email.includes("wrong")) {
                return res
                    .status(400)
                    .json({ message: "Register failed, please try again" });
            }
            return res.status(201).json({
                message: "User created"
            });
        } else {
            return res
                .status(400)
                .json({ message: "Register failed, please try again" });
        }
    }
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.path === "/userInfo") {
        return res.status(200).json({
            email: req.headers.authorization.slice(7),
            token: req.headers.authorization.slice(7)
        });
    }
    next();
};

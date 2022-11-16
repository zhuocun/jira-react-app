module.exports = (req, res, next) => {
    if (req.method === "POST" && req.path === "/login") {
        if (req.body.username && req.body.password) {
            return res.status(200).json({
                token: "mock token"
            });
        } else {
            return res.status(400).json({ message: "invalid credential" });
        }
    }
    next();
};

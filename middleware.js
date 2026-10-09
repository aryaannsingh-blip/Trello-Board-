const jwt = require("jsonwebtoken")

function authMiddleware(req, res, next) {

    const token = req.headers.token // jwt

    try {
        const decoded = jwt.verify(
            token,
            "attlasiationsuperscrect123123password"
        )

        const userId = decoded.userId;

        if (userId !== undefined && userId !== null) { // fixed: `if (userId)` rejected a valid id of 0
            req.userId = userId;
            next();
        } else {
            res.status(403).json({
                message: "Token was incorrect"
            })
        }

    } catch {
        res.status(403).json({
            message: "Token was incorrect"
        })
    }
}

module.exports = {
    authMiddleware: authMiddleware
}


const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require('../middleware/auth')

const User = require("../models/user");


router.post(
    "/signup",
    async (req, res) => {
        const { username, email, password } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }
            user = new User({
                username,
                email,
                password
            });
            let salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, "randomString", { expiresIn: 10000 },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        console.log('user')
        res.json(user);
    } catch (e) {
        console.log(e)
        res.json({ status: "failed" });
    }
});

router.post("/login",
    async (req, res) => {
        const { username, password } = req.body;
        console.log(username)
        try {
            let user = await User.findOne({
                'username': username
            });
            console.log("USER: ", user)
            let isMatch = await bcrypt.compare(password, user.password)
            if (isMatch) {
                jwt.sign({ user: { id: user._id } }, "randomString", { expiresIn: 10000 },
                    (err, token) => {
                        console.log("TOKEN: ", token)
                        if (err) throw err;
                        res.cookie("dfToken", token)
                        res.status(200).json({
                            token
                        });
                    }
                );
            }

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

router.post("/logout", (req, res) => {
    console.log("LOGGING OUT SETTING COOKIE TO EMPTY")
    res.cookie("dfToken", "");
    res.status(200).send();
    }
)


module.exports = router;

const express = require("express");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middleware");

const {
    userModel,
    organizationModel
} = require("./models");


let BOARD_ID = 1;
let ISSUES_ID = 1;


const BOARDS = [];
const ISSUES = [];


const app = express();

app.use(express.json());



// CREATE


// SIGNUP

app.post("/signup", async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const userExists = await userModel.findOne({
        username: username
    });

    if (userExists) {
        res.status(411).json({
            message: "User with this username already exists"
        });

        return;
    }

    await userModel.create({
        username: username,
        password: password
    });

    res.json({
        message: "You have signed up successfully"
    });
});


// SIGNIN

app.post("/signin", async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const userExists = await userModel.findOne({
        username: username,
        password: password
    });

    if (!userExists) {
        res.status(403).json({
            message: "Incorrect credentials"
        });

        return;
    }

    const token = jwt.sign(
        {
            userId: userExists._id
        },
        "attlasiationsupersecret123123password"
    );

    res.json({
        token: token
    });
});



// ORGANIZATION


app.post(
    "/organization",
    authMiddleware,
    async (req, res) => {

        const userId = req.userId;

        const organization = await organizationModel.create({
            title: req.body.title,
            description: req.body.description,
            admin: userId,
            members: []
        });

        res.json({
            message: "Org created",
            id: organization._id
        });
    }
);



// ADD MEMBER


app.post(
    "/add-member-to-organization",
    authMiddleware,
    async (req, res) => {

        const userId = req.userId;

        const organizationId =
            req.body.organizationId;

        const memberUserUsername =
            req.body.memberUserUsername;


        const organization =
            await organizationModel.findById(
                organizationId
            );


        if (
            !organization ||
            organization.admin.toString() !== userId.toString()
        ) {

            res.status(411).json({
                message:
                    "Either this org doesnt exist or you are not an admin of this org"
            });

            return;
        }


        const memberUser =
            await userModel.findOne({
                username: memberUserUsername
            });


        if (!memberUser) {

            res.status(411).json({
                message:
                    "No user with this username exists in our db"
            });

            return;
        }


        organization.members.push(
            memberUser._id
        );


        await organization.save();


        res.json({
            message: "New member added!"
        });
    }
);



// BOARD


app.post("/board", (req, res) => {

});



// ISSUE


app.post("/issue", (req, res) => {

});



// GET ORGANIZATION


app.get(
    "/organization",
    authMiddleware,
    async (req, res) => {

        const userId = req.userId;

        const organizationId =
            req.query.organizationId;


        const organization =
            await organizationModel.findById(
                organizationId
            ).populate(
                "members",
                "username"
            );


        console.log(organization);
        console.log(userId);


        if (
            !organization ||
            organization.admin.toString() !== userId.toString()
        ) {

            res.status(411).json({
                message:
                    "Either this org doesnt exist or you are not an admin of this org"
            });

            return;
        }


        res.json({
            organization
        });
    }
);



// GET BOARDS


app.get("/boards", (req, res) => {

});



// GET ISSUES


app.get("/issues", (req, res) => {

});



// GET MEMBERS


app.get("/members", (req, res) => {

});



// UPDATE ISSUE


app.put("/issues", (req, res) => {

});



// DELETE MEMBER


app.delete(
    "/members",
    authMiddleware,
    async (req, res) => {

        const userId = req.userId;

        const organizationId =
            req.body.organizationId;

        const memberUserUsername =
            req.body.memberUserUsername;


        const organization =
            await organizationModel.findById(
                organizationId
            );


        if (
            !organization ||
            organization.admin.toString() !== userId.toString()
        ) {

            res.status(411).json({
                message:
                    "Either this org doesnt exist or you are not an admin of this org"
            });

            return;
        }


        const memberUser =
            await userModel.findOne({
                username: memberUserUsername
            });


        if (!memberUser) {

            res.status(411).json({
                message:
                    "No user with this username exists in our db"
            });

            return;
        }


        organization.members =
            organization.members.filter(
                memberId =>
                    memberId.toString() !==
                    memberUser._id.toString()
            );


        await organization.save();


        res.json({
            message: "member deleted!"
        });
    }
);



// SERVER

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
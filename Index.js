const express = require("express");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middleware");
const { userModel, organizationModel, boardModel, issueModel } = require("./models");


const app = express();

app.use(express.json());



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

    const newUser = await userModel.create({
        username: username,
        password: password
    });

    res.json({
        id: newUser._id,
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
    } else {
        const token = jwt.sign(
            {
                userId: userExists._id
            },
            "attlasiationsupersecret123123password"
        );

        res.json({
            token: token
        });
    }

});



// ORGANIZATION

app.post(
    "/organization",
    authMiddleware,
    async (req, res) => {

        const userId = req.userId;

        const newOrg = await organizationModel.create({
            title: req.body.title,
            description: req.body.description,
            admin: userId,
            members: []
        });

        res.json({
            message: "Org created",
            id: newOrg._id
        });
    }
);



// ADD MEMBER

app.post(
    "/add-member-to-organization",
    authMiddleware,
    async (req, res) => {

        const userId = req.userId;

        const organizationId = req.body.organizationId;

        const memberUserUsername = req.body.memberUserUsername;

        const organization = await organizationModel.findOne({
            _id: organizationId
        });

        if (
            !organization ||
            organization.admin.toString() !== userId
        ) {
            res.status(411).json({
                message:
                    "Either this org doesnt exist or you are not an admin of this org"
            });

            return;
        }

        const memberUser = await userModel.findOne({
            username: memberUserUsername
        });

        if (!memberUser) {
            res.status(411).json({
                message:
                    "No user with this username exists in our db"
            });

            return;
        }

        organization.members.push(memberUser._id)
        await organization.save()

        res.json({
            message: "New member added!"
        });
    }
);



// BOARD

app.post("/board", authMiddleware, async (req, res) => {
    const userId = req.userId
    const organizationId = req.body.organizationId;
    const title = req.body.title

    const organization = await organizationModel.findOne({
        _id: organizationId
    })

    if (!organization) {
        res.status(404).json({
            message: "Organization not found"
        })
        return
    }

    const newBoard = await boardModel.create({
        title: title,
        organizationId: organizationId
    })

    res.json({
        message: "Board created successfully",
        id: newBoard._id
    })
});



// ISSUE

app.post("/issue", authMiddleware, async (req, res) => {
    const userId = req.userId
    const title = req.body.title
    const description = req.body.description
    const boardId = req.body.boardId;

    const board = await boardModel.findOne({
        _id: boardId
    })

    if (!board) {
        res.status(404).json({
            message: "Board not found"
        })
        return
    }

    const organization = await organizationModel.findOne({
        _id: board.organizationId
    })

    if (!organization) {
        res.status(404).json({
            message: "Organization not found"
        })
        return
    }

    const isAdmin = organization.admin.toString() === userId
    const isMember = organization.members.some(
        member => member.toString() === userId
    )

    if (!isAdmin && !isMember) {
        res.status(403).json({
            message: "You are not member of this organization"
        })
        return
    }

    const newIssue = await issueModel.create({
        title: title,
        description: description,
        boardId: boardId,
        createdBy: userId
    })

    res.json({
        message: "Issue created successfully",
        id: newIssue._id
    })

});



// GET ORGANIZATION

app.get(
    "/organization",
    authMiddleware,
    async (req, res) => {

        const userId = req.userId;
        const organizationId = req.query.organizationId;

        const organization = await organizationModel.findOne({
            _id: organizationId
        });

        if (
            !organization ||
            organization.admin.toString() !== userId
        ) {
            res.status(411).json({
                message:
                    "Either this org doesnt exist or you are not an admin of this org"
            });
            return;
        }

        const members = await userModel.find({
            _id: { $in: organization.members }
        });

        res.json({
            organization: {
                title: organization.title,
                members: members.map(m => ({
                    username: m.username,
                    id: m._id
                }))
            }
        });
    }
);



// GET BOARDS

app.get("/boards", authMiddleware, async (req, res) => {
    const userId = req.userId
    const organizationId = req.query.organizationId

    const organization = await organizationModel.findOne({
        _id: organizationId
    })

    if (!organization) {
        res.status(404).json({
            message: "organization not found"
        })
        return
    }

    const isAdmin = organization.admin.toString() === userId

    const isMember = organization.members.some(
        member => member.toString() === userId
    )

    if (!isAdmin && !isMember) {
        res.status(403).json({
            message: "You are not member of this organization"
        })
        return
    }

    const boards = await boardModel.find({
        organizationId: organizationId
    })

    res.json({
        boards: boards
    })

});



// GET ISSUES

app.get("/issues", authMiddleware, async (req, res) => {
    const userId = req.userId
    const boardId = req.query.boardId;

    const board = await boardModel.findOne({
        _id: boardId
    })

    if (!board) {
        res.status(404).json({
            message: "Board not found"
        });
        return
    }

    const organization = await organizationModel.findOne({
        _id: board.organizationId
    })

    if (!organization) {
        res.status(404).json({
            message: "organization not found"
        })
        return
    }

    const isAdmin = organization.admin.toString() === userId

    const isMember = organization.members.some(
        member => member.toString() === userId
    )

    if (!isAdmin && !isMember) {
        res.status(403).json({
            message: "You are not a member of this organization"
        });
        return
    }

    const issues = await issueModel.find({
        boardId: boardId
    })

    res.json({
        issues: issues
    })
});



// GET MEMBERS

app.get("/members", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const organizationId = req.query.organizationId;

    const organization = await organizationModel.findOne({
        _id: organizationId
    })

    if (!organization) {
        res.status(404).json({
            message: "Organization not found"
        });
        return
    }

    const isAdmin = organization.admin.toString() === userId;

    const isMember = organization.members.some(
        member => member.toString() === userId
    );

    if (!isAdmin && !isMember) {
        res.status(403).json({
            message: "You are not a member of this organization"
        })
        return
    }

    const members = await userModel.find({
        _id: {
            $in: organization.members
        }
    })

    res.json({
        members: members.map(member => ({
            id: member._id,
            username: member.username
        }))
    })

});



// UPDATE ISSUE

app.put(
    "/issues",
    authMiddleware,
    async (req, res) => {

        const userId = req.userId;
        const issueId = req.body.issueId;

        const issue = await issueModel.findOne({
            _id: issueId
        });

        if (!issue) {
            res.status(404).json({
                message: "Issue not found"
            });

            return;
        }

        const board = await boardModel.findOne({
            _id: issue.boardId
        });

        if (!board) {
            res.status(404).json({
                message: "Board not found"
            });

            return;
        }

        const organization = await organizationModel.findOne({
            _id: board.organizationId
        });

        if (!organization) {
            res.status(404).json({
                message: "Organization not found"
            });

            return;
        }

        const isAdmin = organization.admin.toString() === userId;

        const isMember = organization.members.some(
            member => member.toString() === userId
        );

        if (!isAdmin && !isMember) {
            res.status(403).json({
                message:
                    "You are not a member of this organization"
            });

            return;
        }

        issue.title = req.body.title;
        issue.description = req.body.description;
        issue.status = req.body.status;

        await issue.save();

        res.json({
            message: "Issue updated successfully"
        });
    }
);



// DELETE MEMBER

app.delete(
    "/members",
    authMiddleware,
    async (req, res) => {

        const userId = req.userId;

        const organizationId = req.body.organizationId;

        const memberUserUsername = req.body.memberUserUsername;

        const organization = await organizationModel.findOne({
            _id: organizationId
        });

        if (
            !organization ||
            organization.admin.toString() !== userId
        ) {
            res.status(411).json({
                message:
                    "Either this org doesnt exist or you are not an admin of this org"
            });

            return;
        }

        const memberUser = await userModel.findOne({
            username: memberUserUsername
        });

        if (!memberUser) {
            res.status(411).json({
                message:
                    "No user with this username exists in our db"
            });

            return;
        }

        organization.members = organization.members.filter(x => x.toString() !== memberUser._id.toString());
        await organization.save();

        res.json({
            message: "member deleted!"
        });
    }
);



// SERVER

app.listen(3000, () => {
    console.log(3000);
});
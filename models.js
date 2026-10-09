const mongoose = require("mongoose")
mongoose.connect("");

const userSchema = mongoose.Schema({
    username: String,
    password: String
})

const organizationSchema = mongoose.Schema({
    title: String,
    description: String,
    admin: mongoose.Schema.Types.ObjectId,
    members: [mongoose.Schema.Types.ObjectId]
})

const boardSchema = mongoose.Schema({
    title: String,
    organizationId: mongoose.Schema.Types.ObjectId
})

const issueSchema = mongoose.Schema({
    title: String,
    description: String,
    status: { type: String, default: "todo" },
    boardId: mongoose.Schema.Types.ObjectId,
    createdBy: mongoose.Schema.Types.ObjectId
})

const organizationModel = mongoose.model("organization", organizationSchema)
const userModel = mongoose.model("users", userSchema)
const boardModel = mongoose.model("boards", boardSchema)
const issueModel = mongoose.model("issues", issueSchema)

module.exports = {
    organizationModel,
    userModel,
    boardModel,
    issueModel
}
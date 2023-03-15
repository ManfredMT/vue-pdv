const express = require('express')
const router = express.Router()
const {getComments, deleteComment, postComment} = require("../controllers/commentController")
const {protect} = require('../middleware/authMiddleware')

router.post("/",protect, postComment)
router.get("/video/:videoId", getComments)
router.delete("/",protect,deleteComment)


module.exports = router
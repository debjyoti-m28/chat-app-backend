const express= require("express");
const router = express.Router();

const { registerUser, authUser, allUsers } = require("../controllers/userControllers");
const { protect } = require("../middlewares/authMiddleware");

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);
// router.route("/").get(allUsers);
module.exports = router;
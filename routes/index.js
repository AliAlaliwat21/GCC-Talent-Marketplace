const express = require("express")
const mongoose = require("mongoose")
const rateLimit = require("express-rate-limit")

const authCtrl = require("../controllers/auth")
const usersCtrl = require("../controllers/users")
const freelancerProfilesCtrl = require("../controllers/freelancerProfiles")
const clientProfileCtrl = require("../controllers/clientProfile")
const jobsCtrl = require("../controllers/jobs")
const proposalsCtrl = require("../controllers/proposals")
const contractsCtrl = require("../controllers/contracts")
const reviewsCtrl = require("../controllers/reviews")
const skillsCtrl = require("../controllers/skills")
const categoriesCtrl = require("../controllers/categories")
const uploadsCtrl = require("../controllers/uploads")
const walletCtrl = require("../controllers/wallet")
const adminCtrl = require("../controllers/admin")

const verifyToken = require("../middleware/verify-token")
const optionalToken = require("../middleware/optional-token")
const authorize = require("../middleware/authorize")
const upload = require("../middleware/upload")
const {validate, validateIds} = require("../middleware/validate")

const router = express.Router()

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many authentication attempts. Please try again later."
    }
})

router.param("id", validateIds)
router.param("jobId", validateIds)
router.param("userId", validateIds)
router.param("portfolioId", validateIds)
router.param("mid", validateIds)

router.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        build: process.env.BUILD_SHA || "development"
    })
})

router.post("/auth/register", authLimiter, validate("register"), authCtrl.signUp)
router.post("/auth/login", authLimiter, validate("login"), authCtrl.signIn)
router.post("/auth/refresh", authLimiter, authCtrl.refresh)
router.post("/auth/logout", authCtrl.logout)

router.get("/users", verifyToken, authorize("admin"), usersCtrl.index)
router.get("/users/me", verifyToken, usersCtrl.showMe)
router.patch("/users/me", verifyToken, validate("updateUser"), usersCtrl.updateMe)
router.patch(
    "/users/me/password",
    verifyToken,
    validate("changePassword"),
    usersCtrl.changePassword
)

router.get("/freelancers", freelancerProfilesCtrl.index)
router.get("/freelancers/:userId", freelancerProfilesCtrl.show)
router.post(
    "/freelancers",
    verifyToken,
    authorize("freelancer"),
    validate("freelancerProfile"),
    freelancerProfilesCtrl.create
)
router.put(
    "/freelancers/me",
    verifyToken,
    authorize("freelancer"),
    validate("freelancerProfile"),
    freelancerProfilesCtrl.upsertMe
)
router.patch(
    "/freelancers/:id",
    verifyToken,
    authorize("freelancer"),
    validate("updateFreelancerProfile"),
    freelancerProfilesCtrl.update
)
router.delete(
    "/freelancers/:id",
    verifyToken,
    authorize("freelancer"),
    freelancerProfilesCtrl.deleteProfile
)
router.post(
    "/freelancers/:id/portfolio",
    verifyToken,
    authorize("freelancer"),
    validate("portfolio"),
    freelancerProfilesCtrl.createPortfolioItem
)
router.patch(
    "/freelancers/:id/portfolio/:portfolioId",
    verifyToken,
    authorize("freelancer"),
    validate("updatePortfolio"),
    freelancerProfilesCtrl.updatePortfolioItem
)
router.delete(
    "/freelancers/:id/portfolio/:portfolioId",
    verifyToken,
    authorize("freelancer"),
    freelancerProfilesCtrl.deletePortfolioItem
)

router.get("/clients", clientProfileCtrl.index)
router.get("/clients/me", verifyToken, clientProfileCtrl.showMe)
router.post(
    "/clients/me",
    verifyToken,
    authorize("client"),
    validate("clientProfile"),
    clientProfileCtrl.create
)
router.put(
    "/clients/me",
    verifyToken,
    authorize("client"),
    validate("clientProfile"),
    clientProfileCtrl.upsertMe
)
router.patch(
    "/clients/me",
    verifyToken,
    authorize("client"),
    validate("updateClientProfile"),
    clientProfileCtrl.update
)
router.delete(
    "/clients/me",
    verifyToken,
    authorize("client"),
    clientProfileCtrl.deleteProfile
)
router.get("/clients/:userId", clientProfileCtrl.show)

router.post("/jobs", verifyToken, authorize("client"), validate("job"), jobsCtrl.create)
router.get("/jobs/mine", verifyToken, authorize("client"), jobsCtrl.myJobs)
router.get("/jobs", jobsCtrl.allJobs)
router.get("/jobs/:jobId", optionalToken, jobsCtrl.showJob)
router.patch(
    "/jobs/:jobId",
    verifyToken,
    authorize("client"),
    validate("updateJob"),
    jobsCtrl.updateJob
)
router.patch("/jobs/:jobId/publish", verifyToken, authorize("client"), jobsCtrl.publishJob)
router.patch("/jobs/:jobId/close", verifyToken, authorize("client"), jobsCtrl.closeJob)
router.post("/jobs/:jobId/close", verifyToken, authorize("client"), jobsCtrl.closeJob)
router.patch("/jobs/:jobId/reopen", verifyToken, authorize("client"), jobsCtrl.reopenJob)
router.post("/jobs/:jobId/reopen", verifyToken, authorize("client"), jobsCtrl.reopenJob)
router.delete("/jobs/:jobId", verifyToken, authorize("client"), jobsCtrl.deleteDraft)

router.post(
    "/jobs/:id/proposals",
    verifyToken,
    authorize("freelancer"),
    validate("proposal"),
    proposalsCtrl.create
)
router.get(
    "/jobs/:id/proposals",
    verifyToken,
    authorize("client"),
    proposalsCtrl.jobProposals
)
router.get(
    "/proposals/me",
    verifyToken,
    authorize("freelancer"),
    proposalsCtrl.freelancerProposals
)
router.get(
    "/proposals/mine",
    verifyToken,
    authorize("freelancer"),
    proposalsCtrl.freelancerProposals
)
router.patch(
    "/proposals/:id",
    verifyToken,
    authorize("freelancer"),
    validate("updateProposal"),
    proposalsCtrl.update
)
router.patch(
    "/proposals/:id/withdraw",
    verifyToken,
    authorize("freelancer"),
    proposalsCtrl.withdraw
)
router.post(
    "/proposals/:id/withdraw",
    verifyToken,
    authorize("freelancer"),
    proposalsCtrl.withdraw
)
router.patch(
    "/proposals/:id/shortlist",
    verifyToken,
    authorize("client"),
    proposalsCtrl.shortlist
)
router.post(
    "/proposals/:id/shortlist",
    verifyToken,
    authorize("client"),
    proposalsCtrl.shortlist
)
router.patch(
    "/proposals/:id/decline",
    verifyToken,
    authorize("client"),
    proposalsCtrl.decline
)
router.post(
    "/proposals/:id/decline",
    verifyToken,
    authorize("client"),
    proposalsCtrl.decline
)
router.patch(
    "/proposals/:id/accept",
    verifyToken,
    authorize("client"),
    validate("acceptProposal"),
    proposalsCtrl.accept
)
router.post(
    "/proposals/:id/accept",
    verifyToken,
    authorize("client"),
    validate("acceptProposal"),
    proposalsCtrl.accept
)

router.get("/contracts", verifyToken, authorize("client", "freelancer"), contractsCtrl.index)
router.get("/contracts/:id", verifyToken, authorize("client", "freelancer"), contractsCtrl.show)
router.post(
    "/contracts/:id/milestones",
    verifyToken,
    authorize("client"),
    validate("milestone"),
    contractsCtrl.addMilestone
)
router.patch(
    "/contracts/:id/milestones/:mid",
    verifyToken,
    authorize("client"),
    validate("updateMilestone"),
    contractsCtrl.updateMilestone
)
router.patch(
    "/contracts/:id/milestones/:mid/fund",
    verifyToken,
    authorize("client"),
    contractsCtrl.fundMilestone
)
router.post(
    "/contracts/:id/milestones/:mid/fund",
    verifyToken,
    authorize("client"),
    contractsCtrl.fundMilestone
)
router.patch(
    "/contracts/:id/milestones/:mid/deliver",
    verifyToken,
    authorize("freelancer"),
    validate("delivery"),
    contractsCtrl.deliverMilestone
)
router.post(
    "/contracts/:id/milestones/:mid/deliver",
    verifyToken,
    authorize("freelancer"),
    validate("delivery"),
    contractsCtrl.deliverMilestone
)
router.patch(
    "/contracts/:id/milestones/:mid/approve",
    verifyToken,
    authorize("client"),
    contractsCtrl.approveMilestone
)
router.post(
    "/contracts/:id/milestones/:mid/approve",
    verifyToken,
    authorize("client"),
    contractsCtrl.approveMilestone
)
router.patch(
    "/contracts/:id/milestones/:mid/revision",
    verifyToken,
    authorize("client"),
    validate("revision"),
    contractsCtrl.requestRevision
)
router.post(
    "/contracts/:id/milestones/:mid/request-revision",
    verifyToken,
    authorize("client"),
    validate("revision"),
    contractsCtrl.requestRevision
)
router.patch(
    "/contracts/:id/cancel",
    verifyToken,
    authorize("client", "freelancer"),
    contractsCtrl.cancelContract
)
router.post(
    "/contracts/:id/cancel",
    verifyToken,
    authorize("client", "freelancer"),
    contractsCtrl.cancelContract
)
router.post(
    "/contracts/:id/messages",
    verifyToken,
    authorize("client", "freelancer"),
    validate("contractMessage"),
    contractsCtrl.sendMessage
)

router.get("/users/:id/reviews", reviewsCtrl.index)
router.post(
    "/contracts/:id/reviews",
    verifyToken,
    authorize("client", "freelancer"),
    validate("review"),
    reviewsCtrl.create
)

router.get("/skills", skillsCtrl.index)
router.post("/skills", verifyToken, authorize("admin"), validate("skill"), skillsCtrl.create)
router.patch(
    "/skills/:id",
    verifyToken,
    authorize("admin"),
    validate("updateSkill"),
    skillsCtrl.update
)
router.delete("/skills/:id", verifyToken, authorize("admin"), skillsCtrl.deleteSkill)

router.get("/categories", categoriesCtrl.index)
router.post(
    "/categories",
    verifyToken,
    authorize("admin"),
    validate("category"),
    categoriesCtrl.create
)
router.patch(
    "/categories/:id",
    verifyToken,
    authorize("admin"),
    validate("updateCategory"),
    categoriesCtrl.update
)
router.delete("/categories/:id", verifyToken, authorize("admin"), categoriesCtrl.deleteCategory)

router.get("/wallet", verifyToken, walletCtrl.index)
router.post(
    "/wallet/deposit",
    verifyToken,
    authorize("client"),
    validate("deposit"),
    walletCtrl.deposit
)

router.post("/uploads", verifyToken, upload.single("file"), uploadsCtrl.upload)

router.get("/admin/stats", verifyToken, authorize("admin"), adminCtrl.stats)
router.get("/admin/users", verifyToken, authorize("admin"), adminCtrl.index)
router.get("/admin/users/:id", verifyToken, authorize("admin"), adminCtrl.show)
router.patch(
    "/admin/users/:id/status",
    verifyToken,
    authorize("admin"),
    validate("userStatus"),
    adminCtrl.updateStatus
)
router.patch(
    "/admin/users/:id/verify",
    verifyToken,
    authorize("admin"),
    adminCtrl.verifyUser
)
router.delete("/admin/users/:id", verifyToken, authorize("admin"), adminCtrl.deleteUser)

router.post(
    "/admin/categories",
    verifyToken,
    authorize("admin"),
    validate("category"),
    categoriesCtrl.create
)
router.patch(
    "/admin/categories/:id",
    verifyToken,
    authorize("admin"),
    validate("updateCategory"),
    categoriesCtrl.update
)
router.delete(
    "/admin/categories/:id",
    verifyToken,
    authorize("admin"),
    categoriesCtrl.deleteCategory
)

router.post(
    "/admin/skills",
    verifyToken,
    authorize("admin"),
    validate("skill"),
    skillsCtrl.create
)
router.patch(
    "/admin/skills/:id",
    verifyToken,
    authorize("admin"),
    validate("updateSkill"),
    skillsCtrl.update
)
router.delete("/admin/skills/:id", verifyToken, authorize("admin"), skillsCtrl.deleteSkill)

module.exports = router

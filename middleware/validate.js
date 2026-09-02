const mongoose = require("mongoose")
const {z} = require("zod")

const attachmentSchema = z.object({
    url: z.string().url(),
    name: z.string().min(1).max(200),
    size: z.number().nonnegative().optional()
})

const languageSchema = z.object({
    name: z.string().min(1).max(50),
    level: z.string().min(1).max(50).optional()
})

const schemas = {
    register: z.object({
        username: z.string().trim().min(2).max(50),
        email: z.string().trim().email(),
        password: z.string().min(8).max(128),
        role: z.enum(["client", "freelancer"])
    }),
    login: z.object({
        email: z.string().trim().email(),
        password: z.string().min(1).max(128)
    }),
    updateUser: z.object({
        username: z.string().trim().min(2).max(50).optional(),
        avatarUrl: z.string().url().or(z.literal("")).optional(),
        notificationPrefs: z.object({
            email: z.boolean().optional(),
            inApp: z.boolean().optional()
        }).optional(),
        country: z.enum([
            "Bahrain",
            "Kuwait",
            "Oman",
            "Qatar",
            "Saudi Arabia",
            "United Arab Emirates"
        ]).optional(),
        city: z.string().trim().max(100).optional()
    }),
    changePassword: z.object({
        currentPassword: z.string().min(1).max(128),
        newPassword: z.string().min(8).max(128)
    }),
    freelancerProfile: z.object({
        headline: z.string().trim().min(2).max(120),
        bio: z.string().trim().min(10).max(2000),
        skills: z.array(z.string()).min(1),
        hourlyRate: z.number().nonnegative(),
        languages: z.array(languageSchema).min(1),
        availability: z.enum(["full_time", "part_time", "unavailable"]),
        country: z.string().optional(),
        city: z.string().trim().max(100).optional()
    }),
    portfolio: z.object({
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().max(1000).optional(),
        imageUrl: z.string().url().optional(),
        link: z.string().url().optional()
    }),
    updatePortfolio: z.object({
        title: z.string().trim().min(1).max(120).optional(),
        description: z.string().trim().max(1000).optional(),
        imageUrl: z.string().url().optional(),
        link: z.string().url().optional()
    }),
    clientProfile: z.object({
        isCompany: z.boolean(),
        companyName: z.string().trim().max(120).optional(),
        description: z.string().trim().min(10).max(2000),
        website: z.string().url().optional(),
        country: z.string().optional(),
        city: z.string().trim().max(100).optional()
    }),
    job: z.object({
        title: z.string().trim().min(3).max(150),
        description: z.string().trim().min(10).max(5000),
        category: z.string().min(1),
        skills: z.array(z.string()).default([]),
        budgetType: z.enum(["fixed", "hourly"]),
        budgetMin: z.number().nonnegative().optional(),
        budgetMax: z.number().nonnegative().optional(),
        experienceLevel: z.enum(["entry", "intermediate", "expert"]).optional(),
        duration: z.string().trim().max(100).optional(),
        deadline: z.coerce.date().optional(),
        attachments: z.array(attachmentSchema).optional(),
        status: z.enum(["draft", "open"]).optional()
    }).refine((data) => {
        return data.budgetMin === undefined || data.budgetMax === undefined || data.budgetMin <= data.budgetMax
    }, {message: "Minimum budget cannot be greater than maximum budget"}),
    updateJob: z.object({
        title: z.string().trim().min(3).max(150).optional(),
        description: z.string().trim().min(10).max(5000).optional(),
        category: z.string().min(1).optional(),
        skills: z.array(z.string()).optional(),
        budgetType: z.enum(["fixed", "hourly"]).optional(),
        budgetMin: z.number().nonnegative().optional(),
        budgetMax: z.number().nonnegative().optional(),
        experienceLevel: z.enum(["entry", "intermediate", "expert"]).optional(),
        duration: z.string().trim().max(100).optional(),
        deadline: z.coerce.date().optional(),
        attachments: z.array(attachmentSchema).optional(),
        status: z.enum(["draft", "open"]).optional()
    }),
    proposal: z.object({
        coverLetter: z.string().trim().min(10).max(3000),
        amount: z.number().positive(),
        deliveryDays: z.number().int().positive(),
        attachments: z.array(attachmentSchema.omit({size: true})).optional()
    }),
    updateProposal: z.object({
        coverLetter: z.string().trim().min(10).max(3000).optional(),
        amount: z.number().positive().optional(),
        deliveryDays: z.number().int().positive().optional(),
        attachments: z.array(attachmentSchema.omit({size: true})).optional()
    }),
    acceptProposal: z.object({
        milestones: z.array(z.object({
            title: z.string().trim().min(2).max(150),
            description: z.string().trim().max(2000).optional(),
            amount: z.number().positive(),
            dueDate: z.coerce.date().optional()
        })).min(1)
    }),
    milestone: z.object({
        title: z.string().trim().min(2).max(150),
        description: z.string().trim().max(2000).optional(),
        amount: z.number().positive(),
        dueDate: z.coerce.date().optional()
    }),
    updateMilestone: z.object({
        title: z.string().trim().min(2).max(150).optional(),
        description: z.string().trim().max(2000).optional(),
        amount: z.number().positive().optional(),
        dueDate: z.coerce.date().optional()
    }),
    delivery: z.object({
        message: z.string().trim().min(1).max(3000),
        attachments: z.array(attachmentSchema.omit({size: true})).optional()
    }),
    revision: z.object({
        note: z.string().trim().min(1).max(2000)
    }),
    contractMessage: z.object({
        text: z.string().trim().min(1).max(3000),
        attachments: z.array(attachmentSchema.omit({size: true})).optional()
    }),
    deposit: z.object({
        amount: z.number().positive(),
        card: z.object({
            number: z.string().regex(/^\d{16}$/),
            exp: z.string().min(3).max(7),
            cvc: z.string().regex(/^\d{3,4}$/)
        })
    }),
    review: z.object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().trim().min(1).max(2000)
    }),
    category: z.object({
        name: z.string().trim().min(2).max(100),
        slug: z.string().trim().regex(/^[a-z0-9-]+$/),
        icon: z.string().trim().max(100).optional(),
        isFeatured: z.boolean().optional()
    }),
    updateCategory: z.object({
        name: z.string().trim().min(2).max(100).optional(),
        slug: z.string().trim().regex(/^[a-z0-9-]+$/).optional(),
        icon: z.string().trim().max(100).optional(),
        isFeatured: z.boolean().optional()
    }),
    skill: z.object({
        name: z.string().trim().min(1).max(100),
        slug: z.string().trim().regex(/^[a-z0-9-]+$/),
        category: z.string().min(1)
    }),
    updateSkill: z.object({
        name: z.string().trim().min(1).max(100).optional(),
        slug: z.string().trim().regex(/^[a-z0-9-]+$/).optional(),
        category: z.string().min(1).optional()
    }),
    userStatus: z.object({
        status: z.enum(["active", "suspended"])
    })
}

const validate = (schemaName) => {
    return (req, res, next) => {
        const result = schemas[schemaName].safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues.map((issue) => {
                    return {
                        field: issue.path.join("."),
                        message: issue.message
                    }
                })
            })
        }

        req.body = result.data
        next()
    }
}

const validateIds = (req, res, next) => {
    const names = ["id", "jobId", "userId", "portfolioId", "mid"]

    for (let i = 0; i < names.length; i++) {
        const value = req.params[names[i]]

        if (value && !mongoose.isValidObjectId(value)) {
            return res.status(400).json({message: `Invalid ${names[i]}`})
        }
    }

    next()
}

module.exports = {
    validate,
    validateIds
}
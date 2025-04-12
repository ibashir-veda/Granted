const db = require("../models");
const User = db.user;
const NgoProfile = db.ngoProfile;
const FundingOpportunity = db.fundingOpportunity; // Import model
const DiscountOffer = db.discountOffer; // Import model
const ProviderProfile = db.providerProfile; // Ensure all needed models are imported
const Notification = db.notification;
const { sendEmail } = require('../utils/email.util'); // Import the email utility
const { Op } = require("sequelize"); // Ensure Op is imported

// Helper function for pagination parameters
const getPagination = (page, size) => {
  const limit = size ? +size : 10; // Default size 10
  const offset = page ? (page - 1) * limit : 0; // page is 1-based
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: users } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, users, totalPages, currentPage };
};


// List users with role 'ngo_admin' who are not yet verified
exports.listUnverifiedNgos = (req, res) => {
    User.findAll({
        where: {
            role: 'ngo_admin',
            isVerified: false
        },
        include: [{ // Include profile information to help admin decide
            model: NgoProfile,
            required: false // Use left join in case profile hasn't been created yet
        }],
        attributes: ['id', 'email', 'createdAt', 'isVerified'] // Select specific user fields
    })
    .then(users => {
        res.status(200).send(users);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Verify an NGO by Admin
exports.verifyNgo = async (req, res) => {
    const userIdToVerify = req.params.userId;

    try {
        const user = await User.findByPk(userIdToVerify);

        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        if (user.role !== 'ngo_admin') {
            return res.status(400).send({ message: "User is not an NGO Admin." });
        }

        if (user.isVerified) {
            return res.status(400).send({ message: "NGO is already verified." });
        }

        user.isVerified = true;
        await user.save();

        // Create in-app notification
        const notificationMessage = "Congratulations! Your NGO account has been verified by the platform admin.";
        const notificationLink = "/dashboard";
        await Notification.create({
            userId: user.id,
            message: notificationMessage,
            link: notificationLink
        });

        // Send email notification
        const emailSubject = "Your F6S Account Has Been Verified!";
        const emailText = `${notificationMessage}\nYou can now access all features for verified NGOs.\nLogin here: ${process.env.APP_BASE_URL || 'http://localhost:3000'}${notificationLink}`;
        const emailHtml = `<p>${notificationMessage}</p><p>You can now access all features for verified NGOs.</p><p><a href="${process.env.APP_BASE_URL || 'http://localhost:3000'}${notificationLink}">Go to Dashboard</a></p>`;

        // Send email asynchronously (don't wait for it to complete before responding)
        sendEmail(user.email, emailSubject, emailText, emailHtml).catch(err => {
             console.error(`Failed to send verification email to ${user.email}:`, err);
             // Log error, but don't fail the API response
        });


        res.status(200).send({ message: `NGO ${user.email} verified successfully!` });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error verifying NGO." });
    }
};


// Create a new Funding Opportunity (by Admin)
exports.createFundingOpportunity = (req, res) => {
    // Basic validation
    if (!req.body.title || !req.body.funderName || !req.body.description || !req.body.applicationLink) {
        return res.status(400).send({ message: "Title, Funder Name, Description, and Application Link are required." });
    }

    FundingOpportunity.create({
        title: req.body.title,
        funderName: req.body.funderName,
        description: req.body.description,
        fundingAmountRange: req.body.fundingAmountRange,
        eligibilityCriteria: req.body.eligibilityCriteria,
        applicationDeadline: req.body.applicationDeadline || null, // Handle optional date
        applicationLink: req.body.applicationLink,
        tags: req.body.tags,
        postedByAdminId: req.userId // Link to the logged-in admin
    })
    .then(opportunity => {
        res.status(201).send({ message: "Funding Opportunity created successfully!", opportunity: opportunity });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Create a new Discount Offer (by Admin)
exports.createDiscountOffer = (req, res) => {
     // Basic validation
    if (!req.body.productServiceName || !req.body.providerName || !req.body.description || !req.body.discountDetails || !req.body.redemptionInfo) {
        return res.status(400).send({ message: "Product/Service Name, Provider Name, Description, Discount Details, and Redemption Info are required." });
    }

    DiscountOffer.create({
        productServiceName: req.body.productServiceName,
        providerName: req.body.providerName,
        description: req.body.description,
        discountDetails: req.body.discountDetails,
        eligibilityCriteria: req.body.eligibilityCriteria,
        redemptionInfo: req.body.redemptionInfo,
        websiteLink: req.body.websiteLink,
        validityPeriod: req.body.validityPeriod,
        categoryTags: req.body.categoryTags,
        postedByAdminId: req.userId // Link to the logged-in admin
    })
    .then(offer => {
        res.status(201).send({ message: "Discount Offer created successfully!", offer: offer });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Get basic dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const ngoUsers = await User.count({ where: { role: 'ngo_admin' } });
        const verifiedNgos = await User.count({ where: { role: 'ngo_admin', isVerified: true } });
        const unverifiedNgos = ngoUsers - verifiedNgos; // Calculate unverified
        const funderUsers = await User.count({ where: { role: 'funder' } });
        const providerUsers = await User.count({ where: { role: 'service_provider' } });
        const adminUsers = await User.count({ where: { role: 'platform_admin' } });

        const totalOpportunities = await FundingOpportunity.count();
        const totalOffers = await DiscountOffer.count();

        res.status(200).send({
            totalUsers,
            usersByRole: {
                ngo: ngoUsers,
                funder: funderUsers,
                serviceProvider: providerUsers,
                admin: adminUsers
            },
            ngoVerification: {
                verified: verifiedNgos,
                unverified: unverifiedNgos
            },
            contentCounts: {
                fundingOpportunities: totalOpportunities,
                discountOffers: totalOffers
            }
        });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error fetching dashboard statistics." });
    }
};

// --- User Management ---

// List all users with pagination
exports.listUsers = (req, res) => {
    const { page, size, email, role } = req.query; // Add potential filters later
    const { limit, offset } = getPagination(page, size);

    // Basic filtering example (add more as needed)
    let condition = {};
    if (email) {
        condition.email = { [Op.like]: `%${email}%` };
    }
    if (role) {
        condition.role = role;
    }


    User.findAndCountAll({
        where: condition, // Apply filters
        attributes: ['id', 'email', 'role', 'isVerified', 'createdAt'],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
    })
    .then(data => {
        const response = getPagingData(data, page, limit);
        res.status(200).send(response);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Update a user's role or verification status by Admin
exports.updateUser = async (req, res) => {
    const userIdToUpdate = req.params.userId;
    const { role, isVerified } = req.body;
    const adminUserId = req.userId; // ID of the admin performing the action

    // Prevent admin from modifying their own role/status via this endpoint
    if (parseInt(userIdToUpdate, 10) === adminUserId) {
        return res.status(403).send({ message: "Admins cannot modify their own role or verification status via this endpoint." });
    }

    const validRoles = ['ngo_admin', 'funder', 'service_provider', 'platform_admin'];
    if (role && !validRoles.includes(role)) {
        return res.status(400).send({ message: `Invalid role provided. Must be one of: ${validRoles.join(', ')}` });
    }

    try {
        const user = await User.findByPk(userIdToUpdate);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Update fields if provided in the request body
        if (role !== undefined) {
            user.role = role;
        }
        if (isVerified !== undefined) {
            // Ensure boolean value
            user.isVerified = (isVerified === true || isVerified === 'true');
        }

        await user.save();
        // Return only safe fields
        const updatedUserInfo = {
             id: user.id,
             email: user.email,
             role: user.role,
             isVerified: user.isVerified,
             createdAt: user.createdAt,
             updatedAt: user.updatedAt
        };
        res.status(200).send({ message: "User updated successfully!", user: updatedUserInfo });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error updating user." });
    }
};

// --- Admin Content Management ---

// -- Funding Opportunities --

// List ALL Funding Opportunities (for Admin)
exports.listAllOpportunities = (req, res) => {
    // TODO: Add pagination later
    FundingOpportunity.findAll({
        include: [ // Include who posted it
            { model: User, as: 'postingAdmin', attributes: ['id', 'email'] },
            { model: User, as: 'postingFunder', attributes: ['id', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
    })
    .then(opportunities => {
        res.status(200).send(opportunities);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Get details of ANY Funding Opportunity (for Admin editing)
exports.getOpportunityDetails = (req, res) => {
    const opportunityId = req.params.opportunityId;
    FundingOpportunity.findByPk(opportunityId)
    .then(opportunity => {
        if (!opportunity) {
            return res.status(404).send({ message: "Opportunity not found." });
        }
        res.status(200).send(opportunity);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};


// Update ANY Funding Opportunity (by Admin)
// Reuses logic from funder.controller but without ownership check
exports.updateOpportunity = async (req, res) => {
    const opportunityId = req.params.opportunityId;
    const acceptsIntegratedApp = req.body.acceptsIntegratedApp === true || req.body.acceptsIntegratedApp === 'true';
    let appFields = null;

    // Re-use parsing logic (consider moving to a helper if used often)
    const parseAppFields = (fields) => { /* ... copy parseAppFields logic from funder.controller.js ... */
        if (!fields) return null;
        try {
            let parsedFields = fields;
            if (typeof fields === 'string') {
                 parsedFields = JSON.parse(fields);
            }
            if (!Array.isArray(parsedFields) || !parsedFields.every(f => typeof f === 'object' && f !== null && typeof f.label === 'string' && f.label.trim() !== '')) {
                throw new Error("Invalid format for integratedAppFields. Must be an array of objects with non-empty labels.");
            }
            return parsedFields.map(f => ({
                label: f.label.trim(),
                type: f.type || 'text',
                required: !!f.required
            }));
        } catch (error) {
            console.error("Error parsing integratedAppFields:", error);
            throw new Error("Invalid JSON format for integrated application fields.");
        }
    };


     try {
        if (acceptsIntegratedApp && req.body.integratedAppFields) {
            appFields = parseAppFields(req.body.integratedAppFields);
        } else if (acceptsIntegratedApp && !req.body.integratedAppFields) {
             appFields = null;
        }

        const opportunity = await FundingOpportunity.findByPk(opportunityId);
        if (!opportunity) {
            return res.status(404).send({ message: "Opportunity not found." });
        }

        // Update fields
        opportunity.title = req.body.title || opportunity.title;
        // Admin might need to update funderName if not linked to a funder user
        opportunity.funderName = req.body.funderName || opportunity.funderName;
        opportunity.description = req.body.description || opportunity.description;
        opportunity.fundingAmountRange = req.body.fundingAmountRange;
        opportunity.eligibilityCriteria = req.body.eligibilityCriteria;
        opportunity.applicationDeadline = req.body.applicationDeadline || null;
        opportunity.applicationLink = req.body.applicationLink || opportunity.applicationLink;
        opportunity.tags = req.body.tags;
        opportunity.acceptsIntegratedApp = acceptsIntegratedApp;
        opportunity.integratedAppFields = acceptsIntegratedApp ? appFields : null;
        // Admin should not change funderUserId or postedByAdminId here

        await opportunity.save();
        res.status(200).send({ message: "Opportunity updated successfully by Admin!", opportunity: opportunity });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error updating opportunity." });
    }
};

// Delete ANY Funding Opportunity (by Admin)
exports.deleteOpportunity = async (req, res) => {
    const opportunityId = req.params.opportunityId;
    try {
        const opportunity = await FundingOpportunity.findByPk(opportunityId);
        if (!opportunity) {
            return res.status(404).send({ message: "Opportunity not found." });
        }
        await opportunity.destroy();
        res.status(200).send({ message: "Opportunity deleted successfully by Admin!" });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error deleting opportunity." });
    }
};


// -- Discount Offers --

// List ALL Discount Offers (for Admin)
exports.listAllOffers = (req, res) => {
    // TODO: Add pagination later
    DiscountOffer.findAll({
         include: [ // Include who posted it
            { model: User, as: 'postingAdminOffer', attributes: ['id', 'email'] },
            { model: User, as: 'postingProvider', attributes: ['id', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
    })
    .then(offers => {
        res.status(200).send(offers);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Get details of ANY Discount Offer (for Admin editing)
exports.getOfferDetails = (req, res) => {
    const offerId = req.params.offerId;
    DiscountOffer.findByPk(offerId)
    .then(offer => {
        if (!offer) {
            return res.status(404).send({ message: "Offer not found." });
        }
        res.status(200).send(offer);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Update ANY Discount Offer (by Admin)
exports.updateOffer = async (req, res) => {
    const offerId = req.params.offerId;
    try {
        const offer = await DiscountOffer.findByPk(offerId);
        if (!offer) {
            return res.status(404).send({ message: "Offer not found." });
        }

        // Update fields
        offer.productServiceName = req.body.productServiceName || offer.productServiceName;
        // Admin might need to update providerName if not linked to a provider user
        offer.providerName = req.body.providerName || offer.providerName;
        offer.description = req.body.description || offer.description;
        offer.discountDetails = req.body.discountDetails || offer.discountDetails;
        offer.eligibilityCriteria = req.body.eligibilityCriteria;
        offer.redemptionInfo = req.body.redemptionInfo || offer.redemptionInfo;
        offer.websiteLink = req.body.websiteLink;
        offer.validityPeriod = req.body.validityPeriod;
        offer.categoryTags = req.body.categoryTags;
        // Admin should not change providerUserId or postedByAdminId here

        await offer.save();
        res.status(200).send({ message: "Offer updated successfully by Admin!", offer: offer });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error updating offer." });
    }
};

// Delete ANY Discount Offer (by Admin)
exports.deleteOffer = async (req, res) => {
    const offerId = req.params.offerId;
    try {
        const offer = await DiscountOffer.findByPk(offerId);
        if (!offer) {
            return res.status(404).send({ message: "Offer not found." });
        }
        await offer.destroy();
        res.status(200).send({ message: "Offer deleted successfully by Admin!" });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error deleting offer." });
    }
};

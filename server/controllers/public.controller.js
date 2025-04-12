const db = require("../models");
const FundingOpportunity = db.fundingOpportunity;
const DiscountOffer = db.discountOffer;
const User = db.user;
const FunderProfile = db.funderProfile;
const ProviderProfile = db.providerProfile;
const { Op, Sequelize } = require("sequelize"); // Ensure Sequelize is required

// --- Pagination Helpers ---
const getPagination = (page, size) => {
  const limit = size ? +size : 10; // Default size 10
  const offset = page ? (page - 1) * limit : 0; // page is 1-based
  return { limit, offset };
};

// Updated to match expected frontend structure (items instead of users/rows)
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, items, totalPages, currentPage };
};
// --- End Pagination Helpers ---


// List all active Funding Opportunities (with Backend Pagination/Filtering)
exports.listFundingOpportunities = (req, res) => {
    const { page, size, tags, q } = req.query; // Get pagination and filter params
    const { limit, offset } = getPagination(page, size);

    let whereClause = {};

    // Keyword Search
    if (q) {
        const searchTerm = `%${q.toLowerCase()}%`;
        whereClause[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('FundingOpportunity.title')), { [Op.like]: searchTerm }), // Qualify column names
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('FundingOpportunity.description')), { [Op.like]: searchTerm }),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('FundingOpportunity.funderName')), { [Op.like]: searchTerm }),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('FundingOpportunity.tags')), { [Op.like]: searchTerm }),
        ];
    }

    // Tag Filtering
    if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(t => t); // Ensure non-empty tags
        if (tagList.length > 0) {
            const tagClauses = tagList.map(tag =>
                 Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('FundingOpportunity.tags')), { [Op.like]: `%${tag}%` })
            );
             if (whereClause[Op.or]) {
                 whereClause = { [Op.and]: [whereClause, { [Op.or]: tagClauses }] };
             } else {
                 whereClause[Op.or] = tagClauses;
             }
        }
    }

    // Add deadline filtering if needed later
    // whereClause.applicationDeadline = { [Op.or]: [null, { [Op.gte]: new Date() }] };

    FundingOpportunity.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        include: [ // Re-verify includes if needed, qualify columns if ambiguous
             { model: User, as: 'postingFunder', include: [{ model: FunderProfile, attributes: ['website'] }] },
             { model: User, as: 'postingAdmin', attributes: ['id', 'email'] } // Example if admin posts
        ],
        order: [['createdAt', 'DESC']],
        distinct: true // Add distinct if includes cause duplicate rows
    })
    .then(data => {
        // Map results to add display names/websites consistently
         const results = data.rows.map(opp => {
             const plainOpp = opp.get({ plain: true });
             plainOpp.funderDisplayName = plainOpp.funderName; // Default
             plainOpp.funderWebsite = null;
             if (plainOpp.postingFunder?.funder_profile) {
                 plainOpp.funderWebsite = plainOpp.postingFunder.funder_profile.website;
                 // Optionally override funderDisplayName if profile name exists and is preferred
                 // plainOpp.funderDisplayName = plainOpp.postingFunder.funder_profile.organisationName || plainOpp.funderName;
             }
             // Remove nested objects if not needed by frontend
             delete plainOpp.postingFunder;
             delete plainOpp.postingAdmin;
             return plainOpp;
         });

        const response = getPagingData({ count: data.count, rows: results }, page, limit);
        res.status(200).send(response);
    })
    .catch(err => {
        console.error("Error listing funding opportunities:", err); // Log detailed error
        res.status(500).send({ message: err.message || "Error retrieving funding opportunities." });
    });
};

// List all active Discount Offers (with Backend Pagination/Filtering)
exports.listDiscountOffers = (req, res) => {
    const { page, size, categoryTags, q } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereClause = {};

     // Keyword Search
    if (q) {
        const searchTerm = `%${q.toLowerCase()}%`;
        whereClause[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('DiscountOffer.productServiceName')), { [Op.like]: searchTerm }), // Qualify
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('DiscountOffer.description')), { [Op.like]: searchTerm }),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('DiscountOffer.providerName')), { [Op.like]: searchTerm }),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('DiscountOffer.categoryTags')), { [Op.like]: searchTerm }),
        ];
    }

    // Category Tag Filtering
    if (categoryTags) {
        const tagList = categoryTags.split(',').map(tag => tag.trim().toLowerCase()).filter(t => t);
         if (tagList.length > 0) {
            const tagClauses = tagList.map(tag =>
                 Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('DiscountOffer.categoryTags')), { [Op.like]: `%${tag}%` })
            );
             if (whereClause[Op.or]) {
                 whereClause = { [Op.and]: [whereClause, { [Op.or]: tagClauses }] };
             } else {
                 whereClause[Op.or] = tagClauses;
             }
        }
    }

    DiscountOffer.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        include: [ // Re-verify includes, qualify columns
             { model: User, as: 'postingProvider', include: [{ model: ProviderProfile, attributes: ['website'] }] },
             { model: User, as: 'postingAdminOffer', attributes: ['id', 'email'] }
        ],
        order: [['createdAt', 'DESC']],
        distinct: true
    })
    .then(data => {
         // Map results for display names/websites
         const results = data.rows.map(offer => {
             const plainOffer = offer.get({ plain: true });
             plainOffer.providerDisplayName = plainOffer.providerName; // Default
             plainOffer.providerWebsite = plainOffer.websiteLink; // Use specific link first
             if (plainOffer.postingProvider?.provider_profile && plainOffer.postingProvider.provider_profile.website) {
                 plainOffer.providerWebsite = plainOffer.postingProvider.provider_profile.website; // Override with profile website if available
             }
             // Remove nested objects
             delete plainOffer.postingProvider;
             delete plainOffer.postingAdminOffer;
             return plainOffer;
         });

        const response = getPagingData({ count: data.count, rows: results }, page, limit);
        res.status(200).send(response);
    })
    .catch(err => {
         console.error("Error listing discount offers:", err); // Log detailed error
        res.status(500).send({ message: err.message || "Error retrieving discount offers." });
    });
};

const db = require("../models");
const ProviderProfile = db.providerProfile;
const DiscountOffer = db.discountOffer;
const User = db.user;

// --- Profile Management ---

// Get the profile for the currently logged-in Provider user
exports.getMyProfile = (req, res) => {
    ProviderProfile.findOne({
        where: { userId: req.userId }, // userId from authJwt middleware
        include: [{ model: User, attributes: ['email', 'role'] }]
    })
    .then(profile => {
        if (!profile) {
            return res.status(200).send({ message: "Service Provider profile not created yet.", profile: null });
        }
        res.status(200).send({ profile: profile });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Create or Update the profile for the currently logged-in Provider user
exports.updateMyProfile = (req, res) => {
    const userId = req.userId;

    if (!req.body.companyName) {
        return res.status(400).send({ message: "Company Name is required." });
    }

    const profileData = {
        userId: userId,
        companyName: req.body.companyName,
        serviceType: req.body.serviceType,
        website: req.body.website,
        contactEmail: req.body.contactEmail,
        description: req.body.description
    };

    ProviderProfile.findOne({ where: { userId: userId } })
        .then(profile => {
            if (profile) {
                return profile.update(profileData); // Update existing
            } else {
                return ProviderProfile.create(profileData); // Create new
            }
        })
        .then(updatedOrCreatedProfile => {
            res.status(200).send({
                message: "Profile updated successfully!",
                profile: updatedOrCreatedProfile
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

// --- Discount Offer Management ---

// Create a new Discount Offer (by Provider)
exports.createDiscountOffer = (req, res) => {
     if (!req.body.productServiceName || !req.body.description || !req.body.discountDetails || !req.body.redemptionInfo) {
        return res.status(400).send({ message: "Product/Service Name, Description, Discount Details, and Redemption Info are required." });
    }

    // Get Provider's company name from their profile
    ProviderProfile.findOne({ where: { userId: req.userId }})
    .then(profile => {
        const providerCompName = profile ? profile.companyName : req.body.providerName; // Use profile name or fallback

        if (!providerCompName) {
             return res.status(400).send({ message: "Provider company name could not be determined. Ensure profile is created or provide providerName." });
        }

        return DiscountOffer.create({
            productServiceName: req.body.productServiceName,
            providerName: providerCompName, // Use name from profile or request
            description: req.body.description,
            discountDetails: req.body.discountDetails,
            eligibilityCriteria: req.body.eligibilityCriteria,
            redemptionInfo: req.body.redemptionInfo,
            websiteLink: req.body.websiteLink,
            validityPeriod: req.body.validityPeriod,
            categoryTags: req.body.categoryTags,
            providerUserId: req.userId // Link to the logged-in provider
        });
    })
    .then(offer => {
        res.status(201).send({ message: "Discount Offer created successfully!", offer: offer });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Get Discount Offers posted by the currently logged-in Provider
exports.getMyDiscountOffers = (req, res) => {
    DiscountOffer.findAll({
        where: { providerUserId: req.userId },
        order: [['createdAt', 'DESC']]
    })
    .then(offers => {
        res.status(200).send(offers);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Helper function to parse and validate offer data (similar to funder controller)
const parseOfferFields = (body) => {
    // Add validation/parsing if complex fields are added later
    return {
        productServiceName: body.productServiceName,
        description: body.description,
        discountDetails: body.discountDetails,
        eligibilityCriteria: body.eligibilityCriteria,
        redemptionInfo: body.redemptionInfo,
        websiteLink: body.websiteLink,
        validityPeriod: body.validityPeriod,
        categoryTags: body.categoryTags,
        // providerName is handled separately based on profile
    };
};

// Get details of a specific offer owned by the provider (for editing)
exports.getMyDiscountOfferDetails = (req, res) => {
    const offerId = req.params.offerId;
    const userId = req.userId;

    DiscountOffer.findOne({
        where: {
            id: offerId,
            providerUserId: userId // Ensure ownership
        }
    })
    .then(offer => {
        if (!offer) {
            return res.status(404).send({ message: "Offer not found or access denied." });
        }
        res.status(200).send(offer);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};


// Update a Discount Offer owned by the Provider
exports.updateMyDiscountOffer = async (req, res) => {
    const offerId = req.params.offerId;
    const userId = req.userId;

    try {
        const offer = await DiscountOffer.findOne({
            where: {
                id: offerId,
                providerUserId: userId // Ensure ownership
            }
        });

        if (!offer) {
            return res.status(404).send({ message: "Offer not found or access denied." });
        }

        // Get updated data
        const updatedData = parseOfferFields(req.body);

        // Update fields - allow clearing optional fields
        offer.productServiceName = updatedData.productServiceName || offer.productServiceName;
        offer.description = updatedData.description || offer.description;
        offer.discountDetails = updatedData.discountDetails || offer.discountDetails;
        offer.eligibilityCriteria = updatedData.eligibilityCriteria;
        offer.redemptionInfo = updatedData.redemptionInfo || offer.redemptionInfo;
        offer.websiteLink = updatedData.websiteLink;
        offer.validityPeriod = updatedData.validityPeriod;
        offer.categoryTags = updatedData.categoryTags;

        // Provider name should ideally not change unless profile changes, keep as is.

        await offer.save();
        res.status(200).send({ message: "Offer updated successfully!", offer: offer });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error updating offer." });
    }
};

// Delete a Discount Offer owned by the Provider
exports.deleteMyDiscountOffer = async (req, res) => {
    const offerId = req.params.offerId;
    const userId = req.userId;

    try {
        const offer = await DiscountOffer.findOne({
            where: {
                id: offerId,
                providerUserId: userId // Ensure ownership
            }
        });

        if (!offer) {
            return res.status(404).send({ message: "Offer not found or access denied." });
        }

        await offer.destroy();
        res.status(200).send({ message: "Offer deleted successfully!" });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error deleting offer." });
    }
};

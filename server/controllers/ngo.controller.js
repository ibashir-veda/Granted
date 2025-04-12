const db = require("../models");
const NgoProfile = db.ngoProfile;
const User = db.user;
const SavedSearch = db.savedSearch; // Import SavedSearch model
const FundingOpportunity = db.fundingOpportunity; // Import FundingOpportunity
const ApplicationSubmission = db.applicationSubmission; // Import ApplicationSubmission
const Notification = db.notification; // Import Notification model
const { sendEmail } = require('../utils/email.util'); // Ensure email utility is imported

// Get the profile for the currently logged-in NGO Admin user
exports.getMyProfile = (req, res) => {
    NgoProfile.findOne({
        where: { userId: req.userId }, // userId is attached by authJwt middleware
        include: [{ // Optionally include user details if needed
            model: User,
            attributes: ['email', 'role', 'isVerified']
        }]
    })
    .then(profile => {
        if (!profile) {
            // If no profile exists yet, return a specific status or empty object
            return res.status(200).send({ message: "NGO profile not created yet.", profile: null });
        }
        res.status(200).send({ profile: profile });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Create or Update the profile for the currently logged-in NGO Admin user
exports.updateMyProfile = (req, res) => {
    const userId = req.userId;

    // Basic validation
    if (!req.body.ngoName) {
        return res.status(400).send({ message: "NGO Name is required." });
    }

    const profileData = {
        userId: userId, // Ensure userId is set
        ngoName: req.body.ngoName,
        location: req.body.location,
        contactEmail: req.body.contactEmail,
        website: req.body.website,
        mission: req.body.mission,
        vision: req.body.vision,
        impactAreas: req.body.impactAreas,
        registrationDetails: req.body.registrationDetails,
        teamSize: req.body.teamSize,
        budgetRange: req.body.budgetRange
    };

    NgoProfile.findOne({ where: { userId: userId } })
        .then(profile => {
            if (profile) {
                // Update existing profile
                return profile.update(profileData);
            } else {
                // Create new profile
                return NgoProfile.create(profileData);
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


// --- Saved Search Management ---

// Create a new Saved Search for the logged-in NGO Admin
exports.createSavedSearch = (req, res) => {
    const userId = req.userId;
    const { searchType, keywords, searchName, filters } = req.body; // Add filters

    if (!searchType || !['funding', 'discounts'].includes(searchType)) {
        return res.status(400).send({ message: "Valid searchType ('funding' or 'discounts') is required." });
    }
    // Require at least keywords OR filters
    if (!keywords && (!filters || Object.keys(filters).length === 0)) {
         return res.status(400).send({ message: "Keywords or filters are required to save a search." });
    }

    // Basic validation/sanitization for filters if needed
    let cleanFilters = null;
    if (filters && typeof filters === 'object' && Object.keys(filters).length > 0) {
        cleanFilters = filters; // Add more validation later if needed
    }

    // Generate a default name if not provided
    let defaultName = `Search (${searchType})`;
    if (keywords) defaultName += ` for "${keywords}"`;
    if (cleanFilters?.tags) defaultName += ` [Tags: ${cleanFilters.tags}]`;
    if (cleanFilters?.categories) defaultName += ` [Categories: ${cleanFilters.categories}]`;


    SavedSearch.create({
        userId: userId,
        searchType: searchType,
        keywords: keywords || null, // Store null if empty
        searchName: searchName || defaultName,
        filters: cleanFilters // Store validated filters
    })
    .then(savedSearch => {
        res.status(201).send({ message: "Search saved successfully!", savedSearch: savedSearch });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// List Saved Searches for the logged-in NGO Admin
exports.listMySavedSearches = (req, res) => {
    SavedSearch.findAll({
        where: { userId: req.userId },
        order: [['createdAt', 'DESC']]
    })
    .then(searches => {
        res.status(200).send(searches);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Delete a Saved Search for the logged-in NGO Admin
exports.deleteMySavedSearch = (req, res) => {
    const searchId = req.params.searchId;
    const userId = req.userId;

    SavedSearch.findOne({
        where: {
            id: searchId,
            userId: userId // Ensure the user owns this search
        }
    })
    .then(search => {
        if (!search) {
            return res.status(404).send({ message: "Saved search not found or you don't have permission." });
        }
        return search.destroy(); // Delete the found search
    })
    .then(() => {
        res.status(200).send({ message: "Saved search deleted successfully!" });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};


// --- Application Submission ---

exports.submitApplication = async (req, res) => {
    const userId = req.userId; // NGO User ID
    const opportunityId = req.params.opportunityId;
    const submissionData = req.body.submissionData;

    if (!submissionData || typeof submissionData !== 'object' || Object.keys(submissionData).length === 0) {
        return res.status(400).send({ message: "Submission data is required." });
    }

    try {
        // 1. Find the Opportunity (include funderUserId and title, and funder email)
        const opportunity = await FundingOpportunity.findByPk(opportunityId, {
            attributes: ['id', 'acceptsIntegratedApp', 'integratedAppFields', 'funderUserId', 'title'],
            include: [ // Include the funder user to get their email
                {
                    model: User,
                    as: 'postingFunder', // Use the correct alias if defined in associations
                    attributes: ['id', 'email']
                }
            ]
        });
        if (!opportunity) {
            return res.status(404).send({ message: "Funding Opportunity not found." });
        }
        if (!opportunity.acceptsIntegratedApp) {
            return res.status(400).send({ message: "This opportunity does not accept integrated applications." });
        }

        // 2. Find the NGO's profile
        const ngoProfile = await NgoProfile.findOne({ where: { userId: userId }, attributes: ['id', 'ngoName'] });
        if (!ngoProfile) {
            // Require profile to be created before applying? Or allow submission without it?
            // Let's require it for now to link profile data.
            return res.status(400).send({ message: "NGO Profile must be created before submitting applications." });
        }

        // 3. Basic Validation: Check if required fields (defined in opportunity) are present in submissionData
        const requiredFields = (opportunity.integratedAppFields || []).filter(f => f.required);
        for (const field of requiredFields) {
            if (!(field.label in submissionData) || !submissionData[field.label]) {
                 return res.status(400).send({ message: `Missing required field: ${field.label}` });
            }
        }

        // 4. Check if user has already applied (optional, prevent duplicates)
        const existingSubmission = await ApplicationSubmission.findOne({
            where: { fundingOpportunityId: opportunityId, ngoUserId: userId }
        });
        if (existingSubmission) {
            return res.status(400).send({ message: "You have already submitted an application for this opportunity." });
        }


        // 5. Create the submission record
        const submission = await ApplicationSubmission.create({
            fundingOpportunityId: opportunityId,
            ngoUserId: userId,
            ngoProfileId: ngoProfile.id, // Link to the profile
            submissionData: submissionData, // Store the submitted answers
            status: 'submitted',
            submittedAt: new Date()
        });

        // 6. Create in-app notification and send email to the Funder user (if linked)
        const funderUser = opportunity.postingFunder; // Get the included funder user data
        if (funderUser && funderUser.email) {
            const appTitle = opportunity.title;
            const ngoName = ngoProfile?.ngoName || 'an NGO';
            const notificationLink = `/funder/funding/${opportunityId}/applications`; // Link to the applications list

            // Create in-app notification
            const inAppMessage = `New application received from ${ngoName} for "${appTitle}".`;
            await Notification.create({
                userId: funderUser.id,
                message: inAppMessage,
                link: notificationLink
            });

            // Send email notification
            const emailSubject = `New Application Received for "${appTitle}"`;
            const emailText = `Hi,\n\nYou have received a new application from ${ngoName} for your funding opportunity "${appTitle}".\n\nView applications here: ${process.env.APP_BASE_URL || 'http://localhost:3000'}${notificationLink}`;
            const emailHtml = `<p>Hi,</p><p>You have received a new application from <strong>${ngoName}</strong> for your funding opportunity "<strong>${appTitle}</strong>".</p><p><a href="${process.env.APP_BASE_URL || 'http://localhost:3000'}${notificationLink}">View Applications</a></p>`;

            sendEmail(funderUser.email, emailSubject, emailText, emailHtml).catch(err => {
                 console.error(`Failed to send new application email to ${funderUser.email}:`, err);
            });
        }

        res.status(201).send({ message: "Application submitted successfully!", submission: submission });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error submitting application." });
    }
};

// List applications submitted by the currently logged-in NGO Admin
exports.listMyApplications = (req, res) => {
    const userId = req.userId;

    ApplicationSubmission.findAll({
        where: { ngoUserId: userId },
        include: [
            {
                model: FundingOpportunity,
                attributes: ['id', 'title', 'funderName'] // Include basic opportunity info
            }
        ],
        order: [['submittedAt', 'DESC']] // Show most recent first
    })
    .then(submissions => {
        res.status(200).send(submissions);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

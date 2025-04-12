const db = require("../models");
const FunderProfile = db.funderProfile;
const FundingOpportunity = db.fundingOpportunity;
const User = db.user;
const ApplicationSubmission = db.applicationSubmission; // Import ApplicationSubmission
const NgoProfile = db.ngoProfile; // Import NgoProfile
const Notification = db.notification; // Import Notification model
const { Op } = require("sequelize"); // Import Op
const { sendEmail } = require('../utils/email.util'); // Ensure email utility is imported

// --- Profile Management ---

// Get the profile for the currently logged-in Funder user
exports.getMyProfile = (req, res) => {
    FunderProfile.findOne({
        where: { userId: req.userId }, // userId from authJwt middleware
        include: [{ model: User, attributes: ['email', 'role'] }]
    })
    .then(profile => {
        if (!profile) {
            return res.status(200).send({ message: "Funder profile not created yet.", profile: null });
        }
        res.status(200).send({ profile: profile });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Create or Update the profile for the currently logged-in Funder user
exports.updateMyProfile = (req, res) => {
    const userId = req.userId;

    if (!req.body.organizationName) {
        return res.status(400).send({ message: "Organization Name is required." });
    }

    const profileData = {
        userId: userId,
        organizationName: req.body.organizationName,
        funderType: req.body.funderType,
        website: req.body.website,
        contactEmail: req.body.contactEmail,
        fundingAreas: req.body.fundingAreas,
        grantSizeRange: req.body.grantSizeRange,
        eligibilitySummary: req.body.eligibilitySummary,
        applicationPortalLink: req.body.applicationPortalLink
    };

    FunderProfile.findOne({ where: { userId: userId } })
        .then(profile => {
            if (profile) {
                return profile.update(profileData); // Update existing
            } else {
                return FunderProfile.create(profileData); // Create new
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

// --- Funding Opportunity Management ---

// Helper function to parse and validate integratedAppFields
const parseAppFields = (fields) => {
    if (!fields) return null;
    try {
        let parsedFields = fields;
        // If fields are passed as a string (e.g., from form), parse it
        if (typeof fields === 'string') {
             parsedFields = JSON.parse(fields);
        }

        // Basic validation: ensure it's an array of objects with labels
        if (!Array.isArray(parsedFields) || !parsedFields.every(f => typeof f === 'object' && f !== null && typeof f.label === 'string' && f.label.trim() !== '')) {
            throw new Error("Invalid format for integratedAppFields. Must be an array of objects with non-empty labels.");
        }
        // Add more validation later (e.g., field types)
        return parsedFields.map(f => ({
            label: f.label.trim(),
            type: f.type || 'text', // Default to text input
            required: !!f.required // Ensure boolean
        }));
    } catch (error) {
        console.error("Error parsing integratedAppFields:", error);
        throw new Error("Invalid JSON format for integrated application fields.");
    }
};


// Create a new Funding Opportunity (by Funder)
exports.createFundingOpportunity = (req, res) => {
    if (!req.body.title || !req.body.description || !req.body.applicationLink) {
        return res.status(400).send({ message: "Title, Description, and Application Link are required." });
    }

    // Get Funder's organization name from their profile to pre-fill funderName
    FunderProfile.findOne({ where: { userId: req.userId }})
    .then(profile => {
        const funderOrgName = profile ? profile.organizationName : req.body.funderName; // Use profile name or fallback to request body if needed

        if (!funderOrgName) {
             return res.status(400).send({ message: "Funder organization name could not be determined. Ensure profile is created or provide funderName." });
        }

        const acceptsIntegratedApp = req.body.acceptsIntegratedApp === true || req.body.acceptsIntegratedApp === 'true';
        let appFields = null;

        try {
            if (acceptsIntegratedApp && req.body.integratedAppFields) {
                appFields = parseAppFields(req.body.integratedAppFields);
            } else if (acceptsIntegratedApp && !req.body.integratedAppFields) {
                // If integrated app is enabled but no fields provided, maybe default or error?
                // For now, let's allow it but fields will be null. Add validation if needed.
            }
        } catch (error) {
            return res.status(400).send({ message: error.message });
        }

        return FundingOpportunity.create({
            title: req.body.title,
            funderName: funderOrgName, // Use name from profile or request
            description: req.body.description,
            fundingAmountRange: req.body.fundingAmountRange,
            eligibilityCriteria: req.body.eligibilityCriteria,
            applicationDeadline: req.body.applicationDeadline || null,
            applicationLink: req.body.applicationLink, // Keep this even if integrated app is used
            tags: req.body.tags,
            funderUserId: req.userId, // Link to the logged-in funder
            acceptsIntegratedApp: acceptsIntegratedApp, // Save flag
            integratedAppFields: appFields // Save parsed fields
        });
    })
    .then(opportunity => {
        res.status(201).send({ message: "Funding Opportunity created successfully!", opportunity: opportunity });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Get Funding Opportunities posted by the currently logged-in Funder
exports.getMyFundingOpportunities = (req, res) => {
    FundingOpportunity.findAll({
        where: { funderUserId: req.userId },
        order: [['createdAt', 'DESC']]
    })
    .then(opportunities => {
        res.status(200).send(opportunities);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Get details of a specific opportunity owned by the funder (for editing)
exports.getMyFundingOpportunityDetails = (req, res) => {
    const opportunityId = req.params.opportunityId;
    const userId = req.userId;

    FundingOpportunity.findOne({
        where: {
            id: opportunityId,
            funderUserId: userId // Ensure ownership
        }
    })
    .then(opportunity => {
        if (!opportunity) {
            return res.status(404).send({ message: "Opportunity not found or access denied." });
        }
        res.status(200).send(opportunity);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};


// Update a Funding Opportunity owned by the Funder
exports.updateMyFundingOpportunity = (req, res) => {
    const opportunityId = req.params.opportunityId;
    const userId = req.userId;
    const acceptsIntegratedApp = req.body.acceptsIntegratedApp === true || req.body.acceptsIntegratedApp === 'true';
    let appFields = null;

     try {
        if (acceptsIntegratedApp && req.body.integratedAppFields) {
            appFields = parseAppFields(req.body.integratedAppFields);
        } else if (acceptsIntegratedApp && !req.body.integratedAppFields) {
             // Keep existing fields if integrated app is enabled but no new fields provided? Or clear them?
             // Let's clear them for simplicity if acceptsIntegratedApp is true but fields are empty/null.
             appFields = null;
        }
    } catch (error) {
        return res.status(400).send({ message: error.message });
    }

    FundingOpportunity.findOne({
        where: {
            id: opportunityId,
            funderUserId: userId // Ensure ownership
        }
    })
    .then(opportunity => {
        if (!opportunity) {
            return res.status(404).send({ message: "Opportunity not found or access denied." });
        }

        // Update fields
        opportunity.title = req.body.title || opportunity.title;
        opportunity.description = req.body.description || opportunity.description;
        opportunity.fundingAmountRange = req.body.fundingAmountRange; // Allow clearing
        opportunity.eligibilityCriteria = req.body.eligibilityCriteria; // Allow clearing
        opportunity.applicationDeadline = req.body.applicationDeadline || null;
        opportunity.applicationLink = req.body.applicationLink || opportunity.applicationLink;
        opportunity.tags = req.body.tags; // Allow clearing
        opportunity.acceptsIntegratedApp = acceptsIntegratedApp;
        // Only update fields if acceptsIntegratedApp is true, otherwise set to null
        opportunity.integratedAppFields = acceptsIntegratedApp ? appFields : null;

        return opportunity.save();
    })
    .then(updatedOpportunity => {
        res.status(200).send({ message: "Opportunity updated successfully!", opportunity: updatedOpportunity });
    })
    .catch(err => {
        // Handle potential validation errors from parseAppFields or save()
        res.status(500).send({ message: err.message || "Error updating opportunity." });
    });
};


// Delete a Funding Opportunity owned by the Funder
exports.deleteMyFundingOpportunity = async (req, res) => {
    const opportunityId = req.params.opportunityId;
    const userId = req.userId;

    try {
        const opportunity = await FundingOpportunity.findOne({
            where: {
                id: opportunityId,
                funderUserId: userId // Ensure ownership
            }
        });

        if (!opportunity) {
            return res.status(404).send({ message: "Opportunity not found or access denied." });
        }

        // TODO: Consider implications - what happens to existing applications?
        // For now, we'll just delete the opportunity. Add cascading delete or status change later if needed.
        await opportunity.destroy();

        res.status(200).send({ message: "Opportunity deleted successfully!" });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error deleting opportunity." });
    }
};


// --- Application Viewing (Funder) ---

// List applications received for a specific funding opportunity owned by the funder
exports.listOpportunityApplications = (req, res) => {
    const opportunityId = req.params.opportunityId;
    const userId = req.userId; // Funder's user ID

    // 1. Verify the funder owns the opportunity
    FundingOpportunity.findOne({
        where: { id: opportunityId, funderUserId: userId }
    })
    .then(opportunity => {
        if (!opportunity) {
            return res.status(404).send({ message: "Opportunity not found or access denied." });
        }

        // 2. Find all submissions for this opportunity, include applicant info
        return ApplicationSubmission.findAll({
            where: { fundingOpportunityId: opportunityId },
            include: [
                {
                    model: User,
                    as: 'applicantUser',
                    attributes: ['id', 'email'] // Get applicant user email
                },
                {
                    model: NgoProfile,
                    as: 'applicantProfile', // Get applicant profile details
                    // attributes: ['ngoName', 'website', ...] // Select specific fields if needed
                }
            ],
            order: [['submittedAt', 'ASC']] // Show oldest first
        });
    })
    .then(submissions => {
        res.status(200).send(submissions);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Update the status of a specific application
exports.updateApplicationStatus = async (req, res) => {
    const submissionId = req.params.submissionId;
    const funderUserId = req.userId;
    const { status } = req.body;

    const validStatuses = ['submitted', 'under_review', 'approved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).send({ message: `Invalid status provided. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        // 1. Find the submission (include applicant user email and opportunity title)
        const submission = await ApplicationSubmission.findByPk(submissionId, {
            include: [
                {
                    model: FundingOpportunity,
                    attributes: ['id', 'funderUserId', 'title']
                },
                 {
                    model: User,
                    as: 'applicantUser',
                    attributes: ['id', 'email'] // Need applicant user email
                }
            ]
        });

        if (!submission) {
            return res.status(404).send({ message: "Application submission not found." });
        }

        // 2. Verify the logged-in funder owns the opportunity linked to this submission
        if (!submission.funding_opportunity || submission.funding_opportunity.funderUserId !== funderUserId) {
            return res.status(403).send({ message: "Access denied. You do not own the opportunity associated with this application." });
        }

        // 3. Update the status
        const previousStatus = submission.status;
        submission.status = status;
        await submission.save();

        // 4. Create in-app notification and send email if status changed
        if (submission.applicantUser && previousStatus !== status) {
            const appTitle = submission.funding_opportunity.title;
            const ngoEmail = submission.applicantUser.email;
            const notificationLink = "/my-applications"; // Link to NGO's application list

            // Create in-app notification
            const inAppMessage = `Status for your application to "${appTitle}" updated to: ${status}.`;
            await Notification.create({
                userId: submission.applicantUser.id,
                message: inAppMessage,
                link: notificationLink
            });

            // Send email notification
            const emailSubject = `Application Status Update for "${appTitle}"`;
            const emailText = `Hi,\n\nThe status for your application to the funding opportunity "${appTitle}" has been updated to: ${status}.\n\nYou can view your applications here: ${process.env.APP_BASE_URL || 'http://localhost:3000'}${notificationLink}`;
            const emailHtml = `<p>Hi,</p><p>The status for your application to the funding opportunity "<strong>${appTitle}</strong>" has been updated to: <strong>${status}</strong>.</p><p><a href="${process.env.APP_BASE_URL || 'http://localhost:3000'}${notificationLink}">View My Applications</a></p>`;

            sendEmail(ngoEmail, emailSubject, emailText, emailHtml).catch(err => {
                 console.error(`Failed to send application status email to ${ngoEmail}:`, err);
            });
        }

        res.status(200).send({ message: "Application status updated successfully!", submission: submission });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error updating application status." });
    }
};

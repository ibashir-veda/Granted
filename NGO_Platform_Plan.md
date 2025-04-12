# NGO Platform Plan (Focused on Funding & Discounts)

## 1. Introduction

**Purpose:** To create a specialized online platform connecting Non-Governmental Organizations (NGOs) primarily with **funding opportunities** and **discounted offers** on essential software, tools, and services.

**Vision:** To become the leading digital hub for NGOs seeking grants and operational cost savings, and for funders and service providers looking to support the non-profit sector efficiently.

## 2. Target Audience

*   **NGOs:** Non-profit organizations seeking grants and discounts.
*   **Grantmakers/Funders:** Organizations offering grants. These can be Foundations, Government, Private Companies or Other NGOs
*   **Service Providers:** Companies offering discounted software, tools, or services to NGOs.
*   **Platform Administrators:** Team managing the platform.

## 3. User Roles & Permissions

*   **NGO Admin:**
    *   Create/Manage NGO Profile (including verification details)
    *   Search/Filter for Funding Opportunities and Discount Offers
    *   Apply for Funding Opportunities
    *   Redeem/Access Discount Offers
    *   Track Application Status & Offer Usage
    *   Communicate with Funders (re: applications)
*   **Funder/Grantmaker:**
    *   Create/Manage Funder Profile
    *   Post/Manage Funding Opportunities (Grants)
    *   Define Application Process & Criteria
    *   Review/Manage Grant Applications Received via the platform
    *   Communicate with NGO Applicants
    *   View basic analytics on posted opportunities (views, applications started/submitted)
*   **Service Provider:**
    *   Create/Manage Provider Profile
    *   Post/Manage Discount Offers (including eligibility, redemption process)
    *   Track Offer Visibility/Redemption (basic analytics)
*   **Platform Admin:**
    *   User Management (Approve/Verify NGOs, Funders, Providers)
    *   Content Moderation (Opportunities, Offers, Profiles)
    *   Platform Configuration (Categories, Filters)
    *   Analytics & Reporting
    *   System Maintenance
    *   Manage Featured Listings (if applicable)

## 4. Core Features

### 4.1. Profiles

*   **NGO Profile:**
    *   Basic Info: Name, Location, Contact, Website
    *   Mission & Vision
    *   Impact Areas/Sectors
    *   **Verification Status:** (Crucial for accessing offers/funding) - Requires documentation upload (Registration, Tax Exemption) managed by Platform Admin.
    *   Funding Needs Overview (Optional)
    *   Team Size/Budget Range (For eligibility filtering)
*   **Funder Profile:**
    *   Organization Details
    *   Funding Areas/Priorities
    *   Typical Grant Size/Range
    *   Eligibility Criteria Summary
    *   Link to Official Grant Guidelines
    *   Contact Information / Application Portal Link
*   **Service Provider Profile:**
    *   Company Information & Description
    *   Type of Software/Service Offered
    *   Link to Company Website
    *   Contact for Support/Partnerships

### 4.2. Opportunity & Offer Listings

*   **Funding Opportunities:**
    *   Posted by Funders or curated by Platform Admin.
    *   Grant Title, Funder Name, Description
    *   Funding Amount/Range
    *   Detailed Eligibility Criteria (Region, NGO size, Sector, etc.)
    *   Application Deadline
    *   Application Method (Link to external portal or Integrated Application Form)
    *   Tags/Categories (e.g., Health, Education, Environment, Capacity Building)
*   **Discount Offers:**
    *   Posted by Service Providers or curated by Platform Admin.
    *   Product/Service Name & Description
    *   Provider Name
    *   Discount Details (% off, specific price, freemium tier)
    *   Eligibility Criteria (e.g., Verified NGOs only, specific regions)
    *   Redemption Process (Coupon code, unique link, contact instructions)
    *   Validity Period
    *   Categories/Tags (e.g., CRM, Accounting, Marketing, Cloud Services, HR Tools)

### 4.3. Search & Filtering

*   **Unified Search:** Search across both Funding and Discounts.
*   **Funding Filters:** Grant Amount, Deadline Proximity, Funder Type, Geographic Focus, Impact Area, Eligibility Criteria.
*   **Discount Filters:** Service Category (CRM, Finance, etc.), Provider Name, Discount Type (% vs Fixed), Free Tier availability.
*   Keyword Search across descriptions and titles.
*   Saved Searches & Email Alerts for new relevant listings.

### 4.4. Application Management & Offer Redemption

*   **Funding Applications:**
    *   Option for integrated basic application forms (configurable by Funder).
    *   Clear links to external application portals.
    *   Dashboard for NGOs to track applications submitted via the platform (Status: Submitted, Under Review - if Funder updates).
    *   Dashboard for Funders to review applications received via the platform.
*   **Offer Redemption:**
    *   Mechanism to reveal discount codes or unique links (potentially only to verified NGOs).
    *   Clear instructions on how to redeem the offer on the provider's site.
    *   "Save Offer" functionality for NGOs.
    *   Basic tracking for providers (e.g., number of clicks on redemption link/code reveal).

### 4.5. Networking & Communication

*   Primarily focused on communication related to funding applications (NGO <> Funder) if using integrated applications.
*   Notifications for saved search alerts, application status changes (if applicable), expiring saved offers.

### 4.6. Dashboard

*   **NGO Dashboard:** Overview of saved offers, tracked funding opportunities, application statuses (if applicable), alerts.
*   **Funder Dashboard:** Manage posted opportunities, review submitted applications (if applicable).
*   **Service Provider Dashboard:** Manage posted offers, view basic redemption metrics (clicks/reveals).

## 5. Potential Advanced Features (Focus on Funding/Discounts)

*   **Eligibility Matching:** Automated suggestions for NGOs based on their profile matching funding/offer criteria.
*   **Grant Deadline Calendar & Reminders:** Personalized calendar view for NGOs.

## 7. Technology Stack (Chosen)

*   **Frontend:** React (using Create React App)
*   **Backend:** Node.js (Express)
*   **Database:** PostgreSQL (with Sequelize ORM)
*   **Search:** (To be decided - Elasticsearch or PostgreSQL Full-Text Search initially)
*   **Cloud Hosting:** (To be decided - AWS, Google Cloud Platform, or Azure)
*   **Other:** Cloud Storage (e.g., S3), Caching (e.g., Redis), Background Jobs (e.g., BullMQ/Agenda) - *Future Consideration*

## 8. Development Phases (Revised Roadmap)

*   **Phase 1 (MVP):**
    *   User Registration & Login (NGO, Platform Admin roles)
    *   NGO Profile Creation (including basic verification info upload)
    *   Platform Admin interface for NGO verification (Manual process)
    *   Ability for Admins to manually curate and post initial Funding Opportunities and Discount Offers (simple listings).
    *   Basic Search & Filtering (Category, Keyword).
    *   Display Offer Redemption Info (codes/links visible to verified NGOs).
    *   Links to external funding application portals.
*   **Phase 2:**
    *   Funder Role & Profile Creation.
    *   Funders can post/manage Funding Opportunities.
    *   Service Provider Role & Profile Creation.
    *   Service Providers can post/manage Discount Offers.
    *   Enhanced Search Filters (Funding Amount, Deadline, Discount Category).
    *   NGO Dashboard v1 (Saved Offers/Opportunities).
*   **Phase 3:**
    *   Saved Searches & Email Alerts.
    *   Basic Integrated Application Option for Funders.
    *   NGO Application Tracking Dashboard (for integrated apps).
    *   Funder Application Review Dashboard (for integrated apps).
    *   Refined NGO Verification Workflow.
*   **Phase 4 & Beyond:**
    *   Implement selected Advanced Features (Eligibility Matching, Calendar, etc.)
    *   Analytics Dashboards for Admins, Providers.
    *   Refine UI/UX based on feedback.
    *   API Development.

---

This revised plan focuses sharply on the core value propositions of Funding and Discounts. Please review this updated direction.

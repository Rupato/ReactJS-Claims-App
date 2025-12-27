# Senior Frontend Engineer - Technical Assignment

## Overview

Build a claims management interface that demonstrates modern React patterns and production-quality engineering. This will be the foundation for our technical interview, where we'll pair program to extend it together.



## What We're Evaluating

We're looking for clean, maintainable code that demonstrates modern React practices. We'll discuss your choices and work together to extend it in the technical interview.

We evaluate:
- Modern React patterns and tooling
- Code quality and organization
- Production mindset (errors, loading, edge cases)
- Communication (can you explain your decisions?)

## Core Requirements

### 1. Claims Dashboard

Build a dashboard that displays claims with search, filter, and sort capabilities.

**Display:**
- Show all claims from the API in a table or card layout
- Display these fields: claim ID, status, holder name, policy number, claim amount, processing fee, total amount (claim + processing fee), incident date, created date
- Format currency values properly ($1,234.56)
- Format dates as relative time ("2 days ago")

**Search:**
- Single search input that searches across claim ID, holder name, and policy number
- Debounce the search input (don't search on every keystroke)
- Show a loading indicator while searching

**Filter:**
- Dropdown to filter by status (Submitted, Approved, Processed, Completed, Rejected)
- Support selecting multiple statuses at once
- Show active filters as removable chips/tags
- Include a "Clear all filters" option

**Sort:**
- Dropdown with these options:
  - Created date (newest first / oldest first)
  - Claim amount (highest / lowest)
  - Total amount (highest / lowest)
- Visual indicator showing which sort is active

**Interactions:**
- Click a row to view full claim details in a modal or drawer
- Keyboard navigation: use ↑↓ arrow keys to navigate rows, Enter to open details
- Show empty state when no claims match the search/filters

**State Management:**
- Use TanStack Query (React Query) or SWR for data fetching
- Store search term, active filters, and sort option in URL query parameters (shareable links)
- When a new claim is created, automatically refresh the claims list

**Loading & Errors:**
- Show skeleton loaders on initial page load (not spinners)
- Handle API errors with user-friendly messages
- Show a retry button if the API call fails

---

### 2. Create Claim Form

Build a form to create new claims with validation and smart field behavior.

**Navigation:**
- Create claim form should be on a separate route (e.g., `/create` or `/claims/new`)
- Provide navigation from the claims list to the create form (button/link)
- Lazy load this route for better performance

**Form Fields:**
- Policy number (text input)
- Holder name (text input)
- Insured item (text input)
- Claim amount (currency input)
- Processing fee (currency input)
- Description (textarea)
- Incident date (date picker)

**Validation:**
- All fields are required
- Claim amount and processing fee: Must be valid numbers with up to 2 decimal places
- Incident date: Must be between 6 months ago and yesterday
- Show validation errors below each field
- Validate fields on blur (when user leaves the field)
- Disable the submit button while the form is invalid or submitting

**Smart Behavior:**
- **Policy number field**: When the user enters a policy number and moves to the next field, call `GET /api/v1/policies/:number` to fetch the holder name
  - If found: Auto-fill the holder name field and make it read-only
  - If not found: Show an error message and allow manual entry of holder name
  - Show a loading indicator in the field while fetching
- **Currency fields**: Format the value as currency ($1,234.56) when the user leaves the field
- **Incident date**: Use a date picker that disables dates outside the valid range

**Submission:**
- POST the form data to `/api/v1/claims`
- Show a loading state on the submit button while submitting
- On success: Navigate back to the claims list (e.g., `/`) and show a success message
- On error: Show the error message and allow the user to retry
- Warn the user if they try to navigate away with unsaved changes

**Requirements:**
- Use React Hook Form or Formik for form state management
- Use Zod or Yup for validation schema
- Use a date picker library (react-datepicker, date-fns, etc.)

---

### 3. Technical Standards

**TypeScript:**
- Use TypeScript with strict mode enabled
- Define proper types for API responses (no `any` types)
- Use discriminated unions for claim status

**Error Handling:**
- Add error boundaries around the claims list and claim form
- Show user-friendly error messages (not technical stack traces)
- Provide retry mechanisms for failed API calls

**Performance:**
- Lazy load the create claim form route
- Memoize expensive calculations (like filtered/sorted lists)

**Testing:**
- Write 2-3 tests for critical business logic
- Examples: form validation, currency formatting, date validation
- Use Vitest or Jest with React Testing Library

---

## Deliverables

**1. GitHub Repository**
- Clean commit history
- Works with `npm install && npm run dev`
- No console errors or warnings

**2. README.md**

Include:
- Setup instructions
- Tech stack overview
- Key decisions
- Trade-offs you made
- What you'd improve with more time

**3. Tests**

Include 2-3 basic tests for critical logic (form validation, calculations, etc.)

---

## Optional: Show Your Strength

If you have extra time and want to showcase a specific skill, pick ONE:

**Option A: Architecture Deep Dive**
- Write an ARCHITECTURE.md document (1-2 pages) addressing this scenario:
- **Scenario:** This claims module is part of a multi-tenant insurance platform with 5 micro-frontends (Claims, Policies, Billing, Reports, Customer Portal). You have 10 insurance clients, each requiring custom claim form fields and custom claim list columns.
- **Document:**
  - How would you architect the claims module to support client-specific customization?
  - How would this module integrate with the other 4 micro-frontends?
  - How would you handle shared dependencies and prevent bundle duplication?
  - How would the claim form schema be defined and stored for each client?
  - What are the key architectural risks and trade-offs?

**Option B: Advanced Table Features**
- Add column visibility toggle (show/hide columns)
- Add column sorting by clicking column headers
- Persist user preferences in localStorage


**Option C: Testing Strategy**
- Write comprehensive tests (unit + integration)
- Test critical user flows end-to-end
- Document your testing approach
- Aim for 70%+ coverage of business logic

**Option D: Performance Optimization**
- Implement virtual scrolling for the claims list (handles 1000+ rows)
- Measure the performance improvement
- Document when virtualization is worth it

---

## What We DON'T Need

- Pixel-perfect design
- Deployment setup (localhost is fine)
- Authentication or authorization

---

## Tech Stack Recommendations

You can use any libraries you prefer, but here are our suggestions:

- **Framework**: React 18+ with Vite, Next.js, or TanStack Start
- **Data Fetching**: TanStack Query (React Query) or SWR
- **Forms**: React Hook Form + Zod for validation
- **UI Components**: Material-UI or shadcn
- **Date Picker**: react-datepicker or @mui/x-date-pickers
- **Testing**: Jest + React Testing Library

---

## Getting Started

1. From this current folder:
```bash
cd mock
npm install
npm run mock
```

The mock server will run on `http://localhost:8001`

2. Test the API:
```bash
curl http://localhost:8001/api/v1/claims
```
Sample response:
``` json
[
  {
    "id": 1,
    "number": "CL-16219",
    "incidentDate": "2022-08-15",
    "createdAt": "2022-08-20",
    "amount": "464.00",
    "holder": "Lola Kiehn",
    "policyNumber": "TL-18592",
    "insuredItem": "Licensed Metal Shirt",
    "description": "Deserunt non vel tempora illo magni dicta tempora eos modi repellat cumque aut perferendis voluptatem.",
    "processingFee": "118.00",
    "status": "Submitted"
  },
]
```

3. Build your solution in a separate directory

4. Submit your GitHub repository link when ready

## Questions?

If anything is unclear, please don't hesitate to reach out. We're happy to clarify.

Good luck! We're excited to see your approach.

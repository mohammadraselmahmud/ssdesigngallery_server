# SS Design Gallery — frontend generation prompt

Copy the prompt below into your frontend coding tool. The feature and API contract is based on static inspection of this backend; it has not been verified against a running server. The visual direction and frontend stack are proposed choices.

---

Build a complete, polished, responsive frontend for **SS Design Gallery**, a stainless-steel design discovery and AI visualization platform. Deliver working frontend code, not just a landing page or a design description. Build the customer website, member workspace, and an admin dashboard.

## Product purpose

Users explore stainless-steel grill, door, window, gate, and railing design imagery, search by keywords and category, save favorites, organize designs into named folders with personal notes, and buy subscription credits to preview a selected steel design on a photo of their own space. These category names are illustrative; use categories returned by the API.

This backend has no cart, physical-product ordering, shipping, reviews, vendor storefront, or messaging API. Product prices are catalog information; checkout purchases subscription packages. Do not invent those unrelated workflows or unsupported endpoints.

## Implementation choices

- Use React, TypeScript, Next.js App Router, Tailwind CSS, accessible shadcn/ui components, Lucide icons, TanStack Query, and React Hook Form with Zod. If an existing frontend already establishes a stack, preserve it.
- Configure a public API base URL ending in `/api`, for example `NEXT_PUBLIC_API_BASE_URL=http://localhost:<backend-port>/api`. Do not assume a configured port or hard-code production hosts.
- Organize by features: auth, catalog, wishlist, folders, AI preview, subscriptions, payments, and admin. Keep typed API clients and response adapters separate from UI components.
- Use live API data by default. An explicit development-only demo flag may provide realistic fixtures; never silently switch to fake success after a network failure. Label demo mode clearly.
- Do not modify this backend as part of frontend generation. Record backend dependencies and contract gaps in an integration document.

## Visual direction

Create an image-focused architectural design gallery with a restrained industrial identity. Use warm off-white backgrounds, charcoal text, steel-gray borders, and deep teal primary actions. Use generous whitespace, crisp typography, subtle shadows, and consistent rounded corners. Avoid oversized decorative gradients and generic dashboard styling on the public website.

The first screen should communicate the actual product: large architectural imagery, a prominent design search box, and the headline “Find the right steel design for your space.” Primary CTA: “Explore designs”; secondary CTA: “Try AI preview.” Use API sliders for promotional imagery.

Use a responsive gallery with two columns on small screens where legible, three on tablets, and four on wide desktops. Preserve image proportions and offer full-image inspection so grill patterns are not hidden by cropping. Cards show image, design name, category when resolvable, optional price, save action, and a detail link. Show full images in detail views.

Desktop navigation: logo, Explore, Categories, AI Preview, Pricing, and account controls. Mobile navigation should make Explore, Saved, AI Preview, and Account easy to reach. Use a compact accessible menu for remaining links.

Start with English UI copy and keep text ready for Bengali localization. Format subscription prices as BDT unless the API supplies another currency. Do not invent product price units or billing recurrence. Make all layouts usable from 360px through large desktop widths.

## Required screens and behavior

### Public experience

1. **Home**: navigation, API-backed hero slider, search, category tiles, recent designs, an explanation of the AI preview workflow, package highlights, and footer. Use `/ads/public` for clearly labeled sponsored placements. Do not invent testimonials or usage statistics.
2. **Explore**: debounced search, keyword chips, category filter, supported sort options, result count, pagination, URL-synchronized query state, clear filters, loading skeletons, and no-results recovery.
3. **Category page**: category image/name and filtered design gallery.
4. **Design details**: large image with zoom, product name, description keywords, category, price, optional note, wishlist toggle, save-to-folder dialog, “Preview in my space,” and related designs. Preserve the selected design when routing to AI preview.
5. **Pricing**: package title, description, price, totalDays, credit limit, recommended badge, current-plan indication, and subscribe CTA. Read plan values from the API.

### Authentication and account

Build sign-up, sign-in, forgot-password, OTP verification, reset-password, profile editing, and change-password screens. Sign-up fields are name, email, phoneNumber, and password; always submit role `user`, with no public role selector. Sign-up does not return login tokens and does not currently send a registration OTP; direct successful registrations to sign-in.

The forgot-password flow is email submission, OTP verification, then a new password. Support OTP paste and accessible inputs. Do not add a fabricated resend endpoint; any resend uses the existing forget-password endpoint with a local cooldown.

Use bearer authorization for protected API calls. Login returns `{ user, accessToken, refreshToken }` inside the response data. There is no refresh-token or logout endpoint: do not invent one. Clear local auth state on logout. On confirmed session expiration, clear user-specific caches and route to sign-in with a safe return path. Distinguish session failures from endpoint permission failures so a role restriction does not cause a login loop.

Prefer an HttpOnly cookie-backed frontend session/BFF if supported by the chosen architecture; otherwise use an explicit, documented token storage strategy. Never expose backend secrets or display password/OTP fields returned in user objects.

Google login must remain feature-gated until the backend verifies Google identity tokens. The existing name/email endpoint is not sufficient proof of Google identity.

### Member workspace

- **Overview**: current plan, expiry, total/used/remaining credits when available, links to saved designs, folders, and AI preview. Treat an empty current-plan object as no active plan.
- **Wishlist**: saved designs, remove toggle, detail navigation, and save-to-folder action.
- **Folders**: create a folder while saving a design, choose an existing folder, rename, show contained designs, edit per-design notes, remove a design, and delete a folder with confirmation. The backend creates/adds by folder name and requires a product. Do not assume empty-folder creation works. Removing the final product deletes the folder; update navigation accordingly.
- **Subscription**: server-returned current plan, credits, and dates, plus upgrade/renew links to pricing. Do not expose a user-side status editor. Personal subscription history requires backend ownership enforcement before enabling it.
- **Profile**: edit supported personal fields only; no role, verification, password-hash, or credit editing.

### AI preview studio

Build a focused workspace with these steps:

1. Upload a photo of the user's window, doorway, or space.
2. Select a gallery design or upload a design image.
3. Optionally enter instructions, up to 1000 characters.
4. Check current subscription and available credits.
5. Generate and show a before/after comparison, full-screen result, and save/download action when browser and image-host capabilities permit.

Both input images must be uploaded to the configured backend image host. Send direct HTTPS URLs, not base64 or blob URLs. Show upload progress, remove/replace actions, validation, generation loading, and useful retry states. Do not invent percentage progress or a prediction-status endpoint. Prevent duplicate generation submissions and do not automatically retry a potentially billable generation request. Update credits from server data after success.

Handle no plan, expired plan, exhausted credits, upload failure, generation failure, and unavailable service. Do not claim server-persisted generation history because no such API exists. An optional session-only result list must be described as local/session-only.

The existing AI route/controller wiring currently prevents a successful authenticated generation; build its UI and adapter but keep live generation feature-gated until the backend issue below is resolved. Explain temporary unavailability in ordinary product language.

### Subscription checkout

Allow coupon entry and validate on the server. Display original price, discount, payable amount, package duration, and credits. Use the returned subscription ID to initialize PayStation payment, then navigate to the validated gateway URL returned by its adapter.

Build pending, success, failed, and cancelled result screens. Confirm the subscription/payment state with the server; a browser query parameter is not proof of payment. Do not mark subscriptions active from the frontend. Preserve an existing pending subscription for payment retries instead of repeatedly consuming coupon claims by creating new ones.

Only enable the live checkout flow after callback URLs, gateway response fields, server verification, ownership checks, and return navigation have been validated. Do not display working Stripe or browser Google Pay buttons merely because provider names or dependencies exist in the backend.

### Admin experience

Use a sidebar and compact dashboard layout with responsive tables, pagination where supported, form validation, accessible dialogs, and confirmations for deletion.

- Overview: total/today/this-month income, monthly growth, paid subscription count, discounts, subscription-status breakdown, monthly income chart, and top packages. Use only metrics returned by the backend.
- Income history: transaction reference, user, package, provider, original price, discount, payable amount, currency, paid date; filters for date range, provider, coupon use, and search.
- Designs: create/edit/delete using actual product fields and image upload; support a keyword/tag editor for productDescription.
- Categories: name, category image, optional prompt, edit/delete.
- Sliders: image create/edit/delete.
- Ads: title, description, image/video, link, active state, expiry, create/edit/delete.
- Packages: title, productId, description, price, isRecommended, totalDays, limit, create/edit/delete.
- Coupons: percentage/fixed discounts, minimum purchase, maximum discount, global/per-user limits, start/expiry, applicable packages, active state, and usage counters.
- Users: read-only searchable list. No supported admin user-edit/delete endpoint exists.
- Subscriptions: list/detail only according to endpoint permissions; avoid arbitrary payment/credit/status changes from generic CRUD controls.

Use exact route permissions, not an assumed role hierarchy: `admin` alone can manage products, categories, sliders, ads, and list users. `admin`, `sub_admin`, and `super_admin` can access dashboard, coupon management, and package management. Subscription list/detail allows only `user` and `admin`; it does not include the other admin roles. `vendor` exists as a role value but has no implemented vendor workspace. Frontend role guards complement server authorization and cannot replace it.

## Actual backend API contract

All paths below are relative to `/api`.

### Response handling

The usual envelope is `{ success, message, data, meta? }`. Several list controllers put `{ data: items, meta }` inside the outer `data`, so product lists typically resolve to `response.data.data` when `response` means parsed JSON, not the Axios response. Folders return an array directly inside outer `data`. Normalize each endpoint explicitly and handle missing metadata. MongoDB identifiers use `_id`; reference fields may be IDs or populated objects.

Product list query parameters: `searchTerm`, `categoryId`, `page`, `limit`, `sort`, and `fields`. Valid proposed sort choices include `-createdAt`, `productName`, `productPrice`, and `-productPrice`. Do not assume rating, popularity, or price-range filtering is implemented. Related products accept comma-separated `productDescription` keywords and optional `categoryId`.

### Endpoint map

| Feature | Method and path | Request/notes |
| --- | --- | --- |
| Register | POST `/users/sign-up` | `{ name, email, phoneNumber, password, role: "user" }` |
| Login | POST `/users/sign-in` | `{ email, password }` |
| Profile | GET `/users/my-profile` | Includes subscription information |
| Edit profile | PUT `/users/updateUser` | Allowlisted personal fields |
| Forgot password | POST `/users/forget-password` | `{ email }` |
| Verify reset OTP | POST `/users/verify?requestType=resetPassword` | `{ email, oneTimeCode }` |
| Reset password | POST `/users/update-password` | `{ email, password }` |
| Change password | POST `/users/change-password` | `{ oldPassword, newPassword, confirmPassword }`; user/admin only |
| Categories | GET `/category`, GET `/category/:id` | Category data |
| Category mutations | POST `/category/add`, PATCH/DELETE `/category/:id` | Image multipart for create/edit |
| Designs | GET `/product`, `/product/search`, `/product/:id` | Product records |
| Category designs | GET `/product/category-wise/:id` | List query parameters |
| Keywords | GET `/product/keywords` | `{ keyword, count }[]` |
| Related | GET `/product/related` | Keyword/category queries |
| Design mutations | POST `/product`, PATCH/DELETE `/product/:id` | Image multipart for create/edit |
| My wishlist | GET `/wishlist/wishlist` | Populated product references |
| Toggle wishlist | POST `/wishlist` | `{ productId }`; toggles membership |
| Create/add to folder | POST `/product-folder/create-folder` | `{ folderName, productId, note? }` |
| My folders | GET `/product-folder/user/folders` | Array with populated products |
| Folder detail | GET `/product-folder/folders/:folderId` | Product references may be unpopulated |
| Rename folder | PUT `/product-folder/folders/:folderId` | `{ folderName }` |
| Update note | PUT `/product-folder/folders/:folderId/products/:productId` | `{ note }`; nonempty; refetch after success |
| Remove design | DELETE `/product-folder/folders/:folderId/products/:productId` | Final removal deletes folder |
| Delete folder | DELETE `/product-folder/folders/:folderId` | Confirm first |
| Sliders | GET/POST `/slider`, GET/PATCH/DELETE `/slider/:id` | Image multipart for create/edit |
| Public ads | GET `/ads/public` | Public placements |
| Admin ads | GET/POST `/ads`, GET/PATCH/DELETE `/ads/:id` | Multipart image/video |
| Packages | GET/POST `/package`, GET/PATCH/DELETE `/package/:id` | JSON mutations |
| Validate coupon | POST `/coupon/validate` | `{ code, packageId }` |
| Admin coupons | GET/POST `/coupon`, GET/PATCH/DELETE `/coupon/:id` | JSON mutations |
| Create subscription | POST `/subscription` | `{ package: packageId, couponCode? }`; returns pending subscription |
| Current plan | GET `/subscription/current-plan` | Active unexpired plan or `{}` |
| Subscription records | GET `/subscription`, GET `/subscription/:id` | Ownership limitation below |
| Payment initialization | POST `/payment/init` | `{ provider: "paystation", subscriptionId, redirectUrl? }` |
| Payment verification | POST `/payment/verify` | Provider adapter uses `{ provider: "paystation", paymentId }`; verification alone is not a frontend activation action |
| Upload | POST `/upload/single` | Multipart `file`; outer `data` is uploaded URL |
| Multiple upload | POST `/upload/multiple` | Multipart `images`/`videos`, up to five each; `{ images, videos }` result |
| AI preview | POST `/ai/ss-preview` | `{ userImageUrl, ssDesignUrl, promptInstruction? }`; blocked by current wiring |
| Admin overview | GET `/admin-dashboard/overview` | Optional `currency` |
| Income history | GET `/admin-dashboard/income-history` | `page`, `limit`, `currency`, `startDate`, `endDate`, `provider`, `couponUsed`, `searchTerm` |
| Users | GET `/users` | Admin only; search/pagination |

### Field contracts

- Product: `_id`, `productName`, `productDescription: string[]`, `productImage`, `productPrice`, `note?`, `categoryId`, `isDeleted`, timestamps.
- Category: `_id`, `name`, `categoryImage?`, `prompt?`, `isDeleted`.
- Package: `_id`, `title`, `productId`, `description`, `price`, `isRecommended`, `totalDays`, `limit`, `isDeleted`.
- Subscription: `_id`, `user`, `package`, `startDate`, `endDate`, `tranId`, `couponCode?`, `originalPrice`, `discountAmount`, `payableAmount`, `totalCredit?`, `usedCredit?`, `remainingCredit?`, `paymentProvider?`, `currency?`, `paidAt?`, `status`.
- Subscription status: `pending | active | expired | cancelled | failed`.
- Folder: `_id`, `folderName`, `userId`, `products: [{ productId, note }]`.
- Slider: `_id`, `sliderImage`.
- Ad: `_id`, `title`, `description?`, `image?`, `video?`, `link?`, `isActive?`, `expiredAt?`.

Image-based category/product/slider mutations use multipart field `image` and a `data` field containing a JSON string of the non-file values. Ads use `image` and/or `video` plus JSON `data`. Let the browser set multipart boundaries. Use JSON for ordinary requests.

## Backend dependencies to document explicitly

1. AI authentication middleware is commented out, and its controller does not pass `userId` into a service that requires it. With provider configuration present, the service rejects the call for missing authentication. Sending a frontend bearer token alone cannot fix this.
2. AI service returns `{ generatedUrl, subscriptionId, totalCredit, usedCredit, remainingCredit }`, but the controller wraps that object as `data.generatedUrl`. Keep a defensive adapter for the nested shape, and document the preferred corrected flat response without claiming it already exists.
3. Login returns refresh tokens, but there is no refresh endpoint. Google login accepts name/email without verifying a Google identity token. Signup accepts role values, and profile updates lack an explicit field allowlist on the server; public frontend forms must never send privileged fields, and server enforcement remains required.
4. Subscription reads/mutations and several folder operations do not consistently enforce record ownership. Do not present client-side filtering as a security fix. Gate affected private-data flows until server scoping is verified.
5. Payment initialization reads `req.user._id` while JWT claims use `userId`; its service obtains user data from the subscription, so this is also an ownership-enforcement concern rather than proof every payment call fails. Payment success/cancel controllers return JSON rather than an active browser redirect. Validate the callback base URL includes the correct API prefix.
6. Subscription creation calculates an end date one month ahead; PayStation duration handling defaults to a month rather than directly using package `totalDays`. Show actual server dates and report this inconsistency before claiming all plan durations work.
7. `/wishlist/remove` calls the same toggle handler as `/wishlist`. Use one serialized toggle mutation, disable duplicate clicks, and refetch after success; do not treat it as idempotent removal.
8. The product validation file contains unrelated fields such as quantity and expiredAt, but that validator is not attached to product routes. Follow the active product model/controller contract above.

Keep technical integration notes in developer documentation. End users should see clear loading, unavailable, permission, or retry states without internal implementation details.

## Delivery and verification

Deliver the complete frontend, reusable components, typed clients/adapters, environment-variable example, setup README, and `BACKEND_INTEGRATION_NOTES.md` identifying implemented, gated, and unverified flows. No backend secrets in client code.

Verify the production build and type checking. Add focused checks for response normalization, wishlist toggle behavior, protected navigation, and checkout/AI failure states. Check responsive layouts, keyboard navigation, focus management, readable contrast, image failure fallbacks, direct page loads, and query-state navigation. Report honestly which live workflows could not be exercised without backend fixes/configuration.

Implement all specified screens and connect supported actions. Do not stop after producing the homepage or a static mockup.

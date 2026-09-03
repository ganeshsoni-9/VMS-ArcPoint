# Architecture

See the Phase 0 document shared in chat for the full architecture diagram, ER relationships, status
lifecycle, and role permission matrix. Summary:

Browser → React/Vite/Tailwind → Axios → Express → (Helmet/CORS/RateLimit/Auth/RBAC/Validation) → Controllers → Services/Utils → Mongoose → MongoDB.

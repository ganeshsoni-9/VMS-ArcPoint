# Testing

Run with `npm test` inside `/server`. Uses `mongodb-memory-server` — no real database is touched.

Current coverage (3 tests):
1. Valid login succeeds
2. Invalid password fails
3. Unauthorized user cannot access admin API
4. Duplicate active visit is rejected at the database constraint level

Not yet covered (documented honestly, see README limitations): visitor registration success/validation,
consent-missing rejection, approve/reject flow, check-in/out status guards and duration calculation.
The existing Jest + Supertest + in-memory-Mongo scaffold makes adding these straightforward.

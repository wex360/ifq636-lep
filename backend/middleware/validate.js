// LEP-16: third link in the middleware chain (protect -> requireRole -> validate -> controller).
// Each rule is (value, body) => error message or null. The controller only runs on a clean body.
const validate = (rules) => (req, res, next) => {
    const errors = {};
    for (const [field, checks] of Object.entries(rules)) {
        for (const check of checks) {
            const message = check(req.body[field], req.body);
            if (message) { errors[field] = message; break; }
        }
    }
    if (Object.keys(errors).length) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }
    next();
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const required = (label) => (v) =>
    v === undefined || v === null || String(v).trim() === '' ? `${label} is required` : null;
const optional = (check) => (v, body) => (v === undefined || v === '' ? null : check(v, body));
const isEmail = (v) => (EMAIL.test(String(v)) ? null : 'Enter a valid email address');
const minLength = (n, label) => (v) => (String(v).length >= n ? null : `${label} must be at least ${n} characters`);
const maxLength = (n, label) => (v) => (String(v).length <= n ? null : `${label} must be at most ${n} characters`);
const languageList = (label) => (v) => {
    if (!Array.isArray(v)) return `${label} must be a list`;
    if (v.length > 5) return `${label}: at most 5 languages`;
    if (v.some((l) => typeof l !== 'string' || !l.trim() || l.length > 40)) return `${label}: each language must be 1 to 40 characters`;
    return null;
};
const isObjectId = (label) => (v) => (/^[a-f\d]{24}$/i.test(String(v)) ? null : `${label} is not a valid id`);
const oneOf = (values, label) => (v) => (values.includes(v) ? null : `${label} must be one of: ${values.join(', ')}`);
const futureDate = (label) => (v) => {
    const d = new Date(v);
    if (isNaN(d)) return `${label} must be a valid date and time`;
    return d > new Date() ? null : `${label} must be in the future`;
};
const intRange = (min, max, label) => (v) =>
    Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max ? null : `${label} must be a whole number from ${min} to ${max}`;

module.exports = { validate, required, optional, isEmail, minLength, maxLength, languageList, isObjectId, oneOf, futureDate, intRange };

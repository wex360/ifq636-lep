// LEP-7: promote an existing account to moderator. Roles are never self-assigned through the API.
// Usage (from backend/): node scripts/makeModerator.js someone@example.com
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
    const email = process.argv[2];
    if (!email) { console.error('Usage: node scripts/makeModerator.js <email>'); process.exit(1); }
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOneAndUpdate({ email }, { role: 'moderator' }, { new: true });
    console.log(user ? `${user.email} is now a moderator` : `No account for ${email}`);
    await mongoose.disconnect();
})();

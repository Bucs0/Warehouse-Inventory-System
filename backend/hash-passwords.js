const bcrypt = require('bcrypt');

async function hashPasswords() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);
  
  console.log('Admin password hash:', adminHash);
  console.log('Staff password hash:', staffHash);
}

hashPasswords();
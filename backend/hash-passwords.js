const bcrypt = require('bcrypt');

async function hashPasswords() {
  const adminHash = await bcrypt.hash('q110978123', 10);
  const staffHash = await bcrypt.hash('Trends', 10);
  
  console.log('Admin password hash:', adminHash);
  console.log('Staff password hash:', staffHash);
}

hashPasswords();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local missing');
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/);
  if (match) {
    acc[match[1]] = match[2];
  }
  return acc;
}, {});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Supabase env missing');
  process.exit(1);
}

const client = createClient(url, key);
const email = `testregister${Date.now()}@gmail.com`;
const password = 'Password1!';

console.log('Test email:', email);

(async () => {
  try {
    const response = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Register',
          phone: '+12345678901',
        },
      },
    });
    console.log('RESPONSE', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('EXCEPTION', error);
  }
})();

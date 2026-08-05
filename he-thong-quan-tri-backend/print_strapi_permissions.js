const strapi = require('@strapi/strapi');

async function main() {
  console.log('Bootstrapping Strapi to inspect permissions registry...');
  const app = await strapi().load();
  
  // Kiểm tra registry của Users-Permissions plugin hoặc upload plugin
  console.log('--- Upload Plugin Controllers ---');
  if (app.plugins.upload) {
    const controllers = app.plugins.upload.controllers;
    for (const cName of Object.keys(controllers)) {
      console.log(`Controller: ${cName}`);
      const actions = Object.keys(controllers[cName]);
      console.log('  Actions:', actions);
    }
  }
  
  console.log('--- Users-Permissions Actions Registry ---');
  if (app.plugins['users-permissions']) {
    const actions = await app.plugins['users-permissions'].services['users-permissions'].getActions();
    console.log(JSON.stringify(actions, null, 2));
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error('Error bootstrapping Strapi:', err);
  process.exit(1);
});

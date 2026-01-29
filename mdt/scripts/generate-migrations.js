// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// // This script generates migrations from your existing TypeScript models
// // Since your models use a custom initialization pattern, we'll create migrations
// // for the core tables based on your model structure

// const generateMigration = (tableName, attributes) => {
//   const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '');
//   const fileName = `${timestamp}-create-${tableName.toLowerCase().replace(/_/g, '-')}.js`;
  
//   const migrationContent = `'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('${tableName}', {
// ${attributes.map(attr => `      ${attr.name}: {
//         ${attr.definition}
//       }`).join(',\n')}
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.dropTable('${tableName}');
//   }
// };
// `;

//   const migrationPath = path.join(__dirname, '..', 'migrations', fileName);
//   fs.writeFileSync(migrationPath, migrationContent);
//   console.log(`Generated migration: ${fileName}`);
// };

// // Define your table structures based on your models
// const tables = {
//   users: [
//     { name: 'id', definition: 'type: Sequelize.UUID,\n        defaultValue: Sequelize.UUIDV4,\n        primaryKey: true' },
//     { name: 'firstName', definition: 'type: Sequelize.STRING,\n        allowNull: false' },
//     { name: 'lastName', definition: 'type: Sequelize.STRING,\n        allowNull: false' },
//     { name: 'email', definition: 'type: Sequelize.STRING,\n        allowNull: false,\n        unique: true' },
//     { name: 'phoneNumber', definition: 'type: Sequelize.STRING,\n        allowNull: false,\n        unique: true' },
//     { name: 'password', definition: 'type: Sequelize.STRING,\n        allowNull: false' },
//     { name: 'role', definition: 'type: Sequelize.ENUM(\'user\', \'agent\', \'admin\'),\n        allowNull: false,\n        defaultValue: \'user\'' },
//     { name: 'adminType', definition: 'type: Sequelize.ENUM(\'super_admin\', \'staff\'),\n        allowNull: true' },
//     { name: 'isEmailVerified', definition: 'type: Sequelize.BOOLEAN,\n        defaultValue: false' },
//     { name: 'isPhoneVerified', definition: 'type: Sequelize.BOOLEAN,\n        defaultValue: false' },
//     { name: 'hasTransactionPin', definition: 'type: Sequelize.BOOLEAN,\n        defaultValue: false' },
//     { name: 'transactionPin', definition: 'type: Sequelize.STRING,\n        allowNull: true' },
//     { name: 'account_status', definition: 'type: Sequelize.ENUM(\'ACTIVE\', \'FROZEN\', \'CLOSED\'),\n        defaultValue: \'ACTIVE\'' },
//     { name: 'createdAt', definition: 'type: Sequelize.DATE,\n        allowNull: false' },
//     { name: 'updatedAt', definition: 'type: Sequelize.DATE,\n        allowNull: false' }
//   ]
// };

// // Generate migrations for each table
// Object.entries(tables).forEach(([tableName, attributes]) => {
//   generateMigration(tableName, attributes);
// });

// console.log('\nMigration generation complete!');
// console.log('Run "npx sequelize-cli db:migrate" to apply the migrations.');
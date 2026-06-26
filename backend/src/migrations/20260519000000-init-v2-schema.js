import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Execute the raw SQL
    // Since schema.sql contains multiple statements (DROP, CREATE, INSERT, etc.),
    // we need to run it as a raw query.
    // Ensure that multipleStatements: true is enabled in Sequelize config for this to work perfectly,
    // but typically queryInterface.sequelize.query handles it well.
    
    try {
      await queryInterface.sequelize.query(sql);
      console.log('Successfully executed schema.sql init migration.');
    } catch (error) {
      console.error('Error executing schema.sql migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Optional: Write a down script to drop all tables if needed.
    // Since this is an init schema, dropping everything can be done by parsing the DROP statements,
    // or we can just leave it as is if resetting DB drops everything anyway.
    
    // We can extract just the DROP statements from the top of schema.sql
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    const dropStatements = sql
      .split('\n')
      .filter(line => line.trim().startsWith('DROP TABLE IF EXISTS'))
      .join('\n');
      
    if (dropStatements) {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;\n' + dropStatements + '\nSET FOREIGN_KEY_CHECKS = 1;');
    }
  }
};

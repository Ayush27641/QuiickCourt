#!/usr/bin/env node

/**
 * Database Seeding Script
 * Populates database with initial data
 */

const { User, Sport, Venue } = require('../src/models');
const jwtService = require('../src/services/jwtService');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create admin user
    const adminExists = await User.findByPk('admin@odoohackathon.com');
    if (!adminExists) {
      await User.create({
        email: 'admin@odoohackathon.com',
        password: await jwtService.hashPassword('admin123'),
        fullName: 'System Administrator',
        role: 'ADMIN',
        verified: true
      });
      console.log('✅ Admin user created');
    }
    
    // Create sample sports
    const sportsData = [
      {
        name: 'Football',
        description: 'American football game',
        category: 'Team Sport',
        minPlayers: 22,
        maxPlayers: 22,
        equipment: ['Football', 'Helmets', 'Protective gear']
      },
      {
        name: 'Basketball',
        description: 'Indoor basketball game',
        category: 'Team Sport',
        minPlayers: 10,
        maxPlayers: 10,
        equipment: ['Basketball', 'Hoops']
      },
      {
        name: 'Tennis',
        description: 'Tennis singles or doubles',
        category: 'Racket Sport',
        minPlayers: 2,
        maxPlayers: 4,
        equipment: ['Tennis rackets', 'Tennis balls', 'Net']
      },
      {
        name: 'Swimming',
        description: 'Pool swimming',
        category: 'Individual Sport',
        minPlayers: 1,
        maxPlayers: 50,
        equipment: ['Swimming pool', 'Lanes']
      }
    ];
    
    for (const sportData of sportsData) {
      const [sport, created] = await Sport.findOrCreate({
        where: { name: sportData.name },
        defaults: sportData
      });
      if (created) {
        console.log(`✅ Sport created: ${sport.name}`);
      }
    }
    
    console.log('🎉 Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';

dotenv.config();

async function createAdmin(){
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true });

  const email = 'admin@sevillacheats.com'; // admin email
  const password = '135153500';             // admin şifresi

  const exists = await User.findOne({ email });
  if(exists){
    console.log('Admin zaten var!');
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const admin = new User({ email, password: hashed, isAdmin: true });
  await admin.save();
  console.log('✅ Admin oluşturuldu!');
  process.exit(0);
}

createAdmin();

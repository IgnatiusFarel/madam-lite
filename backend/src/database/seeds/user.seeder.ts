// user.seeder.ts
import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

export async function userSeeder(dataSource: DataSource): Promise<void> {
    console.log("Running UserSeeder...");
    const userRepository = dataSource.getRepository(User);

    // Hapus semua data user yang ada
    await userRepository.delete({});

    const superAdminPassword = await bcrypt.hash('superadmin', 10);
    const adminPassword = await bcrypt.hash('admin1234', 10);
    const userPassword = await bcrypt.hash('user1234', 10);

    // Buat data user baru
    const users = userRepository.create([
        {
            name: 'Super Admin',
            username: 'superadmin',
            password: superAdminPassword,
            email: 'superadmin@gmail.com',
            role: 'superadmin'
        },
        {
            name: 'Admin',
            username: 'admin',
            password: adminPassword,
            email: 'admin@gmail.com',
            role: 'admin'
        },
        {
            name: 'User',
            username: 'user',
            password: userPassword,
            email: 'user@gmail.com',
        }
    ]);

    // Simpan user baru ke database
    await userRepository.save(users);

    console.log('User seeder completed.');
};
import axios from 'axios';
import { nanoid } from 'nanoid';
import { api } from '@/app/utils/api';

const USERS = 500;

for (let i = 0; i < USERS; i++) {
    const mockUser = {
        user_id: Math.floor(Math.random() * 800000) + 100000,
        fullName: `Test User ${i}`,
        email: `test${i}@example.com`,
        batch: 2020 + (i % 5),
    };

    // USER_AUTH
    await api.post('/USER_AUTH', {
        user_id: mockUser.user_id,
        email: mockUser.email,
        password_hash: '$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y',
        last_login: new Date().toISOString()
    });

    // RECORDS
    const record_id = nanoid(11);
    await api.post('/RECORDS', {
        record_id,
        user_id: mockUser.user_id,
        admin_id: "admin3",
        status_id: "401",
        date_created: new Date().toISOString(),
        description: "User registered",
        date_expires: null
    })

    await api.post('/USER', {
        user_id: mockUser.user_id,
        status_id: "401",
        current_record_id: record_id
    })

    await api.post('/PROFILE', {
        user_id: mockUser.user_id,
        user_name: mockUser.fullName,
        email: mockUser.email,
        phone: "+63 923 777 1234",
        location: "SAMPLE LOCATION",
        currentJob: "UNEMPLOYED",
        company: "SAMPLE COMPANY",
        bio: "SAMPLE BIO",
        degree_id: Math.floor(Math.random() * 5) + 100,
        batch: mockUser.batch,
        birthday: null,
        date_registered: new Date().toISOString(),
        profileImage: "http://localhost:3000/engineer.png"
    })

}
import { NextResponse } from 'next/server';

export async function middleware(request) {
    try {
        const sequelize = require('../config/database');
        await sequelize.authenticate();
        return NextResponse.next();
    } catch (error) {
        console.error('Database connection error:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Database connection failed' }),
            { status: 500, headers: { 'content-type': 'application/json' } }
        );
    }
}
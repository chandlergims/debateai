import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Topic from '@/models/Topic';

// This API route will be called by a cron job every minute
export async function GET() {
  try {
    // Connect to the database
    await dbConnect();
    
    // Delete all topics
    const result = await Topic.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: `Wiped all topics. Deleted ${result.deletedCount} topics.`,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

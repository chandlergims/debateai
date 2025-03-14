import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { verifyToken } from '@/lib/phantom';

// Helper function to get the wallet address from the authorization header
async function getWalletAddress(req: NextRequest): Promise<string | null> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    return decoded.walletAddress;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

// POST handler to vote on a topic
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get wallet address from token
    const walletAddress = await getWalletAddress(request);
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    if (!body.topicId) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }
    
    // Find the topic
    const topic = await Topic.findById(body.topicId);
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }
    
    // Check if user has already voted on this topic
    if (topic.votedBy.includes(walletAddress)) {
      return NextResponse.json(
        { error: 'You have already voted on this topic' },
        { status: 403 }
      );
    }
    
    // Check if user has already voted on any topic in this session
    const userVotedOnAnyTopic = await Topic.findOne({ votedBy: walletAddress });
    if (userVotedOnAnyTopic) {
      return NextResponse.json(
        { error: 'You can only vote on one topic per session' },
        { status: 403 }
      );
    }
    
    // Add vote and update votedBy array
    const updatedTopic = await Topic.findByIdAndUpdate(
      body.topicId,
      { 
        $inc: { votes: 1 },
        $push: { votedBy: walletAddress }
      },
      { new: true }
    );
    
    return NextResponse.json({ 
      topic: updatedTopic,
      hasVoted: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error voting on topic:', error);
    return NextResponse.json(
      { error: 'Failed to vote on topic' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { verifyToken } from '@/lib/phantom';

// Maximum number of topics allowed
const MAX_TOPICS = 15;

// Helper function to get the wallet address from the authorization header
async function getWalletAddress(req: NextRequest): Promise<string | null> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // For development purposes, if the token starts with 'mock_token_', extract the wallet address from the request
    if (token.startsWith('mock_token_')) {
      // Try to get the wallet address from the request cookies or headers
      const walletAddressHeader = headersList.get('x-wallet-address');
      if (walletAddressHeader) {
        return walletAddressHeader;
      }
      
      // If we can't find the wallet address, generate a mock one
      return `mock_wallet_${token.substring(11)}`;
    }
    
    // Otherwise, verify the token normally
    const decoded = verifyToken(token);
    return decoded.walletAddress;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

// GET handler to fetch all topics
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get wallet address from token (if authenticated)
    const walletAddress = await getWalletAddress(request);
    
    // Fetch top 15 topics sorted by votes in descending order
    const topics = await Topic.find({})
      .sort({ votes: -1 })
      .limit(MAX_TOPICS);
    
    // Add hasVoted field to each topic if user is authenticated
    const topicsWithVoteStatus = topics.map(topic => {
      const hasVoted = walletAddress ? topic.votedBy.includes(walletAddress) : false;
      
      return {
        ...topic.toObject(),
        hasVoted
      };
    });
    
    return NextResponse.json({ 
      topics: topicsWithVoteStatus
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

// POST handler to create a new topic
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
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Check if the topic already exists
    const existingTopic = await Topic.findOne({ title: body.title });
    if (existingTopic) {
      return NextResponse.json(
        { error: 'A topic with this title already exists' },
        { status: 409 }
      );
    }
    
    // Check if user already created a topic
    const userTopicCount = await Topic.countDocuments({ createdBy: walletAddress });
    if (userTopicCount > 0) {
      return NextResponse.json(
        { error: 'You can only create one topic' },
        { status: 403 }
      );
    }
    
    // Check if we've reached the maximum number of topics
    const totalTopics = await Topic.countDocuments({});
    if (totalTopics >= MAX_TOPICS) {
      return NextResponse.json(
        { error: `Maximum number of topics (${MAX_TOPICS}) has been reached` },
        { status: 403 }
      );
    }
    
    // Create a new topic
    const newTopic = await Topic.create({
      title: body.title,
      votes: 0,
      createdBy: walletAddress,
      votedBy: [],
    });
    
    return NextResponse.json({ topic: newTopic }, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}

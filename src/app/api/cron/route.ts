import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Topic, AppState, PeriodStatus } from '@/models/Topic';

// This API route will be called by a cron job every 5 minutes
export async function GET() {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get the current app state
    let appState = await AppState.findOne({});
    
    // If no app state exists, create one
    if (!appState) {
      appState = await AppState.create({
        currentPeriod: PeriodStatus.VOTING,
        lastUpdated: new Date(),
      });
    }
    
    // Toggle between voting and debate periods
    if (appState.currentPeriod === PeriodStatus.VOTING) {
      // If we're in voting period, switch to debate period
      // Find the topic with the most votes that hasn't been debated yet
      const topVotedTopic = await Topic.findOne({ isDebated: false })
        .sort({ votes: -1 })
        .limit(1) as any;
      
      if (topVotedTopic) {
        // Mark the topic as debated
        topVotedTopic.isDebated = true;
        topVotedTopic.debateDate = new Date();
        await topVotedTopic.save();
        
        // Update the app state
        appState.currentPeriod = PeriodStatus.DEBATE;
        appState.topicId = topVotedTopic._id.toString();
        appState.lastUpdated = new Date();
        await appState.save();
        
        return NextResponse.json({
          success: true,
          message: 'Switched to debate period',
          topic: topVotedTopic,
          period: PeriodStatus.DEBATE,
        });
      } else {
        // No topics to debate, stay in voting period
        return NextResponse.json({
          success: true,
          message: 'No topics to debate, staying in voting period',
          period: PeriodStatus.VOTING,
        });
      }
    } else {
      // If we're in debate period, switch back to voting period
      appState.currentPeriod = PeriodStatus.VOTING;
      appState.topicId = undefined;
      appState.lastUpdated = new Date();
      await appState.save();
      
      return NextResponse.json({
        success: true,
        message: 'Switched to voting period',
        period: PeriodStatus.VOTING,
      });
    }
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

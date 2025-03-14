import mongoose, { Schema, Document } from 'mongoose';

// Define the possible states for the app
export enum PeriodStatus {
  VOTING = 'voting',
  DEBATE = 'debate'
}

// Define the interface for a Topic document
export interface ITopic extends Document {
  title: string;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
  isDebated: boolean;
  debateDate?: Date;
  createdBy: string; // wallet address
  votedBy: string[]; // array of wallet addresses
}

// Interface for the app state
export interface IAppState extends Document {
  currentPeriod: PeriodStatus;
  lastUpdated: Date;
  topicId?: string; // ID of the current topic being debated
}

// Define the schema for a Topic
const TopicSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a topic title'],
      maxlength: [200, 'Title cannot be more than 200 characters'],
      unique: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
    isDebated: {
      type: Boolean,
      default: false,
    },
    debateDate: {
      type: Date,
      required: false,
    },
    createdBy: {
      type: String,
      required: [true, 'Creator wallet address is required'],
      lowercase: true,
    },
    votedBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Define the schema for the app state
const AppStateSchema: Schema = new Schema(
  {
    currentPeriod: {
      type: String,
      enum: Object.values(PeriodStatus),
      default: PeriodStatus.VOTING,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    topicId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the models
// Check if models are already defined to prevent recompilation errors
export const Topic = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);
export const AppState = mongoose.models.AppState || mongoose.model<IAppState>('AppState', AppStateSchema);

export default Topic;

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
  nextPeriodChange: Date; // When the next period change will occur
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
    nextPeriodChange: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
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
let TopicModel: mongoose.Model<ITopic>;
let AppStateModel: mongoose.Model<IAppState>;

// Use try-catch to handle potential errors with mongoose.models
try {
  TopicModel = mongoose.models.Topic as mongoose.Model<ITopic> || mongoose.model<ITopic>('Topic', TopicSchema);
} catch (error) {
  TopicModel = mongoose.model<ITopic>('Topic', TopicSchema);
}

try {
  AppStateModel = mongoose.models.AppState as mongoose.Model<IAppState> || mongoose.model<IAppState>('AppState', AppStateSchema);
} catch (error) {
  AppStateModel = mongoose.model<IAppState>('AppState', AppStateSchema);
}

export const Topic = TopicModel;
export const AppState = AppStateModel;

export default Topic;

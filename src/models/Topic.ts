import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a Topic document
export interface ITopic extends Document {
  title: string;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // wallet address
  votedBy: string[]; // array of wallet addresses
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

// Create and export the Topic model
const Topic = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);

export default Topic;

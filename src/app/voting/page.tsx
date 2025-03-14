'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PeriodStatus } from '@/models/Topic';

interface Topic {
  _id: string;
  title: string;
  votes: number;
  createdAt: string;
  isDebated: boolean;
  hasVoted?: boolean;
  createdBy: string;
  votedBy?: string[];
  isCurrentDebateTopic?: boolean;
}

export default function VotingPage() {
  const [newTopic, setNewTopic] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitStatus, setSubmitStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [topVotedTopic, setTopVotedTopic] = useState<Topic | null>(null);
  const [showTopVoted, setShowTopVoted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [hasCreatedTopic, setHasCreatedTopic] = useState(false);
  const [maxTopicsReached, setMaxTopicsReached] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodStatus>(PeriodStatus.VOTING);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  
  // Get authentication state from context
  const { isAuthenticated, authToken, walletAddress } = useAuth();

  // Fetch topics function
  const fetchTopics = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Removed test API check
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('/api/topics', {
        headers
      });
      
      if (!response.ok) {
        // If we get a 404, the API route might not be registered yet
        if (response.status === 404) {
          // Use mock data for now
          const mockTopics = [
            { _id: '1', title: 'Is AI consciousness possible?', votes: 42, createdAt: new Date().toISOString(), isDebated: false, createdBy: '', votedBy: [] },
            { _id: '2', title: 'Should social media be regulated?', votes: 38, createdAt: new Date().toISOString(), isDebated: false, createdBy: '', votedBy: [] },
            { _id: '3', title: 'Is universal basic income viable?', votes: 27, createdAt: new Date().toISOString(), isDebated: false, createdBy: '', votedBy: [] },
          ];
          
          setTopics(mockTopics);
          setFilteredTopics(mockTopics);
          setTopVotedTopic(mockTopics[0]);
          setMaxTopicsReached(false);
          setHasCreatedTopic(false);
          
          console.log('Using mock data since API is not available');
          return;
        }
        
        throw new Error(`Failed to fetch topics: ${response.status}`);
      }
      
      const data = await response.json();
      setTopics(data.topics);
      setFilteredTopics(data.topics);
      
      // Set current period and topic
      if (data.currentPeriod) {
        setCurrentPeriod(data.currentPeriod);
      }
      
      if (data.currentTopicId) {
        setCurrentTopicId(data.currentTopicId);
      }
      
      // Set top voted topic
      if (data.topics.length > 0) {
        setTopVotedTopic(data.topics[0]); // Topics are already sorted by votes
      }
      
      // Check if user has created a topic
      if (isAuthenticated && walletAddress) {
        const userCreatedTopic = data.topics.some((topic: Topic) => topic.createdBy === walletAddress);
        setHasCreatedTopic(userCreatedTopic);
      }
      
      // Check if max topics reached
      setMaxTopicsReached(data.topics.length >= 15);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Failed to load topics. Please try again later.');
      
      // Use mock data as fallback
      const mockTopics = [
        { _id: '1', title: 'Is AI consciousness possible?', votes: 42, createdAt: new Date().toISOString(), isDebated: false, createdBy: '', votedBy: [] },
        { _id: '2', title: 'Should social media be regulated?', votes: 38, createdAt: new Date().toISOString(), isDebated: false, createdBy: '', votedBy: [] },
        { _id: '3', title: 'Is universal basic income viable?', votes: 27, createdAt: new Date().toISOString(), isDebated: false, createdBy: '', votedBy: [] },
      ];
      
      setTopics(mockTopics);
      setFilteredTopics(mockTopics);
      setTopVotedTopic(mockTopics[0]);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, isAuthenticated, walletAddress]);

  // Session check removed for now
  
  // Fetch topics on component mount and when auth changes
  useEffect(() => {
    fetchTopics();
    
    // Set up interval to refresh topics
    const intervalId = setInterval(() => {
      fetchTopics();
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [fetchTopics, isAuthenticated, walletAddress]);
  
  // Filter topics based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTopics(topics);
    } else {
      const filtered = topics.filter(topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [searchQuery, topics]);

  // Calculate word count
  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Handle input change for new topic
  const handleNewTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewTopic(value);
    setWordCount(calculateWordCount(value));
  };

  // Handle form submission to create a new topic
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowModal(false);
    if (!newTopic.trim() || !isAuthenticated) return;

    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ title: newTopic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create topic');
      }

      // Add the new topic to the list
      setTopics([...topics, data.topic]);
      setNewTopic('');
      setHasCreatedTopic(true);
      setSubmitStatus({ message: 'Topic submitted successfully!', type: 'success' });
      
      // Clear status message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err: any) {
      console.error('Error creating topic:', err);
      setSubmitStatus({ message: err.message || 'Failed to submit topic', type: 'error' });
      
      // Clear status message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  // Handle voting on a topic
  const handleVote = async (id: string) => {
    if (!isAuthenticated) {
      setError('Please connect your wallet to vote');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Check if user has already voted on any topic
    const hasVotedOnAny = topics.some(topic => topic.hasVoted);
    if (hasVotedOnAny) {
      setError('You can only vote on one topic per session');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      const response = await fetch('/api/topics/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ topicId: id }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote on topic');
      }
      
      // Update the topics list with the updated topic and mark all others as unavailable
      const updatedTopics = topics.map(topic => {
        if (topic._id === id) {
          return { ...data.topic, hasVoted: true };
        } else {
          // Mark all other topics as unavailable for voting
          return { ...topic, cannotVote: true };
        }
      }).sort((a, b) => b.votes - a.votes);
      
      setTopics(updatedTopics);
      
      // Update top voted topic if necessary
      if (updatedTopics.length > 0 && updatedTopics[0]._id === id) {
        setTopVotedTopic(updatedTopics[0]);
      }
    } catch (err: any) {
      console.error('Error voting on topic:', err);
      setError(err.message || 'Failed to vote. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Trending Topics section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-green-500">
              {currentPeriod === PeriodStatus.VOTING ? 'Trending Topics' : 'Debate Period'}
            </h2>
            <p className="text-sm text-gray-400">
              {currentPeriod === PeriodStatus.VOTING 
                ? 'Vote for the topic you want to see debated next' 
                : 'Voting is paused during the debate period'}
            </p>
          </div>
          
          {/* Create Topic Button - Disabled during debate period */}
          <button 
            onClick={() => {
              if (currentPeriod === PeriodStatus.DEBATE) {
                setError('Creating topics is not allowed during the debate period');
              } else if (!isAuthenticated) {
                setError('Please connect your wallet to create a topic');
              } else if (hasCreatedTopic) {
                setError('You can only create one topic');
              } else if (maxTopicsReached) {
                setError('Maximum number of topics (15) has been reached');
              } else {
                setShowModal(true);
              }
            }}
            className={`text-sm py-2 px-4 rounded-md transition-colors duration-200 ${
              currentPeriod === PeriodStatus.DEBATE || !isAuthenticated || hasCreatedTopic || maxTopicsReached
                ? 'bg-gray-900 text-gray-500 border border-gray-700 cursor-not-allowed'
                : 'bg-black text-green-500 border border-green-600 hover:bg-green-900/20'
            }`}
          >
            Create Topic
          </button>
        </div>
        
        {/* Current Period Status */}
        {currentPeriod === PeriodStatus.DEBATE && currentTopicId && (
          <div className="mb-6 bg-green-900/20 border border-green-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-500 mb-2">Current Debate Topic</h3>
            {topics.map(topic => (
              topic.isCurrentDebateTopic && (
                <div key={topic._id} className="bg-black p-3 rounded border border-green-600">
                  <p className="text-white font-medium">{topic.title}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="bg-gray-900 text-green-500 px-2 py-0.5 rounded text-xs font-medium">
                      {topic.votes} votes
                    </span>
                    <span className="text-xs text-gray-400">
                      Voting will resume in a few minutes
                    </span>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button className="border border-gray-800 bg-gray-900 text-white rounded px-3 py-1 text-xs">
            Most Votes
          </button>
          <button className="border border-gray-800 bg-black text-gray-400 rounded px-3 py-1 text-xs hover:bg-gray-900">
            Newest
          </button>
          <button className="border border-gray-800 bg-black text-gray-400 rounded px-3 py-1 text-xs hover:bg-gray-900">
            Popular
          </button>
          <button className="border border-gray-800 bg-black text-gray-400 rounded px-3 py-1 text-xs hover:bg-gray-900">
            24h Change
          </button>
        </div>
        
        {/* Search input moved under filters */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            className="block w-full p-2 pl-10 text-sm border rounded-lg bg-black border-gray-800 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500" 
            placeholder="Search topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-2 text-sm bg-red-900/30 text-red-200 rounded border border-red-800">
            {error}
          </div>
        )}
        
        {/* Status message */}
        {submitStatus && (
          <div className={`mb-4 p-2 text-sm rounded ${
            submitStatus.type === 'success' 
              ? 'bg-green-900/30 text-green-200 border border-green-800' 
              : 'bg-red-900/30 text-red-200 border border-red-800'
          }`}>
            {submitStatus.message}
          </div>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-green-500 border-r-transparent align-[-0.125em]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">Loading topics...</p>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No trending topics found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredTopics.map((topic) => (
              <div 
                key={topic._id} 
                className="bg-black p-3 rounded border border-gray-800 hover:border-green-900 transition-all"
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-sm font-medium text-white mb-2 line-clamp-2">{topic.title}</h3>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="bg-gray-900 text-green-500 px-2 py-0.5 rounded text-xs font-medium">
                      {topic.votes} votes
                    </span>
                    <button
                      onClick={() => handleVote(topic._id)}
                      disabled={currentPeriod === PeriodStatus.DEBATE || !isAuthenticated || topic.hasVoted}
                      className={`text-xs py-1 px-2 rounded transition-colors ${
                        currentPeriod === PeriodStatus.DEBATE
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : !isAuthenticated
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : topic.hasVoted
                              ? 'bg-green-900/50 text-green-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {currentPeriod === PeriodStatus.DEBATE 
                        ? 'Voting Paused' 
                        : topic.hasVoted 
                          ? 'Voted' 
                          : 'Vote'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Top voted topic highlight - Shows periodically */}
        {showTopVoted && topVotedTopic && (
          <div className="fixed bottom-4 right-4 p-4 bg-black border border-green-500 rounded-lg shadow-lg animate-pulse max-w-sm">
            <div>
              <span className="text-xs font-medium text-green-500 mb-1 block">TOP VOTED TOPIC</span>
              <h3 className="text-base font-medium text-white">{topVotedTopic.title}</h3>
              <div className="mt-2 bg-green-900/30 text-green-400 px-2 py-0.5 rounded text-xs font-medium inline-block">
                {topVotedTopic.votes} votes
              </div>
            </div>
          </div>
        )}
        
        {/* Create Topic Modal */}
        {showModal && !hasCreatedTopic && !maxTopicsReached && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-green-500">Create New Topic</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">
                Suggest a topic for AI to debate. Keep it concise and clear.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <textarea
                    value={newTopic}
                    onChange={handleNewTopicChange}
                    placeholder="Enter your debate topic..."
                    className="w-full p-3 rounded border bg-gray-900 border-gray-800 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500 resize-none"
                    rows={3}
                    maxLength={200}
                    required
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{wordCount} words</span>
                    <span>{newTopic.length}/200 characters</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-800 rounded text-gray-300 hover:bg-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newTopic.trim() || wordCount > 15}
                  >
                    Submit
                  </button>
                </div>
                
                {wordCount > 15 && (
                  <p className="text-red-400 text-xs mt-2">
                    Topic is too long. Please keep it under 15 words.
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

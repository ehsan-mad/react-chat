import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FileUpload from "./FileUpload";

const BASE_URL = "https://chat-api-vecx.onrender.com/api";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState({
    chats: false,
    messages: false,
    sendMessage: false,
    createChat: false,
    searchUsers: false
  });
  const [error, setError] = useState({
    chats: null,
    messages: null,
    sendMessage: null,
    createChat: null,
    searchUsers: null
  });
  
  // Create chat modal state
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);
  const [chatName, setChatName] = useState("");
  const [chatType, setChatType] = useState("individual");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Check if user is logged in
  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  // Fetch chats when component mounts
  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId]);

  async function fetchChats() {
    setIsLoading(prev => ({ ...prev, chats: true }));
    setError(prev => ({ ...prev, chats: null }));
    
    try {
      const response = await axios.get(`${BASE_URL}/chats?userId=${userId}`);
      setChats(response.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError(prev => ({ 
        ...prev, 
        chats: "Failed to load chats. Please try again." 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, chats: false }));
    }
  }

  async function fetchMessages(chatId) {
    setSelectedChat(chatId);
    setIsLoading(prev => ({ ...prev, messages: true }));
    setError(prev => ({ ...prev, messages: null }));
    
    try {
      const response = await axios.get(`${BASE_URL}/messages?chatId=${chatId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(prev => ({ 
        ...prev, 
        messages: "Failed to load messages. Please try again." 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, messages: false }));
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;
    
    setIsLoading(prev => ({ ...prev, sendMessage: true }));
    setError(prev => ({ ...prev, sendMessage: null }));
    
    try {
      const response = await axios.post(`${BASE_URL}/messages`, {
        chatId: selectedChat,
        senderId: userId,
        content: messageInput,
        type: "text",
      });
      setMessages(prev => [...prev, response.data]);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError(prev => ({ 
        ...prev, 
        sendMessage: "Failed to send message. Please try again." 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, sendMessage: false }));
    }
  }

  async function sendFileMessage(fileData) {
    if (!selectedChat) {
      alert("Please select a chat first");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, sendMessage: true }));
    setError(prev => ({ ...prev, sendMessage: null }));
    
    try {
      // Determine file type (image or file)
      const messageType = fileData.mimetype.startsWith('image/') ? 'image' : 'file';
      
      // Create a message with the file information
      const response = await axios.post(`${BASE_URL}/messages`, {
        chatId: selectedChat,
        senderId: userId,
        content: JSON.stringify({
          fileId: fileData.id,
          filename: fileData.originalName,
          path: fileData.path,
          mimetype: fileData.mimetype,
          size: fileData.size
        }),
        type: messageType,
      });
      
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error("Error sending file message:", error);
      setError(prev => ({ 
        ...prev, 
        sendMessage: "Failed to send file. Please try again." 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, sendMessage: false }));
    }
  }

  function openCreateChatModal() {
    setShowCreateChatModal(true);
    setChatName("");
    setChatType("individual");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
  }

  function closeCreateChatModal() {
    setShowCreateChatModal(false);
  }

  async function searchUsers(query) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(prev => ({ ...prev, searchUsers: true }));
    setError(prev => ({ ...prev, searchUsers: null }));
    
    try {
      // This endpoint is not specified in the requirements, but would be needed
      // For this example, we'll simulate a search response
      // In a real app, you would call something like: 
      // const response = await axios.get(`${BASE_URL}/users/search?query=${query}`);
      
      // Simulated response for demonstration
      setTimeout(() => {
        const mockUsers = [
          { id: "user1", name: "John Doe" },
          { id: "user2", name: "Jane Smith" },
          { id: "user3", name: "Bob Johnson" }
        ].filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) && 
          user.id !== userId
        );
        
        setSearchResults(mockUsers);
        setIsLoading(prev => ({ ...prev, searchUsers: false }));
      }, 500);
      
    } catch (error) {
      console.error("Error searching users:", error);
      setError(prev => ({ 
        ...prev, 
        searchUsers: "Failed to search users. Please try again." 
      }));
      setIsLoading(prev => ({ ...prev, searchUsers: false }));
    }
  }

  function toggleUserSelection(user) {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      // For individual chats, only allow one user to be selected
      if (chatType === "individual") {
        setSelectedUsers([user]);
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  }

  async function createChat() {
    if (selectedUsers.length === 0) {
      setError(prev => ({ 
        ...prev, 
        createChat: "Please select at least one user to chat with." 
      }));
      return;
    }

    setIsLoading(prev => ({ ...prev, createChat: true }));
    setError(prev => ({ ...prev, createChat: null }));
    
    try {
      const participants = [userId, ...selectedUsers.map(user => user.id)];
      
      const response = await axios.post(`${BASE_URL}/chats`, {
        name: chatType === "group" ? chatName : null,
        participants: participants,
        type: chatType,
        createdBy: userId
      });
      
      // Add the new chat to the list and select it
      setChats(prev => [...prev, response.data]);
      setSelectedChat(response.data.id);
      setMessages([]);
      closeCreateChatModal();
      
    } catch (error) {
      console.error("Error creating chat:", error);
      setError(prev => ({ 
        ...prev, 
        createChat: "Failed to create chat. Please try again." 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, createChat: false }));
    }
  }

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Render message content based on type
  function renderMessageContent(message) {
    switch (message.type) {
      case 'text':
        return <div>{message.content}</div>;
        
      case 'image': {
        try {
          const fileData = JSON.parse(message.content);
          return (
            <div>
              <img 
                src={`https://chat-api-vecx.onrender.com${fileData.path}`} 
                alt={fileData.filename}
                className="max-w-full rounded"
                style={{ maxHeight: '200px' }}
              />
              <div className="text-xs mt-1">{fileData.filename}</div>
            </div>
          );
        } catch (e) {
          return <div>Invalid image format</div>;
        }
      }
        
      case 'file': {
        try {
          const fileData = JSON.parse(message.content);
          return (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <a 
                href={`https://chat-api-vecx.onrender.com${fileData.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {fileData.filename}
              </a>
              <span className="text-xs ml-2">
                ({Math.round(fileData.size / 1024)}KB)
              </span>
            </div>
          );
        } catch (e) {
          return <div>Invalid file format</div>;
        }
      }
        
      default:
        return <div>{message.content}</div>;
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar for chat list */}
      <div className="w-1/3 bg-gray-200 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chats</h2>
          <button 
            onClick={openCreateChatModal}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            New Chat
          </button>
        </div>
        
        {isLoading.chats ? (
          <div className="text-center py-4">Loading chats...</div>
        ) : error.chats ? (
          <div className="text-red-500 text-center py-4">{error.chats}</div>
        ) : chats.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No chats found. Start a new conversation!
          </div>
        ) : (
          <ul className="overflow-y-auto">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className={`p-3 mb-1 rounded cursor-pointer hover:bg-gray-300 transition ${
                  selectedChat === chat.id ? "bg-gray-300" : ""
                }`}
                onClick={() => fetchMessages(chat.id)}
              >
                {chat.name || "Unnamed Chat"}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col bg-white">
        <div className="p-4 border-b font-bold">
          {selectedChat ? (
            chats.find(chat => chat.id === selectedChat)?.name || "Chat Window"
          ) : (
            "Select a chat to start messaging"
          )}
        </div>
        
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat from the sidebar to view messages
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading.messages ? (
                <div className="text-center py-4">Loading messages...</div>
              ) : error.messages ? (
                <div className="text-red-500 text-center py-4">{error.messages}</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.senderId === userId
                          ? "bg-blue-500 text-white self-end rounded-br-none"
                          : "bg-gray-200 self-start rounded-bl-none"
                      }`}
                    >
                      {renderMessageContent(msg)}
                      <div className={`text-xs mt-1 ${
                        msg.senderId === userId ? "text-blue-100" : "text-gray-500"
                      }`}>
                        {msg.status || "sent"} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex items-center mb-2">
                <FileUpload 
                  onFileUploaded={sendFileMessage} 
                  userId={userId} 
                />
              </div>
              
              <div className="flex">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder="Type a message..."
                  disabled={isLoading.sendMessage}
                />
                <button
                  type="submit"
                  className={`ml-2 px-4 py-2 rounded text-white ${
                    isLoading.sendMessage 
                      ? "bg-blue-400 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={isLoading.sendMessage}
                >
                  {isLoading.sendMessage ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
            
            {error.sendMessage && (
              <div className="text-red-500 text-center py-2 px-4 bg-red-50">
                {error.sendMessage}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Chat Modal */}
      {showCreateChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Create New Chat</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Chat Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="individual"
                    checked={chatType === "individual"}
                    onChange={() => {
                      setChatType("individual");
                      // For individual chats, only allow one selected user
                      if (selectedUsers.length > 1) {
                        setSelectedUsers(selectedUsers.slice(0, 1));
                      }
                    }}
                    className="mr-2"
                  />
                  Individual
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="group"
                    checked={chatType === "group"}
                    onChange={() => setChatType("group")}
                    className="mr-2"
                  />
                  Group
                </label>
              </div>
            </div>
            
            {chatType === "group" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter group name"
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Search Users</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Type to search users..."
              />
            </div>
            
            {isLoading.searchUsers ? (
              <div className="text-center py-2">Searching users...</div>
            ) : error.searchUsers ? (
              <div className="text-red-500 text-center py-2">{error.searchUsers}</div>
            ) : searchResults.length > 0 ? (
              <div className="mb-4 max-h-40 overflow-y-auto border rounded">
                {searchResults.map(user => (
                  <div 
                    key={user.id}
                    className={`p-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                      selectedUsers.some(u => u.id === user.id) ? "bg-blue-50" : ""
                    }`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                      {user.name.charAt(0)}
                    </div>
                    <div>{user.name}</div>
                    {selectedUsers.some(u => u.id === user.id) && (
                      <div className="ml-auto text-blue-500">✓</div>
                    )}
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-2 text-gray-500">No users found</div>
            ) : null}
            
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Selected Users</label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div key={user.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                      {user.name}
                      <button 
                        onClick={() => toggleUserSelection(user)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {error.createChat && (
              <div className="text-red-500 text-center py-2 mb-4">{error.createChat}</div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeCreateChatModal}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                disabled={isLoading.createChat}
              >
                Cancel
              </button>
              <button
                onClick={createChat}
                className={`px-4 py-2 rounded text-white ${
                  isLoading.createChat 
                    ? "bg-blue-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={isLoading.createChat || selectedUsers.length === 0}
              >
                {isLoading.createChat ? "Creating..." : "Create Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

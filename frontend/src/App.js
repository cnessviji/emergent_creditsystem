import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Wallet, Home, User, TrendingUp, Users, BookOpen, ShoppingCart, Briefcase, MessageCircle, Heart, Send } from "lucide-react";
import CreditAnimation from "@/components/CreditAnimation";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [animations, setAnimations] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Initialize user
  useEffect(() => {
    initializeUser();
  }, []);

  // Load posts
  useEffect(() => {
    if (currentUser) {
      loadPosts();
    }
  }, [currentUser]);

  const initializeUser = async () => {
    try {
      // Create or get user
      const response = await axios.post(`${API}/user/create`, {
        username: "Nandhini Navas",
        email: "nandhini@oneness.com"
      });
      setCurrentUser(response.data);
      setCredits(response.data.credits);
    } catch (error) {
      console.error("Error initializing user:", error);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const triggerCreditAnimation = (fromElement, amount = 10) => {
    const walletIcon = document.querySelector('[data-wallet-icon]');
    if (!walletIcon || !fromElement) return;

    const fromRect = fromElement.getBoundingClientRect();
    const toRect = walletIcon.getBoundingClientRect();

    const animationId = Date.now();
    setAnimations(prev => [...prev, {
      id: animationId,
      from: { x: fromRect.left + fromRect.width / 2, y: fromRect.top + fromRect.height / 2 },
      to: { x: toRect.left + toRect.width / 2, y: toRect.top + toRect.height / 2 },
      amount: amount
    }]);

    // Remove animation after completion
    setTimeout(() => {
      setAnimations(prev => prev.filter(a => a.id !== animationId));
    }, 1400);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !currentUser) return;

    // Store the element reference before the async operation
    const formElement = e.currentTarget;

    try {
      const response = await axios.post(`${API}/post/create`, {
        user_id: currentUser.id,
        content: newPostContent
      });

      setPosts([response.data, ...posts]);
      setNewPostContent("");

      // Trigger animation using the stored element reference
      triggerCreditAnimation(formElement);

      // Update credits
      setTimeout(async () => {
        const creditsResponse = await axios.get(`${API}/user/${currentUser.id}/credits`);
        setCredits(creditsResponse.data.credits);
      }, 800);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = async (postId, event) => {
    if (!currentUser) return;

    // Store the element reference before the async operation
    const buttonElement = event.currentTarget;

    try {
      const response = await axios.post(`${API}/post/like`, {
        user_id: currentUser.id,
        post_id: postId
      });

      // Only animate and update credits if action was performed (not unliking)
      if (response.data.action_performed) {
        // Trigger animation using the stored element reference
        triggerCreditAnimation(buttonElement);

        setTimeout(async () => {
          const creditsResponse = await axios.get(`${API}/user/${currentUser.id}/credits`);
          setCredits(creditsResponse.data.credits);
        }, 800);
      }

      // Update posts
      loadPosts();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId, event) => {
    if (!currentUser || !commentInputs[postId]?.trim()) return;

    // Store the element reference before the async operation
    const buttonElement = event.currentTarget;

    try {
      await axios.post(`${API}/post/comment`, {
        user_id: currentUser.id,
        post_id: postId,
        comment: commentInputs[postId]
      });

      // Trigger animation using the stored element reference
      triggerCreditAnimation(buttonElement);

      // Clear comment input
      setCommentInputs({ ...commentInputs, [postId]: "" });

      // Update credits
      setTimeout(async () => {
        const creditsResponse = await axios.get(`${API}/user/${currentUser.id}/credits`);
        setCredits(creditsResponse.data.credits);
      }, 800);

      // Reload posts
      loadPosts();
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  const handleCreateStory = async (event) => {
    if (!currentUser) return;

    // Store the element reference before the async operation
    const buttonElement = event.currentTarget;

    try {
      // Award credits for creating story
      await axios.post(`${API}/credits/award`, {
        user_id: currentUser.id,
        amount: 10,
        action: "story"
      });

      // Trigger animation using the stored element reference
      triggerCreditAnimation(buttonElement);

      setTimeout(async () => {
        const creditsResponse = await axios.get(`${API}/user/${currentUser.id}/credits`);
        setCredits(creditsResponse.data.credits);
      }, 800);
    } catch (error) {
      console.error("Error creating story:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Credit Animations */}
      {animations.map(anim => (
        <CreditAnimation key={anim.id} from={anim.from} to={anim.to} amount={anim.amount} />
      ))}

      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Oneness
              </div>
              <p className="text-xs text-gray-500 mt-1">consciousness triumphs</p>
            </div>

            {/* Right Menu Icons */}
            <div className="flex items-center space-x-6">
              <button className="text-gray-600 hover:text-purple-600 transition">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button className="text-gray-600 hover:text-purple-600 transition">
                <Users className="w-6 h-6" />
              </button>
              <button className="relative text-gray-600 hover:text-purple-600 transition">
                <div className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full"></div>
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">N</div>
              </button>
              <button className="text-gray-600 hover:text-purple-600 transition">
                <div className="w-6 h-6 flex items-center justify-center">⚙️</div>
              </button>

              {/* Wallet Icon with Credits */}
              <div
                data-wallet-icon
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full shadow-lg"
              >
                <Wallet className="w-5 h-5" />
                <span className="font-bold text-lg">{credits}</span>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Nandhini</p>
                  <p className="text-xs text-gray-500">Navas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
          <div className="p-4 space-y-2">
            <SidebarItem icon={<Home className="w-5 h-5" />} text="Home / Dashboard" />
            <SidebarItem icon={<User className="w-5 h-5" />} text="True Profile" />
            <SidebarItem icon={<BookOpen className="w-5 h-5" />} text="Certifications" />
            <SidebarItem icon={<Users className="w-5 h-5" />} text="Directory" />
            <SidebarItem icon={<TrendingUp className="w-5 h-5" />} text="Best Practices Hub" />
            <div className="pt-4 border-t">
              <p className="text-purple-600 font-semibold mb-2 flex items-center">
                <span className="mr-2">📻</span> Social
              </p>
              <div className="ml-6 space-y-2">
                <SidebarItem text="Feed" active />
                <SidebarItem text="Profile" />
                <SidebarItem text="My Connections" />
              </div>
            </div>
            <SidebarItem icon={<ShoppingCart className="w-5 h-5" />} text="Marketplace" />
            <SidebarItem icon={<Briefcase className="w-5 h-5" />} text="Business Hub" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          <div className="max-w-4xl">
            {/* Create Post Section */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-8 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <form onSubmit={handleCreatePost} className="flex-1">
                  <input
                    type="text"
                    placeholder="Create a Conscious Act"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full px-6 py-4 rounded-full bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </form>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 bg-yellow-400 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition">
                  <span>📹</span>
                  <span>Video</span>
                </button>
                <button className="flex items-center space-x-2 bg-pink-400 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-500 transition">
                  <span>🖼️</span>
                  <span>Photo</span>
                </button>
              </div>
            </div>

            {/* Inspiration Reels */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Inspiration Reels</h2>
              <div className="bg-gradient-to-b from-purple-400 to-blue-500 rounded-3xl p-6 w-64 shadow-xl">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 h-64 rounded-2xl mb-4 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-2 flex items-center justify-center cursor-pointer hover:scale-110 transition" onClick={handleCreateStory}>
                      <span className="text-4xl text-blue-500">+</span>
                    </div>
                  </div>
                </div>
                <p className="text-white text-center font-semibold">Create Story</p>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                      alt="User"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Nandhini Navas</h3>
                      <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-800 mb-4">{post.content}</p>

                  {/* Actions */}
                  <div className="flex items-center space-x-6 border-t pt-4">
                    <button
                      onClick={(e) => handleLike(post.id, e)}
                      className={`flex items-center space-x-2 transition ${
                        post.likes.includes(currentUser?.id)
                          ? "text-red-500"
                          : "text-gray-600 hover:text-red-500"
                      }`}
                      data-testid={`like-btn-${post.id}`}
                    >
                      <Heart className={`w-5 h-5 ${post.likes.includes(currentUser?.id) ? 'fill-current' : ''}`} />
                      <span>{post.likes.length}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="flex items-start space-x-3">
                          <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                            alt="User"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1 bg-gray-100 rounded-lg p-3">
                            <p className="text-sm font-semibold text-gray-900">Nandhini Navas</p>
                            <p className="text-sm text-gray-700">{comment.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div className="mt-4 flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                      alt="User"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      data-testid={`comment-input-${post.id}`}
                    />
                    <button
                      onClick={(e) => handleComment(post.id, e)}
                      className="text-purple-600 hover:text-purple-700 transition"
                      data-testid={`comment-btn-${post.id}`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 fixed right-0 h-full overflow-y-auto p-6">
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <QuickActionItem icon="📈" text="Trending" />
              <QuickActionItem icon="📚" text="My Collection" />
              <QuickActionItem icon="👥" text="People you follow" />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">My Picks</h3>
              <button className="text-blue-500 text-sm">Change</button>
            </div>
            <div className="space-y-2">
              <PickItem text="Conscious Leadership" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Explore Topics</h3>
            <div className="space-y-2">
              <PickItem text="Conscious News" />
              <PickItem text="Conscious Leadership" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const SidebarItem = ({ icon, text, active }) => (
  <div
    className={`flex items-center space-x-3 px-4 py-2 rounded-lg cursor-pointer transition ${
      active ? "bg-purple-50 text-purple-600" : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span className="text-sm">{text}</span>
  </div>
);

const QuickActionItem = ({ icon, text }) => (
  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-purple-50 cursor-pointer transition">
    <span className="text-xl">{icon}</span>
    <span className="text-sm text-gray-700">{text}</span>
  </div>
);

const PickItem = ({ text }) => (
  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-50 cursor-pointer transition">
    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
    <span className="text-sm text-gray-700">{text}</span>
  </div>
);

export default App;
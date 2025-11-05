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
              <button
                data-wallet-icon
                onClick={() => setShowWalletModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
              >
                <Wallet className="w-5 h-5" />
                <span className="font-bold text-lg">{credits}</span>
              </button>

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
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowWalletModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Your Credits Wallet</h2>
                  <p className="text-purple-100">Track and redeem your earned credits</p>
                </div>
                <button 
                  onClick={() => setShowWalletModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Credits Display */}
              <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">Total Credits Earned</p>
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-8 h-8" />
                      <span className="text-5xl font-bold">{credits}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-100 text-sm mb-1">Member Status</p>
                    <span className="inline-block bg-yellow-400 text-purple-900 px-4 py-1 rounded-full text-sm font-bold">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* How to Earn Credits */}
              <section className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-purple-100 p-2 rounded-lg mr-3">💎</span>
                  Ways to Increase Your Credits
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <p className="font-semibold text-gray-900">Create a Post</p>
                        <p className="text-sm text-gray-600">+10 credits per post</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">❤️</span>
                      <div>
                        <p className="font-semibold text-gray-900">Like Content</p>
                        <p className="text-sm text-gray-600">+10 credits per like</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">💬</span>
                      <div>
                        <p className="font-semibold text-gray-900">Add Comment</p>
                        <p className="text-sm text-gray-600">+10 credits per comment</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📖</span>
                      <div>
                        <p className="font-semibold text-gray-900">Create Story</p>
                        <p className="text-sm text-gray-600">+10 credits per story</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Redemption Options */}
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-lg mr-3">🎁</span>
                  Credit Redemption Options
                </h3>
                <p className="text-gray-600 mb-6">
                  Redeem your earned credits for exclusive benefits and recognition within the CNESS community. 
                  Each reward tier offers unique opportunities to enhance your professional presence and networking experience.
                </p>

                <div className="space-y-4">
                  {/* Marketplace Discount */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 hover:shadow-md transition">
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl">🛍️</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Marketplace Discount</h4>
                        <p className="text-gray-700 mb-2">
                          Unlock exclusive discounts on premium products and services available in the CNESS Marketplace. 
                          Save on professional development courses, consulting services, and premium resources.
                        </p>
                        <span className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          100 Credits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Special Recognition in Newsletter */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 hover:shadow-md transition">
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl">📰</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Special Recognition in Monthly Newsletter</h4>
                        <p className="text-gray-700 mb-2">
                          Be featured as a valued community member in our monthly newsletter, reaching thousands of 
                          professionals across various industries. Gain visibility and recognition for your contributions.
                        </p>
                        <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          200 Credits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Exclusive Professional/Industry Featured Newsletter */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 hover:shadow-md transition">
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl">📧</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Exclusive Professional/Industry Featured Newsletter</h4>
                        <p className="text-gray-700 mb-2">
                          Have your professional achievements, insights, or industry expertise highlighted in a dedicated 
                          section of our newsletter. Perfect for thought leaders and industry innovators seeking greater exposure.
                        </p>
                        <span className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          350 Credits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Special Interview in Newsletter */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200 hover:shadow-md transition">
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl">🎤</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Special Interview in Newsletter</h4>
                        <p className="text-gray-700 mb-2">
                          Participate in an exclusive interview published in our newsletter, where you can share your journey, 
                          expertise, and insights with our engaged community. Establish yourself as an industry authority.
                        </p>
                        <span className="inline-block bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          500 Credits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Feature */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200 hover:shadow-md transition">
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl">📱</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Special Post on CNESS Social Media Platforms</h4>
                        <p className="text-gray-700 mb-2">
                          Get featured across all CNESS social media channels including LinkedIn, Twitter, and Instagram. 
                          Amplify your personal brand and reach thousands of professionals in our network.
                        </p>
                        <span className="inline-block bg-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          600 Credits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Interview */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200 hover:shadow-md transition">
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl">🎥</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Special Interview Video on YouTube</h4>
                        <p className="text-gray-700 mb-2">
                          Participate in a professionally produced video interview on the CNESS YouTube channel. 
                          Share your story, expertise, and vision with our global audience in this premium content format.
                        </p>
                        <span className="inline-block bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          800 Credits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Directory Feature */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200 hover:shadow-md transition">
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl">📂</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Featured on Directory</h4>
                        <p className="text-gray-700 mb-2">
                          Receive premium placement in the CNESS Professional Directory with enhanced profile visibility, 
                          priority search ranking, and featured badge. Maximize your discoverability to potential collaborators and clients.
                        </p>
                        <span className="inline-block bg-cyan-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          750 Credits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Aspired Member Recognition */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-400 hover:shadow-lg transition">
                    <div className="flex items-start space-x-4">
                      <span className="text-3xl">🏆</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Recognized Aspired Member Status</h4>
                        <p className="text-gray-700 mb-2">
                          Achieve elite recognition as a Top Aspired Member, Inspired Contributor, or Community Leader. 
                          This prestigious designation includes all premium benefits, lifetime recognition, and exclusive access 
                          to leadership opportunities within the CNESS ecosystem.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Top Member: 1000 Credits
                          </span>
                          <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Inspired: 1500 Credits
                          </span>
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Leader: 2000 Credits
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer Note */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  <strong className="text-gray-900">Note:</strong> Credits are accumulated through active participation in the CNESS community. 
                  To redeem your credits, please contact our community team at{" "}
                  <a href="mailto:community@cness.com" className="text-purple-600 hover:underline font-semibold">
                    community@cness.com
                  </a>{" "}
                  with your desired redemption option.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
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
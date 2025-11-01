from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    credits: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    email: str

class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content: str
    likes: List[str] = []  # List of user IDs who liked
    comments: List[dict] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PostCreate(BaseModel):
    user_id: str
    content: str

class LikeRequest(BaseModel):
    user_id: str
    post_id: str

class CommentRequest(BaseModel):
    user_id: str
    post_id: str
    comment: str

class AwardCreditsRequest(BaseModel):
    user_id: str
    amount: int = 10
    action: str  # "post", "like", "comment", "story"

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

# User Routes
@api_router.post("/user/create", response_model=User)
async def create_user(input: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing_user:
        return User(**existing_user)
    
    user_obj = User(**input.model_dump())
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user_obj

@api_router.get("/user/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

@api_router.get("/user/{user_id}/credits")
async def get_user_credits(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "credits": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"credits": user.get("credits", 0)}

# Credits Routes
@api_router.post("/credits/award")
async def award_credits(input: AwardCreditsRequest):
    user = await db.users.find_one({"id": input.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_credits = user.get("credits", 0) + input.amount
    
    await db.users.update_one(
        {"id": input.user_id},
        {"$set": {"credits": new_credits}}
    )
    
    return {"success": True, "credits": new_credits, "amount_awarded": input.amount}

# Post Routes
@api_router.post("/post/create", response_model=Post)
async def create_post(input: PostCreate):
    post_obj = Post(**input.model_dump())
    doc = post_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.posts.insert_one(doc)
    
    # Award credits for creating a post
    await award_credits(AwardCreditsRequest(user_id=input.user_id, amount=10, action="post"))
    
    return post_obj

@api_router.get("/posts", response_model=List[Post])
async def get_posts():
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    
    return posts

@api_router.post("/post/like")
async def like_post(input: LikeRequest):
    post = await db.posts.find_one({"id": input.post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    likes = post.get("likes", [])
    
    # Toggle like
    if input.user_id in likes:
        likes.remove(input.user_id)
        action_performed = False
    else:
        likes.append(input.user_id)
        action_performed = True
        # Award credits for liking
        await award_credits(AwardCreditsRequest(user_id=input.user_id, amount=10, action="like"))
    
    await db.posts.update_one(
        {"id": input.post_id},
        {"$set": {"likes": likes}}
    )
    
    return {"success": True, "likes_count": len(likes), "action_performed": action_performed}

@api_router.post("/post/comment")
async def comment_on_post(input: CommentRequest):
    post = await db.posts.find_one({"id": input.post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = post.get("comments", [])
    comment_obj = {
        "id": str(uuid.uuid4()),
        "user_id": input.user_id,
        "comment": input.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    comments.append(comment_obj)
    
    await db.posts.update_one(
        {"id": input.post_id},
        {"$set": {"comments": comments}}
    )
    
    # Award credits for commenting
    await award_credits(AwardCreditsRequest(user_id=input.user_id, amount=10, action="comment"))
    
    return {"success": True, "comment": comment_obj}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
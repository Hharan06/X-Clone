import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import cloudinary from "cloudinary";

export const createPost = async (req,res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;

        const userId = req.user._id.toString();

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({error: "No user found"});
        }

        if(!text && !img){
            return res.status(400).json({error: "Post should have text ot image"});
        }

        if(img){
            const uploadedResponse = cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post(
            {
                user: userId,
                text,
                img
            }
        );

        await newPost.save();

        res.status(201).json(newPost);  // We use 201 if we create something
        
    } catch (error) {
        console.log(`Error in createPost controller ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deletePost = async (req,res) => {
    try {
        const {id} = req.params;                     // Here name should be same as in router
        const post = await Post.findById(id);

        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        if(req.user._id.toString() !== post.user.toString()){
            return res.status(401).json("You are not authorized to delete this post");
        }

        if(post.img){
            await cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0]);
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({message: "Post deleted successfully"});
        
    } catch (error) {
        console.log(`Error in deletePost controller ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const createComment = async (req,res) => {
    try {
        const postId = req.params.id;
        const {text} = req.body;               // {} makes it string if no {} then it is object
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        const comment = {user: userId, text: text};

        await post.comments.push(comment);

        await post.save();

        res.status(200).json(post);
        
    } catch (error) {
        console.log(`Error in createComment controller ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const likeUnlikePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        const userLikePost = post.likes.includes(userId);

        if(userLikePost){
            //Unlike the post
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}});
            // updateOne directly modifies the database but not the object

            const updatedPost = await Post.findById(postId);

			res.status(200).json(updatedPost.likes);

        } else{
            //Like the post
            post.likes.push(userId);
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}});

            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            });

            await notification.save();

            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
        }
        
    } catch (error) {
        console.log(`Error in likeUnlikePost controller ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getAllPosts = async (req,res) => {
    try {
        // createdAt: -1 will display the recently posted posts
        const posts = await Post.find()
        .sort({createdAt: -1})
        .populate({path: "user", select: "-password"})         // populate() will give all information of user
        .populate({path: "comments.user", select: ["-password","-email","-following","-followers","-link","-bio"]});

        if(posts.length === 0){
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
        
    } catch (error) {
        console.log(`Error in getAllPosts controller ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getLikedPosts = async(req,res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);

        if(!user) return res.status(404).json({error: "User not found"});

        const userLikedPosts = await Post.find({_id: {$in: user.likedPosts}})
        .populate({path: "user", select: "-password"})
        .populate({path: "comments.user", select: ["-password","-email","-following","-followers","-link","-bio"]});

        res.status(200).json(userLikedPosts);
        
    } catch (error) {
        console.log(`Error in getLikedPosts controller ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
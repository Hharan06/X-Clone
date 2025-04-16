import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";

export const getProfile = async (req,res)=>{
    const {username} = req.params;
    try {
        const user = await User.findOne({username}).select("-password");
        res.status(200).json(user);

    } catch (error) {
        console.log(`Error in getProfile controller:${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const followUnfollowUser = async (req,res)=> {
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(userToModify == currentUser){
            res.status(400).json({error:"You cant follow/unfollow yourself"});
        }

        if(!userToModify || !currentUser){
            res.status(404).json({error: "No user found"});
        }

        const following = await currentUser.following.includes(id);

        if(following){
            // Unfollow
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}});
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}});
            res.status(200).json({message:"Unfollow Successfully"});

        } else{
            // Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            const newNotification = new Notification({
                from: req.user._id,
                to: userToModify._id,
                type: "follow",
            })

            await newNotification.save();

            res.status(200).json({message:"Follow Successfully"});
        }

    } catch (error) {
        console.log(`Error in followUnfollowUser controller:${error}`);
        res.status(500).json({error:"Internal server error"});
    }
}

export const getSuggestedUsers = async (req,res)=> {
    try {
        const userId = req.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following");
        
        const allUsers = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },

            },

            {
                $sample: { size: 10 },
            },
        ]);

        const filteredUsers = allUsers.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);

    } catch (error) {
        console.log(`Error in get suggested users controller:${error}`);
        res.status(500).json({error:"Internal server error"});
    }
}

export const updateUser = async (req,res)=> {
    try {
        const userId = req.user._id;
        const {username, fullName, email, currentPassword, newPassword, bio, link} = req.body;
        let {profileImg, coverImg} = req.body;

        let user = await User.findById(userId);

        if(!user) return res.status(404).json({message: "User not found"});

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

        if(currentPassword && newPassword){
            const isMatch = bcrypt.compare(currentPassword, user.password);

            if(!isMatch) return res.status(400).json({message: "Current password is incorrect"});

            if(newPassword.length < 6){
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }

            const salt = bcrypt.genSalt(10);
            user.password = bcrypt.hash(newPassword, salt);
        }

        if(profileImg){
            if(user.profileImg){
                // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
                // We need only this zmxorcxexpdbh8r0bkjb
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const updateResponse = cloudinary.uploader.upload(profileImg);
            profileImg = updateResponse.secure_url;
        }

        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const updateResponse = cloudinary.uploader.upload(coverImg);
            coverImg = updateResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        user.password = null;

        return res.status(200).json(user);

    } catch (error) {
        console.log(`Error in update user controller: ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}
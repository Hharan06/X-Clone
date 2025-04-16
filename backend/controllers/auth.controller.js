import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/generateToken.js"

export const signup = async(req, res)=>{
    try {
        const {username, fullName, email, password} = req.body;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if(!emailRegex.test(email)){
            return res.status(400).json({error : "Invalid Email Format"});
        }

        const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
			fullName: fullName,
			username: username,
			email: email,
			password: hashedPassword,
		});

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}

    } catch (error) {
        console.log(`Error in SignUp ${error}`);
        res.status(500).json({error : "Internal Server Error"});
    }
}

export const login = async(req, res)=>{
    try {
		const {username, password} = req.body;

		const user = await User.findOne({username});
		const isPassword = await bcrypt.compare(password, user.password || " ");

		if(!user || !isPassword){
			return res.status(404).json({error: "No User found"});
		}

		generateTokenAndSetCookie(user._id,res);

		return res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});

	} catch (error) {
		console.log(`Error in login:${error}`);
		res.status(500).json({error: "Internal Server error"});
	}
}

export const logout = async(req, res)=>{
    try {
		res.cookie("jwt", "", {maxAge: 0});
		res.status(200).json({ message: "Logged out successfully" });
		
	} catch (error) {
		console.log(`Error in logout:${error}`);
		res.status(500).json({error:"Internal Server error"});
	}
}

export const getMe = async(req, res) => {
	try {
		const user = await User.findOne({_id : req.user._id}).select("-password");
		res.status(200).json(user);
		
	} catch (error) {
		console.log(`Error in getMe controller:${error}`);
		res.status(500).json({message: "Internal Server console.error"});
	}
}
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Association = require("../models/Association");
const bcrypt = require("bcrypt");

// Middleware for API key authentication
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['passkey'];
  if (apiKey && apiKey === process.env.PASS_KEY) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized - Invalid API Key" });
  }
};




// Get All Users with role-specific fields
router.get("/", async (req, res) => {
  try {
    // Fetch all users with necessary associations populated
    const users = await User.find()
      .select('-password')
      .populate({
        path: 'association',
        select: '_id name' // Only get association id and name when populated
      });

    // Process each user based on their type
    const processedUsers = users.map(user => {
      const baseFields = {
        id: user._id,
        role: user.role,
        joinDate: user.joinDate
      };

      if (user.isAnonymous || user.role === 'anonymous') {
        // Anonymous user - only basic fields
        return baseFields;
      }

      if (user.role === 'donor') {
        // Donor fields
        const donorResponse = {
          ...baseFields,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          address: user.address,
          UserStatus: user.UserStatus,
          upgradeStatus: user.upgradeStatus
        };

        // Add association info if upgraded
        if (user.upgradeStatus === 'enabled' && user.association) {
          donorResponse.association = {
            id: user.association._id,
            name: user.association.name
          };
        }

        return donorResponse;
      }

      if (user.role === 'volunteer') {
        // Volunteer fields
        return {
          ...baseFields,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          address: user.address,
          badge: user.badge,
          association: user.association ? {
            id: user.association._id,
            name: user.association.name
          } : null,
          UserStatus: user.UserStatus,
          VolunteerStatus: user.VolunteerStatus
        };
      }

      return baseFields; // fallback
    });

    res.json(processedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error retrieving users" });
  }
});


// Get User by ID with role-specific fields
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'association',
        select: '_id name'
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const baseFields = {
      id: user._id,
      role: user.role,
      joinDate: user.joinDate
    };

    let response;
    
    if (user.isAnonymous || user.role === 'anonymous') {
      // Anonymous user
      response = baseFields;
    } 
    else if (user.role === 'donor') {
      // Donor fields
      response = {
        ...baseFields,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        address: user.address,
        UserStatus: user.UserStatus,
        upgradeStatus: user.upgradeStatus
      };

      // Add association if upgraded
      if (user.upgradeStatus === 'enabled' && user.association) {
        response.association = {
          id: user.association._id,
          name: user.association.name
        };
      }
    } 
    else if (user.role === 'volunteer') {
      // Volunteer fields
      response = {
        ...baseFields,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        address: user.address,
        badge: user.badge,
        association: user.association ? {
          id: user.association._id,
          name: user.association.name
        } : null,
        UserStatus: user.UserStatus,
        VolunteerStatus: user.VolunteerStatus
      };
    } 
    else {
      // Fallback (shouldn't normally happen)
      response = baseFields;
    }

    res.json(response);

  } catch (error) {
    console.error("Error fetching user:", error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({ message: "Error retrieving user" });
  }
});






router.patch('/UpdateProfile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, phone, address, oldPassword, newPassword, upgradeStatus, association } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent association changes for enabled volunteers
    if (user.role === 'volunteer' && user.VolunteerStatus === 'enabled' && association) {
      return res.status(403).json({ 
        message: "Cannot change association for enabled volunteers"
      });
    }

    // Password change validation
    if (newPassword) {
      if (!oldPassword) return res.status(400).json({ message: "Old password is required" });
      
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Association validation if upgrading
    if (upgradeStatus === 'enabled') {
      if (!association) return res.status(400).json({ message: "Association ID is required for upgrade" });
      
      const associationExists = await Association.exists({ _id: association });
      if (!associationExists) return res.status(400).json({ message: "Association not found" });
    }

    // Prepare updates
    const updates = {
      fullname,
      email,
      phone,
      address,
      upgradeStatus,
      // Only update association if not an enabled volunteer
      association: (user.role !== 'volunteer' || user.VolunteerStatus !== 'enabled') 
        ? (upgradeStatus === 'enabled' ? association : undefined)
        : user.association // Keep existing association
    };

    // Hash new password if provided
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    // Apply updates
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updates, 
      { 
        new: true,
        runValidators: true 
      }
    )
    .select('-password')
    .populate('association', '_id name');

    res.json(updatedUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error updating profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});






// Approve Volunteer (PATCH)
router.patch('/ApproveVolunteer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { badge } = req.body;
    const role = 'volunteer';
    const VolunteerStatus = 'enabled';
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if(user.role === 'volunteer') {
      return res.status(400).json({ message: "User is  already a volunteer" });
    }
    if(user.upgradeStatus === 'disabled') {
      return res.status(400).json({ message: "no application for this user" });
    }
    // Validate inputs
    if (badge && !['no badge yet', 'Bronze', 'Silver', 'Gold'].includes(badge)) {
      return res.status(400).json({ message: "Invalid badge value" });
    }

    const updatedVolunteer = await User.findByIdAndUpdate(
      id,
      { badge, VolunteerStatus ,role },
      { new: true }
    ).select('-password');
    res.json(updatedVolunteer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating volunteer" });
  }
});


// Approve Volunteer (PATCH)
router.patch('/VolunteerBadge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { badge } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if(user.role ==! 'volunteer') {
      return res.status(400).json({ message: "User is not a volunteer" });
    }
    if (badge && !['no badge yet', 'bronze', 'silver', 'gold'].includes(badge)) {
      return res.status(400).json({ message: "Invalid badge value" });
    }
    const updatedVolunteer = await User.findByIdAndUpdate(
      id,
      { badge},
      { new: true }
    ).select('-password');
    res.json({message : "badge updated successfully" , updatedVolunteer});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating volunteer" });
  }
});




// Disable Volunteer (PATCH)
router.patch("/VolunteerStatus/:id", apiKeyMiddleware, async (req, res) => {
  try {
    const { VolunteerStatus } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { VolunteerStatus },
      { 
        new: true,
        runValidators: true // Ensures the update respects schema validations
      }
    )
    .select('-password')
    .lean();

    if (!user || user.role !== 'volunteer') {
      return res.status(400).json({ 
        message: "User is not a volunteer or doesn't exist" 
      });
    }

    res.json({
      ...user,
      message: `Volunteer ${user.VolunteerStatus} successfully`,
    });

  } catch (error) {
    console.error("Disable Volunteer Error:", error);
    res.status(500).json({ 
      message: "Error disabling volunteer",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});




// Disable User
router.patch('/UserStatus/:id', apiKeyMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { UserStatus } = req.body;

    // Validate status
    if (!['enabled', 'disabled'].includes(UserStatus)) {
      return res.status(400).json({ message: "Invalid UserStatus" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { UserStatus },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user status" });
  }
});

module.exports = router;
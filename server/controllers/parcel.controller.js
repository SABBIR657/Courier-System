const Parcel = require("../models/parcel.model");
const User = require("../models/user.model")



const bookParcel = async (req, res) => {
  try {
    const { pickupAddress, deliveryAddress, parcelSize, parcelType, isPrepaid, codAmount } = req.body;

    const parcel = new Parcel({
      customer: req.user.id,
      pickupAddress,
      deliveryAddress,
      parcelSize,
      parcelType,
      isPrepaid,
      codAmount,
    });

    await parcel.save();
    res.status(201).json({ message: "Parcel booked successfully", parcel });
  } catch (error) {
    res.status(500).json({ message: "Failed to book parcel", error: error.message });
  }
};

const getMyParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ customer: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(parcels);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch parcels", error: error.message });
  }
};

const getAllParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find().populate("customer", "name email").populate("assignedAgent", "name email");
    res.status(200).json(parcels);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all parcels", error: error.message });
  }
};

const assignAgent = async (req, res)=>{
    try{
        const {parcelId, agentId} = req.body;

        const agent = await User.findById(agentId);
        if(!agent || agent.role !== "agent"){
            return res.status(400).json({message: "Invalid delivery agent"});
        }

        const updatedParcel = await Parcel.findByIdAndUpdate(
            parcelId,
            {assignedAgent:agentId},
            {new:true}
        ).populate("assignedAgent", "name email");

        res.status(200).json({message: "Agent assigned", parcel: updatedParcel});
    }catch(error){
        res.status(500).json({message: "failed to assign agent", error: error.message})
    }
}

const getAssignedParcels = async (req, res) =>{
    try{
        const parcels = await Parcel.find({assignedAgent: req.user.id}).sort({updatedAt: -1})
        res.status(200).json(parcels);
    } catch(error){
         res.status(500).json({ message: "Failed to fetch assigned parcels", error: error.message });
    }
}

const updateParcelStatus = async (req, res)=>{
    try{
        const {parcelId, status} = req.body;
        const allowedStatuses = ["Picked Up", "In Transit", "Delivered", "Failed"];

        if(!allowedStatuses.includes(status)){
            return res.status(400).json({message: "Invalid status"});
        }
        const parcel = await Parcel.findById(parcelId);

        if(!parcel){
            return res.status(404).json({message: "Parcel not found"})
        }

        if(!parcel.assignedAgent || parcel.assignedAgent.toString() !== req.user.id){
             return res.status(403).json({ message: "You are not assigned to this parcel" });
        }
        parcel.status = status;
        await parcel.save();

        res.status(200).json({message: "Status updated", parcel});
    } catch(error){
         res.status(500).json({ message: "Failed to update status", error: error.message });
    }
}

module.exports = { bookParcel, getMyParcels, getAllParcels, assignAgent, getAssignedParcels, updateParcelStatus };

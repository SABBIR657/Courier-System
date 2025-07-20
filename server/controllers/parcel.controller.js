const Parcel = require("../models/parcel.model");
const User = require("../models/user.model");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

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
    // --- MODIFICATION START ---
    // Populate the 'currentLocation' field to include it in the response
    const parcels = await Parcel.find({ customer: req.user.id })
      .select("+currentLocation") // Explicitly select currentLocation if it's set to `select: false` in your schema
      .sort({ createdAt: -1 });
    // --- MODIFICATION END ---
    res.status(200).json(parcels);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch parcels", error: error.message });
  }
};

const getAllParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find()
      .populate("customer", "name email")
      .populate("assignedAgent", "name email")
      .select("+currentLocation"); // Also include currentLocation for admin view
    res.status(200).json(parcels);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all parcels", error: error.message });
  }
};

const assignAgent = async (req, res) => {
  try {
    const { parcelId, agentId } = req.body;

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== "agent") {
      return res.status(400).json({ message: "Invalid delivery agent" });
    }

    const updatedParcel = await Parcel.findByIdAndUpdate(
      parcelId,
      { assignedAgent: agentId },
      { new: true }
    ).populate("assignedAgent", "name email");

    res.status(200).json({ message: "Agent assigned", parcel: updatedParcel });
  } catch (error) {
    res.status(500).json({ message: "failed to assign agent", error: error.message });
  }
};

const getAssignedParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ assignedAgent: req.user.id })
      .select("+currentLocation") // Agents also need to see the current location
      .sort({ updatedAt: -1 });
    res.status(200).json(parcels);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned parcels", error: error.message });
  }
};

const updateParcelStatus = async (req, res) => {
  try {
    const { parcelId, status } = req.body;
    const allowedStatuses = ["Picked Up", "In Transit", "Delivered", "Failed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    if (!parcel.assignedAgent || parcel.assignedAgent.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not assigned to this parcel" });
    }
    parcel.status = status;
    await parcel.save();

    res.status(200).json({ message: "Status updated", parcel });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

const updatedParcelLocation = async (req, res) => {
  try {
    const { parcelId, lat, lng } = req.body;

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) return res.status(404).json({ message: "Parcel not found" });

    if (!parcel.assignedAgent || parcel.assignedAgent.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not assigned to this parcel" });
    }

    parcel.currentLocation = { lat, lng };
    await parcel.save();

    //emit real-time update
    req.io.emit("location_update", {
      parcelId,
      lat,
      lng,
    });

    res.status(200).json({ message: "Location updated", parcel });
  } catch (error) {
    res.status(500).json({ message: "Failed to update location", error: error.message });
  }
};

const getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const totalBookingsToday = await Parcel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    const failedDeliveries = await Parcel.countDocuments({ status: "Failed" });

    const codTotal = await Parcel.aggregate([
      { $match: { isPrepaid: false } },
      { $group: { _id: null, total: { $sum: "$codAmount" } } },
    ]);

    res.json({
      totalBookingsToday,
      failedDeliveries,
      codAmount: codTotal[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard metrics", error: error.message });
  }
};

const exportCSV = async (req, res) => {
  try {
    const parcels = await Parcel.find().populate("customer assignedAgent", "name email");

    const parser = new Parser();
    const csv = parser.parse(
      parcels.map((p) => ({
        id: p._id,
        customer: p.customer?.name,
        pickup: p.pickupAddress,
        delivery: p.deliveryAddress,
        type: p.parcelType,
        size: p.parcelSize,
        status: p.status,
        isPrepaid: p.isPrepaid,
        codAmount: p.codAmount,
        assignedAgent: p.assignedAgent?.name,
        currentLocationLat: p.currentLocation?.lat, // Include latitude
        currentLocationLng: p.currentLocation?.lng, // Include longitude
      }))
    );

    res.header("Content-Type", "text/csv");
    res.attachment("parcels.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "CSV export failed", error: error.message });
  }
};

const exportPDF = async (req, res) => {
  try {
    const parcels = await Parcel.find().populate("customer assignedAgent", "name email");

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=parcels.pdf");
    doc.pipe(res);

    doc.fontSize(18).text("Parcel Report", { align: "center" });
    doc.moveDown();

    parcels.forEach((p) => {
      doc.fontSize(12).text(`ID: ${p._id}`);
      doc.text(`Customer: ${p.customer?.name}`);
      doc.text(`Pickup: ${p.pickupAddress}`);
      doc.text(`Delivery: ${p.deliveryAddress}`);
      doc.text(`Type: ${p.parcelType} | Size: ${p.parcelSize}`);
      doc.text(`Status: ${p.status} | COD: ${p.codAmount} (${p.isPrepaid ? "Prepaid" : "COD"})`);
      doc.text(`Agent: ${p.assignedAgent?.name || "Not assigned"}`);
      if (p.currentLocation && p.currentLocation.lat && p.currentLocation.lng) {
        doc.text(`Current Location: Lat ${p.currentLocation.lat}, Lng ${p.currentLocation.lng}`);
      }
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "PDF export failed", error: error.message });
  }
};

const getAllAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" }).select("name email phone createdAt");
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch agents", error: error.message });
  }
};

module.exports = {
  bookParcel,
  getMyParcels,
  getAllParcels,
  assignAgent,
  getAssignedParcels,
  updateParcelStatus,
  updatedParcelLocation,
  getDashboardMetrics,
  exportPDF,
  exportCSV,
  getAllAgents,
};
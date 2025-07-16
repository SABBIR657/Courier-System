const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middleware/auth.middleware");
const { bookParcel, getMyParcels, getAllParcels, assignAgent, getAssignedParcels,updateParcelStatus,updatedParcelLocation,getDashboardMetrics,exportPDF,exportCSV
 } = require("../controllers/parcel.controller");

// Customer: book a parcel
router.post("/book", verifyToken, checkRole("customer"), bookParcel);

// Customer: view their own parcels
router.get("/my", verifyToken, checkRole("customer"), getMyParcels);

// Admin: view all parcels
router.get("/", verifyToken, checkRole("admin"), getAllParcels);

//Admin: assign delivery agent to a parcel 
router.patch("/assign-agent", verifyToken, checkRole("admin"), assignAgent);

//Delivery Agent: view assigned parcel
router.get("/assigned", verifyToken, checkRole("agent"), getAssignedParcels);

//Delivery Agent: Update parcel status
router.patch("/status", verifyToken, checkRole("agent"),updateParcelStatus);

//Agent: Update live location
router.patch("/update-location", verifyToken,  checkRole("agent"), updatedParcelLocation);

// Admin: dashboard metrics
router.get("/dashboard/metrics", verifyToken, checkRole("admin"), getDashboardMetrics);

//admin: export csv
router.get("/export/csv", verifyToken, checkRole("admin"), exportCSV);

//admin: export pdf
router.get("/export/pdf", verifyToken, checkRole("admin"), exportPDF)



module.exports = router;

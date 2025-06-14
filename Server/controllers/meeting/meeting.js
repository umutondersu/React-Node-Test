const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');
const User = require('../../model/schema/user');

const add = async (req, res) => {
    try {
        req.body.createBy = req.user.userId; // Set creator from auth middleware
        const result = new MeetingHistory(req.body);
        await result.save();
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to create Meeting:', err);
        res.status(400).json({ err, error: 'Failed to create Meeting' });
    }
}

const index = async (req, res) => {
    try {
        const query = req.query;
        query.deleted = false;

        // Role-based access control (following account pattern)
        const user = await User.findById(req.user.userId);
        if (user?.role !== "superAdmin") {
            delete query.createBy;
            query.createBy = new mongoose.Types.ObjectId(req.user.userId);
        }

        const result = await MeetingHistory.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'createdByUser'
                }
            },
            {
                $lookup: {
                    from: 'Contact',
                    localField: 'attendes',
                    foreignField: '_id',
                    as: 'attendesData'
                }
            },
            {
                $lookup: {
                    from: 'Leads',
                    localField: 'attendesLead',
                    foreignField: '_id',
                    as: 'attendesLeadData'
                }
            },
            { $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true } },
            { $match: { 'createdByUser.deleted': false } },
            {
                $addFields: {
                    createdByName: { $concat: ['$createdByUser.firstName', ' ', '$createdByUser.lastName'] },
                    attendesCount: { $size: { $ifNull: ['$attendesData', []] } },
                    attendesLeadCount: { $size: { $ifNull: ['$attendesLeadData', []] } }
                }
            },
            {
                $project: {
                    createdByUser: 0,
                    attendesData: 0,
                    attendesLeadData: 0
                }
            }
        ]);

        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to fetch meetings:', err);
        res.status(400).json({ err, error: 'Failed to fetch meetings' });
    }
}

const view = async (req, res) => {
    try {
        let result = await MeetingHistory.findOne({ _id: req.params.id, deleted: false });
        if (!result) return res.status(404).json({ message: "Meeting not found." });

        let response = await MeetingHistory.aggregate([
            { $match: { _id: result._id } },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'createdByUser'
                }
            },
            {
                $lookup: {
                    from: 'Contact',
                    localField: 'attendes',
                    foreignField: '_id',
                    as: 'attendesData'
                }
            },
            {
                $lookup: {
                    from: 'Leads',
                    localField: 'attendesLead',
                    foreignField: '_id',
                    as: 'attendesLeadData'
                }
            },
            { $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    createdByName: { $concat: ['$createdByUser.firstName', ' ', '$createdByUser.lastName'] }
                }
            },
            {
                $project: {
                    createdByUser: 0
                }
            }
        ]);

        res.status(200).json(response[0]);
    } catch (err) {
        console.error('Failed to fetch meeting:', err);
        res.status(400).json({ err, error: 'Failed to fetch meeting' });
    }
}

const deleteData = async (req, res) => {
    try {
        const result = await MeetingHistory.findByIdAndUpdate(
            req.params.id, 
            { deleted: true },
            { new: true }
        );
        if (!result) return res.status(404).json({ message: "Meeting not found." });
        res.status(200).json({ message: "Meeting deleted successfully", result });
    } catch (err) {
        console.error('Failed to delete Meeting:', err);
        res.status(404).json({ message: "Error deleting meeting", err });
    }
}

const deleteMany = async (req, res) => {
    try {
        const result = await MeetingHistory.updateMany(
            { _id: { $in: req.body } }, 
            { $set: { deleted: true } }
        );
        res.status(200).json({ message: "Meetings deleted successfully", result });
    } catch (err) {
        console.error('Failed to delete meetings:', err);
        res.status(404).json({ message: "Error deleting meetings", err });
    }
}

module.exports = { add, index, view, deleteData, deleteMany }

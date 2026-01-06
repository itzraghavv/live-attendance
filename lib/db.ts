import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["teacher", "student"] },
  },
  {
    timestamps: true,
  }
);

const ClassSchema = new Schema({
  _id: ObjectId,
  className: String,
  teacherId: ObjectId,
  studentIds: [ObjectId],
});

const AttendanceSchema = new Schema({
  classId: ObjectId,
  studentId: ObjectId,
  status: { type: String, enum: ["present", "absent"] },
});

export const UserModel = mongoose.model("User", UserSchema);
export const ClassModel = mongoose.model("Class", ClassSchema);
export const AttendanceModel = mongoose.model("Attendance", AttendanceSchema);

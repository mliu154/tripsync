import mongoose, { Types, HydratedDocument } from 'mongoose';
interface TripLeg {
  cityEncrypted: string;
  startDateEncrypted: string;
  endDateEncrypted: string;
}

interface ITrip {
  userIds: Types.ObjectId[];
  legs: TripLeg[];
}
const TripObjSchema = new mongoose.Schema<ITrip>({
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  legs: [
    {
      cityEncrypted: String,
      startDateEncrypted: String,
      endDateEncrypted: String,
    },
  ],
});
export type TripDocument = HydratedDocument<ITrip>;
const TripObj =
  (mongoose.models.Trip as mongoose.Model<ITrip>) ||
  mongoose.model<ITrip>('Trip', TripObjSchema);
export default TripObj;
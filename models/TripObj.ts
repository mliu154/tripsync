import mongoose, { Types, HydratedDocument } from 'mongoose';

interface ITrip {
  nameEncrypted: string;
  userIds: Types.ObjectId[];
  legs: {
    cityEncrypted: string;
    startDateEncrypted: string;
    endDateEncrypted: string;
    noteEncrypted: string;
    attractions: { nameEncrypted: string; descriptionEncrypted: string }[];
  }[];
  hotels: {
    hotelNameEncrypted: string;
    checkInEncrypted: string;
    checkOutEncrypted: string;
  }[];
}

const TripObjSchema = new mongoose.Schema<ITrip>({
  nameEncrypted: { type: String, required: true },
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  legs: [
    {
      cityEncrypted: String,
      startDateEncrypted: String,
      endDateEncrypted: String,
      noteEncrypted: { type: String, default: "" },
      attractions: [
        {
          nameEncrypted: String,
          descriptionEncrypted: String,
        },
      ],
    },
  ],
  hotels: [
    {
      hotelNameEncrypted: String,
      checkInEncrypted: String,
      checkOutEncrypted: String,
    },
  ],
});

export type TripDocument = HydratedDocument<ITrip>;
const TripObj =
  (mongoose.models.Trip as mongoose.Model<ITrip>) ||
  mongoose.model<ITrip>('Trip', TripObjSchema);

export default TripObj;
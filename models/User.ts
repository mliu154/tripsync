import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  usernameEncrypted: string;
  usernameHash: string;
  password: string;
  totpSecret: string;
}
const UserSchema = new mongoose.Schema<IUser>({
  usernameEncrypted: {
    type: String,
    required: true,
  },
  usernameHash: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  totpSecret: {
    type: String,
    required: true,
  },
});
const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);

export default User;
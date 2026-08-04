import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import type { UpdateProfileInput, ChangePasswordInput } from "@/validations/user";

export class ServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function updateProfile(userId: string, { name, email }: UpdateProfileInput) {
  await connectDB();

  const emailTaken = await User.findOne({ email, _id: { $ne: userId } });
  if (emailTaken) {
    throw new ServiceError("This email is already in use by another account", 409);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
}

export async function changePassword(
  userId: string,
  { currentPassword, newPassword }: ChangePasswordInput
) {
  await connectDB();

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ServiceError("Current password is incorrect", 401);
  }

  user.password = newPassword; // re-hashed automatically by the pre-save hook
  await user.save();

  return { email: user.email };
}

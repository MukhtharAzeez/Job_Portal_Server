import { JobPostDocument } from './../../company-admin/schema/job-post-schema.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobPost } from 'src/company-admin/schema/job-post-schema.schema';
import { User, UserDocument } from '../schemas/user.schema';
import {
  UserRequests,
  UserRequestsDocument,
} from 'src/requests/schema/userRequests.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(JobPost.name) private jobModel: Model<JobPostDocument>,
    @InjectModel(UserRequests.name)
    private userRequestModel: Model<UserRequestsDocument>,
  ) {}

  async find(): Promise<User[]> {
    return this.userModel.find({});
  }

  async getCurrentUserProfile(userId: string): Promise<User> {
    return this.userModel.findOne({ _id: userId });
  }

  async updateProfile(userDetails: any): Promise<User> {
    const {
      firstName,
      lastName,
      email,
      image,
      resume,
      DOB,
      mobile,
      gender,
      address,
      city,
      country,
      postalCode,
    } = userDetails;

    let { qualifications } = userDetails;
    qualifications = JSON.parse(qualifications);

    let { skills } = userDetails;
    skills = JSON.parse(skills);

    await this.userModel.updateOne(
      { _id: userDetails.userId },
      {
        $set: {
          firstName,
          lastName,
          email,
          image,
          resume,
          DOB,
          mobile,
          gender,
          address,
          city,
          country,
          postalCode,
          qualifications,
          skills,
        },
      },
    );
    return null;
  }

  async getUserByEmail(email: string) {
    return this.userModel.findOne({ email: email });
  }

  async connectFriend(userId: string, friendId: string): Promise<boolean> {
    const alreadyConnected = await this.userModel.findOne({
      _id: userId,
      friends: { $in: [new Types.ObjectId(friendId)] },
    });
    if (!alreadyConnected) {
      await this.userModel.updateOne(
        { _id: userId },
        {
          $push: {
            friends: new Types.ObjectId(friendId),
          },
        },
      );
      await this.userModel.updateOne(
        { _id: friendId },
        {
          $push: {
            friends: new Types.ObjectId(userId),
          },
        },
      );
      return true;
    } else {
      await this.userModel.updateOne(
        { _id: userId },
        {
          $pull: {
            friends: new Types.ObjectId(friendId),
          },
        },
      );
      await this.userModel.updateOne(
        { _id: friendId },
        {
          $pull: {
            friends: new Types.ObjectId(userId),
          },
        },
      );
    }
    return false;
  }

  async userFriends(userId: string): Promise<User[]> {
    const friends = await this.userModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(userId) },
      },
      {
        $unwind: {
          path: '$friends',
        },
      },
      {
        $project: {
          friends: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'friends',
          foreignField: '_id',
          as: 'friends',
        },
      },
      {
        $project: {
          friend: { $arrayElemAt: ['$friends', 0] },
        },
      },
    ]);
    return friends;
  }

  async getUserNotifications(userId: string): Promise<UserRequests[]> {
    return this.userRequestModel
      .find({ user: userId })
      .populate('company')
      .populate('job')
      .sort({ createdAt: -1 });
  }
}

import { JobApplicantDocument } from './../schema/job-applicants.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JobApplicant } from '../schema/job-applicants.schema';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class JobApplicantRepository {
  constructor(
    @InjectModel(JobApplicant.name)
    private jobApplicantModel: Model<JobApplicantDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async applyForJob(jobId: string, userId: string): Promise<boolean> {
    // To check the user have a resume
    const userResume = await this.userModel.findOne({ _id: userId });
    if (userResume.resume.length == 0)
      throw new HttpException(
        'Please update your profile with your Resume !',
        HttpStatus.BAD_REQUEST,
      );
    // To check the user is already applied or not
    const alreadyApplied = await this.jobApplicantModel.findOne({
      jobId: jobId,
      applicantId: userId,
    });
    if (alreadyApplied)
      throw new HttpException(
        'You already applied to this Job !',
        HttpStatus.BAD_REQUEST,
      );
    // To add the user as an applicant
    const newApplicant = await new this.jobApplicantModel({
      jobId: jobId,
      applicantId: userId,
    });
    await newApplicant.save();
    return true;
  }

  async getAllApplicants(jobId: string): Promise<User[]> {
    return this.jobApplicantModel
      .find({ jobId: jobId })
      .populate('applicantId');
  }

  async rejectApplicant(applicantId: string, jobId: string): Promise<boolean> {
    await this.jobApplicantModel.updateOne(
      { jobId: jobId, applicantId: applicantId },
      {
        $set: {
          accepted: false,
        },
      },
    );
    return true;
  }

  async acceptApplicant(applicantId: string, jobId: string): Promise<boolean> {
    await this.jobApplicantModel.updateOne(
      { jobId: jobId, applicantId: applicantId },
      {
        $set: {
          accepted: true,
        },
      },
    );
    return true;
  }

  async acceptApplicantAndSchedule(
    formData: any,
    applicantId: string,
    jobId: string,
    adminId: string,
  ): Promise<boolean> {
    // await this.companyAdminModel.findOne({
    //   _id: adminId,
    // });

    // Update the jobPost by applicant information if it is a online interview
    if (formData.onlineInterviewDate) {
      const { onlineInterviewDate, onlineInterviewTime } = formData;
      await this.jobApplicantModel.updateOne(
        { jobId: jobId, applicantId: applicantId },
        {
          $set: {
            accepted: true,
            online: {
              date: onlineInterviewDate,
              time: onlineInterviewTime,
              completed: false,
              adminApproved: false,
              userAccepted: false,
              scheduledAdmin: new Types.ObjectId(adminId),
            },
          },
        },
      );
    }

    // Update the jobPost by applicant information if it is a offline interview
    if (formData.offlineInterviewDate) {
      const {
        offlineInterviewDate,
        offlineInterviewTime,
        offlineInterviewPlace,
      } = formData;
      await this.jobApplicantModel.updateOne(
        { jobId: jobId, applicantId: applicantId },
        {
          $set: {
            accepted: true,
            offline: {
              date: offlineInterviewDate,
              time: offlineInterviewTime,
              place: offlineInterviewPlace,
              completed: false,
              adminApproved: false,
              userAccepted: false,
              scheduledAdmin: new Types.ObjectId(adminId),
            },
          },
        },
      );
    }
    // Update the jobPost by applicant information if admin directly hire the user
    if (formData.directHire) {
      await this.jobApplicantModel.updateOne(
        { jobId: jobId, applicantId: applicantId },
        {
          $set: {
            accepted: true,
            hired: {
              hire: true,
              adminApproved: false,
              userAccepted: false,
              hiredAdmin: new Types.ObjectId(adminId),
            },
          },
        },
      );
    }
    return true;
  }
}
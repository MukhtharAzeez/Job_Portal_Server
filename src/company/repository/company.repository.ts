import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { CompanyDocument } from '../schema/company.schema';
import { Company } from '../schema/company.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import {
  CompanyAdmin,
  CompanyAdminDocument,
} from 'src/company-admin/schema/company-admin.schema';
import { CompanyAdminDto } from 'src/company-admin/dto/companyAdmin.dto';
import {
  JobPost,
  JobPostDocument,
} from 'src/company-admin/schema/job-post-schema.schema';
import {
  CompanyRequests,
  CompanyRequestsDocument,
} from 'src/requests/schema/companyRequests';

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(CompanyAdmin.name)
    private companyAdminModel: Model<CompanyAdminDocument>,
    @InjectModel(JobPost.name)
    private jobPostModel: Model<JobPostDocument>,
    @InjectModel(CompanyRequests.name)
    private companyRequestModel: Model<CompanyRequestsDocument>,
  ) {}

  async addAdmin(companyAdminDto: CompanyAdminDto): Promise<any> {
    const adminExist = await this.companyAdminModel.findOne({
      email: companyAdminDto.email,
    });
    if (adminExist) {
      throw new BadRequestException('An Admin already exists with this email');
    }
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const passwordLength = 8;
    let password = '';

    for (let i = 0; i < passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
    const newPassword = await argon2.hash(password);
    companyAdminDto.status = true;
    companyAdminDto.password = newPassword;
    const newAdmin = new this.companyAdminModel(companyAdminDto).save();
    (await newAdmin).password = password;
    return newAdmin;
  }

  async getAllCompanyAdmins(
    companyId: string,
    limit: number,
    skip: number,
  ): Promise<CompanyAdmin[]> {
    return this.companyAdminModel
      .find({ company: companyId })
      .skip(skip * limit)
      .limit(limit);
  }

  async getCountCompanyAdmins(companyId: string): Promise<number> {
    return this.companyAdminModel.find({ company: companyId }).count();
  }

  async getJobPosts(limit: number, skip: number): Promise<JobPost[]> {
    return this.jobPostModel
      .find({})
      .skip(skip * limit)
      .limit(limit)
      .populate('companyId')
      .sort({ createdAt: -1 });
  }

  async getAllRequests(companyId: string): Promise<CompanyRequests[]> {
    if (companyId == 'null') {
      throw new HttpException('Please try again', HttpStatus.BAD_REQUEST);
    }
    return this.companyRequestModel
      .find({ company: companyId })
      .populate('company')
      .populate('admin')
      .populate('job');
  }
}

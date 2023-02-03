import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/schemas/user.schema';
import { JobApplicantsService } from '../service/job-applicants.service';

@Controller('jobApplicant')
export class JobApplicantsController {
  constructor(private jobApplicantService: JobApplicantsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/applyForJob')
  async applyForJob(
    @Query() object: { jobId: string; userId: string },
  ): Promise<boolean> {
    if (
      !object.jobId ||
      object.jobId == 'undefined' ||
      !object.userId ||
      object.userId == 'undefined'
    )
      throw new HttpException('An Error occurred', HttpStatus.BAD_REQUEST);
    return this.jobApplicantService.applyForJob(object.jobId, object.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/getAllApplicants')
  async getAllApplicants(@Query() object: { jobId: string }): Promise<User[]> {
    if (object.jobId == 'undefined' || !object.jobId)
      throw new HttpException('An Error Occurred', HttpStatus.BAD_REQUEST);
    return this.jobApplicantService.getAllApplicants(object.jobId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/rejectApplicant')
  async rejectApplicant(
    @Query() object: { applicantId: string; jobId: string },
  ): Promise<boolean> {
    if (
      !object.jobId ||
      object.jobId == 'undefined' ||
      !object.applicantId ||
      object.applicantId == 'undefined'
    )
      throw new HttpException('An Error occurred', HttpStatus.BAD_REQUEST);
    return this.jobApplicantService.rejectApplicant(
      object.applicantId,
      object.jobId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/acceptApplicant')
  async acceptApplicant(
    @Query() object: { applicantId: string; jobId: string },
  ): Promise<boolean> {
    if (
      !object.jobId ||
      object.jobId == 'undefined' ||
      !object.applicantId ||
      object.applicantId == 'undefined'
    )
      throw new HttpException('An Error occurred', HttpStatus.BAD_REQUEST);
    return this.jobApplicantService.acceptApplicant(
      object.applicantId,
      object.jobId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/acceptApplicant')
  async acceptApplicantAndSchedule(
    @Body() formData: any,
    @Query() object: { jobId: string; applicantId: string; adminId: string },
  ): Promise<boolean> {
    if (!object.applicantId || !object.jobId || !object.adminId)
      throw new HttpException('An Error occurred', HttpStatus.BAD_REQUEST);
    return this.jobApplicantService.acceptApplicantAndSchedule(
      formData,
      object.applicantId,
      object.jobId,
      object.adminId,
    );
  }
}

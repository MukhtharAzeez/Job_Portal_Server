import { JobApplicantRepository } from './repository/job-applicants.repository';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { JobApplicantsController } from './controller/job-applicants.controller';
import {
  JobApplicant,
  JobApplicantsSchema,
} from './schema/job-applicants.schema';
import { JobApplicantsService } from './service/job-applicants.service';
import {
  CompanyRequests,
  CompanyRequestsSchema,
} from 'src/requests/schema/companyRequests';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: JobApplicant.name, schema: JobApplicantsSchema },
      { name: CompanyRequests.name, schema: CompanyRequestsSchema },
    ]),
  ],
  controllers: [JobApplicantsController],
  providers: [JobApplicantsService, JobApplicantRepository],
})
export class JobApplicantsModule {}

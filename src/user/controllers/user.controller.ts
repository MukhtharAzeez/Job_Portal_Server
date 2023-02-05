import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { User } from 'src/user/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from '../dto/updateUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRequests } from 'src/requests/schema/userRequests.schema';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  async getCurrentUserProfile(
    @Query() object: { userId: string },
  ): Promise<User> {
    if (object.userId == 'null')
      throw new HttpException('Ann error occurred', HttpStatus.ACCEPTED);
    return this.userService.getCurrentUserProfile(object.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/updateProfile')
  async updateProfile(@Body() updateUserDto: UpdateUserDto): Promise<User> {
    if (!updateUserDto.userId)
      throw new HttpException('Must provide user Id', HttpStatus.BAD_REQUEST);
    return this.userService.updateProfile(updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/allUsers')
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/findByEmail')
  async getUserByEmail(@Query() email: { email: string }) {
    return this.userService.getUserByEmail(email.email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/sendFriendRequest')
  async sendFriendRequest(
    @Query() object: { userId: string; friendId: string },
  ): Promise<boolean> {
    return this.userService.connectFriend(object.userId, object.friendId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/userFriends')
  async userFriends(@Query() object: { userId: string }): Promise<User[]> {
    if (object.userId == 'null')
      throw new HttpException('Ann error occurred', HttpStatus.ACCEPTED);
    return this.userService.userFriends(object.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/getUserNotifications')
  async getUserNotifications(
    @Query() object: { userId: string },
  ): Promise<UserRequests[]> {
    if (!object.userId || object.userId == 'undefined')
      throw new HttpException('An Error occurred', HttpStatus.CONFLICT);
    return this.userService.getUserNotifications(object.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/userAcceptSchedule')
  async userAcceptSchedule(
    @Query() object: { requestId: string },
  ): Promise<boolean> {
    console.log(object);
    if (!object.requestId || object.requestId == 'undefined')
      throw new HttpException('An Error occurred', HttpStatus.CONFLICT);
    return this.userService.userAcceptSchedule(object.requestId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/userRejectSchedule')
  async userRejectSchedule(
    @Query() object: { requestId: string },
  ): Promise<boolean> {
    if (!object.requestId || object.requestId == 'undefined')
      throw new HttpException('An Error occurred', HttpStatus.CONFLICT);
    return this.userService.userRejectSchedule(object.requestId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/userRequestToChangeTime')
  async userRequestToChangeTime(
    @Query() object: { requestId: string },
  ): Promise<boolean> {
    if (!object.requestId || object.requestId == 'undefined')
      throw new HttpException('An Error occurred', HttpStatus.CONFLICT);
    return this.userService.userRequestToChangeTime(object.requestId);
  }
}

/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({
  timestamps: true,
})
export class Chat {
  @Prop({ required: true })
  members: Array<Types.ObjectId>;

  @Prop({ required: true })
  type: string;

  @Prop({ })
  lastMessage: string;

  @Prop({ })
  unSeenMessages: Array<string>
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

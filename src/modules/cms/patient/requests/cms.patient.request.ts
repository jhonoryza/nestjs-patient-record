import { Field, InputType, Int } from '@nestjs/graphql';
import { EChangeType, EGender } from '@utils/enum';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class PatientListArgs {
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page!: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;
}

@InputType()
export class CreateDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  idCard!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  diagnosis!: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  birthDate!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  gender!: EGender;

  @Field()
  @IsNotEmpty()
  @IsEnum(EChangeType)
  changeType: EChangeType;
}

@InputType()
export class IdInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id!: string;
}

@InputType()
export class UpdateDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  diagnosis!: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  birthDate!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  gender!: EGender;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  medicalNotes?: string;
}

@InputType()
export class RollbackDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  versionId!: string;
}

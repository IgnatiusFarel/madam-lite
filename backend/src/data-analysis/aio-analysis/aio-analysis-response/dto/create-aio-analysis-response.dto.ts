import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";
import { CreateCompanyInformationDto } from "../../company-information/dto/create-company-information.dto";
import { CreateDemographResponseDto } from "./create-demograph-response.dto";
import { CreatePsychographResponseDto } from "./create-psychograph-response.dto";

export class CreateAioAnalysisResponseDto {
    user_id: number;

    @IsString()
    additional_notes: string;

    @ValidateNested()
    @Type(() => CreateCompanyInformationDto)
    company_information: CreateCompanyInformationDto;

    @ValidateNested({ each: true })
    @Type(() => CreateDemographResponseDto)
    demograph: CreateDemographResponseDto[];

    @ValidateNested({ each: true })
    @Type(() => CreatePsychographResponseDto)
    psychograph: CreatePsychographResponseDto[];
}

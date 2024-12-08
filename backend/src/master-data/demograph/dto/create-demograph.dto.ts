import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateDemographOptionDto } from "./create-demograph-option.dto";
import { Type } from "class-transformer";

export class CreateDemographDto {
    @IsNotEmpty()
    @IsString()
    parameter_name: string;

    @IsOptional()
    @IsString()
    custom_result_parameter: string;

    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateDemographOptionDto)
    list_of_options: CreateDemographOptionDto[];
}

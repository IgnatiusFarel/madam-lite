import { IsNotEmpty, IsString } from "class-validator";

export class CreateCompanyInformationDto {
    aio_analysis_response_id: number;
    company_information_id: number;
    contact_person_id: number;

    @IsNotEmpty()
    @IsString()
    company_name: string;
    @IsNotEmpty()
    @IsString()
    industry: string;
    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    full_name: string;
    @IsNotEmpty()
    @IsString()
    email_address: string;
    @IsNotEmpty()
    @IsString()
    position_or_title: string;
    @IsNotEmpty()
    @IsString()
    phone_number: string;
}
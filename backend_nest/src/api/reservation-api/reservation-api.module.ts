import { Module } from '@nestjs/common';
import { ReservationApiController } from './reservation-api.controller';
import { ReservationApiService } from './reservation-api.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { EumcRsvNotMeEumcEntity } from "../../entities/eumc-rsv-not-me.eumc-entity";
import { EmrSoapApiService } from "../emr-soap-api/emr-soap-api.service";
import { EmrSoapApiModule } from "../emr-soap-api/emr-soap-api.module";
import { EumcWaitingMeddeptEumcEntity } from "../../entities/eumc-waiting-meddept.eumc-entity";

@Module({
  imports:[
    EmrSoapApiModule,
    TypeOrmModule.forFeature([EumcRsvNotMeEumcEntity], 'eumc_pay'),
    TypeOrmModule.forFeature([EumcWaitingMeddeptEumcEntity], 'eumc_pay'),
  ],
  controllers: [ReservationApiController],
  providers: [ReservationApiService],
  exports: [TypeOrmModule, ReservationApiService],
})
export class ReservationApiModule {}

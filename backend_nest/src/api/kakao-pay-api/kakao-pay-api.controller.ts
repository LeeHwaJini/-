import { Body, Controller, Get, Logger, Post, Query, Redirect, Render, Req, Session } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { KakaoPayApiService } from "./kakao-pay-api.service";
import { ResponseDto } from "../../common/dto/response.dto";
import { ApiResult } from "../../const/api-result.const";

@Controller('api/v1/kakao-pay')
@ApiTags('카카오페이 API')
export class KakaoPayApiController {
  private readonly logger = new Logger(KakaoPayApiController.name);



  constructor(private readonly  kakaoPayApiService: KakaoPayApiService) {

  }

  @Post('/ready')
  @Redirect('https://app.eumc.ac.kr', 302)
  @ApiOperation({ summary: '결재 정보 입력 - 페이머니' })
  async kakaoReady(@Body('his_hsp_tp_cd') his_hsp_tp_cd: string,
                   @Body('alimtalk_user_key') alimtalk_user_key: string,
                   @Body('pat_no') pat_no: string,
                   @Body('rcptype') rcptype: string,
                   @Body('payFlag') payFlag: string,
                   @Body('payStore') payStore: string,
                   @Body('meddept') meddept: string,
                   @Body('spcdryn') spcdryn: string,
                   @Body('medtype') medtype: string,
                   @Body('meddr') meddr: string,
                   @Body('pattype') pattype: string,
                   @Body('typecd') typecd: string,
                   @Body('insurt') insurt: string,
                   @Body('custcd') custcd: string,
                   @Body('custinf') custinf: string,
                   @Body('rateinf') rateinf: string,
                   @Body('inordcd') inordcd: string,
                   @Body('meddate') meddate: string,
                   @Body('admdate') admdate: string,
                   @Body('savedata') savedata: string,
                   @Body('emailChk') emailChk: string,
                   @Body('emailSaveYN') emailSaveYN: string,
                   @Session() session: Record<string, any>
                   ) {
    this.logger.debug(`결재 정보 입력 - 페이머니`);

    if(emailSaveYN == 'Y'){
      //TODO: EMAIL 업데이트
    }


    let result = await this.kakaoPayApiService
      .kakaoPayReady(his_hsp_tp_cd, alimtalk_user_key, pat_no, payFlag, rcptype, payStore,
        meddept, spcdryn, medtype, meddr, pattype, typecd, insurt, custcd, custinf, rateinf, inordcd, meddate, admdate, emailChk)

    session.kakao_data = {
      his_hsp_tp_cd: his_hsp_tp_cd,
      pat_no: pat_no,
      partner_order_id: result.partner_order_id,
      tid: result.tid,
      email: emailChk
    }

    return { url: result.redirect_url + '?tid=' + result.tid };
  }

  @Render('kakaopay_fail')
  @Get('/fail')
  @ApiOperation({ summary: '결재 정보 입력 - 페이머니' })
  async kakaoPayReadyFail(body: any) {
    this.logger.debug(`결재 정보 입력 - 페이머니 : ${JSON.stringify(body)}`);
    const resp = new ResponseDto();

    this.logger.debug(`결재 정보 입력 - 페이머니`);
    resp.setErrorWithMsg(ApiResult.UNKNOWN_ERROR, "카카오페이 결제가 실패하었습니다.");
    return resp;
  }

  @Render('kakaopay_cancel')
  @Get('/cancel')
  @ApiOperation({ summary: '결재 정보 입력 - 페이머니' })
  async kakaoPayReadyCancel(body: any) {
    this.logger.debug(`결재 정보 입력 - 페이머니 : ${JSON.stringify(body)}`);
    const resp = new ResponseDto();

    this.logger.debug(`결재 정보 입력 - 페이머니`);
    resp.setErrorWithMsg(ApiResult.UNKNOWN_ERROR, "카카오페이 결제가 취소되었습니다.");
    return resp;

  }


  @Render('kakaopay_success')
  @Get('/approval')
  @ApiOperation({ summary: '결재 정보 입력 - 페이머니' })
  async kakaoApproval(@Query('pg_token') pg_token: string,
                      @Session() session: Record<string, any>

  ) {
    const resp = new ResponseDto();
    this.logger.debug(`결재 정보 입력 - 페이머니`);

    let {his_hsp_tp_cd, pat_no, partner_order_id, tid, email} = session.kakao_data;

    this.logger.debug(`KAKAO APRROVE SESSION : ${JSON.stringify(session.kakao_data)}`);

    let result = await this.kakaoPayApiService.kakaoPayApproval(his_hsp_tp_cd, pat_no, partner_order_id, tid, pg_token, email);
    resp.setSuccess(result, "카카오페이 결제가 완료되었습니다.");
    return result;
  }

  @Post('/approval-cancel')
  @ApiOperation({ summary: '결재 정보 갱신 - 취소' })
  async getPayCancelHistory() {
    this.logger.debug(`결재 취소 정보 조회`);
  }




}

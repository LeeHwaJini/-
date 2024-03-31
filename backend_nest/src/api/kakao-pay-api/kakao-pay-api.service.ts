import { Injectable,
Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { CrytoUtil } from "../../utils/cryto.util";
import { PaymentApiService } from "../payment-api/payment-api.service";
import { InjectRepository } from "@nestjs/typeorm";
import { EumcPayEumcEntity } from "../../entities/eumc-pay.eumc-entity";
import { Repository } from "typeorm";
import { EumcKakaopayEumcEntity } from "../../entities/eumc-kakaopay.eumc-entity";
import { CommonCodeConst, RCP_TYPE } from "../../const/common-code.const";
import * as moment from "moment-timezone";
import axios, { AxiosError } from "axios";
import { catchError, firstValueFrom, lastValueFrom } from "rxjs";

@Injectable()
export class KakaoPayApiService {
  private readonly logger = new Logger(KakaoPayApiService.name);

  constructor(
    private httpService: HttpService,
    private paymentApiService: PaymentApiService,
    @InjectRepository(EumcKakaopayEumcEntity,
"eumc_pay")
    private kakaopayEumcEntityRepo: Repository<EumcKakaopayEumcEntity>,
  ) {
  }


  /**
   * 카카오페이 결제 준비
   * @param payFlag
   * @param rcptype
   * @param payStore
   * @param meddept
   * @param spcdryn
   * @param medtype
   * @param meddr
   * @param pattype
   * @param typecd
   * @param insurt
   * @param custcd
   * @param custinf
   * @param rateinf
   * @param inordcd
   * @param meddate
   * @param admdate
   * @param email
   */
  async kakaoPayReady(
    his_hsp_tp_cd: string,
    alimtalk_user_key: string,
    pat_no: string,

    payFlag: string,
    rcptype: string,
    payStore: string,
    meddept: string,
    spcdryn: string,
    medtype: string,
    meddr: string,
    pattype: string,
    typecd: string,
    insurt: string,
    custcd: string,
    custinf: string,
    rateinf: string,
    inordcd: string,
    meddate: string,
    admdate: string,
    email: string
  ) {

    try {
      let partner_order_id = moment().format('yyyyMMDDHHmmss');

      let reqBody = {
        cid: '',
        available_cards: null,
        partner_order_id: pat_no + partner_order_id,
        partner_user_id: "EumcMD",
        item_code: null,
        item_name: null,

        quantity: '1',
        total_amount: payStore.replace(",", ""),
        tax_free_amount: '0',
        payment_method_type: (Number(payStore) > 2000000 ? "CARD" : null),
        approval_url: null,
        fail_url: null,
        cancel_url: null,
      }

      if (his_hsp_tp_cd == CommonCodeConst.HIS_HSP_TP_CD_SEOUL) {
        reqBody.cid = 'TC0ONETIME';//CommonCodeConst.KAKAO_CID_SEOUL;
        reqBody.available_cards = ["SHINHAN", "KB", "HYUNDAI", "LOTTE", "SAMSUNG", "NH", "BC", "CITI", "KAKAOBANK", "KAKAOPAY", "WOORI", "GWANGJU", "SUHYUP", "SHINHYUP", "JEONBUK", "JEJU", "SC"]

      } else if (his_hsp_tp_cd == CommonCodeConst.HIS_HSP_TP_CD_SEOUL) {
        reqBody.cid = 'TC0ONETIME';//CommonCodeConst.KAKAO_CID_MOKDONG;
      }

      /**
       *   INOUT_MID = '2', // 입퇴원 중간비
       *   INOUT_FINAL = '3', // 퇴원비
       *   RSV_PAY = '4', // 진료예약 예약비
       *   HISTORY_TALK_PAY = '5', // 문진표 작성(스마트서베이)
       *   REQ_CERTIFICATION = '6', // 증명서 신청
       *   RSV_MEDICINE_PAY = '7', // 예약 조제비 결제
       */
      reqBody.item_code = rcptype;
      if (alimtalk_user_key == null || alimtalk_user_key == '') {
        // reqBody.cancel_url = 'https://app.eumc.ac.kr' + "/api/v1/kakao-pay/cancel";
        // reqBody.approval_url = 'https://app.eumc.ac.kr' + "/api/v1/kakao-pay/approval";
        // reqBody.fail_url = 'https://app.eumc.ac.kr' + "/api/v1/kakao-pay/fail";

        reqBody.cancel_url = 'https://test-pay.eumc.ac.kr' + "/api/v1/kakao-pay/cancel";
        reqBody.approval_url = 'https://test-pay.eumc.ac.kr' + "/api/v1/kakao-pay/approval";
        reqBody.fail_url = 'https://test-pay.eumc.ac.kr' + "/api/v1/kakao-pay/fail";
      } else {
        reqBody.cancel_url = 'https://test-pay.eumc.ac.kr' + "/api/v1/kakao-pay/cancel";
        reqBody.approval_url = 'https://test-pay.eumc.ac.kr' + "/api/v1/kakao-pay/approval";
        reqBody.fail_url = 'https://test-pay.eumc.ac.kr' + "/api/v1/kakao-pay/fail";
      }

      switch (rcptype) {
        case RCP_TYPE.OUT_PATIENT: {
          reqBody.item_name = '외래수납';
        }
          break;
        case RCP_TYPE.INOUT_MID: {
          reqBody.item_name = '입원중간비 수납';
        }
          break;
        case RCP_TYPE.INOUT_FINAL: {
          reqBody.item_name = '퇴원비 수납';
        }
          break;
        case RCP_TYPE.REQ_CERTIFICATION: {
          reqBody.item_name = '증명서 신청';
        }
          break;
        case RCP_TYPE.RSV_MEDICINE_PAY: {
          reqBody.item_name = '예약 조제비 결제';
        }
          break;
      }

      // const result$ = await this.httpService.post(
      //   `https://kapi.kakao.com/v1/payment/ready`,
      //   reqBody,
      //   {
      //     headers: {
      //       Authorization: "KakaoAK " + "c4aeff4192f52fef5b2ddfc090104e7e",
      //       'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      //       Accept: 'application/json',
      //     },
      //   },
      // );
      //
      // const callResp = await lastValueFrom(result$);

      const { data } = await lastValueFrom(
        this.httpService.post(`https://kapi.kakao.com/v1/payment/ready`, reqBody, {
          headers: {
            // Authorization: "KakaoAK " + "c4aeff4192f52fef5b2ddfc090104e7e",
            Authorization: "KakaoAK " + "359e60db812962a943dbd62d667d4f75",
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw error;
          }),
        ),
      ).finally(()=>{
        this.logger.debug(`KAKAO READY SEND`)
      });

      this.logger.debug(`KAKAO READY RESP : ${JSON.stringify(data)}`)


      // this.kakaopayEumcEntityRepo.save({
      //   tid: data.tid,
      //   partner_order_id: data.partner_order_id,
      // } as EumcKakaopayEumcEntity)


      return {
        tid: data.tid,
        partner_order_id: reqBody.partner_order_id,
        item_name: rcptype,
        redirect_url: data.next_redirect_mobile_url
      };

      // return await fetch('https://kapi.kakao.com/v1/payment/ready', {
      //   method: 'POST',
      //   headers: {
      //     Authorization: "KakaoAK " + "c4aeff4192f52fef5b2ddfc090104e7e",
      //     'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      //   },
      //   body: JSON.stringify(reqBody),
      // })
      // .then(response => {
      //   return response.json();
      // })
      // .then(callResp => {
      //   this.logger.debug(`KAKAO READY OK : ${JSON.stringify(callResp)}`)
      //    return { tid: callResp.data.tid,
      //      partner_order_id: callResp.data.partner_order_id,
      //      item_name: rcptype,
      //      redirect_url: callResp.data.next_redirect_mobile_url}
      // })
    } catch (e) {
      this.logger.error(`KAKAO PAY ERROR : ${e}`);
      throw e;
    }
  }







  /**
   * 카카오페이 결제 진행
   * @param his_hsp_tp_cd
   * @param pat_no
   * @param tid
   * @param partner_order_id
   * @param pg_token
   * @param emailChk
   */
  async kakaoPayApproval(
    his_hsp_tp_cd: string,
    pat_no: string,
    partner_order_id: string,
    tid: string,
    pg_token: string,
    emailChk?: string
  ) {

    try{
      let reqBody = {
        cid: '',
        partner_user_id: "EumcMD",
        partner_order_id: partner_order_id,
        pg_token: pg_token,
        tid: tid
      }

      if (his_hsp_tp_cd == CommonCodeConst.HIS_HSP_TP_CD_SEOUL) {
        reqBody.cid = 'TC0ONETIME';//CommonCodeConst.KAKAO_CID_SEOUL;
      } else if (his_hsp_tp_cd == CommonCodeConst.HIS_HSP_TP_CD_SEOUL) {
        reqBody.cid = 'TC0ONETIME';//CommonCodeConst.KAKAO_CID_MOKDONG;
      }


      const { data } = await lastValueFrom(
        this.httpService.post(`https://kapi.kakao.com/v1/payment/approve`, reqBody, {
          headers: {
            // Authorization: "KakaoAK " + "c4aeff4192f52fef5b2ddfc090104e7e",
            Authorization: "KakaoAK " + "359e60db812962a943dbd62d667d4f75",
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw error;
          }),
        ),
      ).finally(()=>{
        this.logger.debug(`KAKAO APRROVE SEND`)
      });


      /**
       * {"aid":"A44933aa5b8c2c026ee5",
       * "tid":"T44933a541ce0891c833",
       * "cid":"TC0ONETIME",
       * "partner_order_id":"1581861420230426232229",
       * "partner_user_id":"EumcMD",
       * "payment_method_type":"MONEY",
       * "item_name":"외래수납",
       * "item_code":"1",
       * "quantity":1,
       * "amount":{"total":1100,"tax_free":0,"vat":100,"point":0,"discount":0,"green_deposit":0},
       * "created_at":"2023-04-26T23:22:29",
       * "approved_at":"2023-04-26T23:22:37"}
       * "card_info":{"approved_id":"11111111",
       * "bin":"111111",
       * "card_mid":"111111",
       * "card_type":"신용",
       * "install_month":"00",
       * "issuer_corp":"신한카드",
       * "issuer_corp_code":"05",
       * "purchase_corp":"신한카드",
       * "purchase_corp_code":"05",
       * "card_item_code":"111111",
       * "interest_free_install":"N",
       * "kakaopay_purchase_corp":"신한",
       * "kakaopay_purchase_corp_code":"101",
       * "kakaopay_issuer_corp":"신한",
       * "kakaopay_issuer_corp_code":"101"}
       */
      this.logger.debug(`KAKAO APPROVE RESP : ${JSON.stringify(data)}`)


      if(data != null) {
          let amount = data.amount;
          // data.total = amount.total;
          data.tax_free = amount.tax_free;
          data.vat = amount.vat;
          // data.point = amount.point;
          // data.discount = amount.discount;
          // data.green_deposit = amount.green_deposit;
          data.amount = amount.total;

          const db_resp = await this.kakaopayEumcEntityRepo.save({
            tid: data.tid,
            cid: data.cid, //TODO: AES256
            partner_order_id: data.partner_order_id,
            payment_method_type: data.payment_method_type,
            item_name: data.item_name,
            item_code: data.item_code,
            amount: data.amount,
            tax_free: data.tax_free,
            vat: data.vat,

            purchase_corp: (typeof(data.card_info) != 'undefined' ? data.card_info.purchase_corp : ''),
            purchase_corp_code: (typeof(data.card_info) != 'undefined' ? data.card_info.purchase_corp_code : ''),
            issuer_corp: (typeof(data.card_info) != 'undefined' ? data.card_info.issuer_corp : ''),
            issuer_corp_code: (typeof(data.card_info) != 'undefined' ? data.card_info.issuer_corp_code : ''),
            card_type: (typeof(data.card_info) != 'undefined' ? data.card_info.card_type : ''),
            install_month: (typeof(data.card_info) != 'undefined' ? data.card_info.install_month : ''),
            approved_id: (typeof(data.card_info) != 'undefined' ? data.card_info.approved_id : ''),//TODO: AES256
            interest_free_install: (typeof(data.card_info) != 'undefined' ? data.card_info.interest_free_install : ''),

            patno: pat_no
          } as EumcKakaopayEumcEntity);


          //TODO: paymentLog????? 저장?



          //TODO: 수납일때 처리 필요!!!!


          //TODO: 수납일때 이메일 전송 - emailChk




          this.logger.log(`KAKAO PAY APPROVE SAVE DB : ${JSON.stringify(db_resp)}`);
        }else{ // TODO: 결제 실패 일때??
          // this.kakaoPayCancel(his_hsp_tp_cd, pat_no, tid, )


        }
      // }catch (e) {
      //   this.logger.error(e);
      //   // return "https://test-pay.eumc.ac.kr/api/v1/kakao-pay/fail";
      //   throw e;
      // }
      return data;
  } catch (e) {
    this.logger.error(`KAKAO PAY ERROR : ${e}`);
      // return "https://test-pay.eumc.ac.kr/api/v1/kakao-pay/fail";
      throw e;
  }




}




  async kakaoPayCancel(his_hsp_tp_cd: string, pat_no: string,
                       tid: string, amount: string, tax_free: string, vat: string) {
    this.logger.debug(`KAKAO PAY CANCEL START`);
    try{

      let reqBody = {
        cid: '',
        cancel_amount: amount,
        cancel_tax_free_amount: tax_free,
        cancel_vat_amount: vat,
        tid: tid
      }

      if (his_hsp_tp_cd == CommonCodeConst.HIS_HSP_TP_CD_SEOUL) {
        reqBody.cid = 'TC0ONETIME';//CommonCodeConst.KAKAO_CID_SEOUL;
      } else if (his_hsp_tp_cd == CommonCodeConst.HIS_HSP_TP_CD_SEOUL) {
        reqBody.cid = 'TC0ONETIME';//CommonCodeConst.KAKAO_CID_MOKDONG;
      }



      const { data } = await lastValueFrom(
        this.httpService.post(`https://kapi.kakao.com/v1/payment/approve`, reqBody, {
          headers: {
            // Authorization: "KakaoAK " + "c4aeff4192f52fef5b2ddfc090104e7e",
            Authorization: "KakaoAK " + "359e60db812962a943dbd62d667d4f75",
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw error;
          }),
        ),
      ).finally(()=>{
        this.logger.debug(`KAKAO CANCEL SEND`)
      });


    }catch (e) {
      this.logger.error(`KAKAO PAY CANCEL ERROR : ${e}`);
      // return "https://test-pay.eumc.ac.kr/api/v1/kakao-pay/fail";
      throw e;
    }

  }






}

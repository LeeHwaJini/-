import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from '@nestjs/config';
import { CrytoUtil } from "../../utils/cryto.util";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { EumcPayEumcEntity } from "../../entities/eumc-pay.eumc-entity";
import fs from "fs";
import crypto from "crypto";
import fetch from "node-fetch";
import { ReqKcpPayment } from "./dto/req-kcp-payment.interface";
import * as moment from "moment-timezone";
import { CommonCodeConst, RCP_TYPE } from "../../const/common-code.const";
import {
  ReqInternetDeptRoomArrivalConfirm
} from "../emr-soap-api/dto/req-internet-dept-room-arrival-confirm.interface";
import { EumcKakaopayEumcEntity } from "../../entities/eumc-kakaopay.eumc-entity";
import { PaymentApiService } from "../payment-api/payment-api.service";
import { CertApiService } from "../cert-api/cert-api.service";
import { PaymentSave } from "../cert-api/dto/payment-save.interface";
import { RespKcpPayment } from "./dto/resp-kcp-payment.interface";
import { PaymentSaveI } from "../cert-api/dto/payment-save-i.interface";
import { ReqMakeCertPdf } from "../cert-api/dto/req-make-cert.pdf";


@Injectable()
export class EumcPayApiService {
  
  private readonly logger = new Logger(EumcPayApiService.name);

  private readonly KCP_CERT_INFO = '-----BEGIN CERTIFICATE-----MIIDgTCCAmmgAwIBAgIHBy4lYNG7ojANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yMTA2MjkwMDM0MzdaFw0yNjA2MjgwMDM0MzdaMHAxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTERMA8GA1UECgwITG9jYWxXZWIxETAPBgNVBAsMCERFVlBHV0VCMRkwFwYDVQQDDBAyMDIxMDYyOTEwMDAwMDI0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppkVQkU4SwNTYbIUaNDVhu2w1uvG4qip0U7h9n90cLfKymIRKDiebLhLIVFctuhTmgY7tkE7yQTNkD+jXHYufQ/qj06ukwf1BtqUVru9mqa7ysU298B6l9v0Fv8h3ztTYvfHEBmpB6AoZDBChMEua7Or/L3C2vYtU/6lWLjBT1xwXVLvNN/7XpQokuWq0rnjSRThcXrDpWMbqYYUt/CL7YHosfBazAXLoN5JvTd1O9C3FPxLxwcIAI9H8SbWIQKhap7JeA/IUP1Vk4K/o3Yiytl6Aqh3U1egHfEdWNqwpaiHPuM/jsDkVzuS9FV4RCdcBEsRPnAWHz10w8CX7e7zdwIDAQABox0wGzAOBgNVHQ8BAf8EBAMCB4AwCQYDVR0TBAIwADANBgkqhkiG9w0BAQsFAAOCAQEAg9lYy+dM/8Dnz4COc+XIjEwr4FeC9ExnWaaxH6GlWjJbB94O2L26arrjT2hGl9jUzwd+BdvTGdNCpEjOz3KEq8yJhcu5mFxMskLnHNo1lg5qtydIID6eSgew3vm6d7b3O6pYd+NHdHQsuMw5S5z1m+0TbBQkb6A9RKE1md5/Yw+NymDy+c4NaKsbxepw+HtSOnma/R7TErQ/8qVioIthEpwbqyjgIoGzgOdEFsF9mfkt/5k6rR0WX8xzcro5XSB3T+oecMS54j0+nHyoS96/llRLqFDBUfWn5Cay7pJNWXCnw4jIiBsTBa3q95RVRyMEcDgPwugMXPXGBwNoMOOpuQ==-----END CERTIFICATE-----';

  
  constructor(
    private httpService: HttpService,
    private cryUtil: CrytoUtil,
    private configService: ConfigService,
    private paymentApiService: PaymentApiService,
    private certApiService : CertApiService,
    @InjectRepository(EumcPayEumcEntity, "eumc_pay")
    private payEumcEntityRepo: Repository<EumcPayEumcEntity>,
    @InjectRepository(EumcKakaopayEumcEntity, "eumc_pay")
    private kakaopayEumcEntityRepo: Repository<EumcKakaopayEumcEntity>,
  ) {
  }


  // 거래등록 - 테스트
  async regKcpTrade(body) {

    // 거래등록 API REQ DATA
    var req_data = {
      site_cd : this.f_get_parm(body.site_cd),
      kcp_cert_info : this.KCP_CERT_INFO,
      ordr_idxx : this.f_get_parm(body.ordr_idxx),
      good_mny : this.f_get_parm(body.good_mny),
      good_name : this.f_get_parm(body.good_name),
      pay_method : this.f_get_parm(body.pay_method),
      Ret_URL : this.f_get_parm(body.Ret_URL),
      escw_used : 'N',
      user_agent : ''
    };
    // 거래등록 API URL
    // 개발 : https://stg-spl.kcp.co.kr/std/tradeReg/register
    // 운영 : https://spl.kcp.co.kr/std/tradeReg/register
    return await fetch(this.configService.get<string>('PAY_COMMON_URL'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify(req_data),
      })
      // 거래등록 API RES
      .then(response => {
        return response.json();
      })
  }


  /**
   * 배치키 발급 요청
   * @param body
   */
  async reqKcpBatch(body) {
    // 배치키 발급 API REQ DATA
    var req_data = {
      site_cd : this.f_get_parm(body.site_cd),
      kcp_cert_info : this.KCP_CERT_INFO,
      tran_cd : this.f_get_parm(body.tran_cd),
      enc_data : this.f_get_parm(body.enc_data),
      enc_info : this.f_get_parm(body.enc_info),
    };

    // 배치키 발급 API URL
    // 개발 : https://stg-spl.kcp.co.kr/gw/enc/v1/payment
    // 운영 : https://spl.kcp.co.kr/gw/enc/v1/payment
    return await fetch(this.configService.get<string>('PAY_SMART_KEY_RETURN_URL'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req_data),
    })
      // 배치키 발급 API RES
      .then(response => {
        return response.json();
      })
      .then(async data => {
        this.logger.debug(`BATCH KEY RESP : ${JSON.stringify(data)}`)
        this.logger.debug(`REQ BATCH : ${JSON.stringify(body)}`)
        // "param_opt_1":"병원코드",
        // "param_opt_2":"환자번호",
        // "param_opt_3":"카드닉네임",
        if (data.res_cd == '0000') {
        const db_resp = await this.saveKcpBatchKey({
          batch_key: data.batch_key,
          card_name: body.param_opt_3 || data.card_name + '|' + body.card_mask_no.split('******')[1],
          userKey: body.card_mask_no,
          his_hsp_tp_cd: body.param_opt_1,
          patNo: body.param_opt_2,
        });
            this.logger.debug(`DB RESP : ${db_resp}`);
            return db_resp;
         } else {
           throw data.res_msg;
         }
      });
  }


  async getKcpPayList(his_hsp_tp_cd: string, pat_no: string) {
    const list = await this.payEumcEntityRepo.find({
      where:{
        his_hsp_tp_cd: his_hsp_tp_cd,
        patno: pat_no,
        delyn: Not('Y')
      }

    });
    return list;
  }

  /**
   * 배치키 정보 저장
   * @param body
   */
  async saveKcpBatchKey(body) {
    /**
     *  {"res_msg":"정상처리",
     *  "card_cd":"CCDI",
     *  "card_bin_type_02":"0",
     *  "card_bank_cd":"0321",
     *  "batch_key":"2304051168518034",
     *  "card_name":"현대카드",
     *  "van_tx_id":"",
     *  "card_bin_type_01":"0",
     *  "res_cd":"0000",
     *  "join_cd":""}
     */
    var save_data = {
      batchkey: body.batch_key,
      cardname: body.card_name,

      password: '',
      userKey: body.userKey,
      his_hsp_tp_cd: body.his_hsp_tp_cd,
      patno: body.patNo,

      regdate: new Date(),
    } as EumcPayEumcEntity;

    const foundOne = await this.payEumcEntityRepo.findOne({
      where: {
        his_hsp_tp_cd: body.his_hsp_tp_cd,
        patno: body.patNo,
        userKey: body.userKey,
        delyn: 'N'
      }
    });

    this.logger.debug(`SAVE BATCH KEY DB : ${JSON.stringify(foundOne)}`)

    if(foundOne != null && foundOne.seq != null){
      // save_data.seq = foundOne.seq;
      // return await this.payEumcEntityRepo.save(save_data);
      throw "이미 등록된 카드가 있습니다.";
    }
    else{
      return await this.payEumcEntityRepo.save(save_data);
    }


  }


  /**
   * 배치키 정보 삭제
   * @param body
   */
  async deleteKcpBatchKey(seq) {
    this.logger.debug(`배치키 정보 삭제 START`);
    try{
      const foundOne = await this.payEumcEntityRepo.findOne({
        where: {
          seq: seq
        }
      });

      if(foundOne != null){
        foundOne.delyn = 'Y';
        foundOne.deldate = moment().format('yyyyMMDDHHmmss')
        return await this.payEumcEntityRepo.save(foundOne);
      }else{
        return 0;
      }
    }catch (e){
      this.logger.error(`배치키 정보 삭제 ERR : ${e}`);
      throw e;
    }
  }

  getOrderId = () => {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var month_str = '';
    var date = today.getDate();
    var time = '' + today.getHours() + '' + today.getMinutes();

    if (month < 10) {
      month_str = '0' + month;
    }

    var vOrderID = year + '' + month_str + '' + date + '' + time;
    return vOrderID;
  };

  async reqKcpAutoPay(body: ReqKcpPayment) {
    var site_cd = body.site_cd;
    var ordr_idxx = this.getOrderId();

    /*
    OUT_PATIENT = '1', // 외래 진료비
  INOUT_MID = '2', // 입퇴원 중간비
  INOUT_FINAL = '3', // 퇴원비
  RSV_PAY = '4', // 진료예약 예약비
  HISTORY_TALK_PAY = '5', // 문진표 작성(스마트서베이)
  REQ_CERTIFICATION = '6', // 증명서 신청
  RSV_MEDICINE_PAY = '7', // 예약 조제비 결제
     */
    switch(body.rcp_type) {
      case RCP_TYPE.OUT_PATIENT:
        body.good_name = "외래수납";
        break;
      case RCP_TYPE.INOUT_MID:
        body.good_name = "입원중간비 수납";
        break;
      case RCP_TYPE.INOUT_FINAL:
        body.good_name = "퇴원비 수납";
        break;

      // case RCP_TYPE.RSV_PAY:
      // body.good_name = "진료예약 예약비"; break;
      // case RCP_TYPE.HISTORY_TALK_PAY:
      // body.good_name = "스마트서베이"; break;

      case RCP_TYPE.REQ_CERTIFICATION:
        body.good_name = "증명서 신청";
        break;
      case RCP_TYPE.RSV_MEDICINE_PAY:
        body.good_name = " 예약 조제비 결제";
        break;
    }

    // 결제 REQ DATA
    var req_data = {};

    req_data = {
      site_cd : site_cd,
      kcp_cert_info : this.KCP_CERT_INFO,
      pay_method : "CARD",
      amount : body.good_mny,
      card_mny : body.good_mny,
      currency : "410", // 통화코드 한화
      quota : "00", // 할부개월
      ordr_idxx : ordr_idxx,
      good_name : body.good_name,
      buyr_name : body.buyr_name,
      buyr_mail : '',
      buyr_tel2 : '',
      card_tx_type : "11511000",
      bt_batch_key : body.bt_batch_key,
      bt_group_id : body.bt_group_id // 그룹아이디 BA0011000348 실제 A8B2Z1002682 PG A8DZR1002800
    };
    
    // 결제 API URL
    // 개발 : https://stg-spl.kcp.co.kr/gw/hub/v1/payment
    // 운영 : https://spl.kcp.co.kr/gw/hub/v1/payment
    return await fetch(this.configService.get<string>(`PAY_SMART_PAY_URL`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req_data),
    })
      // 결제 API RES
      .then(response => {
        return response.json();
      })
      .then(data => {
        /*
        ==========================================================================
            승인 결과 DB 처리 실패시 : 자동취소
        --------------------------------------------------------------------------
            승인 결과를 DB 작업 하는 과정에서 정상적으로 승인된 건에 대해
        DB 작업을 실패하여 DB update 가 완료되지 않은 경우, 자동으로
            승인 취소 요청을 하는 프로세스가 구성되어 있습니다.

        DB 작업이 실패 한 경우, bSucc 라는 변수(String)의 값을 "false"
            로 설정해 주시기 바랍니다. (DB 작업 성공의 경우에는 "false" 이외의
            값을 설정하시면 됩니다.)
        --------------------------------------------------------------------------
        */
        var bSucc = ''; // DB 작업 실패 또는 금액 불일치의 경우 "false" 로 세팅
        // bSucc='false'인 경우 자동취소로직 진행
        if( bSucc == 'false' ) {
          req_data = {};
          // 취소 REQ DATA
          var tno = data.tno;
          var mod_type = 'STSC';
          var cancel_sign_data = site_cd + '^' + tno + '^' + mod_type;
          var kcp_sign_data = this.make_sign_data(cancel_sign_data);

          req_data = {
            site_cd : site_cd,
            tno : tno,
            kcp_cert_info : this.KCP_CERT_INFO,
            kcp_sign_data : kcp_sign_data,
            mod_type : mod_type,
            mod_desc : '가맹점 DB 처리 실패(자동취소)'
          };
          // 취소 API URL
          // 개발 : https://stg-spl.kcp.co.kr/gw/mod/v1/cancel
          // 운영 : https:/spl.kcp.co.kr/gw/mod/v1/cancel
          return fetch(this.configService.get<string>(`PAY_CANCEL_URL`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(req_data),
          })
            // 취소 API RES
            .then(response => {
              return response.json();
            })
            // RES JSON DATA Parsing
            .then(data => {
              return data;
              // res.render('pay/kcp_api_pay', {
              //   req_data : JSON.stringify(req_data),
              //   res_data : JSON.stringify(data),
              //   data : data,
              //   bSucc : bSucc
              // });
            })
          // bSucc='false'가 아닌경우 자동취소로직 생략 후 결제결과처리
        } else {
          this.logger.debug(`SMART PAY SUCCESS : ${JSON.stringify(data)}`);

          //(data.res_cd)
          //{"order_no":"20230412329",
          // "mall_taxno":"1138521083",
          // "partcanc_yn":"Y",
          // "noinf":"N",
          // "res_msg":"정상처리",
          // "coupon_mny":"0",
          // "pg_txid":"0412032914MK28987373370000000011000070577311",
          // "card_bin_type_01":"0",
          // "trace_no":"A52Q7YM1N8ONLXDR",
          // "card_mny":"1100",
          // "res_vat_mny":"100",
          // "ca_order_id":"20230412329",
          // "res_tax_flag":"TG01",
          // "acqu_name":"신한카드",
          // "card_no":"461954******7815",
          // "quota":"00",
          // "van_cd":"VNKC",
          // "acqu_cd":"CCLG",
          // "amount":"1100",
          // "cert_no":"23732987373372",
          // "van_apptime":"20230412032914",
          // "use_point":"0",
          // "res_free_mny":"0",
          // "pay_method":"PACA",
          // "card_bin_bank_cd":"0301",
          // "bizx_numb":"0040905630",
          // "res_cd":"0000",
          // "escw_yn":"N",
          // "join_cd":"0000",
          // "app_time":"20230412032914",
          // "tno":"23732987373372",
          // "card_bin_type_02":"1",
          // "card_cd":"CCLG",
          // "res_en_msg":"processing completed",
          // "card_name":"신한카드",
          // "mcht_taxno":"1138521083",
          // "res_green_deposit_mny":"0",
          // "res_tax_mny":"1000",
          // "app_no":"70577311"}

          //TODO: 증명서에 대한 수납처리가 필요
          return this.savePaymentKcpDB(body, body.his_hsp_tp_cd, body.pat_no, body.rcp_type, data, body.data_set);
        }
      });
  }


  async savePaymentKcpDB(req: ReqKcpPayment, his_hsp_tp_cd: string, pat_no: string, rcp_type: string, pay_resp: RespKcpPayment, data_set: any){


    if(rcp_type == RCP_TYPE.OUT_PATIENT) {

      let reqBody = new PaymentSave();
      reqBody.buyerCode = '778';// KCP : 778
      reqBody.in_hsp_tp_cd = his_hsp_tp_cd;
      reqBody.patno = pat_no
      reqBody.treatDate =  moment().format("yyyyMMDD"),

      reqBody.approvedNo = pay_resp.tno;
      reqBody.creditPaidTime = pay_resp.app_time;
      reqBody.paidAmount = pay_resp.amount;
      reqBody.buyer = pay_resp.card_name;
      reqBody.catId = pay_resp.bizx_numb;

      // 환자정보
      reqBody.deptCode = data_set.deptCode;
      reqBody.medType = data_set.medType;
      reqBody.patType = data_set.patType;
      reqBody.drcode = data_set.drcode;
      reqBody.typeCd = data_set.typeCd;

      reqBody.creditCardNo = "123456**********";
      this.logger.debug(`SAVE PAYMENT REQ : ${rcp_type}, ${pat_no}, ${JSON.stringify(reqBody)}`)

      //const callResp = await this.paymentApiService.savePayment(rcp_type, pat_no, reqBody);

      //this.logger.debug(`savePayment EMR RESP : ${callResp}`);
    }
    else if(rcp_type == RCP_TYPE.INOUT_MID) {
      let reqBody = new PaymentSaveI();
      reqBody.buyerCode = '778';// KCP : 778
      reqBody.in_hsp_tp_cd = his_hsp_tp_cd;
      reqBody.patno = pat_no
      reqBody.treatDate =  moment().format("yyyyMMDD"),

      reqBody.approvedNo = pay_resp.tno;
      reqBody.creditPaidTime = pay_resp.app_time;
      reqBody.paidAmount = pay_resp.amount;
      reqBody.buyer = pay_resp.card_name;
      reqBody.catId = pay_resp.bizx_numb;
      reqBody.revolving = pay_resp.quota;

      // 환자정보
      reqBody.deptCode = data_set.deptCode;
      reqBody.patType = data_set.patType;
      reqBody.typeCd = data_set.typeCd;

      /**
       *  treatDate: string;
       *   typeCd: string;
       *   patType: string;
       *   creditPaidTime: string;
       *   patno: string;-
       *   paidAmount: string;-
       *   deptCode: string;
       *   approvedNo: string;-
       *   revolving: string; --
       *   buyerCode: string;-
       *   buyer: string;-
       *   catId: string;-
       */
      this.logger.debug(`SAVE PAYMENT REQ : ${rcp_type}, ${pat_no}, ${JSON.stringify(reqBody)}`)
      //const callResp = await this.paymentApiService.savePaymentIB(rcp_type, reqBody);

      //this.logger.debug(`savePayment EMR RESP : ${callResp}`);
    }
    else if(rcp_type == RCP_TYPE.REQ_CERTIFICATION){
      let reqBody = new ReqMakeCertPdf();
      reqBody.his_hsp_tp_cd = data_set.targetData.his_hsp_tp_cd;
      reqBody.patno = data_set.targetData.patno;
      reqBody.rcptype = data_set.targetData.rcptype;
      reqBody.certname = data_set.targetData.certname;
      reqBody.deptname = data_set.targetData.deptname;
      reqBody.fromdate = data_set.targetData.fromdate;
      reqBody.todate = data_set.targetData.todate;
      reqBody.date = data_set.targetData.date;
      reqBody.data = data_set.targetData.date;
      reqBody.email = data_set.targetData.email;
      //const callResp = await this.certApiService.getCertificationListSummary(reqBody);
    }

    // 수납저장
    let newOne = {
      tid: pay_resp.tno,
      amount: pay_resp.amount,
      issuer_corp_code: '',
      issuer_corp: '',
      approved_at: '',
      approved_id: '',
      install_month: pay_resp.quota,
      interest_free_install: '',
      item_name: req.good_name,
      payment_method_type: 'KCP_SMART',
      patno: pat_no
    } as EumcKakaopayEumcEntity;

    //return this.kakaopayEumcEntityRepo.save(newOne);
    return true;
    // pay_resp
    //{"order_no":"20230412329",
    // "mall_taxno":"1138521083",
    // "partcanc_yn":"Y",
    // "noinf":"N",
    // "res_msg":"정상처리",
    // "coupon_mny":"0",
    // "pg_txid":"0412032914MK28987373370000000011000070577311",
    // "card_bin_type_01":"0",
    // "trace_no":"A52Q7YM1N8ONLXDR",
    // "card_mny":"1100",
    // "res_vat_mny":"100",
    // "ca_order_id":"20230412329",
    // "res_tax_flag":"TG01",
    // "acqu_name":"신한카드",
    // "card_no":"461954******7815",
    // "quota":"00",
    // "van_cd":"VNKC",
    // "acqu_cd":"CCLG",
    // "amount":"1100",
    // "cert_no":"23732987373372",
    // "van_apptime":"20230412032914",
    // "use_point":"0",
    // "res_free_mny":"0",
    // "pay_method":"PACA",
    // "card_bin_bank_cd":"0301",
    // "bizx_numb":"0040905630",
    // "res_cd":"0000",
    // "escw_yn":"N",
    // "join_cd":"0000",
    // "app_time":"20230412032914",
    // "tno":"23732987373372",
    // "card_bin_type_02":"1",
    // "card_cd":"CCLG",
    // "res_en_msg":"processing completed",
    // "card_name":"신한카드",
    // "mcht_taxno":"1138521083",
    // "res_green_deposit_mny":"0",
    // "res_tax_mny":"1000",
    // "app_no":"70577311"}

    /*
    String buyerCode, String in_hsp_tp_cd, String patno, String treatDate, String deptCode, String spcdrYn, String medType, String drcode, String patType, String typeCd, String insurt, String custCd, String custRate, String custInfo, String inordCd, String rcpseq2
      PaymentSave paymentSave = new PaymentSave(
          "778",  // KCP : 778
          his_hsp_tp_cd, (String) session.getAttribute("patno"), (String) session.getAttribute("meddate"),
          (String) session.getAttribute("meddept"), (String) session.getAttribute("spcdryn"),
          (String) session.getAttribute("medtype"), (String) session.getAttribute("meddr"), (String) session.getAttribute("pattype"), (String) session.getAttribute("typecd"), (String) session.getAttribute("insurt"),
          (String) session.getAttribute("custcd"), (String) session.getAttribute("rateinf"), (String) session.getAttribute("custinf"), (String) session.getAttribute("inordcd"), "0"
  );
     */


    // paymentSave.setApprovedNo(tno);  // KCP 거래 고유 번호
    // paymentSave.setCreditPaidTime(app_time);
    // paymentSave.setRevolving(quota);
    // paymentSave.setPaidAmount(amount); // 승인 완료 금액
    // paymentSave.setBuyer(card_name);
    // paymentSave.setCatId(bizx_numb);



    /**
     *   in_hsp_tp_cd: string;    // 0 : 병원 구분 코드 (01:서울, 02:목동)
     *   patno: string;       // 2
     *   treatDate: string;   // 3 : 진료일자(YYYYMMDD)
     *   deptCode: string;    // 7 : 진료과코드
     *   spcdrYn: string;     // 10 : 지정구분
     *   medType: string;     // 11 : 초재진구분
     *   drcode: string;      // 12 : 의사코드
     *   patType: string;     // 13 : 급여종별
     *   typeCd: string;      // 14 : 유형보조
     *   insurt: string;
     *   custCd: string;      // 16 : 계약처코드
     *   custRate: string;
     *   custInfo: string;
     *   inordCd: string;     // 43 : 예외환자코드
     *   rcpseq2: string;     // 44 : 그룹영수증순번
     *   buyerCode: string;   // 63 : 카드종류 (VAN응답-'0'+카드타입2자리)
     *   creditCardNo: string;   // 64 : 카드번호 (Track2값 중 '=' 앞까지)
     *   approvedNo: string;   // 65 : 승인번호 (VAN 응답)
     *   creditPaidDate: string;  // 66 : 카드승인일시
     *   creditPaidTime: string;  // 66 : 카드승인일시 (YYYYMMDDHHNN)
     *   revolving: string;   // 67 : 카드할부개월수 (MM)
     *   availablePeriod: string; // 69 : 카드유효기간 (Track2값 중 '=' 뒤부터 4자리)
     *   paidAmount: string;  // 70 : 요청금액
     *   shipID: string;      // 71 : 카드가맹점 (VAN응답 - VAN구분2자리+가맹점번호16자리)
     *   buyer: string;       // 72 : 카드명 (VAN응답 - 12자리)
     *   catId: string;       //가맹점번호
     */



  }





  /**
   * 일반 결제 요청
   * @param body
   */
  async reqKcpNormal(body) {
    var req_data = {
      site_cd : this.f_get_parm(body.site_cd),
      kcp_cert_info : this.KCP_CERT_INFO,
      tran_cd : this.f_get_parm(body.tran_cd),
      enc_data : this.f_get_parm(body.enc_data),
      enc_info : this.f_get_parm(body.enc_info),
      ordr_mony: '1'
    };

    // 배치키 발급 API URL
    // 개발 : https://stg-spl.kcp.co.kr/gw/enc/v1/payment
    // 운영 : https://spl.kcp.co.kr/gw/enc/v1/payment
    return await fetch("https://stg-spl.kcp.co.kr/gw/enc/v1/payment", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req_data),
    })
      .then(response => {
        return response.json();
      })
      .then(async data => {
        this.logger.debug(`NORMAL PAY KEY RESP : ${JSON.stringify(data)}`)
        this.logger.debug(`REQ NORMAL PAY : ${JSON.stringify(body)}`)
        return '성공';
      });
  }





// null 값 처리
  f_get_parm(val) {
    if ( val == null ) val = '';
    return val;
  }

// 서명데이터 생성 예제
  make_sign_data(data){
    // 개인키 READ
    // "splPrikeyPKCS8.pem" 은 테스트용 개인키
    // "changeit" 은 테스트용 개인키비밀번호
    var key_file = fs.readFileSync('C:/../node_kcp_api_Mobile_AutoPayment_sample/certificate/splPrikeyPKCS8.pem').toString();
    var password = 'changeit';
    // 서명데이터생성
    return crypto.createSign('sha256').update(data).sign({
      format: 'pem',
      key: key_file,
      passphrase: password
    }, 'base64');
  }




}

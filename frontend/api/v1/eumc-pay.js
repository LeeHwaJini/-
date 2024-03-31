import axios from '../axios';

const SUB_DIR = '/v1/eumc-pay';

const regTrade = async (ordr_idxx, site_cd) => await axios.post(`${SUB_DIR}/reg-trade`, { ordr_idxx, site_cd });
const regTradeNormal = async (ordr_idxx, site_cd, good_name, good_mny) => await axios.post(`${SUB_DIR}/reg-trade-normal`, { ordr_idxx, site_cd, good_name, good_mny });



const cbKCPBatch = async () => await axios.post(`${SUB_DIR}/callback_kcp_batch`);

const getPaymentList = async (his_hsp_tp_cd, pat_no) =>
  await axios.get(`${SUB_DIR}/cardList`, { params: { his_hsp_tp_cd, pat_no } });

const deletePaymentCard = async (seq) =>
  await axios.delete(`${SUB_DIR}/card/${seq}`, {   });


/**
 *   his_hsp_tp_cd: { type: 'string' },
 *         patno: { type: 'string' },
 *         bt_batch_key: { type: 'string' },
 *         good_mny: { type: 'string' },
 *         buyr_name: { type: 'string' },
 *         data_set: {type: 'string'}
 * @param his_hsp_tp_cd
 * @param patno
 * @param bt_batch_key
 * @param rcp_type
 * @param good_mny
 * @param data_set
 * @return {Promise<axios.AxiosResponse<any>>}
 */
const paymentSmart = async (his_hsp_tp_cd, pat_no, bt_batch_key, rcp_type, good_mny, data_set ) =>
  await axios.post(`${SUB_DIR}/paymentSmart`, { his_hsp_tp_cd, pat_no, bt_batch_key, rcp_type, good_mny, data_set });




export { regTrade, regTradeNormal, cbKCPBatch, getPaymentList, deletePaymentCard, paymentSmart };

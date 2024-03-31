import { useContext, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { UserContext } from '../../context/UserContext';
import WebView from 'react-native-webview';
import { Color } from '../../styles';
import { getRequestMakeCertPDF } from '../../api/v1/cert';
import {
  CONFIRM_CARD_REGISTRATION,
  CONFIRM_NORMAL_ORDER,
  ERROR_KAKAO_CANCEL,
  ERROR_KAKAO_FAIL,
} from '../../popup-templates';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
});


const handleSetRef = _ref => {
  webRef = _ref;
};

const OrderKakao = ({ navigation, route }) => {

  /**
   *    target: selected,
   *    type: 'PROOF',
   *    money: money,
   *    target_data: makeCertInfo,
   *    target_email: target_email
   */
  const { code, medicalCards, currentMedicalCardIndex, setToast } = useContext(UserContext);
  const selected = route.params?.target;
  const money = route.params?.money;
  const email = route.params?.target_email;
  const type = route.params?.type;
  const target_data = route.params?.target_data;


  if (!(currentMedicalCardIndex >= 0)) return <View></View>;
  const { name, phoneNumber, patientNumber } = medicalCards[currentMedicalCardIndex];

  console.log(`route.params : ${JSON.stringify(route.params)}`);
  /**
   *     body.his_hsp_tp_cd,
   *     body.patno,
   *     body.rcptype,
   *     body.certname,
   *     body.deptname,
   *     body.fromdate,
   *     body.todate,
   *     body.date,
   *     body.data,
   *     body.email,
   * @param body
   */
  const genCertPdf = function (body) {
    getRequestMakeCertPDF(
      body.his_hsp_tp_cd,
      body.patno,
      body.rcptype,
      body.certname,
      body.deptname,
      body.fromdate,
      body.todate,
      body.date,
      body.data,
      body.email
    )
      .then(res => {
        console.log(res);
        navigation.navigate('ConfirmScreen', {
          headerShown: true,
          btnUse: true,
          headerTitle: '증명서 신청',
          content: '증명서 발급이 완료되었습니다.',
          target: 'MyPageTab',
        });
      })
      .catch(e => {
        console.log(e);
        navigation.navigate('ConfirmScreen', {
          headerShown: true,
          btnUse: true,
          headerTitle: '증명서 신청',
          content: '증명서 발급에 실패했습니다.',
          target: 'MyPageTab',
        });
      });
  };

  const makeCertInfo = {
    his_hsp_tp_cd: selected.his_hsp_tp_cd,
    patno: patientNumber,
    rcptype: '1',
    certname: selected.certname.trim().replace(/\s/g, ''),
    deptname: selected.deptname,
    fromdate: selected.fromdate,
    todate: selected.todate,
    date: '',
    data: selected.certname.trim() === '일반진단서[재발급]' ? selected.dummyData : '',
    email: email,
  };


  return (
    <View style={styles.container}>
      <WebView
        ref={handleSetRef}
        javaScriptEnabled={true}
        source={{
          html: `<body onload='document.FormName.submit()' style='display: none;'>
                    <form name='FormName' method='POST' action='https://test-pay.eumc.ac.kr/api/v1/kakao-pay/ready'>                    
                  <input type="hidden" name="payFlag" id="payFlag" value="1"/>
                  <input type="hidden" name="payStore" id="payStore" value="${money}"/>
                  <input type="hidden" name="rcptype" id="rcptype" value="${target_data.rcptype}"/>
                  <input type="hidden" name="pat_no" id="pat_no" value="${patientNumber}"/>
                  <input type="hidden" name="his_hsp_tp_cd" value="${code}"/>
                  <input type="hidden" id="meddept" name="meddept" value="">
                  <input type="hidden" id="spcdryn" name="spcdryn" value="">
                  <input type="hidden" id="medtype" name="medtype" value="">
                  <input type="hidden" id="meddr" name="meddr" value="">
                  <input type="hidden" id="pattype" name="pattype" value="">
                  <input type="hidden" id="typecd" name="typecd" value="">
                  <input type="hidden" id="insurt" name="insurt" value="">
                  <input type="hidden" id="custcd" name="custcd" value="">
                  <input type="hidden" id="custinf" name="custinf" value="">
                  <input type="hidden" id="rateinf" name="rateinf" value="">
                  <input type="hidden" id="inordcd" name="inordcd" value="">
                  <input type="hidden" id="meddate" name="meddate" value="">
                  <input type="hidden" id="admdate" name="admdate" value="">
                  <input type="hidden" id="deptname" name="deptname" value="">
                  <input type="hidden" id="savedata" name="savedata" value="">
                  <input type="hidden" id="emailChk" name="emailChk" value="${email}">
                  <input type="hidden" id="emailSaveYN" name="emailSave" value="N">
                    </form>
                </body>`,
        }}
        onMessage={e => {
          const { ok, msg } = JSON.parse(e.nativeEvent.data);
          console.log('onMessage', JSON.stringify(e.nativeEvent.data));
          if (ok == 'false') {
            if (type === 'PROOF') {
              setToast(Object.assign(ERROR_KAKAO_FAIL(msg), { redirect: () => navigation.navigate('MainHome') }));
            } else if (type === 'PAY') {
              setToast(Object.assign(ERROR_KAKAO_FAIL(msg), { redirect: () => navigation.navigate('MainHome') }));
            }
          } else {
            if (type === 'PROOF') {
              genCertPdf(makeCertInfo);
            } else if (type === 'PAY') {
            //  genCertPdf(makeCertInfo);
            } else {
            }
          }
        }}
        onNavigationStateChange={getUrl => {
          console.log('getUrl', getUrl);
        }}
      />
    </View>
  );
};
export default OrderKakao;

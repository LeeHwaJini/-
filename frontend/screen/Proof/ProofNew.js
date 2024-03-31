import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { EumcText } from '../../components';
import { BottomTwoBtn } from '../../components/Buttons';
import { CheckBoxItem } from '../../components/List';
import { UserContext } from '../../context';
import { Color } from '../../styles';

const windowHeight = Dimensions.get('window').height - 80 - 56;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.homeColor.primaryWhite,
  },
  containerNext: {},
  content: {
    flex: 1,
    paddingTop: 30,
  },
  agreement: {
    flex: 4,
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    marginHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
  },
  warning: {
    marginLeft: 20,
    marginTop: 17,
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 50,
  },
  warningText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  termText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 32,
  },
  containerAgree: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mb20: {
    marginBottom: 20,
  },
});

const ProofNew = ({ navigation }) => {
  const { setToast } = useContext(UserContext);
  const [selected, setSelected] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <ScrollView
          style={[styles.agreement, { height: (windowHeight / 3) * 1.9 }]}
          contentContainerStyle={{}}
          indicatorStyle="white"
        >
          <EumcText fontWeight="regular" style={[styles.text, { marginBottom: 45 }]}>
            [제1장 총 칙]
          </EumcText>
          <EumcText fontWeight="regular" style={styles.text}>
            제 1 조 (목적)
            {'\n'}이 약관은 “모바일 진찰권”에서 제공하는 각종 서비스를 이용함에 있어, 차여성의원(이하 “의원”라 합니다)과
            이용자 간의 권리 및 의무 등에 대한 기본적인 사항을 규정함을 목적으로 합니다.
          </EumcText>
          <EumcText fontWeight="regular" style={styles.text}>
            제 2 조 (정의)
            {'\n'}1)이 약관에서 사용하는 용어의 정의는 다음 각호와 같습니다.
            {'\n'}1. "모바일 진찰권”(이하 “모바일 진찰권” 또는 “서비스”)란 “이용자”와 “의원” 간의 계약에 근거하여
            “의원”이 제공하는 다양한 부가서비스를 “이용자”가 하나의 어플리케이션에서 이용할 수 있도록 지원하고, 이를
            위한 통합 플랫폼 기능을 수행하는 모바일 플랫폼 서비스를 의미합니다.
            {'\n'}2. “이용자”란 “의원”이 정한 기준에 따라 일련의 등록절차(“모바일 진찰권” 이용약관 동의, “의원”이
            제공하는 이용약관 동의, 고객인증 및 가입승인 등)를 완료하여 “모바일 진찰권” 사용 권한을 부여 받은 자를
            의미합니다. 2) 본 약관에서 사용하는 용어의 정의는 제1항에서 정하는 것을 제외하고는 관계 법령에서 정하는 바에
            따릅니다.
          </EumcText>
          <EumcText fontWeight="regular" style={styles.text}>
            제 3 조 (약관의 효력)
            {'\n'}1) “서비스”를 이용하려면 먼저 약관에 동의하여야 합니다. 약관에 동의하지 않는 경우 “서비스”를 이용할 수
            없습니다. 2) “의원”은 필요한 경우 관련 법령에 따라 본 약관을 변경할 수 있습니다. “의원”이 약관을 변경할
            경우에는 적용일자 및 변경사유를 명시하여 “모바일 진찰권” 앱 내 공지 사항 게시판에 그 적용일자
            10일(“이용자”에게 불리하거나 중대한 사항의 변경은 30일) 전부터 공지하고, 필요한 경우 기존 “이용자”에게는
            제4조에서 정한 방법으로 개별 통지합니다. 3) “의원”은 제2항의 기간 동안 “이용자”가 거절의 의사표시를 하지
            않으면 동의한 것으로 간주한다는 내용을 별도로 고지하였음에도 불구하고 “이용자”가 이 기간 내에 거절의사를
            표시하지 않았을 경우 변경 약관에 동의한 것으로 간주할 수 있습니다. 4) “이용자”가 변경 약관에 동의하지 않는
            경우 “의원”은 “이용자”와의 계약을 해지하거나 “이용자”의 “서비스” 이용을 제한할 수 있습니다. 5) 이 약관에서
            정하지 아니한 사항이나 해석에 대해서는 차여성의원 이용약관 (https://seoul.chamc.co.kr)의 내용에 따릅니다. 이
            약관과 차여성의원 이용약관 서로 일치하지 않거나 상충될 경우 “모바일 진찰권” 에 대해서는 본 약관이
            우선합니다.
          </EumcText>
        </ScrollView>
        <View style={styles.warning}>
          <EumcText fontWeight="regular" style={styles.warningText}>
            *{' '}
            <EumcText fontWeight="regular" style={{ color: 'red', fontSize: 14 }}>
              본인확인이 가능한 경우에만 증명서 신청
            </EumcText>
            이 가능합니다.
          </EumcText>
          <EumcText fontWeight="regular" style={[styles.warningText, styles.mb20]}>
            * 대리인(위임장)을 통한 대리발급은 불가능합니다.
          </EumcText>
          <CheckBoxItem
            marginEmpty={0}
            title={
              <EumcText fontWeight="bold" style={styles.termText}>
                개인정보 수집 및 이용 동의 (필수)
              </EumcText>
            }
            checked={selected}
            onCheckPress={() => setSelected(!selected)}
            hideArrow={true}
          />
        </View>
      </ScrollView>
      <View style={styles.containerNext}>
        <BottomTwoBtn
          leftTitle="취소"
          rightTitle="다음"
          onNext={() =>
            selected
              ? navigation.navigate('ProofCalendarSelect')
              : setToast({ type: 'error', text1: '필수 선택', text2: '개인정보 수집 및 이용 동의가 필요합니다.' })
          }
          onCancel={() => navigation.goBack()}
        />
      </View>
    </View>
  );
};

export default ProofNew;
